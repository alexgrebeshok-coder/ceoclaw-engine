import { readImportFile } from "@/lib/import/file-reader";
import type {
  ImportInputFile,
  NormalizedImportPreview,
  ParsedImportFile,
  ProjectImportPreviewResult,
  ProjectImportValidationResult,
  RecognizedImportFile,
} from "@/lib/import/types";
import { REQUIRED_IMPORT_FILE_KINDS } from "@/lib/import/types";
import {
  buildNormalizedPreview,
  recognizeImportFile,
  validateRecognizedFile,
} from "@/lib/import/validators";

export async function validateProjectImport(
  files: ImportInputFile[]
): Promise<ProjectImportValidationResult> {
  const result = await analyzeProjectImport(files, false);
  const { normalized, ...validation } = result;
  void normalized;
  return validation;
}

export async function previewProjectImport(
  files: ImportInputFile[]
): Promise<ProjectImportPreviewResult> {
  return analyzeProjectImport(files, true);
}

async function analyzeProjectImport(
  files: ImportInputFile[],
  includePreview: boolean
): Promise<ProjectImportPreviewResult> {
  const parsedFiles = await Promise.all(files.map((file) => readImportFile(file)));
  const recognizedFiles = parsedFiles.map((parsed) => recognizeImportFile(parsed));
  const issues = recognizedFiles.flatMap((recognized, index) =>
    validateRecognizedFile(recognized, parsedFiles[index])
  );

  const normalized = includePreview
    ? mergePreviewFragments(recognizedFiles, parsedFiles)
    : ({} satisfies NormalizedImportPreview);

  const recognizedKinds = new Set(
    recognizedFiles
      .filter((file) => file.kind !== "unknown")
      .map((file) => file.kind)
  );

  const requiredMissing = REQUIRED_IMPORT_FILE_KINDS.filter(
    (kind) => !recognizedKinds.has(kind)
  );

  for (const kind of requiredMissing) {
    issues.push({
      level: "error",
      code: "REQUIRED_FILE_MISSING",
      fileName: kind,
      message: `Required import file "${kind}" is missing.`,
    });
  }

  for (const duplicateKind of findDuplicateKinds(recognizedFiles)) {
    issues.push({
      level: "warning",
      code: "DUPLICATE_FILE_KIND",
      fileName: duplicateKind,
      message: `Multiple files were recognized as "${duplicateKind}". Only preview data from the latest one is retained.`,
    });
  }

  return {
    recognizedFiles,
    errors: issues.filter((issue) => issue.level === "error"),
    warnings: issues.filter((issue) => issue.level === "warning"),
    normalized,
    summary: {
      totalFiles: files.length,
      recognizedFiles: recognizedFiles.filter((file) => file.kind !== "unknown").length,
      unknownFiles: recognizedFiles.filter((file) => file.kind === "unknown").length,
      requiredMissing,
    },
  };
}

function mergePreviewFragments(
  recognizedFiles: RecognizedImportFile[],
  parsedFiles: ParsedImportFile[]
): NormalizedImportPreview {
  return recognizedFiles.reduce<NormalizedImportPreview>((accumulator, recognized, index) => {
    const fragment = buildNormalizedPreview(recognized, parsedFiles[index]);
    return { ...accumulator, ...fragment };
  }, {});
}

function findDuplicateKinds(files: RecognizedImportFile[]) {
  const counts = new Map<string, number>();

  for (const file of files) {
    if (file.kind === "unknown") {
      continue;
    }
    counts.set(file.kind, (counts.get(file.kind) ?? 0) + 1);
  }

  return [...counts.entries()]
    .filter(([, count]) => count > 1)
    .map(([kind]) => kind);
}
