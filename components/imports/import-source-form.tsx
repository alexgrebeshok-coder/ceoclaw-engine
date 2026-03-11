import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { fieldStyles } from "@/components/ui/field";
import type {
  ImportFileKind,
  ProjectImportPreviewResult,
  ProjectImportValidationResult,
  RecognizedImportFile,
} from "@/lib/import/types";

type ImportResult = ProjectImportPreviewResult | ProjectImportValidationResult;

const requiredKinds: ImportFileKind[] = ["wbs", "budget_plan", "risk_register"];

function formatBytes(size: number) {
  if (size >= 1024 * 1024) {
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }

  if (size >= 1024) {
    return `${Math.round(size / 1024)} KB`;
  }

  return `${size} B`;
}

function summarizeTopRecognition(recognizedFiles: RecognizedImportFile[]) {
  return recognizedFiles
    .slice(0, 3)
    .map((file) => `${file.name} -> ${file.kind}`)
    .join(", ");
}

export function ImportSourceForm({
  activeRequest,
  error,
  files,
  message,
  onFilesChange,
  onPreview,
  onValidate,
  result,
}: {
  activeRequest: "preview" | "validate" | null;
  error: string | null;
  files: File[];
  message: string | null;
  onFilesChange: (files: File[]) => void;
  onPreview: () => void;
  onValidate: () => void;
  result: ImportResult | null;
}) {
  const missingRequired = result?.summary.requiredMissing ?? [];

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Upload and inspect</CardTitle>
        <CardDescription>
          Выберите комплект файлов проекта и прогоните сначала validation, затем normalized preview.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <label className="grid gap-2 text-sm">
          <span className="font-medium text-[var(--ink)]">Файлы импорта</span>
          <input
            accept=".csv,.tsv,.txt,.xls,.xlsx,.pdf"
            className={fieldStyles}
            multiple
            onChange={(event) => onFilesChange(Array.from(event.target.files ?? []))}
            type="file"
          />
        </label>

        <div className="grid gap-2">
          <p className="text-sm font-medium text-[var(--ink)]">Обязательные типы</p>
          <div className="flex flex-wrap gap-2">
            {requiredKinds.map((kind) => (
              <Badge
                key={kind}
                variant={missingRequired.includes(kind) ? "warning" : "info"}
              >
                {kind}
              </Badge>
            ))}
          </div>
        </div>

        <div className="rounded-[14px] border border-[var(--line)] bg-[var(--panel-soft)] p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-[var(--ink)]">Выбранные файлы</p>
            <Badge variant={files.length ? "success" : "neutral"}>{files.length}</Badge>
          </div>

          {files.length ? (
            <div className="mt-3 grid gap-2">
              {files.map((file) => (
                <div
                  key={`${file.name}-${file.size}`}
                  className="flex items-center justify-between gap-3 rounded-[12px] border border-[var(--line)] bg-[color:var(--surface-panel)] px-3 py-2 text-sm"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-[var(--ink)]">{file.name}</p>
                    <p className="truncate text-[var(--ink-muted)]">
                      {file.type || "unknown mime"}
                    </p>
                  </div>
                  <span className="shrink-0 text-[var(--ink-soft)]">{formatBytes(file.size)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">
              Поддерживаются `csv`, `tsv`, `xls/xlsx`, `pdf` и текстовые файлы.
            </p>
          )}
        </div>

        {result ? (
          <div className="rounded-[14px] border border-[var(--line)] bg-[var(--panel-soft)] p-4 text-sm">
            <p className="font-medium text-[var(--ink)]">Последний результат</p>
            <p className="mt-2 leading-6 text-[var(--ink-soft)]">
              Распознано {result.summary.recognizedFiles} из {result.summary.totalFiles} файлов.
              {result.summary.requiredMissing.length
                ? ` Не хватает обязательных типов: ${result.summary.requiredMissing.join(", ")}.`
                : " Обязательный минимум закрыт."}
            </p>
            {result.recognizedFiles.length ? (
              <p className="mt-2 leading-6 text-[var(--ink-muted)]">
                {summarizeTopRecognition(result.recognizedFiles)}
              </p>
            ) : null}
          </div>
        ) : null}

        {message ? (
          <div className="rounded-[12px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
            {message}
          </div>
        ) : null}

        {error ? (
          <div className="rounded-[12px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
            {error}
          </div>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <Button
            disabled={activeRequest !== null || files.length === 0}
            onClick={onValidate}
            type="button"
            variant="secondary"
          >
            {activeRequest === "validate" ? "Проверка..." : "Validate files"}
          </Button>
          <Button
            disabled={activeRequest !== null || files.length === 0}
            onClick={onPreview}
            type="button"
          >
            {activeRequest === "preview" ? "Построение..." : "Build preview"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
