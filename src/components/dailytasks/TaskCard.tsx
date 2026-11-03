import DragIndicatorRoundedIcon from '@mui/icons-material/DragIndicatorRounded';
import { Box, Card, Chip, Stack, Typography, useTheme, type SxProps, type Theme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import type { DailyTask, DailyTaskCard, DailyTaskPriority, DailyTaskStatus } from '../../api/types';
import { useAuth } from '../../auth/AuthContext';
import { brand, colors, taskStatus } from '../../theme/tokens';
import { formatDueDate } from '../../utils/format';
import { priorityLabel, statusLabel } from '../../utils/labels';
import AssigneeBadge from './AssigneeBadge';

export type TaskCardData = Pick<
  DailyTask | DailyTaskCard,
  | 'id'
  | 'code'
  | 'title'
  | 'status'
  | 'priority'
  | 'areaName'
  | 'assignedToId'
  | 'assignedToName'
  | 'dueDate'
  | 'isOverdue'
  | 'daysOverdue'
>;

interface Props {
  task: TaskCardData;
  onClick?: () => void;
  draggable?: boolean;
  dragging?: boolean;
  showStatus?: boolean;
  sx?: SxProps<Theme>;
}

/** Tarjeta compartida por lista, tablero, calendario y vista rápida. */
export default function TaskCard({
  task,
  onClick,
  draggable = false,
  dragging = false,
  showStatus = true,
  sx,
}: Props) {
  const { session } = useAuth();
  const theme = useTheme();
  const tone = taskStatus[task.status];
  const isMine = session?.role !== 'MANAGER' && task.assignedToId === session?.id;

  return (
    <Card
      variant="outlined"
      onClick={onClick}
      sx={[
        {
          position: 'relative',
          overflow: 'hidden',
          bgcolor: tone.soft,
          borderColor: alpha(tone.main, 0.22),
          borderLeft: `4px solid ${tone.main}`,
          boxShadow: dragging ? '0 22px 44px -18px rgba(17,20,45,0.55)' : 'none',
          cursor: dragging ? 'grabbing' : onClick ? 'pointer' : 'default',
          transition: dragging ? 'none' : 'border-color .16s ease, box-shadow .16s ease, transform .16s ease',
          '&:hover': onClick && !dragging
            ? {
                borderColor: alpha(tone.main, 0.5),
                boxShadow: '0 10px 24px -20px rgba(17,20,45,0.45)',
                transform: 'translateY(-1px)',
              }
            : undefined,
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Box sx={{ p: 1.6 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
          <Stack direction="row" alignItems="center" spacing={0.75} sx={{ minWidth: 0 }}>
            {draggable && (
              <DragIndicatorRoundedIcon
                sx={{ fontSize: 17, color: alpha(colors.textSecondary, 0.55), flexShrink: 0 }}
              />
            )}
            <Typography variant="caption" sx={{ color: theme.palette.text.disabled, fontWeight: 800 }}>
              {task.code}
            </Typography>
          </Stack>
          <Chip
            size="small"
            label={priorityLabel[task.priority]}
            sx={{
              height: 22,
              fontSize: '.66rem',
              fontWeight: 800,
              bgcolor: alpha(theme.palette.background.paper, 0.72),
              color: theme.palette.text.secondary,
              border: `1px solid ${theme.palette.divider}`,
            }}
          />
        </Stack>

        <Typography
          sx={{
            mt: 0.65,
            fontWeight: 800,
            fontSize: '.88rem',
            lineHeight: 1.35,
            color: theme.palette.text.primary,
          }}
        >
          {task.title}
        </Typography>

        <Box sx={{ mt: 1 }}>
          <AssigneeBadge
            name={task.assignedToName}
            areaName={task.areaName}
            isCurrentUser={isMine}
            showArea
          />
        </Box>

        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          spacing={1}
          sx={{ mt: 1.2 }}
        >
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              color: task.isOverdue ? theme.palette.error.main : theme.palette.text.secondary,
            }}
          >
            Vence: {formatDueDate(task.dueDate)}
          </Typography>
          {task.isOverdue ? (
            <Chip
              size="small"
              label={task.daysOverdue > 0 ? `${task.daysOverdue} d vencido` : 'Vencido'}
              sx={{
                height: 21,
                fontSize: '.64rem',
                fontWeight: 800,
                bgcolor: theme.palette.error.light,
                color: theme.palette.error.main,
              }}
            />
          ) : showStatus ? (
            <Chip
              size="small"
              label={statusLabel[task.status]}
              sx={{
                height: 21,
                fontSize: '.64rem',
                fontWeight: 800,
                bgcolor: alpha(theme.palette.background.paper, 0.72),
                color: tone.main,
                border: `1px solid ${alpha(tone.main, 0.35)}`,
              }}
            />
          ) : null}
        </Stack>

      </Box>
      {isMine && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: 4,
            height: '100%',
            bgcolor: alpha(brand.gold, 0.55),
          }}
        />
      )}
    </Card>
  );
}
