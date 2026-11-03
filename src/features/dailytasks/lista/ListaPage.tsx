import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import FilterAltOffRoundedIcon from '@mui/icons-material/FilterAltOffRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import SearchOffRoundedIcon from '@mui/icons-material/SearchOffRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded';
import TodayRoundedIcon from '@mui/icons-material/TodayRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Collapse,
  FormControl,
  FormControlLabel,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Pagination,
  Select,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useQuery } from '@tanstack/react-query';
import { addDays, format, parseISO, startOfWeek } from 'date-fns';
import { fromZonedTime } from 'date-fns-tz';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';
import { listAllTasks, listAreas, listTasks, listUsers } from '../../../api';
import type { DailyTask, DailyTaskPriority, DailyTaskStatus } from '../../../api/types';
import { qk } from '../../../api/queryClient';
import { useAuth } from '../../../auth/AuthContext';
import { canEditTask, isManager } from '../../../auth/permissions';
import EmptyState from '../../../components/common/EmptyState';
import PageLoader from '../../../components/common/PageLoader';
import AssigneeBadge from '../../../components/dailytasks/AssigneeBadge';
import InlineTaskControls from '../../../components/dailytasks/InlineTaskControls';
import TaskCard from '../../../components/dailytasks/TaskCard';
import TaskQuickViewDrawer from '../../../components/dailytasks/TaskQuickViewDrawer';
import { useDebounced } from '../../../hooks/useDebounced';
import { colors, ownTask } from '../../../theme/tokens';
import { formatDueDate, plural, todayLima } from '../../../utils/format';
import { priorityLabel, priorityOrder, statusLabel, statusOrder } from '../../../utils/labels';
import TaskFormDialog from './TaskFormDialog';

const PAGE_SIZE = 20;

interface TaskTableProps {
  tasks: DailyTask[];
  onOpen: (task: DailyTask) => void;
  onEdit: (task: DailyTask) => void;
  onToast: (message: string) => void;
}

function TaskTable({ tasks, onOpen, onEdit, onToast }: TaskTableProps) {
  const theme = useTheme();
  const { session } = useAuth();
  const manager = isManager(session);

  return (
    <Card variant="outlined" sx={{ display: { xs: 'none', md: 'block' } }}>
      <TableContainer>
        <Table size="small" sx={{ minWidth: 940 }}>
          <TableHead>
            <TableRow>
              <TableCell>Código</TableCell>
              <TableCell>Pendiente</TableCell>
              <TableCell>Estado / prioridad</TableCell>
              <TableCell>Área</TableCell>
              <TableCell>Responsable</TableCell>
              <TableCell>Vence</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tasks.map((task) => {
              const isOwn = !manager && task.assignedToId === session?.id;
              const editable = canEditTask(session, task);
              return (
                <TableRow
                  key={task.id}
                  hover
                  onClick={() => onOpen(task)}
                  sx={{
                    cursor: 'pointer',
                    bgcolor: isOwn ? ownTask.bg : undefined,
                    '& td:first-of-type': {
                      borderLeft: isOwn ? `3px solid ${ownTask.border}` : '3px solid transparent',
                    },
                    '&:hover': { bgcolor: isOwn ? alpha(ownTask.border, 0.14) : theme.palette.action.hover },
                  }}
                >
                  <TableCell sx={{ whiteSpace: 'nowrap', color: theme.palette.text.secondary, fontWeight: 800 }}>
                    {task.code}
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontWeight: 800, fontSize: '.86rem', lineHeight: 1.3 }}>
                      {task.title}
                    </Typography>
                    {task.isOverdue && (
                      <Typography variant="caption" sx={{ color: theme.palette.error.main, fontWeight: 700 }}>
                        {task.daysOverdue > 0 ? `${task.daysOverdue} días vencido` : 'Vencido'}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <InlineTaskControls
                      task={task}
                      disabled={!editable}
                      onSuccess={onToast}
                      onError={onToast}
                    />
                  </TableCell>
                  <TableCell sx={{ fontSize: '.8rem' }}>{task.areaName}</TableCell>
                  <TableCell>
                    <AssigneeBadge
                      name={task.assignedToName}
                      isCurrentUser={task.assignedToId === session?.id}
                    />
                  </TableCell>
                  <TableCell
                    sx={{
                      whiteSpace: 'nowrap',
                      fontWeight: task.isOverdue ? 800 : 600,
                      color: task.isOverdue ? theme.palette.error.main : theme.palette.text.primary,
                    }}
                  >
                    {formatDueDate(task.dueDate)}
                  </TableCell>
                  <TableCell align="right">
                    {editable && (
                      <Tooltip title="Editar pendiente">
                        <IconButton
                          size="small"
                          onClick={(event) => {
                            event.stopPropagation();
                            onEdit(task);
                          }}
                          aria-label={`Editar ${task.title}`}
                        >
                          <EditRoundedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
}

function TaskCards({ tasks, onOpen }: { tasks: DailyTask[]; onOpen: (task: DailyTask) => void }) {
  return (
    <Stack spacing={1.25} sx={{ display: { xs: 'flex', md: 'none' } }}>
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} onClick={() => onOpen(task)} />
      ))}
    </Stack>
  );
}

interface TaskGroupProps {
  title: string;
  subtitle: string;
  tone: string;
  icon: ReactNode;
  tasks: DailyTask[];
  onOpen: (task: DailyTask) => void;
  onEdit: (task: DailyTask) => void;
  onToast: (message: string) => void;
}

function TaskGroup({ title, subtitle, tone, icon, tasks, onOpen, onEdit, onToast }: TaskGroupProps) {
  const theme = useTheme();
  if (tasks.length === 0) return null;

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.25 }}>
        <Box sx={{ color: tone, display: 'flex' }}>{icon}</Box>
        <Typography sx={{ fontWeight: 800, fontSize: '.98rem', color: theme.palette.text.primary }}>{title}</Typography>
        <Chip
          size="small"
          label={tasks.length}
          sx={{ height: 21, fontSize: '.68rem', fontWeight: 800, bgcolor: alpha(tone, 0.1), color: tone }}
        />
        <Typography variant="caption" sx={{ ml: 0.5, color: theme.palette.text.secondary }}>
          {subtitle}
        </Typography>
      </Stack>
      <TaskTable tasks={tasks} onOpen={onOpen} onEdit={onEdit} onToast={onToast} />
      <TaskCards tasks={tasks} onOpen={onOpen} />
    </Box>
  );
}

export default function ListaPage() {
  const theme = useTheme();
  const { session } = useAuth();
  const manager = isManager(session);
  const [params, setParams] = useSearchParams();

  const view = params.get('view') === 'all' ? 'all' : 'today';
  const today = todayLima();
  const [daysAhead, setDaysAhead] = useState(3);
  const [onlyMine, setOnlyMine] = useState(false);
  const [completedOpen, setCompletedOpen] = useState(false);

  const qFromUrl = params.get('q') ?? '';
  const [search, setSearch] = useState(qFromUrl);
  const debouncedSearch = useDebounced(search, 350);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<DailyTask | null>(null);
  const [quickTaskId, setQuickTaskId] = useState<number | null>(null);
  const [toast, setToast] = useState('');

  const status = (params.get('status') as DailyTaskStatus | null) ?? '';
  const priority = (params.get('priority') as DailyTaskPriority | null) ?? '';
  const area = params.get('area') ?? '';
  const assignedToId = params.get('assignedToId') ?? '';
  const dueDate = params.get('dueDate') ?? '';
  const overdue = params.get('overdue') === 'true';
  const sortBy = params.get('sortBy') ?? 'dueDate';
  const page = Math.max(1, Number(params.get('page') ?? '1') || 1);

  const horizon = format(addDays(parseISO(today), daysAhead), 'yyyy-MM-dd');
  const weekStart = format(startOfWeek(parseISO(today), { weekStartsOn: 1 }), 'yyyy-MM-dd');
  const weekStartUtc = fromZonedTime(`${weekStart}T00:00:00`, 'America/Lima').toISOString();

  const updateParam = (key: string, value?: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.delete('page');
    setParams(next, { replace: true });
  };

  const setView = (next: 'today' | 'all') => {
    const nextParams = new URLSearchParams(params);
    if (next === 'all') nextParams.set('view', 'all');
    else nextParams.delete('view');
    nextParams.delete('page');
    setParams(nextParams, { replace: true });
  };

  useEffect(() => {
    const current = params.get('q') ?? '';
    if (debouncedSearch === current) return;
    const next = new URLSearchParams(params);
    if (debouncedSearch) next.set('q', debouncedSearch);
    else next.delete('q');
    next.delete('page');
    setParams(next, { replace: true });
  }, [debouncedSearch, params, setParams]);

  useEffect(() => {
    setSearch(qFromUrl);
  }, [qFromUrl]);

  useEffect(() => {
    if (params.get('nuevo') !== '1') return;
    setEditing(null);
    setFormOpen(true);
    const next = new URLSearchParams(params);
    next.delete('nuevo');
    setParams(next, { replace: true });
  }, [params, setParams]);

  const allFilters = useMemo(
    () => ({
      q: debouncedSearch || undefined,
      status: (status || undefined) as DailyTaskStatus | undefined,
      priority: (priority || undefined) as DailyTaskPriority | undefined,
      area: area || undefined,
      assignedToId: assignedToId ? Number(assignedToId) : undefined,
      dueDate: dueDate || undefined,
      overdue: overdue || undefined,
      page,
      pageSize: PAGE_SIZE,
      sortBy,
      sortDir: 'asc' as const,
    }),
    [debouncedSearch, status, priority, area, assignedToId, dueDate, overdue, page, sortBy],
  );

  const todayQuery = useQuery({
    queryKey: qk.tasks({
      view: 'today',
      horizon,
      q: debouncedSearch,
      onlyMine,
      assignedToId,
      userId: session?.id,
    }),
    queryFn: () =>
      listAllTasks({
        dueTo: horizon,
        q: debouncedSearch || undefined,
        assignedToId: onlyMine
          ? session?.id
          : assignedToId
            ? Number(assignedToId)
            : undefined,
        pageSize: 100,
        sortBy: 'dueDate',
        sortDir: 'asc',
      }),
    enabled: view === 'today',
  });

  const allQuery = useQuery({
    queryKey: qk.tasks(allFilters),
    queryFn: () => listTasks(allFilters),
    enabled: view === 'all',
    placeholderData: (previousData) => previousData,
  });

  const completedQuery = useQuery({
    queryKey: qk.tasks({ completedWeek: weekStart, onlyMine, userId: session?.id }),
    queryFn: () =>
      listAllTasks({
        status: 'Done',
        updatedSince: weekStartUtc,
        assignedToId: onlyMine ? session?.id : undefined,
        pageSize: 100,
        sortBy: 'dueDate',
        sortDir: 'desc',
      }),
    enabled: view === 'today' && completedOpen,
  });

  const areasQuery = useQuery({
    queryKey: qk.areas,
    queryFn: () => listAreas(),
    staleTime: 10 * 60_000,
  });

  const usersQuery = useQuery({
    queryKey: qk.users(),
    queryFn: () => listUsers(),
    enabled: manager,
    staleTime: 5 * 60_000,
  });

  const activeTasks = useMemo(
    () =>
      (todayQuery.data ?? []).filter(
        (task) => task.status !== 'Done' && (!onlyMine || task.assignedToId === session?.id),
      ),
    [todayQuery.data, onlyMine, session?.id],
  );

  const overdueTasks = activeTasks.filter((task) => task.dueDate < today);
  const dueTodayTasks = activeTasks.filter((task) => task.dueDate === today);
  const upcomingTasks = activeTasks.filter((task) => task.dueDate > today);

  const completedThisWeek = useMemo(
    () =>
      (completedQuery.data ?? []).filter(
        (task) =>
          task.completedOn != null &&
          task.completedOn >= weekStart &&
          task.completedOn <= today &&
          (!onlyMine || task.assignedToId === session?.id),
      ),
    [completedQuery.data, weekStart, today, onlyMine, session?.id],
  );

  const openNew = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (task: DailyTask) => {
    setEditing(task);
    setFormOpen(true);
  };

  const openQuickView = (task: DailyTask) => {
    setQuickTaskId(task.id);
  };

  const handleQuickEdit = (task: DailyTask) => {
    setQuickTaskId(null);
    openEdit(task);
  };

  const handleSaved = () => {
    setToast(editing ? 'Pendiente actualizado.' : 'Pendiente creado.');
    setEditing(null);
  };

  const clearFilters = () => {
    const next = new URLSearchParams();
    if (view === 'all') next.set('view', 'all');
    setSearch('');
    setParams(next, { replace: true });
  };

  const hasFilters = Boolean(
    qFromUrl || status || priority || area || assignedToId || dueDate || overdue || sortBy !== 'dueDate',
  );

  const todayLoading = view === 'today' && todayQuery.isLoading && !todayQuery.data;
  const allLoading = view === 'all' && allQuery.isLoading && !allQuery.data;
  const todayError = view === 'today' && todayQuery.isError;
  const allError = view === 'all' && allQuery.isError;

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
            {view === 'today' ? 'Prioridad del día' : 'Vista completa'}
          </Typography>
          <Typography variant="h2" component="h1" sx={{ fontSize: { xs: '1.45rem', md: '1.65rem' } }}>
            {view === 'today' ? 'Hoy' : 'Todos los pendientes'}
          </Typography>
          {view === 'today' ? (
            <Stack direction="row" spacing={0.75} sx={{ mt: 1, flexWrap: 'wrap', rowGap: 0.75 }}>
              <Chip
                size="small"
                icon={<WarningAmberRoundedIcon />}
                label={`${overdueTasks.length} vencidos`}
                sx={{ bgcolor: colors.errorSoft, color: colors.error, fontWeight: 700 }}
              />
              <Chip
                size="small"
                icon={<TodayRoundedIcon />}
                label={`${dueTodayTasks.length} para hoy`}
                sx={{ bgcolor: theme.palette.warning.light, color: theme.palette.warning.main, fontWeight: 700 }}
              />
              <Chip
                size="small"
                icon={<ScheduleRoundedIcon />}
                label={`${upcomingTasks.length} próximos`}
                sx={{ bgcolor: colors.infoSoft, color: colors.info, fontWeight: 700 }}
              />
            </Stack>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.35 }}>
              {allQuery.data
                ? plural(allQuery.data.total, 'pendiente encontrado', 'pendientes encontrados')
                : 'Cargando pendientes…'}
            </Typography>
          )}
        </Box>

        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            onClick={() => setView(view === 'today' ? 'all' : 'today')}
          >
            {view === 'today' ? 'Ver todos' : 'Volver a hoy'}
          </Button>
          <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={openNew}>
            Nuevo pendiente
          </Button>
        </Stack>
      </Stack>

      {view === 'today' ? (
        <>
          <Card variant="outlined" sx={{ mb: 2.5 }}>
            <CardContent sx={{ p: { xs: 1.75, md: 2 } }}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems={{ md: 'center' }}>
                <TextField
                  size="small"
                  label="Buscar en el día"
                  placeholder="Título o descripción"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  sx={{ flex: 1, minWidth: { md: 260 } }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchRoundedIcon fontSize="small" sx={{ color: colors.textMuted }} />
                      </InputAdornment>
                    ),
                  }}
                />
                <FormControl size="small" sx={{ minWidth: 160 }}>
                  <InputLabel id="today-horizon">Próximos</InputLabel>
                  <Select
                    labelId="today-horizon"
                    label="Próximos"
                    value={daysAhead}
                    onChange={(e) => setDaysAhead(Number(e.target.value))}
                  >
                    <MenuItem value={3}>3 días</MenuItem>
                    <MenuItem value={7}>7 días</MenuItem>
                    <MenuItem value={14}>14 días</MenuItem>
                  </Select>
                </FormControl>
                <FormControlLabel
                  control={
                    <Checkbox
                      size="small"
                      checked={onlyMine}
                      onChange={(e) => setOnlyMine(e.target.checked)}
                    />
                  }
                  label={<Typography variant="body2">Solo mis pendientes</Typography>}
                />
              </Stack>
            </CardContent>
          </Card>

          {(todayError || todayQuery.isError) && (
            <Alert
              severity="error"
              sx={{ mb: 2 }}
              action={
                <Button color="inherit" size="small" onClick={() => void todayQuery.refetch()}>
                  Reintentar
                </Button>
              }
            >
              No se pudo cargar la vista del día.
            </Alert>
          )}

          {todayLoading ? (
            <PageLoader />
          ) : activeTasks.length === 0 ? (
            <Card variant="outlined">
              <EmptyState
                icon={CheckCircleRoundedIcon}
                title="No hay pendientes activos para este periodo"
                description="No tienes tareas vencidas, para hoy o próximas en el rango seleccionado."
                action={
                  <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={openNew}>
                    Nuevo pendiente
                  </Button>
                }
              />
            </Card>
          ) : (
            <Stack spacing={3}>
              <TaskGroup
                title="Vencidos"
                subtitle="Requieren atención inmediata"
                tone={colors.error}
                icon={<WarningAmberRoundedIcon fontSize="small" />}
                tasks={overdueTasks}
                onOpen={openQuickView}
                onEdit={openEdit}
                onToast={setToast}
              />
              <TaskGroup
                title="Para hoy"
                subtitle={formatDueDate(today)}
                tone={colors.warning}
                icon={<TodayRoundedIcon fontSize="small" />}
                tasks={dueTodayTasks}
                onOpen={openQuickView}
                onEdit={openEdit}
                onToast={setToast}
              />
              <TaskGroup
                title={`Próximos ${daysAhead} días`}
                subtitle={`Hasta ${formatDueDate(horizon)}`}
                tone={colors.info}
                icon={<ScheduleRoundedIcon fontSize="small" />}
                tasks={upcomingTasks}
                onOpen={openQuickView}
                onEdit={openEdit}
                onToast={setToast}
              />
            </Stack>
          )}

          <Box sx={{ mt: 4 }}>
            <Button
              variant="text"
              color="inherit"
              startIcon={<HistoryRoundedIcon />}
              endIcon={completedOpen ? <ExpandLessRoundedIcon /> : <ExpandMoreRoundedIcon />}
              onClick={() => setCompletedOpen((value) => !value)}
              sx={{ color: colors.textSecondary, fontWeight: 800 }}
            >
              {completedOpen ? 'Ocultar completados de esta semana' : 'Ver completados de esta semana'}
            </Button>
            <Collapse in={completedOpen} timeout="auto" unmountOnExit>
              <Box sx={{ mt: 2 }}>
                {completedQuery.isLoading ? (
                  <PageLoader />
                ) : completedQuery.isError ? (
                  <Alert severity="error">No se pudieron cargar los completados de la semana.</Alert>
                ) : completedThisWeek.length === 0 ? (
                  <Card variant="outlined">
                    <EmptyState
                      icon={CheckCircleRoundedIcon}
                      title="Todavía no hay completados esta semana"
                      description="Las tareas completadas aparecerán aquí cuando las necesites consultar."
                      compact
                    />
                  </Card>
                ) : (
                  <>
                    <TaskTable
                      tasks={completedThisWeek}
                      onOpen={openQuickView}
                      onEdit={openEdit}
                      onToast={setToast}
                    />
                    <TaskCards tasks={completedThisWeek} onOpen={openQuickView} />
                  </>
                )}
              </Box>
            </Collapse>
          </Box>
        </>
      ) : (
        <>
          {dueDate && (
            <Alert
              severity="info"
              sx={{ mb: 2 }}
              action={
                <Button color="inherit" size="small" onClick={() => updateParam('dueDate')}>
                  Quitar filtro
                </Button>
              }
            >
              Mostrando pendientes con vencimiento el {formatDueDate(dueDate)}.
            </Alert>
          )}

          <Card variant="outlined" sx={{ mb: 2.5 }}>
            <CardContent sx={{ p: { xs: 1.75, md: 2.25 } }}>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    sm: 'repeat(2, minmax(0, 1fr))',
                    lg: 'repeat(4, minmax(0, 1fr))',
                  },
                  gap: 1.5,
                }}
              >
                <TextField
                  size="small"
                  label="Buscar"
                  placeholder="Título o descripción"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchRoundedIcon fontSize="small" sx={{ color: colors.textMuted }} />
                      </InputAdornment>
                    ),
                  }}
                />
                <FormControl size="small">
                  <InputLabel id="filter-status">Estado</InputLabel>
                  <Select
                    labelId="filter-status"
                    label="Estado"
                    value={status}
                    onChange={(e) => updateParam('status', e.target.value || undefined)}
                  >
                    <MenuItem value="">Todos</MenuItem>
                    {statusOrder.map((value) => (
                      <MenuItem key={value} value={value}>
                        {statusLabel[value]}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl size="small">
                  <InputLabel id="filter-priority">Prioridad</InputLabel>
                  <Select
                    labelId="filter-priority"
                    label="Prioridad"
                    value={priority}
                    onChange={(e) => updateParam('priority', e.target.value || undefined)}
                  >
                    <MenuItem value="">Todas</MenuItem>
                    {priorityOrder.map((value) => (
                      <MenuItem key={value} value={value}>
                        {priorityLabel[value]}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl size="small">
                  <InputLabel id="filter-area">Área</InputLabel>
                  <Select
                    labelId="filter-area"
                    label="Área"
                    value={area}
                    onChange={(e) => updateParam('area', e.target.value || undefined)}
                  >
                    <MenuItem value="">Todas</MenuItem>
                    {(areasQuery.data ?? []).map((item) => (
                      <MenuItem key={item.code} value={item.code}>
                        {item.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {manager && (
                  <FormControl size="small">
                    <InputLabel id="filter-assignee">Responsable</InputLabel>
                    <Select
                      labelId="filter-assignee"
                      label="Responsable"
                      value={assignedToId}
                      onChange={(e) => updateParam('assignedToId', e.target.value || undefined)}
                    >
                      <MenuItem value="">Todos</MenuItem>
                      {(usersQuery.data ?? []).map((user) => (
                        <MenuItem key={user.id} value={String(user.id)}>
                          {user.fullName}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
                <FormControl size="small">
                  <InputLabel id="filter-sort">Ordenar por</InputLabel>
                  <Select
                    labelId="filter-sort"
                    label="Ordenar por"
                    value={sortBy}
                    onChange={(e) => updateParam('sortBy', e.target.value)}
                  >
                    <MenuItem value="dueDate">Vencimiento</MenuItem>
                    <MenuItem value="priority">Prioridad</MenuItem>
                    <MenuItem value="status">Estado</MenuItem>
                    <MenuItem value="title">Título</MenuItem>
                  </Select>
                </FormControl>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        size="small"
                        checked={overdue}
                        onChange={(e) => updateParam('overdue', e.target.checked ? 'true' : undefined)}
                      />
                    }
                    label={<Typography variant="body2">Solo vencidos</Typography>}
                  />
                  {hasFilters && (
                    <Button
                      size="small"
                      color="inherit"
                      startIcon={<FilterAltOffRoundedIcon />}
                      onClick={clearFilters}
                    >
                      Limpiar
                    </Button>
                  )}
                </Stack>
              </Box>
            </CardContent>
          </Card>

          {allError && (
            <Alert
              severity="error"
              sx={{ mb: 2 }}
              action={
                <Button color="inherit" size="small" onClick={() => void allQuery.refetch()}>
                  Reintentar
                </Button>
              }
            >
              No se pudo cargar la lista de pendientes.
            </Alert>
          )}

          {allLoading ? (
            <PageLoader />
          ) : allQuery.data && allQuery.data.items.length === 0 ? (
            <Card variant="outlined">
              <EmptyState
                icon={SearchOffRoundedIcon}
                title="No hay pendientes con esos filtros"
                description="Prueba con otros criterios o crea un pendiente nuevo."
                action={
                  <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={openNew}>
                    Nuevo pendiente
                  </Button>
                }
              />
            </Card>
          ) : allQuery.data ? (
            <>
              <TaskTable
                tasks={allQuery.data.items}
                onOpen={openQuickView}
                onEdit={openEdit}
                onToast={setToast}
              />
              <TaskCards tasks={allQuery.data.items} onOpen={openQuickView} />

              {allQuery.data.totalPages > 1 && (
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 2.5 }}>
                  <Typography variant="body2" color="text.secondary">
                    Página {allQuery.data.page} de {allQuery.data.totalPages}
                  </Typography>
                  <Pagination
                    color="primary"
                    page={allQuery.data.page}
                    count={allQuery.data.totalPages}
                    onChange={(_, next) => updateParam('page', String(next))}
                  />
                </Stack>
              )}
            </>
          ) : null}
        </>
      )}

      <TaskFormDialog
        open={formOpen}
        task={editing}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSaved={handleSaved}
      />

      <TaskQuickViewDrawer
        open={quickTaskId != null}
        taskId={quickTaskId}
        onClose={() => setQuickTaskId(null)}
        onEdit={handleQuickEdit}
      />

      <Snackbar
        open={Boolean(toast)}
        autoHideDuration={3000}
        onClose={() => setToast('')}
        message={toast}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      />
    </Box>
  );
}
