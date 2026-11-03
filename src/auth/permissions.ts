import type { DailyTask } from '../api/types';
import type { Session } from './session';

export const isManager = (session: Session | null): boolean => session?.role === 'MANAGER';

export const canEditTask = (session: Session | null, task: Pick<DailyTask, 'assignedToId'>): boolean =>
  isManager(session) || task.assignedToId === session?.id;

export const canAssignTask = (session: Session | null): boolean => isManager(session);

export const canDeleteTask = (session: Session | null): boolean => isManager(session);

export const canRestoreTask = (session: Session | null): boolean => isManager(session);

export const canSeeDeleted = (session: Session | null): boolean => isManager(session);

export const canSeeGlobalReports = (session: Session | null): boolean => isManager(session);
