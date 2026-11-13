import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import EventBusyRoundedIcon from '@mui/icons-material/EventBusyRounded';
import TodayRoundedIcon from '@mui/icons-material/TodayRounded';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  FormControlLabel,
  IconButton,
  Stack,
  Switch,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useTheme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCalendar } from '../../../api';
import type { DailyTask, DailyTaskCard, DailyTaskStatus } from '../../../api/types';
import { qk } from '../../../api/queryClient';
import { useAuth } from '../../../auth/AuthContext';
import { isManager } from '../../../auth/permissions';
import EmptyState from '../../../components/common/EmptyState';
import PageLoader from '../../../components/common/PageLoader';
import ProgressRing from '../../../components/common/ProgressRing';
import TaskCard from '../../../components/dailytasks/TaskCard';
import TaskQuickViewDrawer from '../../../components/dailytasks/TaskQuickViewDrawer';
import { brand, colors, taskStatus } from '../../../theme/tokens';
import { formatDateOnlyLong, formatMonthLabel } from '../../../utils/format';
import { statusLabel } from '../../../utils/labels';
import TaskFormDialog from '../lista/TaskFormDialog';

const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const STATUS_ORDER: DailyTaskStatus[] = ['Pending', 'InProgress', 'Done'];

type CalendarGroupBy = 'dueDate' | 'createdOn';

const dateKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const monthBounds = (year: number, month: number) => ({
  from: dateKey(new Date(year, month, 1)),
  to: dateKey(new Date(year, month + 1, 0)),
});

function countByStatus(tasks: DailyTaskCard[]) {
  return {
    Pending: tasks.filter((task) => task.status === 'Pending').length,
    InProgress: tasks.filter((task) => task.status === 'InProgress').length,
    Done: tasks.filter((task) => task.status === 'Done').length,
  };
}

function StatusCount({ status, count }: { status: DailyTaskStatus; count: number }) {
  if (count === 0) return null;
  const tone = taskStatus[status];
  return (
    <Stack direction="row" alignItems="center" spacing={0.3}>
      <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: tone.main }} />
      <Typography sx={{ fontSize: '.64rem', fontWeight: 800, color: tone.main }}>{count}</Typography>
    </Stack>
  );
}

function DayPanel({
  date,
  tasks,
  groupBy,
  onOpenTask,
  onGoBoard,
  onCreate,
}: {
  date: string;
  tasks: DailyTaskCard[];
  groupBy: CalendarGroupBy;
  onOpenTask: (taskId: number) => void;
  onGoBoard: () => void;
  onCreate: () => void;
}) {
  const counts = countByStatus(tasks);
  const total = tasks.length;
  const completion = total > 0 ? Math.round((counts.Done / total) * 100) : 0;

  return (
    <Card
      variant="outlined"
      sx={{
        position: { lg: 'sticky' },
        top: { lg: 88 },
        alignSelf: 'start',
      }}
    >
      <CardContent sx={{ p: { xs: 2, md: 2.5 }, '&:last-child': { pb: { xs: 2, md: 2.5 } } }}>
        <Stack direction="row" alignItems="flex-start" spacing={2} justifyContent="space-between">
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="overline"
              sx={{ color: colors.textMuted, fontWeight: 800, letterSpacing: '.1em' }}
            >
              {groupBy === 'createdOn' ? 'Pendientes creados' : 'Pendientes que vencen'}
            </Typography>
            <Typography component="h2" sx={{ fontSize: '1.05rem', fontWeight: 800, mt: 0.2 }}>
              {formatDateOnlyLong(date)}
            </Typography>
            <Stack direction="row" spacing={0.75} sx={{ mt: 1, flexWrap: 'wrap', rowGap: 0.5 }}>
              {STATUS_ORDER.map((status) => (
                <Chip
                  key={status}
                  size="small"
                  label={`${statusLabel[status]} ${counts[status]}`}
                  sx={{
                    height: 21,
                    fontSize: '.64rem',
                    fontWeight: 800,
                    bgcolor: taskStatus[status].soft,
                    color: taskStatus[status].main,
                  }}
                />
              ))}
            </Stack>
          </Box>
          <ProgressRing value={completion} size={82} thickness={7} color={taskStatus.Done.main} track={colors.bgSubtle}>
            <Typography sx={{ fontSize: '.95rem', fontWeight: 800, color: taskStatus.Done.main }}>
              {completion}%
            </Typography>
            <Typography sx={{ fontSize: '.54rem', color: colors.textMuted, fontWeight: 700 }}>
              cerrado
            </Typography>
          </ProgressRing>
        </Stack>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mt: 2, mb: 2.5 }}>
          <Button fullWidth variant="contained" startIcon={<AddRoundedIcon />} onClick={onCreate}>
            Nuevo pendiente
          </Button>
          <Button fullWidth variant="outlined" onClick={onGoBoard}>
            Ver en tablero
          </Button>
        </Stack>

        {tasks.length === 0 ? (
          <EmptyState
            icon={EventBusyRoundedIcon}
            title="Sin pendientes este día"
            description={
              groupBy === 'createdOn'
                ? 'No hay pendientes creados para la fecha seleccionada.'
                : 'No hay vencimientos registrados para la fecha seleccionada.'
            }
            compact
          />
        ) : (
          <Stack spacing={2.5}>
            {STATUS_ORDER.map((status) => {
              const items = tasks.filter((task) => task.status === status);
              if (items.length === 0) return null;
              return (
                <Box key={status}>
                  <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 1 }}>
                    <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: taskStatus[status].main }} />
                    <Typography sx={{ fontWeight: 800, fontSize: '.82rem', color: taskStatus[status].main }}>
                      {statusLabel[status]}
                    </Typography>
                    <Typography variant="caption" sx={{ color: colors.textMuted, fontWeight: 700 }}>
                      {items.length}
                    </Typography>
                  </Stack>
                  <Stack spacing={1}>
                    {items.map((task) => (
                      <TaskCard key={task.id} task={task} onClick={() => onOpenTask(task.id)} />
                    ))}
                  </Stack>
                </Box>
              );
            })}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}

export default function CalendarioPage() {
  const theme = useTheme();
  const { session } = useAuth();
  const manager = isManager(session);
  const primary = theme.palette.primary.main;
  const nav = useNavigate();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selectedDate, setSelectedDate] = useState(dateKey(now));
  const [quickTaskId, setQuickTaskId] = useState<number | null>(null);
  const [editing, setEditing] = useState<DailyTask | null>(null);
  const [creatingDate, setCreatingDate] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [teamView, setTeamView] = useState(false);
  const [groupBy, setGroupBy] = useState<CalendarGroupBy>('dueDate');

  const { from, to } = monthBounds(year, month);

  const calendarQuery = useQuery({
    queryKey: qk.calendar(from, to, { teamView, groupBy }),
    queryFn: () => getCalendar({ from, to, teamView: teamView || undefined, groupBy }),
  });

  const tasksByDate = useMemo(() => {
    const map = new Map<string, DailyTaskCard[]>();
    for (const day of calendarQuery.data?.days ?? []) {
      map.set(day.date, day.tasks);
    }
    return map;
  }, [calendarQuery.data]);

  const firstOfMonth = new Date(year, month, 1);
  const offset = (firstOfMonth.getDay() + 6) % 7; // lunes primero
  const gridStart = new Date(year, month, 1 - offset);
  const cells = Array.from({ length: 42 }, (_, index) => {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + index);
    return d;
  });

  const todayKey = dateKey(now);
  const selectedTasks = tasksByDate.get(selectedDate) ?? [];

  const moveMonth = (delta: number) => {
    const next = new Date(year, month + delta, 1);
    setYear(next.getFullYear());
    setMonth(next.getMonth());
    setSelectedDate(dateKey(next));
  };

  const goToday = () => {
    const today = new Date();
    setYear(today.getFullYear());
    setMonth(today.getMonth());
    setSelectedDate(dateKey(today));
  };

  if (calendarQuery.isLoading && !calendarQuery.data) return <PageLoader />;

  if (calendarQuery.isError && !calendarQuery.data) {
    return (
      <Alert
        severity="error"
        action={
          <Button color="inherit" size="small" onClick={() => void calendarQuery.refetch()}>
            Reintentar
          </Button>
        }
      >
        No se pudo cargar el calendario de pendientes.
      </Alert>
    );
  }

  return (
    <Box>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        justifyContent="space-between"
        spacing={1.5}
        sx={{ mb: 2.5 }}
      >
        <Box>
          <Typography
            variant="overline"
            sx={{ color: colors.textMuted, fontWeight: 800, letterSpacing: '.12em' }}
          >
            {teamView ? 'Calendario del equipo' : 'Mi calendario'}
          </Typography>
          <Typography variant="h2" component="h1" sx={{ fontSize: { xs: '1.45rem', md: '1.65rem' } }}>
            Calendario
          </Typography>
        </Box>

        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
          <ToggleButtonGroup
            size="small"
            exclusive
            value={groupBy}
            onChange={(_, value: CalendarGroupBy | null) => {
              if (value) setGroupBy(value);
            }}
            aria-label="Agrupar pendientes en el calendario"
          >
            <ToggleButton value="dueDate" sx={{ textTransform: 'none', fontWeight: 700, px: 1.5 }}>
              Vencimiento
            </ToggleButton>
            <ToggleButton value="createdOn" sx={{ textTransform: 'none', fontWeight: 700, px: 1.5 }}>
              Creación
            </ToggleButton>
          </ToggleButtonGroup>
          {manager && (
            <FormControlLabel
              control={
                <Switch
                  checked={teamView}
                  onChange={(event) => setTeamView(event.target.checked)}
                />
              }
              label="Ver equipo"
            />
          )}
          <IconButton onClick={() => moveMonth(-1)} aria-label="Mes anterior">
            <ChevronLeftRoundedIcon />
          </IconButton>
          <Button variant="outlined" startIcon={<TodayRoundedIcon />} onClick={goToday}>
            Hoy
          </Button>
          <IconButton onClick={() => moveMonth(1)} aria-label="Mes siguiente">
            <ChevronRightRoundedIcon />
          </IconButton>
        </Stack>
      </Stack>

      {teamView && (
        <Alert severity="info" sx={{ mb: 2 }} onClose={() => setTeamView(false)}>
          {groupBy === 'createdOn'
            ? 'Estás viendo las fechas de creación de todo el equipo. Este modo solo lo activa Gerencia General.'
            : 'Estás viendo los vencimientos de todo el equipo. Este modo solo lo activa Gerencia General.'}
        </Alert>
      )}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 380px' },
          gap: 2.5,
          alignItems: 'start',
        }}
      >
        <Card variant="outlined">
          <CardContent sx={{ p: { xs: 1.5, md: 2.5 } }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
              <Typography
                component="h2"
                sx={{ fontWeight: 800, fontSize: { xs: '1.1rem', md: '1.25rem' }, color: colors.text }}
              >
                {formatMonthLabel(year, month)}
              </Typography>
              <Stack direction="row" spacing={0.75} sx={{ display: { xs: 'none', sm: 'flex' } }}>
                {STATUS_ORDER.map((status) => (
                  <Stack key={status} direction="row" alignItems="center" spacing={0.35}>
                    <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: taskStatus[status].main }} />
                    <Typography variant="caption" sx={{ fontSize: '.66rem', color: colors.textSecondary }}>
                      {statusLabel[status]}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Stack>

            <Box sx={{ overflowX: 'auto' }}>
              <Box sx={{ minWidth: 720 }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))' }}>
                  {WEEKDAYS.map((day) => (
                    <Typography
                      key={day}
                      variant="caption"
                      sx={{
                        px: 1,
                        py: 1,
                        fontWeight: 800,
                        color: colors.textSecondary,
                        textTransform: 'uppercase',
                        letterSpacing: '.05em',
                        borderBottom: `1px solid ${colors.border}`,
                      }}
                    >
                      {day}
                    </Typography>
                  ))}

                  {cells.map((d) => {
                    const key = dateKey(d);
                    const tasks = tasksByDate.get(key) ?? [];
                    const counts = countByStatus(tasks);
                    const inMonth = d.getMonth() === month;
                    const isToday = key === todayKey;
                    const selected = key === selectedDate;

                    return (
                      <Box
                        key={key}
                        component="button"
                        type="button"
                        onClick={() => setSelectedDate(key)}
                        aria-label={`Ver pendientes del ${formatDateOnlyLong(key)}`}
                        sx={{
                          all: 'unset',
                          boxSizing: 'border-box',
                          minHeight: { xs: 92, md: 116 },
                          p: 1,
                          cursor: 'pointer',
                          bgcolor: selected
                            ? alpha(brand.gold, 0.07)
                            : inMonth
                              ? colors.surface
                              : colors.bgSubtle,
                          opacity: inMonth ? 1 : 0.55,
                          borderRight: `1px solid ${colors.border}`,
                          borderBottom: `1px solid ${colors.border}`,
                          outline: selected ? `2px solid ${brand.gold}` : 'none',
                          outlineOffset: -2,
                          transition: 'background-color .16s ease',
                          '&:hover': { bgcolor: inMonth ? alpha(primary, 0.06) : colors.bg },
                          '&:focus-visible': {
                            outline: `2px solid ${alpha(primary, 0.65)}`,
                            outlineOffset: -2,
                          },
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Box
                            sx={{
                              width: 26,
                              height: 26,
                              borderRadius: '50%',
                              display: 'grid',
                              placeItems: 'center',
                              fontSize: '.78rem',
                              fontWeight: 800,
                              color: isToday ? theme.palette.primary.contrastText : inMonth ? colors.text : colors.textMuted,
                              bgcolor: isToday ? primary : 'transparent',
                            }}
                          >
                            {d.getDate()}
                          </Box>
                          {tasks.length > 0 && (
                            <Chip
                              size="small"
                              label={tasks.length}
                              sx={{
                                height: 19,
                                minWidth: 19,
                                fontSize: '.62rem',
                                fontWeight: 800,
                                bgcolor: alpha(primary, 0.14),
                                color: primary,
                                '& .MuiChip-label': { px: 0.55 },
                              }}
                            />
                          )}
                        </Box>

                        <Stack direction="row" spacing={0.75} sx={{ mt: 0.7, minHeight: 12 }}>
                          {STATUS_ORDER.map((status) => (
                            <StatusCount key={status} status={status} count={counts[status]} />
                          ))}
                        </Stack>

                        <Stack spacing={0.3} sx={{ mt: 0.65 }}>
                          {tasks.slice(0, 2).map((task) => (
                            <Stack key={task.id} direction="row" alignItems="center" spacing={0.4}>
                              <Box
                                sx={{
                                  width: 5,
                                  height: 5,
                                  borderRadius: '50%',
                                  bgcolor: taskStatus[task.status].main,
                                  flexShrink: 0,
                                }}
                              />
                              <Typography
                                noWrap
                                sx={{
                                  fontSize: '.66rem',
                                  lineHeight: 1.25,
                                  color: task.isOverdue ? colors.error : colors.textSecondary,
                                  fontWeight: 600,
                                }}
                              >
                                {task.title}
                              </Typography>
                            </Stack>
                          ))}

                        </Stack>
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <DayPanel
          date={selectedDate}
          tasks={selectedTasks}
          groupBy={groupBy}
          onOpenTask={(taskId) => setQuickTaskId(taskId)}
          onGoBoard={() =>
            nav(groupBy === 'dueDate' ? `/tablero?dueDate=${selectedDate}` : '/tablero?scope=all')
          }
          onCreate={() => {
            setEditing(null);
            setCreatingDate(selectedDate);
            setFormOpen(true);
          }}
        />
      </Box>

      <TaskQuickViewDrawer
        open={quickTaskId != null}
        taskId={quickTaskId}
        onClose={() => setQuickTaskId(null)}
        onEdit={(task) => {
          setQuickTaskId(null);
          setEditing(task);
          setFormOpen(true);
        }}
      />

      <TaskFormDialog
        open={formOpen}
        task={editing}
        initialDueDate={groupBy === 'dueDate' ? (creatingDate ?? undefined) : undefined}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
          setCreatingDate(null);
        }}
        onSaved={() => {
          setEditing(null);
          setCreatingDate(null);
          void calendarQuery.refetch();
        }}
      />
    </Box>
  );
}
