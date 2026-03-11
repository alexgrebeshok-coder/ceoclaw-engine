import type { OneCProjectFinanceSample } from "@/lib/connectors/one-c-client";
import type { GpsTelemetrySample } from "@/lib/connectors/gps-client";
import type {
  EvidenceFusionFactView,
  EvidenceVerificationStatus,
} from "@/lib/evidence";

export type EnterpriseTruthProjectStatus =
  | "corroborated"
  | "field_only"
  | "finance_only";

export interface EnterpriseTruthFinanceView {
  sample: OneCProjectFinanceSample | null;
  variance: number | null;
  variancePercent: number | null;
  reportDate: string | null;
}

export interface EnterpriseTruthFieldView {
  reportCount: number;
  fusedFactCount: number;
  strongestVerificationStatus: EvidenceVerificationStatus | "none";
  latestObservedAt: string | null;
}

export interface EnterpriseTruthProjectView {
  id: string;
  projectId: string | null;
  projectName: string;
  financeProjectId: string | null;
  status: EnterpriseTruthProjectStatus;
  finance: EnterpriseTruthFinanceView;
  field: EnterpriseTruthFieldView;
  explanation: string;
}

export interface EnterpriseTruthTelemetryGapView {
  id: string;
  equipmentId: string | null;
  geofenceName: string | null;
  observedAt: string;
  confidence: number | null;
  explanation: string;
}

export interface EnterpriseTruthSummary {
  totalProjects: number;
  corroborated: number;
  fieldOnly: number;
  financeOnly: number;
  telemetryGaps: number;
  largestVarianceProject: string | null;
}

export interface EnterpriseTruthOverview {
  syncedAt: string;
  summary: EnterpriseTruthSummary;
  projects: EnterpriseTruthProjectView[];
  telemetryGaps: EnterpriseTruthTelemetryGapView[];
}

export interface EnterpriseTruthQuery {
  limit?: number;
  projectId?: string;
  telemetryLimit?: number;
}

export interface EnterpriseTruthTelemetrySource {
  evidenceId?: string;
  evidenceEntityRef?: string;
  sample: GpsTelemetrySample;
}

export interface EnterpriseTruthProjectGroup {
  key: string;
  projectName: string;
  projectId: string | null;
  financeProjectId: string | null;
  financeSample: OneCProjectFinanceSample | null;
  fieldEvidenceIds: string[];
  fusionFacts: EvidenceFusionFactView[];
}
