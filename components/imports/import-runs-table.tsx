import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type {
  ContractMetadataPlaceholder,
  PreviewTable,
  ProjectImportPreviewResult,
  ProjectImportValidationResult,
} from "@/lib/import/types";

type ImportResult = ProjectImportPreviewResult | ProjectImportValidationResult;
type PreviewSectionValue = ContractMetadataPlaceholder | PreviewTable<Record<string, unknown>>;

function formatPreviewLabel(key: string) {
  switch (key) {
    case "wbs":
      return "WBS";
    case "budgetPlan":
      return "Budget plan";
    case "riskRegister":
      return "Risk register";
    case "paymentHistory":
      return "Payment history";
    case "worklogSummary":
      return "Worklog summary";
    case "mainContract":
      return "Main contract";
    default:
      return key;
  }
}

function isPreviewResult(result: ImportResult | null): result is ProjectImportPreviewResult {
  return Boolean(result && "normalized" in result);
}

function formatIssueVariant(level: "error" | "warning") {
  return level === "error" ? "danger" : "warning";
}

function renderPreviewValue(value: PreviewSectionValue) {
  if ("placeholder" in value) {
    return `${value.fileName} · ${value.format.toUpperCase()} · ${value.size} B`;
  }

  return `${value.totalRows} rows · ${value.columns.length} columns`;
}

export function ImportRunsTable({
  result,
}: {
  result: ImportResult | null;
}) {
  const previewEntries = isPreviewResult(result)
    ? Object.entries(result.normalized).filter(([, value]) => value)
    : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recognition and preview</CardTitle>
        <CardDescription>
          Левая панель показывает то, что реальный import engine распознал в загруженных файлах.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {!result ? (
          <div className="rounded-[14px] border border-dashed border-[var(--line-strong)] bg-[var(--panel-soft)] p-5 text-sm leading-6 text-[var(--ink-soft)]">
            Загрузите комплект файлов и выполните validation или preview, чтобы увидеть распознанные типы, issues и normalized slices.
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>File</TableHead>
                  <TableHead>Kind</TableHead>
                  <TableHead>Format</TableHead>
                  <TableHead>Rows / sheets</TableHead>
                  <TableHead>Required</TableHead>
                  <TableHead>Recognized by</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.recognizedFiles.map((file) => (
                  <TableRow key={`${file.name}-${file.kind}`}>
                    <TableCell className="font-medium">{file.name}</TableCell>
                    <TableCell>{file.kind}</TableCell>
                    <TableCell>{file.format.toUpperCase()}</TableCell>
                    <TableCell>
                      {file.rowCount} rows · {file.sheetCount} sheet(s)
                    </TableCell>
                    <TableCell>
                      <Badge variant={file.required ? "info" : "neutral"}>
                        {file.required ? "Required" : "Optional"}
                      </Badge>
                    </TableCell>
                    <TableCell>{file.recognizedBy.join(", ") || "unknown"}</TableCell>
                  </TableRow>
                ))}
                {!result.recognizedFiles.length ? (
                  <TableRow>
                    <TableCell className="text-[var(--ink-soft)]" colSpan={6}>
                      Файлы ещё не распознаны.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>

            {result.errors.length || result.warnings.length ? (
              <div className="grid gap-3">
                <h4 className="text-sm font-semibold text-[var(--ink)]">Issues</h4>
                {[...result.errors, ...result.warnings].map((issue, index) => (
                  <div
                    key={`${issue.code}-${issue.fileName}-${index}`}
                    className="rounded-[12px] border border-[var(--line)] bg-[var(--panel-soft)] p-4"
                  >
                    <div className="flex flex-wrap items-center gap-3">
                      <Badge variant={formatIssueVariant(issue.level)}>{issue.level}</Badge>
                      <span className="text-sm font-semibold text-[var(--ink)]">{issue.code}</span>
                      <span className="text-sm text-[var(--ink-soft)]">{issue.fileName}</span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">{issue.message}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-[12px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                Ошибок и предупреждений нет. Можно переходить к следующему шагу импорта.
              </div>
            )}

            {previewEntries.length ? (
              <div className="grid gap-3">
                <h4 className="text-sm font-semibold text-[var(--ink)]">Normalized preview</h4>
                <div className="grid gap-3">
                  {previewEntries.map(([key, value]) => {
                    const previewValue = value as PreviewSectionValue;
                    const sample =
                      "sample" in previewValue
                        ? JSON.stringify(previewValue.sample.slice(0, 2), null, 2)
                        : null;

                    return (
                      <div
                        key={key}
                        className="rounded-[12px] border border-[var(--line)] bg-[color:var(--surface-panel)] p-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-[var(--ink)]">
                              {formatPreviewLabel(key)}
                            </p>
                            <p className="mt-1 text-sm text-[var(--ink-soft)]">
                              {renderPreviewValue(previewValue)}
                            </p>
                          </div>
                          <Badge variant="success">Preview ready</Badge>
                        </div>

                        {sample ? (
                          <pre className="mt-4 overflow-x-auto rounded-[12px] bg-[var(--panel-soft)] p-4 text-xs leading-6 text-[var(--ink-soft)]">
                            {sample}
                          </pre>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  );
}
