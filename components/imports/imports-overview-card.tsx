import { DomainMetricCard } from "@/components/layout/domain-metric-card";
import type {
  ProjectImportPreviewResult,
  ProjectImportValidationResult,
} from "@/lib/import/types";

type ImportResult = ProjectImportPreviewResult | ProjectImportValidationResult;

function countPreviewSlices(result: ImportResult | null) {
  if (!result || !("normalized" in result)) {
    return 0;
  }

  return Object.values(result.normalized).filter(Boolean).length;
}

export function ImportsOverviewCard({
  result,
  selectedFileCount,
}: {
  result: ImportResult | null;
  selectedFileCount: number;
}) {
  const recognizedFiles = result?.summary.recognizedFiles ?? 0;
  const blockingIssues = result?.errors.length ?? 0;
  const previewSlices = countPreviewSlices(result);

  return (
    <div className="grid gap-4 xl:grid-cols-4">
      <DomainMetricCard
        detail="Количество файлов, которые оператор положил в текущий intake batch."
        label="Selected files"
        status={{ label: selectedFileCount > 0 ? "Loaded" : "Awaiting", variant: selectedFileCount > 0 ? "info" : "neutral" }}
        value={String(selectedFileCount)}
      />
      <DomainMetricCard
        detail="Сколько файлов import engine уже смог классифицировать по доменному типу."
        label="Recognized"
        status={{ label: recognizedFiles > 0 ? "Mapped" : "Idle", variant: recognizedFiles > 0 ? "success" : "neutral" }}
        value={String(recognizedFiles)}
      />
      <DomainMetricCard
        detail="Блокирующие ошибки в составе импорта: missing required files, unrecognized inputs и format issues."
        label="Blocking issues"
        status={{ label: blockingIssues > 0 ? "Attention" : "Clear", variant: blockingIssues > 0 ? "warning" : "success" }}
        value={String(blockingIssues)}
      />
      <DomainMetricCard
        detail="Количество normalized preview slices, которые уже подготовлены для дальнейшего commit/apply контура."
        label="Preview slices"
        status={{ label: previewSlices > 0 ? "Ready" : "None", variant: previewSlices > 0 ? "success" : "neutral" }}
        value={String(previewSlices)}
      />
    </div>
  );
}
