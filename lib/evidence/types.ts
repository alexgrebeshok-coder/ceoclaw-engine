export type EvidenceVerificationStatus = "reported" | "observed" | "verified";

export interface EvidenceMetadata {
  [key: string]: string | number | boolean | null;
}

export interface EvidenceRecordView {
  id: string;
  sourceType: string;
  sourceRef: string | null;
  entityType: string;
  entityRef: string;
  projectId: string | null;
  title: string;
  summary: string | null;
  observedAt: string;
  reportedAt: string | null;
  confidence: number;
  verificationStatus: EvidenceVerificationStatus;
  metadata: EvidenceMetadata;
  createdAt: string;
  updatedAt: string;
}

export interface EvidenceSummary {
  total: number;
  reported: number;
  observed: number;
  verified: number;
  averageConfidence: number | null;
  lastObservedAt: string | null;
}

export interface EvidenceListResult {
  syncedAt: string;
  summary: EvidenceSummary;
  records: EvidenceRecordView[];
}

export interface EvidenceQuery {
  entityRef?: string;
  entityType?: string;
  limit?: number;
  projectId?: string;
  verificationStatus?: EvidenceVerificationStatus;
}

export interface EvidenceUpsertInput {
  sourceType: string;
  sourceRef?: string | null;
  entityType: string;
  entityRef: string;
  projectId?: string | null;
  title: string;
  summary?: string | null;
  observedAt: string;
  reportedAt?: string | null;
  confidence: number;
  verificationStatus: EvidenceVerificationStatus;
  metadata?: EvidenceMetadata;
}
