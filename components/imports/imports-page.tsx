"use client";

import Link from "next/link";
import { useState } from "react";

import { DomainApiCard } from "@/components/layout/domain-api-card";
import { DomainPageHeader } from "@/components/layout/domain-page-header";
import { ImportRunsTable } from "@/components/imports/import-runs-table";
import { ImportsOverviewCard } from "@/components/imports/imports-overview-card";
import { ImportSourceForm } from "@/components/imports/import-source-form";
import { buttonVariants } from "@/components/ui/button";
import type {
  ProjectImportPreviewResult,
  ProjectImportValidationResult,
} from "@/lib/import/types";

const backendEndpoints = [
  {
    method: "POST" as const,
    note: "Проверить комплект файлов, распознать типы, найти ошибки и обязательные пробелы без построения normalized preview.",
    path: "/api/import/validate",
  },
  {
    method: "POST" as const,
    note: "Построить полный import preview: validation summary + normalized slices по WBS, бюджету, рискам, платежам и worklog.",
    path: "/api/import/preview",
  },
];

type ImportResult = ProjectImportPreviewResult | ProjectImportValidationResult;
type ImportRequestMode = "preview" | "validate";

function isPreviewResult(result: ImportResult | null): result is ProjectImportPreviewResult {
  return Boolean(result && "normalized" in result);
}

export function ImportsPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [previewResult, setPreviewResult] = useState<ProjectImportPreviewResult | null>(null);
  const [activeRequest, setActiveRequest] = useState<ImportRequestMode | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function runImport(mode: ImportRequestMode) {
    if (!files.length) {
      setError("Выберите хотя бы один файл для проверки.");
      setMessage(null);
      return;
    }

    setActiveRequest(mode);
    setError(null);
    setMessage(null);

    const formData = new FormData();
    for (const file of files) {
      formData.append("files", file);
    }

    try {
      const response = await fetch(mode === "validate" ? "/api/import/validate" : "/api/import/preview", {
        method: "POST",
        body: formData,
      });

      const payload = (await response.json()) as
        | ImportResult
        | { error?: { message?: string } };

      if (!response.ok) {
        throw new Error(
          "error" in payload && payload.error?.message
            ? payload.error.message
            : "Не удалось обработать импорт."
        );
      }

      const nextResult = payload as ImportResult;
      setResult(nextResult);

      if (isPreviewResult(nextResult)) {
        setPreviewResult(nextResult);
      } else {
        setPreviewResult(null);
      }

      setMessage(
        mode === "validate"
          ? "Проверка файлов завершена. Можно смотреть ошибки и обязательные пробелы."
          : "Preview построен. Доступны normalized slices по распознанным данным."
      );
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Не удалось обработать импорт."
      );
      setMessage(null);
    } finally {
      setActiveRequest(null);
    }
  }

  function handleFilesChange(nextFiles: File[]) {
    setFiles(nextFiles);
    setResult(null);
    setPreviewResult(null);
    setMessage(null);
    setError(null);
  }

  const recognizedCount = result?.summary.recognizedFiles ?? 0;
  const missingRequiredCount = result?.summary.requiredMissing.length ?? 0;

  return (
    <div className="grid gap-6">
      <DomainPageHeader
        actions={
          <Link className={buttonVariants({ variant: "outline" })} href="/projects">
            Вернуться к проектам
          </Link>
        }
        chips={[
          {
            label: files.length ? `${files.length} file(s) selected` : "No files selected",
            variant: files.length ? "info" : "warning",
          },
          {
            label: result ? `${recognizedCount} recognized` : "Awaiting intake",
            variant: result ? "success" : "neutral",
          },
          {
            label:
              result && missingRequiredCount > 0
                ? `${missingRequiredCount} required missing`
                : previewResult
                  ? "Preview ready"
                  : "Validate first",
            variant:
              result && missingRequiredCount > 0
                ? "warning"
                : previewResult
                  ? "success"
                  : "info",
          },
        ]}
        description="Страница импорта теперь опирается на живой import backend: multipart upload, validation summary и normalized preview без фейковой job-очереди."
        eyebrow="Data intake"
        title="Imports"
      />

      <ImportsOverviewCard result={result} selectedFileCount={files.length} />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
        <ImportRunsTable result={result} />
        <ImportSourceForm
          activeRequest={activeRequest}
          error={error}
          files={files}
          message={message}
          onFilesChange={handleFilesChange}
          onPreview={() => runImport("preview")}
          onValidate={() => runImport("validate")}
          result={result}
        />
      </div>

      <DomainApiCard
        description="UI больше не ждёт несуществующие import jobs. Он работает поверх текущих validate/preview контрактов и может быть расширен до commit/apply позже."
        endpoints={backendEndpoints}
        title="Backend Endpoints"
      />
    </div>
  );
}
