import type { ComplaintStatus, UserRole } from '../types';

export interface TransitionRule {
  from: ComplaintStatus;
  to: ComplaintStatus;
  allowedRoles: UserRole[];
  description: string;
}

export const VALID_TRANSITIONS: TransitionRule[] = [
  {
    from: 'Submitted',
    to: 'Acknowledged',
    allowedRoles: ['Authority', 'Admin'],
    description: 'Authority acknowledges receipt of complaint.',
  },
  {
    from: 'Submitted',
    to: 'Assigned',
    allowedRoles: ['Authority', 'Admin'],
    description: 'Authority directly assigns a field officer.',
  },
  {
    from: 'Acknowledged',
    to: 'Assigned',
    allowedRoles: ['Authority', 'Admin'],
    description: 'Authority assigns an acknowledged complaint to an officer.',
  },
  {
    from: 'Assigned',
    to: 'In Progress',
    allowedRoles: ['Field Officer', 'Authority', 'Admin'],
    description: 'Field officer or authority marks inspection/repair work as active.',
  },
  {
    from: 'In Progress',
    to: 'Resolved',
    allowedRoles: ['Field Officer', 'Authority', 'Admin'],
    description: 'Field officer or authority completes repair work.',
  },
  {
    from: 'Resolved',
    to: 'Closed',
    allowedRoles: ['Authority', 'Admin'],
    description: 'Authority closes resolved complaint after citizen feedback or audit verification.',
  },
  {
    from: 'Submitted',
    to: 'Closed',
    allowedRoles: ['Authority', 'Admin'],
    description: 'Authority closes invalid or duplicate reports.',
  },
  {
    from: 'Acknowledged',
    to: 'Closed',
    allowedRoles: ['Authority', 'Admin'],
    description: 'Authority closes non-actionable complaints.',
  },
];

export function validateStateTransition(
  currentStatus: ComplaintStatus,
  targetStatus: ComplaintStatus,
  userRole: UserRole
): { allowed: boolean; reason?: string } {
  if (currentStatus === targetStatus) {
    return { allowed: true };
  }

  const matchingRule = VALID_TRANSITIONS.find(
    (rule) => rule.from === currentStatus && rule.to === targetStatus
  );

  if (!matchingRule) {
    return {
      allowed: false,
      reason: `Invalid transition from "${currentStatus}" to "${targetStatus}".`,
    };
  }

  if (!matchingRule.allowedRoles.includes(userRole)) {
    return {
      allowed: false,
      reason: `Role "${userRole}" is not authorized to transition from "${currentStatus}" to "${targetStatus}".`,
    };
  }

  return { allowed: true };
}
