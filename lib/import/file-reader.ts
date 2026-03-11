import * as XLSX from "xlsx";

import type {
  ImportFileFormat,
  ImportInputFile,
  ParsedImportFile,
  ParsedImportSheet,
  TabularCell,
  TabularRow,
} from "@/lib/import/types";

const UTF8_BOM = "\uFEFF";
const TEXT_ENCODINGS = ["utf-8", "windows-1251", "latin1"];
const EXCEL_SIGNATURE = [0x50, 0x4b, 0x03, 0x04];
const PDF_SIGNATURE = [0x25, 0x50, 0x44, 0x46];

export async function readImportFile(input: ImportInputFile): Promise<ParsedImportFile> {
  const bytes = input.bytes;
  const format = detectImportFormat(input.name, bytes, input.mimeType);

  if (format === "pdf") {
    return {
      name: input.name,
      mimeType: input.mimeType,
      size: bytes.byteLength,
      format,
      sheets: [],
      metadata: {},
    };
  }

  if (format === "xlsx" || format === "xls") {
    return readSpreadsheetFile(input, format);
  }

  const { text, encoding } = decodeText(bytes);
  const delimiter = detectDelimiter(text, input.name);
  const sheets = delimiter
    ? [parseDelimitedSheet(text, delimiter, "Sheet1")]
    : [parseLineBasedSheet(text, "Sheet1")];

  return {
    name: input.name,
    mimeType: input.mimeType,
    size: bytes.byteLength,
    format,
    sheets,
    textContent: text,
    metadata: {
      encoding,
      delimiter,
    },
  };
}

export function detectImportFormat(
  fileName: string,
  bytes: Uint8Array,
  mimeType?: string | null
): ImportFileFormat {
  if (hasSignature(bytes, PDF_SIGNATURE)) {
    return "pdf";
  }

  if (hasSignature(bytes, EXCEL_SIGNATURE)) {
    return "xlsx";
  }

  const lowerName = fileName.toLowerCase();
  const lowerMime = mimeType?.toLowerCase() ?? "";

  if (lowerName.endsWith(".xlsx") || lowerMime.includes("spreadsheetml")) {
    return "xlsx";
  }

  if (lowerName.endsWith(".xls") || lowerMime.includes("application/vnd.ms-excel")) {
    return "xls";
  }

  if (lowerName.endsWith(".tsv")) {
    return "tsv";
  }

  if (lowerName.endsWith(".csv")) {
    return "csv";
  }

  if (lowerName.endsWith(".txt")) {
    return "text";
  }

  if (lowerMime.includes("text/tab-separated-values")) {
    return "tsv";
  }

  if (lowerMime.includes("text/csv")) {
    return "csv";
  }

  if (lowerMime.includes("application/pdf")) {
    return "pdf";
  }

  return "unknown";
}

function readSpreadsheetFile(
  input: ImportInputFile,
  format: ImportFileFormat
): ParsedImportFile {
  const workbook = XLSX.read(Buffer.from(input.bytes), {
    type: "buffer",
    cellDates: true,
    raw: false,
  });

  const sheets = workbook.SheetNames.map((sheetName) => {
    const worksheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<TabularRow>(worksheet, {
      defval: null,
      raw: false,
    });
    const columns = rows.length > 0 ? Object.keys(rows[0]) : deriveWorksheetHeaders(worksheet);

    return {
      name: sheetName,
      columns: uniquifyHeaders(columns),
      rows: rows.map((row) => normalizeObjectRow(row)),
      rowCount: rows.length,
    } satisfies ParsedImportSheet;
  });

  return {
    name: input.name,
    mimeType: input.mimeType,
    size: input.bytes.byteLength,
    format,
    sheets,
    metadata: {},
  };
}

function deriveWorksheetHeaders(worksheet: XLSX.WorkSheet): string[] {
  const rows = XLSX.utils.sheet_to_json<(string | null)[]>(worksheet, {
    header: 1,
    defval: null,
    raw: false,
  });
  const headerRow = Array.isArray(rows[0]) ? rows[0] : [];

  return uniquifyHeaders(
    headerRow.map((value, index) => {
      const text = stringifyCellValue(value);
      return text || `Column ${index + 1}`;
    })
  );
}

function decodeText(bytes: Uint8Array) {
  for (const encoding of TEXT_ENCODINGS) {
    try {
      const text = new TextDecoder(encoding, { fatal: true }).decode(bytes);
      return {
        text: text.startsWith(UTF8_BOM) ? text.slice(1) : text,
        encoding,
      };
    } catch {
      continue;
    }
  }

  return {
    text: new TextDecoder().decode(bytes),
    encoding: "utf-8",
  };
}

function detectDelimiter(text: string, fileName: string): string | undefined {
  const lowerName = fileName.toLowerCase();
  if (lowerName.endsWith(".tsv")) {
    return "\t";
  }

  const sampleLines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 5);

  if (!sampleLines.length) {
    return lowerName.endsWith(".csv") ? "," : undefined;
  }

  const delimiters = ["\t", ";", ","];
  let bestDelimiter: string | undefined;
  let bestScore = 0;

  for (const delimiter of delimiters) {
    const counts = sampleLines.map((line) => countDelimiter(line, delimiter));
    const minCount = Math.min(...counts);
    const maxCount = Math.max(...counts);
    if (minCount === 0) {
      continue;
    }

    const score = counts.reduce((sum, count) => sum + count, 0) - (maxCount - minCount);
    if (score > bestScore) {
      bestScore = score;
      bestDelimiter = delimiter;
    }
  }

  if (bestDelimiter) {
    return bestDelimiter;
  }

  return lowerName.endsWith(".csv") ? "," : undefined;
}

function countDelimiter(line: string, delimiter: string): number {
  let count = 0;
  let quoted = false;

  for (const char of line) {
    if (char === '"') {
      quoted = !quoted;
      continue;
    }

    if (!quoted && char === delimiter) {
      count += 1;
    }
  }

  return count;
}

function parseDelimitedSheet(
  text: string,
  delimiter: string,
  sheetName: string
): ParsedImportSheet {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.replace(/\r/g, ""))
    .filter((line) => line.trim().length > 0);

  if (!lines.length) {
    return { name: sheetName, columns: [], rows: [], rowCount: 0 };
  }

  const [headerLine, ...dataLines] = lines;
  const headers = uniquifyHeaders(parseDelimitedLine(headerLine, delimiter));
  const rows = dataLines.map((line) => {
    const values = parseDelimitedLine(line, delimiter);
    return buildRow(headers, values);
  });

  return {
    name: sheetName,
    columns: headers,
    rows,
    rowCount: rows.length,
  };
}

function parseLineBasedSheet(text: string, sheetName: string): ParsedImportSheet {
  const rows = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => ({ value: line }));

  return {
    name: sheetName,
    columns: rows.length ? ["value"] : [],
    rows,
    rowCount: rows.length,
  };
}

function parseDelimitedLine(line: string, delimiter: string): string[] {
  const values: string[] = [];
  let current = "";
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === '"') {
      if (quoted && next === '"') {
        current += '"';
        index += 1;
        continue;
      }

      quoted = !quoted;
      continue;
    }

    if (!quoted && char === delimiter) {
      values.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current.trim());
  return values;
}

function buildRow(headers: string[], values: string[]): TabularRow {
  const row: TabularRow = {};

  headers.forEach((header, index) => {
    row[header] = normalizeCellValue(values[index] ?? "");
  });

  return row;
}

function normalizeObjectRow(row: TabularRow): TabularRow {
  return Object.fromEntries(
    Object.entries(row).map(([key, value]) => [key, normalizeCellValue(value)])
  );
}

function normalizeCellValue(value: unknown): TabularCell {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length ? trimmed : null;
  }

  return String(value);
}

function stringifyCellValue(value: unknown): string {
  if (value === undefined || value === null) {
    return "";
  }

  return typeof value === "string" ? value.trim() : String(value);
}

function uniquifyHeaders(headers: string[]): string[] {
  const seen = new Map<string, number>();

  return headers.map((header, index) => {
    const base = header.trim() || `Column ${index + 1}`;
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    return count === 0 ? base : `${base} (${count + 1})`;
  });
}

function hasSignature(bytes: Uint8Array, signature: number[]): boolean {
  return signature.every((value, index) => bytes[index] === value);
}
