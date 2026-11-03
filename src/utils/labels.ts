import type { DailyTaskPriority, DailyTaskStatus } from '../api/types';

export const statusLabel: Record<DailyTaskStatus, string> = {
  Pending: 'Pendiente',
  InProgress: 'En progreso',
  Done: 'Completado',
};

export const priorityLabel: Record<DailyTaskPriority, string> = {
  Low: 'Baja',
  Medium: 'Media',
  High: 'Alta',
};

export const statusOrder: DailyTaskStatus[] = ['Pending', 'InProgress', 'Done'];
export const priorityOrder: DailyTaskPriority[] = ['High', 'Medium', 'Low'];

export const historyActionLabel: Record<string, string> = {
  CREATED: 'Creado',
  UPDATED: 'Actualizado',
  STATUS_CHANGED: 'Cambio de estado',
  ASSIGNED: 'Reasignado',
  DELETED: 'Eliminado',
  RESTORED: 'Restaurado',
};

export const historyFieldLabel: Record<string, string> = {
  Title: 'Título',
  Description: 'Descripción',
  Priority: 'Prioridad',
  DueDate: 'Fecha de vencimiento',
  Status: 'Estado',
  AssignedTo: 'Responsable',
  AssignedToId: 'Responsable',
  CompletedAt: 'Fecha de completado',
};

/** Traduce valores de auditoría que llegan como enum o fecha. */
export function historyValueLabel(field: string | null, value: string | null): string {
  if (value == null || value === '') return '—';
  if (field === 'Status') return statusLabel[value as DailyTaskStatus] ?? value;
  if (field === 'Priority') return priorityLabel[value as DailyTaskPriority] ?? value;
  if (field === 'DueDate' || field === 'CompletedAt') {
    const [year, month, day] = value.split('T')[0].split('-');
    return year && month && day ? `${day}/${month}/${year}` : value;
  }
  return value;
}
