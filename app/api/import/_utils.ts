import { NextRequest } from "next/server";

import { badRequest } from "@/lib/server/api-utils";
import type { ImportInputFile } from "@/lib/import/types";

interface JsonImportFile {
  name?: unknown;
  mimeType?: unknown;
  contentBase64?: unknown;
  text?: unknown;
}

export async function extractImportFiles(request: NextRequest): Promise<ImportInputFile[]> {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    return extractFilesFromFormData(request);
  }

  return extractFilesFromJson(request);
}

async function extractFilesFromFormData(request: NextRequest): Promise<ImportInputFile[]> {
  const formData = await request.formData();
  const formFiles = formData.getAll("files");

  const files = await Promise.all(
    formFiles
      .filter((entry): entry is File => entry instanceof File)
      .map(async (file) => ({
        name: file.name,
        mimeType: file.type,
        bytes: new Uint8Array(await file.arrayBuffer()),
      }))
  );

  if (!files.length) {
    throw badRequest("Request must include one or more files.");
  }

  return files;
}

async function extractFilesFromJson(request: NextRequest): Promise<ImportInputFile[]> {
  const body = await request.json();
  const files = Array.isArray(body?.files) ? (body.files as JsonImportFile[]) : [];

  if (!files.length) {
    throw badRequest("Request body must include a non-empty files array.");
  }

  const normalizedFiles = files.map((file, index) => normalizeJsonFile(file, index));

  if (!normalizedFiles.length) {
    throw badRequest("Request body must include a non-empty files array.");
  }

  return normalizedFiles;
}

function normalizeJsonFile(file: JsonImportFile, index: number): ImportInputFile {
  if (typeof file.name !== "string" || !file.name.trim()) {
    throw badRequest(`files[${index}].name is required.`);
  }

  if (typeof file.contentBase64 === "string" && file.contentBase64.length > 0) {
    return {
      name: file.name,
      mimeType: typeof file.mimeType === "string" ? file.mimeType : undefined,
      bytes: new Uint8Array(Buffer.from(file.contentBase64, "base64")),
    };
  }

  if (typeof file.text === "string") {
    return {
      name: file.name,
      mimeType: typeof file.mimeType === "string" ? file.mimeType : "text/plain",
      bytes: new TextEncoder().encode(file.text),
    };
  }

  throw badRequest(
    `files[${index}] must include either contentBase64 or text content.`
  );
}
