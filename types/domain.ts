export type StaffRole =
  | "super_admin"
  | "admin"
  | "lawyer"
  | "counselor"
  | "social_worker"
  | "safeguarding_officer"
  | "support_staff";

export type CaseStatus =
  | "new"
  | "awaiting_assignment"
  | "assigned"
  | "contact_attempted"
  | "in_follow_up"
  | "awaiting_user"
  | "referred"
  | "escalated"
  | "resolved"
  | "closed";

export type RiskLevel = "none" | "low" | "medium" | "high" | "urgent";

export type SafetyAssessment = {
  immediateDanger: boolean;
  potentialRisk: RiskLevel;
  childSafetyConcern: boolean;
  violenceConcern: boolean;
  coercionConcern: boolean;
  harassmentConcern: boolean;
  selfHarmConcern: boolean;
  professionalSupportRecommended: boolean;
  emergencyPathwayRecommended: boolean;
  confidence: number;
  rationale: string;
};