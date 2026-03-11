import assert from "node:assert/strict";

import { getEnterpriseTruthOverview } from "@/lib/enterprise-truth";
import type { GpsTelemetrySampleSnapshot } from "@/lib/connectors/gps-client";
import type { OneCFinanceSampleSnapshot } from "@/lib/connectors/one-c-client";
import type { EvidenceFusionOverview, EvidenceListResult, EvidenceRecordView } from "@/lib/evidence";

function createEvidenceRecord(input: {
  id: string;
  entityType: string;
  entityRef: string;
  projectId?: string | null;
  projectName?: string | null;
  title: string;
  verificationStatus: EvidenceRecordView["verificationStatus"];
  observedAt: string;
  confidence: number;
  metadata?: Record<string, string | number | boolean | null>;
}) {
  return {
    id: input.id,
    sourceType: input.entityType === "gps_session" ? "gps_api:session_sample" : "work_report:manual",
    sourceRef: input.entityRef,
    entityType: input.entityType,
    entityRef: input.entityRef,
    projectId: input.projectId ?? null,
    title: input.title,
    summary: "Synthetic enterprise truth evidence.",
    observedAt: input.observedAt,
    reportedAt: input.observedAt,
    confidence: input.confidence,
    verificationStatus: input.verificationStatus,
    metadata: {
      ...(input.projectName ? { projectName: input.projectName } : {}),
      ...(input.metadata ?? {}),
    },
    createdAt: input.observedAt,
    updatedAt: input.observedAt,
  } satisfies EvidenceRecordView;
}

function createEvidence(): EvidenceListResult {
  return {
    syncedAt: "2026-03-11T16:00:00.000Z",
    summary: {
      total: 4,
      reported: 1,
      observed: 2,
      verified: 1,
      averageConfidence: 0.76,
      lastObservedAt: "2026-03-11T16:00:00.000Z",
    },
    records: [
      createEvidenceRecord({
        id: "work-1",
        entityType: "work_report",
        entityRef: "report-1",
        projectId: "internal-yamal",
        projectName: "Yamal Earthwork Package",
        title: "#20260311-001 · km 10+000",
        verificationStatus: "verified",
        observedAt: "2026-03-11T12:00:00.000Z",
        confidence: 0.82,
      }),
      createEvidenceRecord({
        id: "work-2",
        entityType: "work_report",
        entityRef: "report-2",
        projectId: "internal-field",
        projectName: "Remote Camp Base",
        title: "#20260311-002 · camp base",
        verificationStatus: "reported",
        observedAt: "2026-03-11T13:00:00.000Z",
        confidence: 0.58,
      }),
      createEvidenceRecord({
        id: "gps-1",
        entityType: "gps_session",
        entityRef: "sess-1",
        title: "EXC-01 · work",
        verificationStatus: "observed",
        observedAt: "2026-03-11T10:15:00.000Z",
        confidence: 0.95,
        metadata: {
          equipmentId: "EXC-01",
          geofenceName: "Yamal Earthwork Zone",
        },
      }),
      createEvidenceRecord({
        id: "gps-2",
        entityType: "gps_session",
        entityRef: "sess-2",
        title: "BUL-07 · work",
        verificationStatus: "observed",
        observedAt: "2026-03-11T14:30:00.000Z",
        confidence: 0.92,
        metadata: {
          equipmentId: "BUL-07",
          geofenceName: "Remote Storage Yard",
        },
      }),
    ],
  };
}

function createFusion(): EvidenceFusionOverview {
  return {
    syncedAt: "2026-03-11T16:00:00.000Z",
    summary: {
      total: 1,
      reported: 0,
      observed: 0,
      verified: 1,
      averageConfidence: 0.95,
      strongestFactTitle: "#20260311-001 · km 10+000",
    },
    facts: [
      {
        id: "fusion:report-1",
        projectId: "internal-yamal",
        projectName: "Yamal Earthwork Package",
        title: "#20260311-001 · km 10+000",
        reportId: "report-1",
        reportNumber: "#20260311-001",
        reportDate: "2026-03-11T00:00:00.000Z",
        section: "km 10+000",
        observedAt: "2026-03-11T13:10:00.000Z",
        confidence: 0.95,
        verificationStatus: "verified",
        explanation: "GPS and visual evidence corroborate the work report.",
        sourceCount: 3,
        sources: [
          {
            recordId: "work-1",
            sourceType: "work_report:manual",
            entityType: "work_report",
            entityRef: "report-1",
            title: "#20260311-001 · km 10+000",
            confidence: 0.82,
            verificationStatus: "verified",
            observedAt: "2026-03-11T12:00:00.000Z",
            matchReasons: ["anchor_work_report"],
          },
          {
            recordId: "gps-1",
            sourceType: "gps_api:session_sample",
            entityType: "gps_session",
            entityRef: "sess-1",
            title: "EXC-01 · work",
            confidence: 0.95,
            verificationStatus: "observed",
            observedAt: "2026-03-11T10:15:00.000Z",
            matchReasons: ["same_report_day", "location_overlap"],
          },
        ],
      },
    ],
  };
}

function createOneCSample(): OneCFinanceSampleSnapshot {
  return {
    id: "one-c",
    checkedAt: "2026-03-11T16:05:00.000Z",
    configured: true,
    status: "ok",
    message: "ok",
    missingSecrets: [],
    sampleUrl: "/api/v1/project-financials",
    samples: [
      {
        source: "one-c",
        projectId: "1c-yamal",
        projectName: "Yamal Earthwork Package",
        status: "active",
        currency: "RUB",
        reportDate: "2026-03-11T00:00:00.000Z",
        plannedBudget: 100,
        actualBudget: 115,
        paymentsActual: 80,
        actsActual: 75,
        variance: 15,
        variancePercent: 15,
      },
      {
        source: "one-c",
        projectId: "1c-logistics",
        projectName: "Northern Logistics Hub",
        status: "active",
        currency: "RUB",
        reportDate: "2026-03-11T00:00:00.000Z",
        plannedBudget: 100,
        actualBudget: 92,
        paymentsActual: 60,
        actsActual: 58,
        variance: -8,
        variancePercent: -8,
      },
    ],
  };
}

function createGpsSample(): GpsTelemetrySampleSnapshot {
  return {
    id: "gps",
    checkedAt: "2026-03-11T16:10:00.000Z",
    configured: true,
    status: "ok",
    message: "ok",
    missingSecrets: [],
    sampleUrl: "/api/v1/sessions",
    samples: [
      {
        source: "gps",
        sessionId: "sess-1",
        equipmentId: "EXC-01",
        equipmentType: "excavator",
        status: "work",
        startedAt: "2026-03-11T08:00:00.000Z",
        endedAt: "2026-03-11T10:15:00.000Z",
        durationSeconds: 8100,
        geofenceId: "gf-1",
        geofenceName: "Yamal Earthwork Zone",
      },
      {
        source: "gps",
        sessionId: "sess-2",
        equipmentId: "BUL-07",
        equipmentType: "bulldozer",
        status: "work",
        startedAt: "2026-03-11T13:30:00.000Z",
        endedAt: "2026-03-11T14:30:00.000Z",
        durationSeconds: 3600,
        geofenceId: "gf-2",
        geofenceName: "Remote Storage Yard",
      },
    ],
  };
}

async function testEnterpriseTruthCombinesFinanceFieldAndTelemetry() {
  const overview = await getEnterpriseTruthOverview(
    { limit: 6, telemetryLimit: 4 },
    {
      evidence: createEvidence(),
      fusion: createFusion(),
      oneCSample: createOneCSample(),
      gpsSample: createGpsSample(),
      now: () => new Date("2026-03-11T16:10:00.000Z"),
    }
  );

  assert.equal(overview.summary.totalProjects, 3);
  assert.equal(overview.summary.corroborated, 1);
  assert.equal(overview.summary.financeOnly, 1);
  assert.equal(overview.summary.fieldOnly, 1);
  assert.equal(overview.summary.telemetryGaps, 1);
  assert.equal(overview.summary.largestVarianceProject, "Yamal Earthwork Package");

  const yamal = overview.projects.find((item) => item.projectName === "Yamal Earthwork Package");
  assert.equal(yamal?.status, "corroborated");
  assert.equal(yamal?.field.strongestVerificationStatus, "verified");
  assert.equal(yamal?.field.fusedFactCount, 1);
  assert.equal(yamal?.finance.variancePercent, 15);

  const financeOnly = overview.projects.find((item) => item.projectName === "Northern Logistics Hub");
  assert.equal(financeOnly?.status, "finance_only");
  assert.match(financeOnly?.explanation ?? "", /no field evidence/i);

  const fieldOnly = overview.projects.find((item) => item.projectName === "Remote Camp Base");
  assert.equal(fieldOnly?.status, "field_only");
  assert.equal(fieldOnly?.field.strongestVerificationStatus, "reported");

  assert.equal(overview.telemetryGaps[0]?.equipmentId, "BUL-07");
  assert.match(overview.telemetryGaps[0]?.explanation ?? "", /no corroborating work report/i);
}

async function main() {
  await testEnterpriseTruthCombinesFinanceFieldAndTelemetry();
  console.log("PASS enterprise-truth.unit");
}

void main();
