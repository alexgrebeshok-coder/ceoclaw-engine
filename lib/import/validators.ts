import type {
  BudgetPreviewRow,
  ContractMetadataPlaceholder,
  ImportFileKind,
  ImportIssue,
  ImportRecognitionSource,
  NormalizedImportPreview,
  ParsedImportFile,
  ParsedImportSheet,
  PaymentHistoryPreviewRow,
  PreviewTable,
  RecognizedImportFile,
  RiskPreviewRow,
  WbsPreviewRow,
  WorklogPreviewRow,
} from "@/lib/import/types";

const FILE_KIND_PATTERNS: Record<ImportFileKind, RegExp[]> = {
  wbs: [/wbs/i, /work[\s_-]?breakdown/i],
  budget_plan: [/budget/i, /bac/i, /cost[\s_-]?plan/i],
  risk_register: [/risk/i, /register/i],
  payment_history: [/payment/i, /invoice/i, /cash[\s_-]?flow/i],
  worklog_summary: [/worklog/i, /timesheet/i, /journal/i],
  main_contract: [/contract/i, /agreement/i],
  unknown: [],
};

const COLUMN_HINTS: Record<Exclude<ImportFileKind, "unknown" | "main_contract">, string[]> = {
  wbs: ["код", "wbs", "наименование", "работ", "дни", "duration", "начало", "окончание"],
  budget_plan: ["сумма", "стоимость", "budget", "bac", "план", "amount"],
  risk_register: ["риск", "risk", "вероятност", "probability", "влияни", "impact"],
  payment_history: ["payment", "оплат", "сумма", "amount", "контрагент", "invoice"],
  worklog_summary: ["worklog", "журнал", "date", "дата", "hours", "часы", "employee"],
};

type FieldMatchers = Record<string, string[]>;

const WBS_FIELDS: FieldMatchers = {
  code: ["код", "wbs", "code", "id"],
  title: ["наименование работы", "работа", "activity", "task", "name", "наименование"],
  durationDays: ["дни", "длитель", "duration", "days"],
  startDate: ["начало", "start", "дата начала"],
  endDate: ["окончание", "finish", "end", "дата окончания"],
};

const BUDGET_FIELDS: FieldMatchers = {
  item: ["статья", "item", "наименование", "work", "cost item"],
  amount: ["сумма", "стоимость", "amount", "budget", "bac", "план"],
  period: ["период", "period", "date", "дата", "month"],
  currency: ["currency", "валюта"],
};

const RISK_FIELDS: FieldMatchers = {
  title: ["риск", "risk", "описание"],
  probability: ["вероятност", "probability", " p "],
  impact: ["влияни", "impact", " i "],
  owner: ["owner", "владелец", "ответственный"],
  status: ["status", "статус"],
};

const PAYMENT_FIELDS: FieldMatchers = {
  paymentDate: ["дата платежа", "дата оплаты", "payment date", "date"],
  amount: ["сумма", "amount", "payment"],
  counterparty: ["контрагент", "supplier", "vendor", "counterparty"],
  reference: ["номер", "invoice", "reference", "document"],
};

const WORKLOG_FIELDS: FieldMatchers = {
  date: ["дата", "date", "day"],
  person: ["сотрудник", "исполнитель", "employee", "person", "worker", "author"],
  hours: ["часы", "hours", "hrs", "time", "duration"],
  description: ["работа", "описание", "description", "comment", "task"],
};

const PREVIEW_SAMPLE_SIZE = 5;

export function recognizeImportFile(parsed: ParsedImportFile): RecognizedImportFile {
  const recognizedBy: ImportRecognitionSource[] = [];
  const fileName = parsed.name.toLowerCase();
  const columns = parsed.sheets[0]?.columns ?? [];
  const normalizedColumns = columns.map((column) => normalizeHeader(column));

  let kind: ImportFileKind = "unknown";

  for (const candidate of Object.keys(FILE_KIND_PATTERNS) as ImportFileKind[]) {
    if (candidate === "unknown") {
      continue;
    }

    if (FILE_KIND_PATTERNS[candidate].some((pattern) => pattern.test(fileName))) {
      kind = candidate;
      recognizedBy.push("filename");
      break;
    }
  }

  if (kind === "unknown" && parsed.format === "pdf") {
    kind = "main_contract";
    recognizedBy.push("format");
  }

  if (kind === "unknown" && columns.length > 0) {
    const scoredKinds = (Object.keys(COLUMN_HINTS) as Array<keyof typeof COLUMN_HINTS>)
      .map((candidate) => ({
        candidate,
        score: COLUMN_HINTS[candidate].filter((hint) =>
          normalizedColumns.some((column) => column.includes(normalizeHeader(hint)))
        ).length,
      }))
      .sort((left, right) => right.score - left.score);

    if (scoredKinds[0] && scoredKinds[0].score >= 2) {
      kind = scoredKinds[0].candidate;
      recognizedBy.push("columns");
    }
  }

  if (kind === "unknown") {
    recognizedBy.push("unknown");
  }

  return {
    name: parsed.name,
    kind,
    format: parsed.format,
    mimeType: parsed.mimeType,
    required: kind === "wbs" || kind === "budget_plan" || kind === "risk_register",
    recognizedBy,
    size: parsed.size,
    sheetCount: parsed.sheets.length,
    rowCount: parsed.sheets.reduce((sum, sheet) => sum + sheet.rowCount, 0),
    columns,
  };
}

export function validateRecognizedFile(
  recognized: RecognizedImportFile,
  parsed: ParsedImportFile
): ImportIssue[] {
  const issues: ImportIssue[] = [];

  if (recognized.kind === "unknown") {
    issues.push({
      level: "warning",
      code: "UNRECOGNIZED_FILE",
      fileName: recognized.name,
      message: "File type could not be recognized and will be ignored.",
    });
    return issues;
  }

  if (recognized.kind === "main_contract") {
    if (recognized.format !== "pdf") {
      issues.push({
        level: "warning",
        code: "CONTRACT_NOT_PDF",
        fileName: recognized.name,
        message: "Contract placeholder was recognized but the file is not a PDF.",
      });
    }
    return issues;
  }

  const sheet = parsed.sheets[0];
  if (!sheet || sheet.rowCount === 0) {
    issues.push({
      level: "error",
      code: "EMPTY_FILE",
      fileName: recognized.name,
      message: "The file does not contain tabular data.",
    });
    return issues;
  }

  switch (recognized.kind) {
    case "wbs":
      issues.push(...validateWbsSheet(recognized.name, sheet));
      break;
    case "budget_plan":
      issues.push(...validateBudgetSheet(recognized.name, sheet));
      break;
    case "risk_register":
      issues.push(...validateRiskSheet(recognized.name, sheet));
      break;
    case "payment_history":
      issues.push(...validatePaymentSheet(recognized.name, sheet));
      break;
    case "worklog_summary":
      issues.push(...validateWorklogSheet(recognized.name, sheet));
      break;
    default:
      break;
  }

  return issues;
}

export function buildNormalizedPreview(
  recognized: RecognizedImportFile,
  parsed: ParsedImportFile
): Partial<NormalizedImportPreview> {
  const sheet = parsed.sheets[0];
  if (!sheet && recognized.kind !== "main_contract") {
    return {};
  }

  switch (recognized.kind) {
    case "wbs":
      return { wbs: buildWbsPreview(sheet) };
    case "budget_plan":
      return { budgetPlan: buildBudgetPreview(sheet) };
    case "risk_register":
      return { riskRegister: buildRiskPreview(sheet) };
    case "payment_history":
      return { paymentHistory: buildPaymentPreview(sheet) };
    case "worklog_summary":
      return { worklogSummary: buildWorklogPreview(sheet) };
    case "main_contract":
      return {
        mainContract: {
          fileName: parsed.name,
          format: parsed.format,
          size: parsed.size,
          placeholder: true,
        } satisfies ContractMetadataPlaceholder,
      };
    default:
      return {};
  }
}

function validateWbsSheet(fileName: string, sheet: ParsedImportSheet): ImportIssue[] {
  const issues: ImportIssue[] = [];
  const columns = createColumnIndex(sheet.columns, WBS_FIELDS);

  for (const field of ["code", "title", "durationDays", "startDate", "endDate"] as const) {
    if (!columns[field]) {
      issues.push({
        level: field === "code" || field === "title" ? "error" : "warning",
        code: "MISSING_COLUMN",
        fileName,
        message: `WBS column for "${field}" is missing.`,
        column: field,
      });
    }
  }

  for (const [rowIndex, row] of sheet.rows.entries()) {
    const duration = parseNumericValue(getRowValue(row, columns.durationDays));
    if (duration !== null && duration <= 0) {
      issues.push({
        level: "error",
        code: "INVALID_DURATION",
        fileName,
        message: "WBS duration must be a positive number.",
        row: rowIndex + 2,
        column: columns.durationDays,
      });
    }

    for (const dateField of ["startDate", "endDate"] as const) {
      const dateValue = getRowValue(row, columns[dateField]);
      if (dateValue !== null && !isValidDateValue(dateValue)) {
        issues.push({
          level: "warning",
          code: "INVALID_DATE",
          fileName,
          message: `WBS ${dateField} value could not be parsed as a date.`,
          row: rowIndex + 2,
          column: columns[dateField],
        });
      }
    }
  }

  return issues;
}

function validateBudgetSheet(fileName: string, sheet: ParsedImportSheet): ImportIssue[] {
  const issues: ImportIssue[] = [];
  const columns = createColumnIndex(sheet.columns, BUDGET_FIELDS);

  if (!columns.amount) {
    issues.push({
      level: "warning",
      code: "MISSING_AMOUNT_COLUMN",
      fileName,
      message: "Budget file does not contain an amount column.",
      column: "amount",
    });
    return issues;
  }

  for (const [rowIndex, row] of sheet.rows.entries()) {
    const amount = parseNumericValue(getRowValue(row, columns.amount));
    if (amount === null) {
      continue;
    }

    if (!Number.isFinite(amount)) {
      issues.push({
        level: "error",
        code: "INVALID_AMOUNT",
        fileName,
        message: "Budget amount must be numeric.",
        row: rowIndex + 2,
        column: columns.amount,
      });
    }
  }

  return issues;
}

function validateRiskSheet(fileName: string, sheet: ParsedImportSheet): ImportIssue[] {
  const issues: ImportIssue[] = [];
  const columns = createColumnIndex(sheet.columns, RISK_FIELDS);

  for (const field of ["title", "probability", "impact"] as const) {
    if (!columns[field]) {
      issues.push({
        level: field === "title" ? "error" : "warning",
        code: "MISSING_COLUMN",
        fileName,
        message: `Risk register column for "${field}" is missing.`,
        column: field,
      });
    }
  }

  for (const [rowIndex, row] of sheet.rows.entries()) {
    for (const field of ["probability", "impact"] as const) {
      const value = parseNumericValue(getRowValue(row, columns[field]));
      if (value === null) {
        continue;
      }

      if (value < 1 || value > 5) {
        issues.push({
          level: "warning",
          code: "RISK_SCORE_OUT_OF_RANGE",
          fileName,
          message: `Risk ${field} should be within 1..5.`,
          row: rowIndex + 2,
          column: columns[field],
        });
      }
    }
  }

  return issues;
}

function validatePaymentSheet(fileName: string, sheet: ParsedImportSheet): ImportIssue[] {
  const issues: ImportIssue[] = [];
  const columns = createColumnIndex(sheet.columns, PAYMENT_FIELDS);

  if (!columns.amount) {
    issues.push({
      level: "warning",
      code: "MISSING_AMOUNT_COLUMN",
      fileName,
      message: "Payment history file does not contain an amount column.",
      column: "amount",
    });
  }

  for (const [rowIndex, row] of sheet.rows.entries()) {
    const amount = parseNumericValue(getRowValue(row, columns.amount));
    if (amount !== null && !Number.isFinite(amount)) {
      issues.push({
        level: "error",
        code: "INVALID_AMOUNT",
        fileName,
        message: "Payment amount must be numeric.",
        row: rowIndex + 2,
        column: columns.amount,
      });
    }

    const paymentDate = getRowValue(row, columns.paymentDate);
    if (paymentDate !== null && !isValidDateValue(paymentDate)) {
      issues.push({
        level: "warning",
        code: "INVALID_DATE",
        fileName,
        message: "Payment date could not be parsed.",
        row: rowIndex + 2,
        column: columns.paymentDate,
      });
    }
  }

  return issues;
}

function validateWorklogSheet(fileName: string, sheet: ParsedImportSheet): ImportIssue[] {
  const issues: ImportIssue[] = [];
  const columns = createColumnIndex(sheet.columns, WORKLOG_FIELDS);

  for (const field of ["date", "person", "hours"] as const) {
    if (!columns[field]) {
      issues.push({
        level: field === "hours" ? "warning" : "error",
        code: "MISSING_COLUMN",
        fileName,
        message: `Worklog column for "${field}" is missing.`,
        column: field,
      });
    }
  }

  for (const [rowIndex, row] of sheet.rows.entries()) {
    const hours = parseNumericValue(getRowValue(row, columns.hours));
    if (hours !== null && hours <= 0) {
      issues.push({
        level: "warning",
        code: "INVALID_HOURS",
        fileName,
        message: "Worklog hours should be greater than zero.",
        row: rowIndex + 2,
        column: columns.hours,
      });
    }

    const date = getRowValue(row, columns.date);
    if (date !== null && !isValidDateValue(date)) {
      issues.push({
        level: "warning",
        code: "INVALID_DATE",
        fileName,
        message: "Worklog date could not be parsed.",
        row: rowIndex + 2,
        column: columns.date,
      });
    }
  }

  return issues;
}

function buildWbsPreview(sheet: ParsedImportSheet): PreviewTable<WbsPreviewRow> {
  const columns = createColumnIndex(sheet.columns, WBS_FIELDS);

  return {
    totalRows: sheet.rowCount,
    columns: sheet.columns,
    sample: sheet.rows.slice(0, PREVIEW_SAMPLE_SIZE).map((row) => ({
      code: asString(getRowValue(row, columns.code)),
      title: asString(getRowValue(row, columns.title)),
      durationDays: parseNumericValue(getRowValue(row, columns.durationDays)),
      startDate: toIsoDate(getRowValue(row, columns.startDate)),
      endDate: toIsoDate(getRowValue(row, columns.endDate)),
    })),
  };
}

function buildBudgetPreview(sheet: ParsedImportSheet): PreviewTable<BudgetPreviewRow> {
  const columns = createColumnIndex(sheet.columns, BUDGET_FIELDS);

  return {
    totalRows: sheet.rowCount,
    columns: sheet.columns,
    sample: sheet.rows.slice(0, PREVIEW_SAMPLE_SIZE).map((row) => ({
      item: asString(getRowValue(row, columns.item)),
      amount: parseNumericValue(getRowValue(row, columns.amount)),
      period: toIsoDate(getRowValue(row, columns.period)) ?? asString(getRowValue(row, columns.period)),
      currency: asString(getRowValue(row, columns.currency)),
    })),
  };
}

function buildRiskPreview(sheet: ParsedImportSheet): PreviewTable<RiskPreviewRow> {
  const columns = createColumnIndex(sheet.columns, RISK_FIELDS);

  return {
    totalRows: sheet.rowCount,
    columns: sheet.columns,
    sample: sheet.rows.slice(0, PREVIEW_SAMPLE_SIZE).map((row) => ({
      title: asString(getRowValue(row, columns.title)),
      probability: parseNumericValue(getRowValue(row, columns.probability)),
      impact: parseNumericValue(getRowValue(row, columns.impact)),
      owner: asString(getRowValue(row, columns.owner)),
      status: asString(getRowValue(row, columns.status)),
    })),
  };
}

function buildPaymentPreview(
  sheet: ParsedImportSheet
): PreviewTable<PaymentHistoryPreviewRow> {
  const columns = createColumnIndex(sheet.columns, PAYMENT_FIELDS);

  return {
    totalRows: sheet.rowCount,
    columns: sheet.columns,
    sample: sheet.rows.slice(0, PREVIEW_SAMPLE_SIZE).map((row) => ({
      paymentDate: toIsoDate(getRowValue(row, columns.paymentDate)),
      amount: parseNumericValue(getRowValue(row, columns.amount)),
      counterparty: asString(getRowValue(row, columns.counterparty)),
      reference: asString(getRowValue(row, columns.reference)),
    })),
  };
}

function buildWorklogPreview(sheet: ParsedImportSheet): PreviewTable<WorklogPreviewRow> {
  const columns = createColumnIndex(sheet.columns, WORKLOG_FIELDS);

  return {
    totalRows: sheet.rowCount,
    columns: sheet.columns,
    sample: sheet.rows.slice(0, PREVIEW_SAMPLE_SIZE).map((row) => ({
      date: toIsoDate(getRowValue(row, columns.date)),
      person: asString(getRowValue(row, columns.person)),
      hours: parseNumericValue(getRowValue(row, columns.hours)),
      description: asString(getRowValue(row, columns.description)),
    })),
  };
}

function createColumnIndex(
  columns: string[],
  matchers?: FieldMatchers
): Record<string, string | undefined> {
  if (!matchers) {
    return {};
  }

  const normalizedColumns = columns.map((column) => ({
    original: column,
    normalized: normalizeHeader(column),
  }));

  return Object.fromEntries(
    Object.entries(matchers).map(([field, hints]) => {
      const match = normalizedColumns.find(({ normalized }) =>
        hints.some((hint) => normalized.includes(normalizeHeader(hint)))
      );
      return [field, match?.original];
    })
  );
}

function normalizeHeader(input: string): string {
  return input
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[()\-_/]+/g, " ")
    .replace(/[^\p{L}\p{N}\s]+/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

function getRowValue(row: Record<string, unknown>, key?: string): unknown {
  return key ? row[key] : null;
}

function parseNumericValue(value: unknown): number | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === "string") {
    const normalized = value.replace(/\s+/g, "").replace(",", ".");
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function isValidDateValue(value: unknown): boolean {
  return toIsoDate(value) !== null;
}

function toIsoDate(value: unknown): string | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) {
      return null;
    }

    const ruMatch = trimmed.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
    if (ruMatch) {
      const [, day, month, year] = ruMatch;
      return `${year}-${month}-${day}`;
    }

    const parsed = new Date(trimmed);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString().slice(0, 10);
    }
  }

  if (typeof value === "number") {
    const excelEpoch = new Date(Date.UTC(1899, 11, 30));
    const parsed = new Date(excelEpoch.getTime() + value * 24 * 60 * 60 * 1000);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString().slice(0, 10);
    }
  }

  return null;
}

function asString(value: unknown): string | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  return typeof value === "string" ? value : String(value);
}
