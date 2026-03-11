import assert from "node:assert/strict";

import * as XLSX from "xlsx";

import {
  previewProjectImport,
  validateProjectImport,
} from "@/lib/import/project-import-service";
import type { ImportInputFile } from "@/lib/import/types";

function createWorkbookFile(name: string, rows: Record<string, unknown>[]): ImportInputFile {
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
  const bytes = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;

  return {
    name,
    mimeType:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    bytes: new Uint8Array(bytes),
  };
}

async function testPreviewBuildsNormalizedSlices() {
  const files: ImportInputFile[] = [
    createWorkbookFile("WBS.xlsx", [
      {
        Код: "1.1",
        "Наименование работы": "Подготовить площадку",
        Дни: 5,
        Начало: "01.03.2026",
        Окончание: "05.03.2026",
      },
    ]),
    {
      name: "Budget_Plan.csv",
      mimeType: "text/csv",
      bytes: new TextEncoder().encode(
        "Статья;Сумма;Период;Валюта\nПодготовка;120000;01.03.2026;RUB\n"
      ),
    },
    {
      name: "Risk_Register.tsv",
      mimeType: "text/tab-separated-values",
      bytes: new TextEncoder().encode(
        "Риск\tВероятность\tВлияние\tОтветственный\nПоставка задерживается\t4\t5\tСнабжение\n"
      ),
    },
    {
      name: "Payment_History.csv",
      mimeType: "text/csv",
      bytes: new TextEncoder().encode(
        "Дата оплаты,Сумма,Контрагент,Номер\n2026-03-02,90000,ООО Поставщик,INV-01\n"
      ),
    },
    {
      name: "Worklog_Summary.csv",
      mimeType: "text/csv",
      bytes: new TextEncoder().encode(
        "Дата,Сотрудник,Часы,Описание\n2026-03-03,Иван,8,Смена на объекте\n"
      ),
    },
    {
      name: "Main_Contract.pdf",
      mimeType: "application/pdf",
      bytes: new TextEncoder().encode("%PDF-1.7\nplaceholder"),
    },
  ];

  const result = await previewProjectImport(files);

  assert.equal(result.summary.requiredMissing.length, 0);
  assert.equal(result.errors.length, 0);
  assert.ok(result.normalized.wbs);
  assert.equal(result.normalized.wbs?.sample[0].code, "1.1");
  assert.equal(result.normalized.budgetPlan?.sample[0].amount, 120000);
  assert.equal(result.normalized.riskRegister?.sample[0].probability, 4);
  assert.equal(result.normalized.paymentHistory?.sample[0].counterparty, "ООО Поставщик");
  assert.equal(result.normalized.worklogSummary?.sample[0].hours, 8);
  assert.equal(result.normalized.mainContract?.placeholder, true);
}

async function testValidationFlagsMissingRequiredInputs() {
  const result = await validateProjectImport([
    {
      name: "notes.txt",
      mimeType: "text/plain",
      bytes: new TextEncoder().encode("just notes"),
    },
  ]);

  assert.deepEqual(result.summary.requiredMissing, [
    "wbs",
    "budget_plan",
    "risk_register",
  ]);
  assert.equal(result.errors.length, 3);
  assert.ok(result.warnings.some((warning) => warning.code === "UNRECOGNIZED_FILE"));
}

async function main() {
  await testPreviewBuildsNormalizedSlices();
  await testValidationFlagsMissingRequiredInputs();
  console.log("PASS import-service.unit");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
