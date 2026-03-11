import assert from "node:assert/strict";

import {
  getEvidenceLedgerOverview,
  getEvidenceRecordById,
  mapGpsSnapshotToEvidenceInputs,
  mapWorkReportToEvidenceInput,
} from "@/lib/evidence";
import type { GpsTelemetrySampleSnapshot } from "@/lib/connectors/gps-client";
import type { WorkReportView } from "@/lib/work-reports/types";

type StoredRecord = {
  id: string;
  sourceType: string;
  sourceRef: string | null;
  entityType: string;
  entityRef: string;
  projectId: string | null;
  title: string;
  summary: string | null;
  observedAt: Date;
  reportedAt: Date | null;
  confidence: number;
  verificationStatus: string;
  metadataJson: string | null;
  createdAt: Date;
  updatedAt: Date;
};

function createWorkReport(status: WorkReportView["status"]): WorkReportView {
  return {
    id: `report-${status}`,
    reportNumber: `#20260311${status}`,
    projectId: "project-1",
    project: { id: "project-1", name: "Arctic Road" },
    authorId: "member-1",
    author: { id: "member-1", name: "Alexey", initials: "AM", role: "PM" },
    reviewerId: status === "approved" ? "member-2" : null,
    reviewer:
      status === "approved"
        ? { id: "member-2", name: "Maria", initials: "MK", role: "OPS" }
        : null,
    section: "km 10+000",
    reportDate: "2026-03-11T00:00:00.000Z",
    workDescription: "Excavation and compaction were performed during the day shift.",
    volumes: [],
    personnelCount: 12,
    personnelDetails: null,
    equipment: "Excavator",
    weather: null,
    issues: null,
    nextDayPlan: null,
    attachments: [],
    status,
    reviewComment: status === "approved" ? "Confirmed on site." : null,
    source: "manual",
    externalReporterTelegramId: null,
    externalReporterName: null,
    submittedAt: "2026-03-11T08:00:00.000Z",
    reviewedAt: status === "approved" ? "2026-03-11T12:00:00.000Z" : null,
    createdAt: "2026-03-11T08:00:00.000Z",
    updatedAt: "2026-03-11T12:00:00.000Z",
  };
}

function createGpsSnapshot(): GpsTelemetrySampleSnapshot {
  return {
    id: "gps",
    checkedAt: "2026-03-11T13:00:00.000Z",
    configured: true,
    status: "ok",
    message: "GPS telemetry sample returned 1 session record.",
    missingSecrets: [],
    sampleUrl: "https://gps.example.com/api/v1/sessions?page_size=3",
    samples: [
      {
        source: "gps",
        sessionId: "sess-20260311-001",
        equipmentId: "EXC-KOM-01",
        equipmentType: "excavator",
        status: "work",
        startedAt: "2026-03-11T08:00:00.000Z",
        endedAt: "2026-03-11T10:15:00.000Z",
        durationSeconds: 8100,
        geofenceId: "GF-YANAO-01",
        geofenceName: "YANAO Earthwork Zone",
      },
    ],
    metadata: {
      sampleCount: 1,
    },
  };
}

function createFakeEvidenceStore() {
  const records = new Map<string, StoredRecord>();

  return {
    async upsert(args: {
      where: {
        sourceType_entityType_entityRef: {
          entityRef: string;
          entityType: string;
          sourceType: string;
        };
      };
      create: Omit<StoredRecord, "id" | "createdAt" | "updatedAt">;
      update: Omit<StoredRecord, "id" | "createdAt" | "updatedAt">;
    }) {
      const key = [
        args.where.sourceType_entityType_entityRef.sourceType,
        args.where.sourceType_entityType_entityRef.entityType,
        args.where.sourceType_entityType_entityRef.entityRef,
      ].join("|");
      const existing = records.get(key);
      const next: StoredRecord = existing
        ? {
            ...existing,
            ...args.update,
            updatedAt: new Date("2026-03-11T13:00:00.000Z"),
          }
        : {
            id: `evidence-${records.size + 1}`,
            ...args.create,
            createdAt: new Date("2026-03-11T13:00:00.000Z"),
            updatedAt: new Date("2026-03-11T13:00:00.000Z"),
          };

      records.set(key, next);
      return next;
    },
    async findMany(args: {
      orderBy: { observedAt: "desc" };
      take: number;
      where?: {
        entityRef?: string;
        entityType?: string;
        projectId?: string;
        verificationStatus?: string;
      };
    }) {
      return Array.from(records.values())
        .filter((record) => {
          if (args.where?.entityType && record.entityType !== args.where.entityType) return false;
          if (args.where?.entityRef && record.entityRef !== args.where.entityRef) return false;
          if (args.where?.projectId && record.projectId !== args.where.projectId) return false;
          if (
            args.where?.verificationStatus &&
            record.verificationStatus !== args.where.verificationStatus
          ) {
            return false;
          }
          return true;
        })
        .sort((left, right) => right.observedAt.getTime() - left.observedAt.getTime())
        .slice(0, args.take);
    },
    async findUnique(args: { where: { id: string } }) {
      return Array.from(records.values()).find((record) => record.id === args.where.id) ?? null;
    },
  };
}

async function testWorkReportMappingStates() {
  const submitted = mapWorkReportToEvidenceInput(createWorkReport("submitted"));
  const approved = mapWorkReportToEvidenceInput(createWorkReport("approved"));
  const rejected = mapWorkReportToEvidenceInput(createWorkReport("rejected"));

  assert.equal(submitted?.verificationStatus, "reported");
  assert.equal(approved?.verificationStatus, "verified");
  assert.equal(rejected, null);
}

async function testGpsSnapshotMappingStaysObserved() {
  const inputs = mapGpsSnapshotToEvidenceInputs(createGpsSnapshot());

  assert.equal(inputs.length, 1);
  assert.equal(inputs[0]?.verificationStatus, "observed");
  assert.equal(inputs[0]?.entityType, "gps_session");
  assert.equal(inputs[0]?.confidence, 0.95);
}

async function testEvidenceOverviewSyncsAndListsRecords() {
  const store = createFakeEvidenceStore();
  const overview = await getEvidenceLedgerOverview(
    { limit: 10 },
    {
      evidenceStore: store,
      gpsSnapshot: createGpsSnapshot(),
      listReports: async () => [createWorkReport("submitted"), createWorkReport("approved")],
      now: () => new Date("2026-03-11T13:00:00.000Z"),
    }
  );

  assert.equal(overview.summary.total, 3);
  assert.equal(overview.summary.reported, 1);
  assert.equal(overview.summary.observed, 1);
  assert.equal(overview.summary.verified, 1);
  assert.deepEqual(
    overview.records.map((record) => record.verificationStatus).sort(),
    ["observed", "reported", "verified"]
  );

  const detail = await getEvidenceRecordById(overview.records[0]!.id, {
    evidenceStore: store,
  });
  assert.ok(detail);
  assert.equal(detail?.id, overview.records[0]?.id);
}

async function main() {
  await testWorkReportMappingStates();
  await testGpsSnapshotMappingStaysObserved();
  await testEvidenceOverviewSyncsAndListsRecords();
  console.log("PASS evidence.service.unit");
}

void main();
