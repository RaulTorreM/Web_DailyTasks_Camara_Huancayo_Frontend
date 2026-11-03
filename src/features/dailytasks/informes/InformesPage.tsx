import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  FormControl,
  GlobalStyles,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useQuery } from '@tanstack/react-query';
import { fromZonedTime } from 'date-fns-tz';
import { useMemo, useState } from 'react';
import { listAllTasks, listAreas, listUsers } from '../../../api';
import type { DailyTask, DailyTaskUser } from '../../../api/types';
import { qk } from '../../../api/queryClient';
import { useAuth } from '../../../auth/AuthContext';
import { isManager } from '../../../auth/permissions';
import PageLoader from '../../../components/common/PageLoader';
import SectionHeading from '../../../components/common/SectionHeading';
import { TaskPriorityChip, TaskStatusChip } from '../../../components/common/StatusChips';
import { colors, taskStatus } from '../../../theme/tokens';
import { formatDateOnlyLong, formatDateTime, formatDueDate, formatPercent, todayLima } from '../../../utils/format';
import RangeReport from './RangeReport';

interface AreaRow {
  area: string;
  areaName: string;
  due: number;
  completedToday: number;
  pending: number;
  overdue: number;
  rate: number;
}

interface UserRow extends AreaRow {
  userId: number;
  fullName: string;
}

function MetricCard({ label, value, hint, tone = colors.info }: { label: string; value: string | number; hint?: string; tone?: string }) {
  return (
    <Card variant="outlined" sx={{ height: '100%', boxShadow: 'none' }}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Typography sx={{ fontSize: '.74rem', fontWeight: 800, color: colors.textSecondary }}>{label}</Typography>
        <Typography sx={{ mt: 0.4, fontSize: '1.55rem', fontWeight: 800, lineHeight: 1, color: tone }}>{value}</Typography>
        {hint && <Typography sx={{ mt: 0.4, fontSize: '.68rem', color: colors.textMuted }}>{hint}</Typography>}
      </CardContent>
    </Card>
  );
}

function ReportTaskTable({
  tasks,
  emptyText,
  showCompleted = false,
}: {
  tasks: DailyTask[];
  emptyText: string;
  showCompleted?: boolean;
}) {
  if (tasks.length === 0) {
    return (
      <Card variant="outlined" sx={{ boxShadow: 'none' }}>
        <CardContent sx={{ py: 3 }}>
          <Typography variant="body2" color="text.secondary" align="center">
            {emptyText}
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="outlined" sx={{ boxShadow: 'none' }}>
      <TableContainer>
        <Table
          size="small"
          sx={{
            minWidth: showCompleted ? 940 : 860,
            '@media print': { minWidth: 0, width: '100%' },
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell>Código</TableCell>
              <TableCell>Tarea</TableCell>
              <TableCell>Área</TableCell>
              <TableCell>Responsable</TableCell>
              <TableCell>Vence</TableCell>
              <TableCell className="print-hide">Prioridad</TableCell>
              <TableCell>Estado</TableCell>
              {showCompleted && <TableCell>Completado</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {tasks.map((task) => (
              <TableRow key={task.id} sx={{ bgcolor: alpha(taskStatus[task.status].main, 0.025) }}>
                <TableCell sx={{ whiteSpace: 'nowrap', color: colors.textSecondary, fontWeight: 800 }}>
                  {task.code}
                </TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '.82rem' }}>{task.title}</TableCell>
                <TableCell sx={{ fontSize: '.78rem' }}>{task.areaName}</TableCell>
                <TableCell sx={{ fontSize: '.78rem' }}>{task.assignedToName}</TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap', fontSize: '.78rem', color: task.isOverdue ? colors.error : colors.text }}>
                  {formatDueDate(task.dueDate)}
                </TableCell>
                <TableCell className="print-hide"><TaskPriorityChip priority={task.priority} /></TableCell>
                <TableCell><TaskStatusChip status={task.status} /></TableCell>
                {showCompleted && (
                  <TableCell sx={{ whiteSpace: 'nowrap', fontSize: '.78rem', color: colors.textSecondary }}>
                    {task.completedAt ? formatDateTime(task.completedAt) : '—'}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
}

function AreaTable({ rows }: { rows: AreaRow[] }) {
  if (rows.length === 0) {
    return (
      <Card variant="outlined" sx={{ boxShadow: 'none' }}>
        <CardContent sx={{ py: 3 }}>
          <Typography variant="body2" color="text.secondary" align="center">
            No hay áreas con pendientes para este día.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="outlined" sx={{ boxShadow: 'none' }}>
      <TableContainer>
        <Table size="small" sx={{ minWidth: 720 }}>
          <TableHead>
            <TableRow>
              <TableCell>Área</TableCell>
              <TableCell align="right">Vencían</TableCell>
              <TableCell align="right">Completadas hoy</TableCell>
              <TableCell align="right">Pendientes</TableCell>
              <TableCell align="right">Vencidas</TableCell>
              <TableCell align="right">Cumplimiento</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow
                key={row.area}
                sx={{ bgcolor: row.pending > 0 || row.overdue > 0 ? alpha(colors.warning, 0.055) : undefined }}
              >
                <TableCell sx={{ fontWeight: 800 }}>{row.areaName}</TableCell>
                <TableCell align="right">{row.due}</TableCell>
                <TableCell align="right">{row.completedToday}</TableCell>
                <TableCell align="right">
                  <Chip
                    size="small"
                    label={row.pending}
                    sx={{ height: 21, fontWeight: 800, bgcolor: row.pending > 0 ? colors.warningSoft : colors.bgSubtle, color: row.pending > 0 ? colors.warning : colors.textSecondary }}
                  />
                </TableCell>
                <TableCell align="right">
                  <Chip
                    size="small"
                    label={row.overdue}
                    sx={{ height: 21, fontWeight: 800, bgcolor: row.overdue > 0 ? colors.errorSoft : colors.bgSubtle, color: row.overdue > 0 ? colors.error : colors.textSecondary }}
                  />
                </TableCell>
                <TableCell align="right">
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 800, color: row.rate >= 100 ? colors.success : colors.warning }}
                  >
                    {formatPercent(row.rate)}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
}

function UserTable({ rows }: { rows: UserRow[] }) {
  return (
    <Card variant="outlined" sx={{ boxShadow: 'none' }}>
      <TableContainer>
        <Table size="small" sx={{ minWidth: 820 }}>
          <TableHead>
            <TableRow>
              <TableCell>Usuario</TableCell>
              <TableCell>Área</TableCell>
              <TableCell align="right">Vencían</TableCell>
              <TableCell align="right">Completadas hoy</TableCell>
              <TableCell align="right">Pendientes</TableCell>
              <TableCell align="right">Vencidas</TableCell>
              <TableCell align="right">Cumplimiento</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow
                key={row.userId}
                sx={{ bgcolor: row.pending > 0 || row.overdue > 0 ? alpha(colors.warning, 0.055) : undefined }}
              >
                <TableCell sx={{ fontWeight: 800 }}>{row.fullName}</TableCell>
                <TableCell sx={{ fontSize: '.78rem' }}>{row.areaName}</TableCell>
                <TableCell align="right">{row.due}</TableCell>
                <TableCell align="right">{row.completedToday}</TableCell>
                <TableCell align="right">
                  <Chip
                    size="small"
                    label={row.pending}
                    sx={{ height: 21, fontWeight: 800, bgcolor: row.pending > 0 ? colors.warningSoft : colors.bgSubtle, color: row.pending > 0 ? colors.warning : colors.textSecondary }}
                  />
                </TableCell>
                <TableCell align="right">
                  <Chip
                    size="small"
                    label={row.overdue}
                    sx={{ height: 21, fontWeight: 800, bgcolor: row.overdue > 0 ? colors.errorSoft : colors.bgSubtle, color: row.overdue > 0 ? colors.error : colors.textSecondary }}
                  />
                </TableCell>
                <TableCell align="right">
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 800, color: row.rate >= 100 ? colors.success : colors.warning }}
                  >
                    {formatPercent(row.rate)}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
}

export default function InformesPage() {
  const theme = useTheme();
  const { session } = useAuth();
  const manager = isManager(session);
  const [tab, setTab] = useState(0);
  const [date, setDate] = useState(todayLima());
  const [area, setArea] = useState('');
  const [userId, setUserId] = useState('');

  const assignedToId = manager ? (userId ? Number(userId) : undefined) : session?.id;
  const startOfDayUtc = fromZonedTime(`${date}T00:00:00`, 'America/Lima').toISOString();

  const dueUpToQuery = useQuery({
    queryKey: qk.tasks({ report: 'daily', kind: 'dueUpTo', date, area, assignedToId }),
    queryFn: () =>
      listAllTasks({
        dueTo: date,
        area: area || undefined,
        assignedToId,
        pageSize: 100,
        sortBy: 'dueDate',
        sortDir: 'asc',
      }),
    enabled: tab === 0,
  });

  const completedQuery = useQuery({
    queryKey: qk.tasks({ report: 'daily', kind: 'completed', date, area, assignedToId }),
    queryFn: () =>
      listAllTasks({
        status: 'Done',
        updatedSince: startOfDayUtc,
        area: area || undefined,
        assignedToId,
        pageSize: 100,
        sortBy: 'dueDate',
        sortDir: 'desc',
      }),
    enabled: tab === 0,
  });

  const usersQuery = useQuery({
    queryKey: qk.users(),
    queryFn: () => listUsers(),
    enabled: manager && tab === 0,
    staleTime: 5 * 60_000,
  });

  const areasQuery = useQuery({
    queryKey: qk.areas,
    queryFn: () => listAreas(),
    staleTime: 10 * 60_000,
  });

  const allDueUpTo = dueUpToQuery.data ?? [];
  const dueTasks = allDueUpTo.filter((task) => task.dueDate === date);
  const overdueTasks = allDueUpTo.filter((task) => task.status !== 'Done' && task.dueDate < date);
  const completedTasks = useMemo(
    () => (completedQuery.data ?? []).filter((task) => task.completedOn === date),
    [completedQuery.data, date],
  );

  const pendingDue = dueTasks.filter((task) => task.status !== 'Done');
  const attention = dueTasks.length + overdueTasks.length;
  const completionRate = attention > 0 ? Math.min(100, (completedTasks.length / attention) * 100) : 0;

  const userRows = useMemo<UserRow[]>(() => {
    const source: Array<Pick<DailyTaskUser, 'id' | 'fullName' | 'area' | 'areaName'>> = manager
      ? (usersQuery.data ?? [])
      : session
        ? [{ id: session.id, fullName: session.name, area: session.area, areaName: session.areaName }]
        : [];

    const filtered = manager && userId ? source.filter((user) => user.id === Number(userId)) : source;

    return filtered
      .map((user) => {
        const mine = dueTasks.filter((task) => task.assignedToId === user.id);
        const minePending = mine.filter((task) => task.status !== 'Done');
        const mineCompleted = completedTasks.filter((task) => task.assignedToId === user.id);
        const mineOverdue = overdueTasks.filter((task) => task.assignedToId === user.id);
        return {
          userId: user.id,
          fullName: user.fullName,
          area: user.area,
          areaName: user.areaName,
          due: mine.length,
          completedToday: mineCompleted.length,
          pending: minePending.length,
          overdue: mineOverdue.length,
          rate: mine.length + mineOverdue.length > 0
            ? Math.min(100, (mineCompleted.length / (mine.length + mineOverdue.length)) * 100)
            : 0,
        };
      })
      .sort((a, b) => b.pending - a.pending || b.overdue - a.overdue || a.rate - b.rate);
  }, [manager, usersQuery.data, userId, session, dueTasks, completedTasks, overdueTasks]);

  const areaRows = useMemo<AreaRow[]>(() => {
    const source = manager
      ? (areasQuery.data ?? [])
      : session
        ? [{ code: session.area, name: session.areaName }]
        : [];

    const filtered = manager && area ? source.filter((item) => item.code === area) : source;

    return filtered
      .map((item) => {
        const mine = dueTasks.filter((task) => task.area === item.code);
        const minePending = mine.filter((task) => task.status !== 'Done');
        const mineCompleted = completedTasks.filter((task) => task.area === item.code);
        const mineOverdue = overdueTasks.filter((task) => task.area === item.code);
        return {
          area: item.code,
          areaName: item.name,
          due: mine.length,
          completedToday: mineCompleted.length,
          pending: minePending.length,
          overdue: mineOverdue.length,
          rate: mine.length + mineOverdue.length > 0
            ? Math.min(100, (mineCompleted.length / (mine.length + mineOverdue.length)) * 100)
            : 0,
        };
      })
      .filter((row) => row.due > 0 || row.completedToday > 0 || row.overdue > 0)
      .sort((a, b) => b.pending - a.pending || b.overdue - a.overdue || a.rate - b.rate);
  }, [manager, areasQuery.data, area, session, dueTasks, completedTasks, overdueTasks]);

  const isLoading = dueUpToQuery.isLoading || completedQuery.isLoading;
  const hasError = dueUpToQuery.isError || completedQuery.isError;
  const refetchAll = () => {
    void dueUpToQuery.refetch();
    void completedQuery.refetch();
  };

  return (
    <Box>
      <GlobalStyles
        styles={{
          '@media print': {
            '.no-print': { display: 'none !important' },
            'html, body, #root, .MuiBox-root': { backgroundColor: '#FFFFFF !important' },
            'html, body': { color: '#111827 !important' },
            '.print-report, .print-report *': { color: '#111827 !important' },
            '.print-report .MuiCard-root, .print-report .MuiPaper-root': {
              backgroundColor: '#FFFFFF !important',
              boxShadow: 'none',
              borderColor: '#D8DCE8 !important',
            },
            '.print-report .MuiTableCell-root': {
              fontSize: '9px',
              padding: '3px 4px',
              backgroundColor: '#FFFFFF !important',
              borderColor: '#D8DCE8 !important',
            },
            '.print-report .MuiTableHead-root .MuiTableCell-root': { backgroundColor: '#F5F6FA !important' },
            '.print-report .MuiChip-root': {
              backgroundColor: '#F1F3F8 !important',
              color: '#111827 !important',
              borderColor: '#C9CEDC !important',
            },
            '.print-report table': { minWidth: '0 !important', width: '100% !important' },
            '.print-report .print-hide': { display: 'none !important' },
            '@page': { margin: '10mm' },
          },
        }}
      />

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        justifyContent="space-between"
        spacing={1.5}
        sx={{ mb: 2 }}
        className="no-print"
      >
        <Box>
          <Typography variant="overline" sx={{ color: colors.textMuted, fontWeight: 800, letterSpacing: '.12em' }}>
            {tab === 0 ? 'Cierre del día' : 'Histórico'}
          </Typography>
          <Typography variant="h2" component="h1" sx={{ fontSize: { xs: '1.45rem', md: '1.65rem' } }}>
            Informes
          </Typography>
        </Box>
        <Tabs value={tab} onChange={(_, value) => setTab(value)}>
          <Tab label="Día" />
          <Tab label="Rango" />
        </Tabs>
      </Stack>

      {tab === 1 ? (
        <RangeReport />
      ) : (
        <Box className="print-report">
          <Card variant="outlined" sx={{ mb: 2.5, boxShadow: 'none' }} className="no-print">
            <CardContent sx={{ p: { xs: 1.75, md: 2 } }}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems={{ md: 'center' }} sx={{ flexWrap: 'wrap', rowGap: 1.5 }}>
                <TextField
                  label="Día del informe"
                  type="date"
                  size="small"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{ minWidth: 180 }}
                />
                <Button variant="outlined" onClick={() => setDate(todayLima())}>
                  Hoy
                </Button>
                <FormControl size="small" sx={{ minWidth: 190 }}>
                  <InputLabel id="daily-area">Área</InputLabel>
                  <Select labelId="daily-area" label="Área" value={area} onChange={(e) => setArea(e.target.value)}>
                    <MenuItem value="">Todas</MenuItem>
                    {(areasQuery.data ?? []).map((item) => (
                      <MenuItem key={item.code} value={item.code}>
                        {item.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {manager && (
                  <FormControl size="small" sx={{ minWidth: 200 }}>
                    <InputLabel id="daily-user">Usuario</InputLabel>
                    <Select labelId="daily-user" label="Usuario" value={userId} onChange={(e) => setUserId(e.target.value)}>
                      <MenuItem value="">Todos</MenuItem>
                      {(usersQuery.data ?? []).map((user) => (
                        <MenuItem key={user.id} value={String(user.id)}>
                          {user.fullName}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
                <Box sx={{ flex: 1 }} />
                <Button variant="contained" onClick={() => window.print()}>
                  Imprimir / PDF
                </Button>
              </Stack>
            </CardContent>
          </Card>

          {/* Encabezado solo para impresión */}
          <Box sx={{ display: 'none', '@media print': { display: 'block', mb: 2 } }}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Box component="img" src="/brand/logo-cch-mark.png" alt="" sx={{ width: 44, height: 44 }} />
              <Box>
                <Typography variant="h2" sx={{ fontSize: '1.2rem' }}>
                  Cierre diario de pendientes
                </Typography>
                <Typography variant="body2">
                  {formatDateOnlyLong(date)} · Cámara de Comercio de Huancayo
                </Typography>
              </Box>
            </Stack>
            <Divider sx={{ mt: 2 }} />
          </Box>

          {hasError && (
            <Alert
              severity="error"
              sx={{ mb: 2 }}
              action={
                <Button color="inherit" size="small" onClick={refetchAll}>
                  Reintentar
                </Button>
              }
            >
              No se pudo cargar el informe del día.
            </Alert>
          )}

          {isLoading ? (
            <PageLoader />
          ) : (
            <>
              <SectionHeading
                title="Resumen del día"
                subtitle={`${formatDateOnlyLong(date)} · ${dueTasks.length} tareas vencían hoy`}
              />

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', md: 'repeat(5, minmax(0, 1fr))' },
                  gap: 2,
                }}
              >
                <MetricCard label="Vencían hoy" value={dueTasks.length} hint="Tareas del día" />
                <MetricCard label="Completadas hoy" value={completedTasks.length} hint="Cerradas en el día" tone={colors.success} />
                <MetricCard label="Quedaron pendientes" value={pendingDue.length} hint="De las de hoy" tone={colors.warning} />
                <MetricCard label="Vencidas" value={overdueTasks.length} hint="Arrastradas" tone={colors.error} />
                <MetricCard label="Cumplimiento" value={formatPercent(completionRate)} hint="Del trabajo del día" tone={theme.palette.info.main} />
              </Box>

              <Box sx={{ mt: 3 }}>
                <SectionHeading title="Completadas hoy" subtitle={`${completedTasks.length} tareas cerradas`} />
                <ReportTaskTable tasks={completedTasks} emptyText="Todavía no se completaron tareas hoy." showCompleted />
              </Box>

              <Box sx={{ mt: 3 }}>
                <SectionHeading title="Pendientes de hoy" subtitle={`${pendingDue.length} tareas sin cerrar`} />
                <ReportTaskTable tasks={pendingDue} emptyText="No quedaron pendientes de hoy." />
              </Box>

              <Box sx={{ mt: 3 }}>
                <SectionHeading title="Vencidas" subtitle={`${overdueTasks.length} tareas arrastradas`} />
                <ReportTaskTable tasks={overdueTasks} emptyText="No hay tareas vencidas." />
              </Box>

              <Box sx={{ mt: 3 }}>
                <SectionHeading title="Cierre por área" subtitle="Áreas con tareas del día" />
                <AreaTable rows={areaRows} />
              </Box>

              {manager && (
                <Box sx={{ mt: 3 }}>
                  <SectionHeading title="Cierre por usuario" subtitle="Responsables con tareas del día" />
                  <UserTable rows={userRows} />
                </Box>
              )}
            </>
          )}
        </Box>
      )}
    </Box>
  );
}
