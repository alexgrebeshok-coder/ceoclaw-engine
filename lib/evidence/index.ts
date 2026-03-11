export {
  getEvidenceLedgerOverview,
  getEvidenceRecordById,
  mapGpsSnapshotToEvidenceInputs,
  mapWorkReportToEvidenceInput,
  summarizeEvidenceRecords,
} from "@/lib/evidence/service";
export type {
  EvidenceListResult,
  EvidenceMetadata,
  EvidenceQuery,
  EvidenceRecordView,
  EvidenceSummary,
  EvidenceUpsertInput,
  EvidenceVerificationStatus,
} from "@/lib/evidence/types";
