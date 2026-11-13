import AddRoundedIcon from '@mui/icons-material/AddRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import AutorenewRoundedIcon from '@mui/icons-material/AutorenewRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import PendingActionsRoundedIcon from '@mui/icons-material/PendingActionsRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import TodayRoundedIcon from '@mui/icons-material/TodayRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useTheme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { listAllTasks } from '../../../api';
import type { DailyTask } from '../../../api/types';
import { qk } from '../../../api/queryClient';
import { useAuth } from '../../../auth/AuthContext';
import { isManager } from '../../../auth/permissions';
import EmptyState from '../../../components/common/EmptyState';
import PageLoader from '../../../components/common/PageLoader';
import ProgressRing from '../../../components/common/ProgressRing';
import SectionHeading from '../../../components/common/SectionHeading';
import StatCard from '../../../components/common/StatCard';
import TaskCard from '../../../components/dailytasks/TaskCard';
import TaskQuickViewDrawer from '../../../components/dailytasks/TaskQuickViewDrawer';
import { brand, colors } from '../../../theme/tokens';
import { formatPercent, formatTodayLong, todayLima } from '../../../utils/format';

type Scope = 'team' | 'me';

export default function InicioPage() {
  const theme = useTheme();
  const { session } = useAuth();
  const manager = isManager(session);
  const [scope, setScope] = useState<Scope>('me');
  const [quickTaskId, setQuickTaskId] = useState<number | null>(null);

  const effectiveScope: Scope = manager ? scope : 'me';
  const today = todayLima();

  const tasksQuery = useQuery({
    queryKey: qk.tasks({ view: 'home', scope: effectiveScope, userId: session?.id }),
    queryFn: () =>
      listAllTasks({
        assignedToId: effectiveScope === 'me' ? session?.id : undefined,
        teamView: effectiveScope === 'team' || undefined,
        pageSize: 100,
        sortBy: 'dueDate',
        sortDir: 'asc',
      }),
    enabled: Boolean(session?.id),
  });

  const tasks = tasksQuery.data ?? [];

  const stats = useMemo(() => {
    const activeTasks = tasks.filter((task) => task.status !== 'Done');
    const todayTasks = tasks.filter((task) => task.dueDate === today);
    const overdueTasks = activeTasks.filter((task) => task.dueDate < today);
    const completedDueToday = todayTasks.filter((task) => task.status === 'Done').length;
    const dueTodayActive = todayTasks.filter((task) => task.status !== 'Done');
    const todayTotal = todayTasks.length;

    return {
      activeTasks,
      todayTasks,
      overdueTasks,
      completedDueToday,
      dueTodayActive,
      pending: activeTasks.filter((task) => task.status === 'Pending').length,
      inProgress: activeTasks.filter((task) => task.status === 'InProgress').length,
      total: tasks.length,
      todayTotal,
      todayCompletion: todayTotal > 0 ? Math.min(100, (completedDueToday / todayTotal) * 100) : 0,
    };
  }, [tasks, today]);

  const areaLoad = useMemo(() => {
    if (!manager || effectiveScope !== 'team') return [];

    const map = new Map<string, { areaName: string; active: number; overdue: number }>();
    for (const task of stats.activeTasks) {
      const current = map.get(task.area) ?? { areaName: task.areaName, active: 0, overdue: 0 };
      current.active += 1;
      if (task.dueDate < today) current.overdue += 1;
      map.set(task.area, current);
    }

    return [...map.values()].sort((a, b) => b.active - a.active).slice(0, 6);
  }, [manager, effectiveScope, stats.activeTasks, today]);

  if (tasksQuery.isLoading && !tasksQuery.data) return <PageLoader />;

  if (tasksQuery.isError && !tasksQuery.data) {
    return (
      <Alert
        severity="error"
        action={
          <Button color="inherit" size="small" onClick={() => void tasksQuery.refetch()}>
            Reintentar
          </Button>
        }
      >
        No se pudo cargar el resumen de pendientes. Revisa la conexión con el servidor.
      </Alert>
    );
  }

  const firstName = (session?.name ?? '').trim().split(/\s+/)[0] || 'usuario';
  const todayPreview = stats.todayTasks.slice(0, 4);
  const maxAreaActive = Math.max(1, ...areaLoad.map((row) => row.active));

  const scopedList = (extra: Record<string, string> = {}) => {
    // El equipo se revisa en el tablero; la lista es personal.
    if (effectiveScope === 'team') return '/tablero';
    const params = new URLSearchParams(extra);
    const query = params.toString();
    return `/lista${query ? `?${query}` : ''}`;
  };

  const openQuickView = (task: DailyTask) => setQuickTaskId(task.id);

  return (
    <Box>
      <Card
        sx={{
          position: 'relative',
          overflow: 'hidden',
          border: `1px solid ${alpha('#FFFFFF', 0.09)}`,
          color: '#FFFFFF',
          bgcolor: brand.navy,
          backgroundImage: [
            'radial-gradient(120% 130% at 100% 0%, rgba(186,153,7,0.28) 0%, rgba(19,19,71,0) 55%)',
            'linear-gradient(135deg, #181A4B 0%, #111233 55%, #0C0D29 100%)',
          ].join(','),
        }}
      >
        <CardContent
          sx={{
            p: { xs: 2.5, md: 3.5 },
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { xs: 'flex-start', md: 'center' },
            gap: { xs: 3, md: 4 },
          }}
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              sx={{
                color: brand.goldLight,
                fontSize: '.68rem',
                fontWeight: 800,
                letterSpacing: '.16em',
                textTransform: 'uppercase',
                mb: 1,
              }}
            >
              {formatTodayLong()}
            </Typography>
            <Typography
              component="h1"
              sx={{
                fontWeight: 800,
                fontSize: { xs: '1.55rem', md: '2rem' },
                lineHeight: 1.15,
                letterSpacing: '-0.03em',
              }}
            >
              {effectiveScope === 'team' ? 'Tareas del equipo.' : `Hola, ${firstName}.`}
            </Typography>
            <Typography sx={{ mt: 1.25, color: colors.onDarkMuted, fontSize: '.92rem', maxWidth: 560 }}>
              {effectiveScope === 'team'
                ? 'Pendientes del equipo, vencidos y en curso.'
                : 'Tus pendientes para hoy, vencidos y en curso.'}
            </Typography>

            {manager && (
              <ToggleButtonGroup
                size="small"
                exclusive
                value={effectiveScope}
                onChange={(_, value: Scope | null) => {
                  if (value) setScope(value);
                }}
                sx={{
                  mt: 2,
                  p: 0.35,
                  bgcolor: alpha('#FFFFFF', 0.08),
                  borderRadius: 2,
                  '& .MuiToggleButton-root': {
                    border: 0,
                    borderRadius: 1.5,
                    px: 1.4,
                    py: 0.55,
                    color: alpha('#FFFFFF', 0.72),
                    fontSize: '.74rem',
                    fontWeight: 800,
                    textTransform: 'none',
                    '&.Mui-selected': {
                      bgcolor: brand.goldLight,
                      color: brand.navy,
                      '&:hover': { bgcolor: brand.goldLight },
                    },
                  },
                }}
              >
                <ToggleButton value="team">
                  <GroupsRoundedIcon sx={{ fontSize: 17, mr: 0.6 }} />
                  Equipo
                </ToggleButton>
                <ToggleButton value="me">
                  <PersonRoundedIcon sx={{ fontSize: 17, mr: 0.6 }} />
                  Mis pendientes
                </ToggleButton>
              </ToggleButtonGroup>
            )}

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25} sx={{ mt: 2.5 }}>
              <Button
                component={RouterLink}
                to="/tablero?nuevo=1"
                variant="contained"
                startIcon={<AddRoundedIcon />}
                sx={{ bgcolor: brand.goldLight, color: brand.navy, '&:hover': { bgcolor: '#C9A73A' } }}
              >
                Nuevo pendiente
              </Button>
              <Button
                component={RouterLink}
                to="/tablero"
                variant="outlined"
                sx={{ color: '#FFFFFF', borderColor: alpha('#FFFFFF', 0.28) }}
              >
                Ver tablero
              </Button>
            </Stack>
          </Box>

          <Stack alignItems="center" spacing={0.75}>
            <ProgressRing
              value={stats.todayCompletion}
              size={136}
              thickness={11}
              color={brand.goldLight}
              track={alpha('#FFFFFF', 0.12)}
            >
              <Typography sx={{ color: '#FFFFFF', fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.04em' }}>
                {formatPercent(stats.todayCompletion)}
              </Typography>
              <Typography sx={{ color: alpha('#FFFFFF', 0.62), fontSize: '.66rem', fontWeight: 700 }}>
                {effectiveScope === 'team' ? 'avance del equipo' : 'avance del día'}
              </Typography>
            </ProgressRing>
            <Typography sx={{ color: alpha('#FFFFFF', 0.6), fontSize: '.7rem', fontWeight: 600 }}>
              {stats.completedDueToday} de {stats.todayTotal} de hoy · {stats.overdueTasks.length} vencidas
            </Typography>
          </Stack>
        </CardContent>
      </Card>

      <Box sx={{ mt: 3.5 }}>
        <SectionHeading
          title={effectiveScope === 'team' ? 'Hoy en el equipo' : 'Mi día'}
          subtitle={`${stats.overdueTasks.length} vencidas · ${stats.todayTasks.length} para hoy`}
          action={
            <Button component={RouterLink} to={scopedList()} size="small">
              {effectiveScope === 'team' ? 'Abrir tablero' : 'Abrir mi lista'}
            </Button>
          }
        />

        <Stack spacing={2.5}>
          <Box>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.25 }}>
              <TodayRoundedIcon sx={{ fontSize: 19, color: brand.gold }} />
              <Typography sx={{ fontWeight: 800, fontSize: '.96rem' }}>Para hoy</Typography>
              <Chip
                size="small"
                label={stats.todayTasks.length}
                sx={{ height: 21, fontWeight: 800, bgcolor: colors.warningSoft, color: colors.warning }}
              />
              {stats.todayTasks.length > 4 && (
                <Button
                  component={RouterLink}
                  to={scopedList({ view: 'all', dueDate: today })}
                  size="small"
                  sx={{ ml: 'auto' }}
                >
                  Ver todas
                </Button>
              )}
            </Stack>
            {todayPreview.length === 0 ? (
              <Card variant="outlined">
                <EmptyState
                  icon={CheckCircleRoundedIcon}
                  title={effectiveScope === 'team' ? 'No hay pendientes para hoy' : 'No tienes pendientes para hoy'}
                  description={
                    effectiveScope === 'team'
                      ? 'Las tareas de hoy del equipo aparecerán aquí.'
                      : 'Tus tareas de hoy aparecerán aquí.'
                  }
                  compact
                />
              </Card>
            ) : (
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
                  gap: 1.5,
                }}
              >
                {todayPreview.map((task) => (
                  <TaskCard key={task.id} task={task} onClick={() => openQuickView(task)} />
                ))}
              </Box>
            )}
          </Box>
        </Stack>
      </Box>

      <Box sx={{ mt: 4 }}>
        <SectionHeading
          title={effectiveScope === 'team' ? 'Indicadores del equipo' : 'Mis indicadores'}
          subtitle={effectiveScope === 'team' ? 'Tareas del equipo, con foco en hoy.' : 'Tareas asignadas a ti, con foco en hoy.'}
        />
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(2, minmax(0, 1fr))',
              md: 'repeat(3, minmax(0, 1fr))',
              lg: 'repeat(6, minmax(0, 1fr))',
            },
            gap: 2,
          }}
        >
          <StatCard
            label="Para hoy"
            value={stats.dueTodayActive.length}
            icon={TodayRoundedIcon}
            tone="warning"
            to={scopedList()}
            hint="Activas con vencimiento hoy"
          />
          <StatCard
            label="Vencidas"
            value={stats.overdueTasks.length}
            icon={WarningAmberRoundedIcon}
            tone="error"
            to={scopedList({ view: 'all', overdue: 'true' })}
            hint="Sin completar"
            highlight={stats.overdueTasks.length > 0}
          />
          <StatCard
            label="Completadas hoy"
            value={stats.completedDueToday}
            icon={CheckCircleRoundedIcon}
            tone="success"
            to="/informes"
            hint="Con vencimiento hoy"
          />
          <StatCard
            label="En progreso"
            value={stats.inProgress}
            icon={AutorenewRoundedIcon}
            to={scopedList({ view: 'all', status: 'InProgress' })}
            hint="Activas"
          />
          <StatCard
            label="Proximos"
            value={stats.pending}
            icon={PendingActionsRoundedIcon}
            to={scopedList({ view: 'all', status: 'Pending' })}
            hint="Pendientes"
          />
          <StatCard
            label="Total"
            value={stats.total}
            icon={AssignmentRoundedIcon}
            to={scopedList({ view: 'all' })}
            hint={effectiveScope === 'team' ? 'Del equipo' : 'Asignadas a ti'}
          />
        </Box>
      </Box>

      {manager && effectiveScope === 'team' && areaLoad.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <SectionHeading title="Carga por área" subtitle="Tareas activas del equipo." />
          <Card variant="outlined">
            <CardContent sx={{ p: { xs: 2, md: 2.5 }, '&:last-child': { pb: { xs: 2, md: 2.5 } } }}>
              <Stack spacing={1.75}>
                {areaLoad.map((row) => (
                  <Box key={row.areaName}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
                      <Typography sx={{ fontWeight: 700, fontSize: '.84rem' }}>{row.areaName}</Typography>
                      <Stack direction="row" spacing={1.25}>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: colors.textSecondary }}>
                          {row.active} activas
                        </Typography>
                        {row.overdue > 0 && (
                          <Typography variant="caption" sx={{ fontWeight: 800, color: colors.error }}>
                            {row.overdue} vencidas
                          </Typography>
                        )}
                      </Stack>
                    </Stack>
                    <Box
                      sx={{
                        mt: 0.6,
                        height: 6,
                        borderRadius: 999,
                        bgcolor: colors.bgSubtle,
                        overflow: 'hidden',
                      }}
                    >
                      <Box
                        sx={{
                          height: '100%',
                          width: `${(row.active / maxAreaActive) * 100}%`,
                          borderRadius: 999,
                          bgcolor: row.overdue > 0 ? colors.error : theme.palette.info.main,
                        }}
                      />
                    </Box>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Box>
      )}

      <Box sx={{ mt: 4 }}>
        <SectionHeading title="Accesos directos" />
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
          <Button component={RouterLink} to="/tablero" variant="outlined" startIcon={<AssignmentRoundedIcon />}>
            Tablero Kanban
          </Button>
          <Button component={RouterLink} to="/calendario" variant="outlined" startIcon={<CalendarMonthRoundedIcon />}>
            Calendario
          </Button>
          <Button component={RouterLink} to="/informes" variant="outlined" startIcon={<CheckCircleRoundedIcon />}>
            Informes
          </Button>
        </Stack>
      </Box>

      <TaskQuickViewDrawer
        open={quickTaskId != null}
        taskId={quickTaskId}
        onClose={() => setQuickTaskId(null)}
      />
    </Box>
  );
}
