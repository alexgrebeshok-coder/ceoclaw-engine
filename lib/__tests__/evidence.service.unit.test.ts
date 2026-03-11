import assert from "node:assert/strict";

import type { GpsTelemetrySampleSnapshot } from "@/lib/connectors/gps-client";
import {
  getEvidenceLedgerOverview,
  getEvidenceRecordById,
  mapGpsSnapshotToEvidenceInputs,
  mapWorkReportToEvidenceInput,
  removeEvidenceRecordForEntity,
  syncEvidenceLedger,
  syncWorkReportEvidenceRecord,
} from "@/lib/evidence";
import type { DerivedSyncMetadata } from "@/lib/sync-state";
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

type StoredSyncState = {
  key: string;
  status: string;
  lastStartedAt: Date | null;
  lastCompletedAt: Date | null;
  lastSuccessAt: Date | null;
  lastError: string | null;
  lastResultCount: number | null;
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
    async deleteMany(args: { where: { entityRef?: string; entityType?: string; sourceType?: string } }) {
      let count = 0;
      for (const [key, record] of records.entries()) {
        if (args.where.entityRef && record.entityRef !== args.where.entityRef) continue;
        if (args.where.entityType && record.entityType !== args.where.entityType) continue;
        if (args.where.sourceType && record.sourceType !== args.where.sourceType) continue;
        records.delete(key);
        count += 1;
      }
      return { count };
    },
  };
}

function createFakeSyncStore() {
  const states = new Map<string, StoredSyncState>();

  function clone(state: StoredSyncState) {
    return {
      ...state,
      lastStartedAt: state.lastStartedAt ? new Date(state.lastStartedAt) : null,
      lastCompletedAt: state.lastCompletedAt ? new Date(state.lastCompletedAt) : null,
      lastSuccessAt: state.lastSuccessAt ? new Date(state.lastSuccessAt) : null,
      createdAt: new Date(state.createdAt),
      updatedAt: new Date(state.updatedAt),
    };
  }

  return {
    async findUnique(args: { where: { key: string } }) {
      const state = states.get(args.where.key);
      return state ? clone(state) : null;
    },
    async upsert(args: {
      where: { key: string };
      create: Omit<StoredSyncState, "createdAt" | "updatedAt">;
      update: Omit<StoredSyncState, "key" | "createdAt" | "updatedAt">;
    }) {
      const existing = states.get(args.where.key);
      const next = existing
        ? {
            ...existing,
            ...args.update,
            updatedAt: new Date("2026-03-11T13:00:00.000Z"),
          }
        : {
            ...args.create,
            createdAt: new Date("2026-03-11T13:00:00.000Z"),
            updatedAt: new Date("2026-03-11T13:00:00.000Z"),
          };

      states.set(args.where.key, next);
      return clone(next);
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

async function testEvidenceSyncAndReadOnlyOverview() {
  const store = createFakeEvidenceStore();
  const syncStore = createFakeSyncStore();

  await syncEvidenceLedger(
    {
      evidenceStore: store,
      gpsSnapshot: createGpsSnapshot(),
      listReports: async () => [createWorkReport("submitted"), createWorkReport("approved")],
      now: () => new Date("2026-03-11T13:00:00.000Z"),
      syncStore,
    },
    {
      includeGpsSample: true,
      includeWorkReports: true,
    }
  );

  const overview = await getEvidenceLedgerOverview(
    { limit: 10 },
    {
      evidenceStore: store,
      syncStore,
    }
  );

  assert.equal(overview.summary.total, 3);
  assert.equal(overview.summary.reported, 1);
  assert.equal(overview.summary.observed, 1);
  assert.equal(overview.summary.verified, 1);
  assert.equal(overview.sync?.status, "success");
  assert.equal((overview.sync?.metadata as DerivedSyncMetadata).workReportCount, 2);
  assert.equal(overview.syncedAt, "2026-03-11T13:00:00.000Z");

  const detail = await getEvidenceRecordById(overview.records[0]!.id, {
    evidenceStore: store,
  });
  assert.ok(detail);
  assert.equal(detail?.id, overview.records[0]?.id);
}

async function testWorkReportEvidenceUpsertAndDelete() {
  const store = createFakeEvidenceStore();
  const syncStore = createFakeSyncStore();
  const report = createWorkReport("submitted");

  await syncWorkReportEvidenceRecord(report, {
    evidenceStore: store,
    now: () => new Date("2026-03-11T14:00:00.000Z"),
    syncStore,
  });

  let overview = await getEvidenceLedgerOverview(
    { limit: 10 },
    {
      evidenceStore: store,
      syncStore,
    }
  );

  assert.equal(overview.summary.total, 1);
  assert.equal(overview.records[0]?.entityRef, report.id);

  const deletedCount = await removeEvidenceRecordForEntity("work_report", report.id, {
    evidenceStore: store,
    now: () => new Date("2026-03-11T15:00:00.000Z"),
    syncStore,
  });

  overview = await getEvidenceLedgerOverview(
    { limit: 10 },
    {
      evidenceStore: store,
      syncStore,
    }
  );

  assert.equal(deletedCount, 1);
  assert.equal(overview.summary.total, 0);
  assert.equal(overview.sync?.lastResultCount, 1);
}

async function main() {
  await testWorkReportMappingStates();
  await testGpsSnapshotMappingStaysObserved();
  await testEvidenceSyncAndReadOnlyOverview();
  await testWorkReportEvidenceUpsertAndDelete();
  console.log("PASS evidence.service.unit");
}

void main();
