import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Divider,
  Drawer,
  IconButton,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { getTaskHistory } from '../../api';
import type { DailyTaskHistoryEntry } from '../../api/types';
import { qk } from '../../api/queryClient';
import { colors } from '../../theme/tokens';
import { formatDateTime } from '../../utils/format';
import { historyActionLabel, historyFieldLabel, historyValueLabel } from '../../utils/labels';

interface Props {
  open: boolean;
  onClose: () => void;
  taskId: number | null;
  taskTitle?: string;
}

interface HistoryGroup {
  id: string;
  entries: DailyTaskHistoryEntry[];
}

export default function TaskHistoryDrawer({ open, onClose, taskId, taskTitle }: Props) {
  const theme = useTheme();
  const historyQuery = useQuery({
    queryKey: qk.history(taskId ?? ''),
    queryFn: () => getTaskHistory(taskId as number),
    enabled: open && taskId != null,
  });

  const groups = useMemo<HistoryGroup[]>(() => {
    const map = new Map<string, DailyTaskHistoryEntry[]>();
    for (const entry of historyQuery.data ?? []) {
      const list = map.get(entry.changeGroupId) ?? [];
      list.push(entry);
      map.set(entry.changeGroupId, list);
    }

    return [...map.entries()]
      .map(([id, entries]) => ({
        id,
        entries: [...entries].sort((a, b) => a.changedAt.localeCompare(b.changedAt)),
      }))
      .sort((a, b) => b.entries[0].changedAt.localeCompare(a.entries[0].changedAt));
  }, [historyQuery.data]);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: { xs: '100%', sm: 470 }, maxWidth: '100vw' } }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, p: 2.5, borderBottom: `1px solid ${colors.border}` }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="h3" sx={{ fontSize: '1.08rem' }}>
            Historial de cambios
          </Typography>
          <Typography variant="body2" color="text.secondary" noWrap sx={{ mt: 0.25 }}>
            {taskTitle ?? `Pendiente #${taskId ?? ''}`}
          </Typography>
        </Box>
        <IconButton onClick={onClose} aria-label="Cerrar historial">
          <CloseRoundedIcon />
        </IconButton>
      </Box>

      <Box sx={{ p: { xs: 2, sm: 2.5 }, overflowY: 'auto' }}>
        {historyQuery.isLoading ? (
          <Stack alignItems="center" spacing={1.5} sx={{ py: 6 }}>
            <CircularProgress size={26} />
            <Typography variant="body2" color="text.secondary">
              Cargando historial…
            </Typography>
          </Stack>
        ) : historyQuery.isError ? (
          <Alert severity="error">No se pudo cargar el historial de esta tarea.</Alert>
        ) : groups.length === 0 ? (
          <Stack alignItems="center" spacing={1.25} sx={{ py: 6, textAlign: 'center' }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                display: 'grid',
                placeItems: 'center',
                bgcolor: `${theme.palette.primary.main}18`,
                color: theme.palette.primary.main,
              }}
            >
              <HistoryRoundedIcon />
            </Box>
            <Typography sx={{ fontWeight: 800 }}>Sin cambios registrados</Typography>
            <Typography variant="body2" color="text.secondary">
              Cuando alguien modifique esta tarea, el detalle aparecerá aquí.
            </Typography>
          </Stack>
        ) : (
          <Stack spacing={2.5}>
            {groups.map((group) => {
              const first = group.entries[0];
              return (
                <Box key={group.id}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
                    <Stack direction="row" alignItems="center" spacing={0.75}>
                      <Chip
                        size="small"
                        label={historyActionLabel[first.action] ?? first.action}
                        sx={{
                          height: 22,
                          fontSize: '.66rem',
                          fontWeight: 800,
                          bgcolor: `${theme.palette.primary.main}18`,
                          color: theme.palette.primary.main,
                        }}
                      />
                      <Typography variant="caption" sx={{ fontWeight: 700 }}>
                        {first.changedByName || 'Sistema'}
                      </Typography>
                    </Stack>
                    <Typography variant="caption" color="text.secondary">
                      {formatDateTime(first.changedAt)}
                    </Typography>
                  </Stack>

                  <Stack spacing={0.75} sx={{ mt: 1, pl: 1.25, borderLeft: `2px solid ${colors.border}` }}>
                    {group.entries.map((entry) => (
                      <Box key={entry.id}>
                        {entry.field ? (
                          <Typography variant="body2" sx={{ fontSize: '.82rem' }}>
                            <Box component="span" sx={{ fontWeight: 800 }}>
                              {historyFieldLabel[entry.field] ?? entry.field}:
                            </Box>{' '}
                            <Box component="span" sx={{ color: colors.textSecondary }}>
                              {historyValueLabel(entry.field, entry.oldValue)}
                            </Box>{' '}
                            <Box component="span" sx={{ color: colors.textMuted }}>
                              →
                            </Box>{' '}
                            <Box component="span" sx={{ fontWeight: 700 }}>
                              {historyValueLabel(entry.field, entry.newValue)}
                            </Box>
                          </Typography>
                        ) : (
                          <Typography variant="body2" sx={{ fontSize: '.82rem', color: colors.textSecondary }}>
                            {entry.newValue || entry.oldValue || 'Cambio registrado'}
                          </Typography>
                        )}
                      </Box>
                    ))}
                  </Stack>
                  <Divider sx={{ mt: 2 }} />
                </Box>
              );
            })}
          </Stack>
        )}
      </Box>
    </Drawer>
  );
}
