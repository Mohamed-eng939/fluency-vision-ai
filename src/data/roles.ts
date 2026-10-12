import type { UserRole } from '@/contexts/auth/types';

/**
 * Student-facing labels for the stored roles. The DB role names never change
 * (so RLS + existing logic keep working); only the presentation does.
 *   admin   → Global Admin (owner; access to everything + can review/override)
 *   assessor→ Tester
 *   learner → Student
 *   agent   → Sales Agent
 */
export const ROLE_LABEL: Record<UserRole, string> = {
  admin: 'Global Admin',
  assessor: 'Tester',
  learner: 'Student',
  agent: 'Sales Agent',
};

export const roleLabel = (role?: string | null): string =>
  (role && ROLE_LABEL[role as UserRole]) || role || '—';

/** Roles an admin can assign, in the order shown in pickers. */
export const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: 'learner', label: ROLE_LABEL.learner },
  { value: 'assessor', label: ROLE_LABEL.assessor },
  { value: 'agent', label: ROLE_LABEL.agent },
  { value: 'admin', label: ROLE_LABEL.admin },
];

export const roleBadgeClass = (role?: string | null): string => {
  switch (role) {
    case 'admin':
      return 'bg-purple-100 text-purple-800';
    case 'assessor':
      return 'bg-blue-100 text-blue-800';
    case 'agent':
      return 'bg-teal-100 text-teal-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};
