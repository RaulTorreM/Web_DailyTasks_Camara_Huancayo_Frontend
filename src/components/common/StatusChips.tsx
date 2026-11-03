import { Chip } from '@mui/material';
import type { DailyTaskPriority, DailyTaskStatus } from '../../api/types';
import { priorityLabel, statusLabel } from '../../utils/labels';
import { taskPriority, taskStatus } from '../../theme/tokens';

export const TaskStatusChip = ({ status }: { status: DailyTaskStatus }) => (
  <Chip
    size="small"
    label={statusLabel[status]}
    sx={{
      bgcolor: taskStatus[status].soft,
      color: taskStatus[status].main,
      fontWeight: 700,
    }}
  />
);

export const TaskPriorityChip = ({ priority }: { priority: DailyTaskPriority }) => (
  <Chip
    size="small"
    variant="outlined"
    label={priorityLabel[priority]}
    sx={{
      borderColor: taskPriority[priority].main,
      color: taskPriority[priority].main,
      bgcolor: taskPriority[priority].soft,
      fontWeight: 700,
    }}
  />
);

export const OverdueChip = ({ days }: { days: number }) => (
  <Chip
    size="small"
    label={days > 0 ? `${days} d vencido` : 'Vencido'}
    sx={{
      bgcolor: taskPriority.Overdue.soft,
      color: taskPriority.Overdue.main,
      fontWeight: 700,
    }}
  />
);

export const DeletedChip = () => (
  <Chip
    size="small"
    label="Eliminado"
    sx={{ bgcolor: taskPriority.Overdue.soft, color: taskPriority.Overdue.main, fontWeight: 700 }}
  />
);
