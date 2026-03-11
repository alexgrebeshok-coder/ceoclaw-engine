export type ImportFileKind =
  | "wbs"
  | "budget_plan"
  | "risk_register"
  | "payment_history"
  | "worklog_summary"
  | "main_contract"
  | "unknown";

export type ImportFileFormat =
  | "xlsx"
  | "xls"
  | "csv"
  | "tsv"
  | "text"
  | "pdf"
  | "unknown";

export type ImportRecognitionSource = "filename" | "columns" | "mime" | "format" | "unknown";
export type ImportIssueLevel = "error" | "warning";

export type TabularCell = string | number | boolean | null;
export type TabularRow = Record<string, TabularCell>;

export interface ImportInputFile {
  name: string;
  mimeType?: string | null;
  bytes: Uint8Array;
}

export interface ParsedImportSheet {
  name: string;
  columns: string[];
  rows: TabularRow[];
  rowCount: number;
}

export interface ParsedImportFile {
  name: string;
  mimeType?: string | null;
  size: number;
  format: ImportFileFormat;
  sheets: ParsedImportSheet[];
  textContent?: string;
  metadata: {
    encoding?: string;
    delimiter?: string;
  };
}

export interface ImportIssue {
  level: ImportIssueLevel;
  code: string;
  fileName: string;
  message: string;
  sheetName?: string;
  row?: number;
  column?: string;
}

export interface RecognizedImportFile {
  name: string;
  kind: ImportFileKind;
  format: ImportFileFormat;
  mimeType?: string | null;
  required: boolean;
  recognizedBy: ImportRecognitionSource[];
  size: number;
  sheetCount: number;
  rowCount: number;
  columns: string[];
}

export interface PreviewTable<T> {
  totalRows: number;
  columns: string[];
  sample: T[];
}

export interface WbsPreviewRow {
  code: string | null;
  title: string | null;
  durationDays: number | null;
  startDate: string | null;
  endDate: string | null;
}

export interface BudgetPreviewRow {
  item: string | null;
  amount: number | null;
  period: string | null;
  currency: string | null;
}

export interface RiskPreviewRow {
  title: string | null;
  probability: number | null;
  impact: number | null;
  owner: string | null;
  status: string | null;
}

export interface PaymentHistoryPreviewRow {
  paymentDate: string | null;
  amount: number | null;
  counterparty: string | null;
  reference: string | null;
}

export interface WorklogPreviewRow {
  date: string | null;
  person: string | null;
  hours: number | null;
  description: string | null;
}

export interface ContractMetadataPlaceholder {
  fileName: string;
  format: ImportFileFormat;
  size: number;
  placeholder: true;
}

export interface NormalizedImportPreview {
  wbs?: PreviewTable<WbsPreviewRow>;
  budgetPlan?: PreviewTable<BudgetPreviewRow>;
  riskRegister?: PreviewTable<RiskPreviewRow>;
  paymentHistory?: PreviewTable<PaymentHistoryPreviewRow>;
  worklogSummary?: PreviewTable<WorklogPreviewRow>;
  mainContract?: ContractMetadataPlaceholder;
}

export interface ProjectImportSummary {
  totalFiles: number;
  recognizedFiles: number;
  unknownFiles: number;
  requiredMissing: ImportFileKind[];
}

export interface ProjectImportValidationResult {
  recognizedFiles: RecognizedImportFile[];
  errors: ImportIssue[];
  warnings: ImportIssue[];
  summary: ProjectImportSummary;
}

export interface ProjectImportPreviewResult extends ProjectImportValidationResult {
  normalized: NormalizedImportPreview;
}

export const REQUIRED_IMPORT_FILE_KINDS: ImportFileKind[] = [
  "wbs",
  "budget_plan",
  "risk_register",
];
