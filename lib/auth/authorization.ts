import type { StaffRole } from "@/types/domain";

export function requireRole(role: StaffRole, allowedRoles: StaffRole[]): void {
  if (!allowedRoles.includes(role)) {
    throw new Error("FORBIDDEN");
  }
}

export const ADMIN_ROLES: StaffRole[] = ["super_admin", "admin"];
export const STAFF_ROLES: StaffRole[] = [
  "super_admin",
  "admin",
  "lawyer",
  "counselor",
  "social_worker",
  "safeguarding_officer",
  "support_staff",
];