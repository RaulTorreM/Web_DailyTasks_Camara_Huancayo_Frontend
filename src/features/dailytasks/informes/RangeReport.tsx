import {
  Alert,
  Box,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { subDays } from 'date-fns';
import { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { getMyReport, getReport, listAreas, listUsers } from '../../../api';
import type { DailyTaskPriority, DailyTaskStatus, ReportGranularity } from '../../../api/types';
import { qk } from '../../../api/queryClient';
import { useAuth } from '../../../auth/AuthContext';
import { isManager } from '../../../auth/permissions';
import PageLoader from '../../../components/common/PageLoader';
import SectionHeading from '../../../components/common/SectionHeading';
import { colors, taskPriority, taskStatus } from '../../../theme/tokens';
import { formatPercent, toInputDate } from '../../../utils/format';
import { priorityLabel, priorityOrder, statusLabel, statusOrder } from '../../../utils/labels';

function shortDate(value: string) {
  const [, month, day] = value.split('-');
  return `${day}/${month}`;
}

function MetricCard({
  label,
  value,
  hint,
  tone = colors.info,
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: string;
}) {
  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Typography sx={{ fontSize: '.76rem', fontWeight: 700, color: colors.textSecondary }}>
          {label}
        </Typography>
        <Typography sx={{ mt: 0.5, fontSize: '1.55rem', fontWeight: 800, lineHeight: 1, color: tone }}>
          {value}
        </Typography>
        {hint && (
          <Typography sx={{ mt: 0.5, fontSize: '.7rem', color: colors.textMuted }}>{hint}</Typography>
        )}
      </CardContent>
    </Card>
  );
}

export default function RangeReport() {
  const theme = useTheme();
  const { session } = useAuth();
  const manager = isManager(session);

  const today = new Date();
  const [from, setFrom] = useState(toInputDate(subDays(today, 29)));
  const [to, setTo] = useState(toInputDate(today));
  const [granularity, setGranularity] = useState<ReportGranularity>('day');
  const [area, setArea] = useState('');
  const [status, setStatus] = useState<DailyTaskStatus | ''>('');
  const [priority, setPriority] = useState<DailyTaskPriority | ''>('');
  const [userId, setUserId] = useState('');

  const invalidRange = Boolean(from && to && from > to);

  const query = useMemo(
    () => ({
      from,
      to,
      granularity,
      area: area || undefined,
      status: (status || undefined) as DailyTaskStatus | undefined,
      priority: (priority || undefined) as DailyTaskPriority | undefined,
      userId: manager && userId ? Number(userId) : undefined,
    }),
    [from, to, granularity, area, status, priority, manager, userId],
  );

  const reportQuery = useQuery({
    queryKey: manager ? qk.reportGlobal(query) : qk.reportMe(query),
    queryFn: () => (manager ? getReport(query) : getMyReport(query)),
    enabled: Boolean(from && to) && !invalidRange,
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

  const report = reportQuery.data;

  const seriesData = useMemo(
    () =>
      (report?.series ?? []).map((point) => ({
        period: shortDate(point.periodStart),
        creados: point.created,
        completados: point.completed,
      })),
    [report],
  );

  const statusData = useMemo(
    () =>
      (report?.byStatus ?? []).map((item) => ({
        name: statusLabel[item.status],
        value: item.count,
        color: taskStatus[item.status].main,
      })),
    [report, theme.palette.mode],
  );

  const priorityData = useMemo(
    () =>
      (report?.byPriority ?? []).map((item) => ({
        name: priorityLabel[item.priority],
        value: item.count,
        color: taskPriority[item.priority].main,
      })),
    [report, theme.palette.mode],
  );

  return (
    <Box>
      <Card variant="outlined" sx={{ mb: 2.5 }}>
        <CardContent sx={{ p: { xs: 1.75, md: 2.25 } }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(4, minmax(0, 1fr))' },
              gap: 1.5,
            }}
          >
            <TextField
              label="Desde"
              type="date"
              size="small"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Hasta"
              type="date"
              size="small"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <FormControl size="small">
              <InputLabel id="report-granularity">Granularidad</InputLabel>
              <Select
                labelId="report-granularity"
                label="Granularidad"
                value={granularity}
                onChange={(e) => setGranularity(e.target.value as ReportGranularity)}
              >
                <MenuItem value="day">Diaria</MenuItem>
                <MenuItem value="week">Semanal</MenuItem>
                <MenuItem value="month">Mensual</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small">
              <InputLabel id="report-area">Área</InputLabel>
              <Select
                labelId="report-area"
                label="Área"
                value={area}
                onChange={(e) => setArea(e.target.value)}
              >
                <MenuItem value="">Todas</MenuItem>
                {(areasQuery.data ?? []).map((item) => (
                  <MenuItem key={item.code} value={item.code}>
                    {item.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small">
              <InputLabel id="report-status">Estado</InputLabel>
              <Select
                labelId="report-status"
                label="Estado"
                value={status}
                onChange={(e) => setStatus(e.target.value as DailyTaskStatus | '')}
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
              <InputLabel id="report-priority">Prioridad</InputLabel>
              <Select
                labelId="report-priority"
                label="Prioridad"
                value={priority}
                onChange={(e) => setPriority(e.target.value as DailyTaskPriority | '')}
              >
                <MenuItem value="">Todas</MenuItem>
                {priorityOrder.map((value) => (
                  <MenuItem key={value} value={value}>
                    {priorityLabel[value]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {manager && (
              <FormControl size="small">
                <InputLabel id="report-user">Usuario</InputLabel>
                <Select
                  labelId="report-user"
                  label="Usuario"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
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
          </Box>
        </CardContent>
      </Card>

      {invalidRange && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          La fecha “Desde” no puede ser posterior a la fecha “Hasta”.
        </Alert>
      )}

      {reportQuery.isError && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          action={
            <span>
              <Typography
                component="button"
                onClick={() => void reportQuery.refetch()}
                sx={{ border: 0, bgcolor: 'transparent', color: 'inherit', fontWeight: 700, cursor: 'pointer' }}
              >
                Reintentar
              </Typography>
            </span>
          }
        >
          No se pudo cargar el informe.
        </Alert>
      )}

      {reportQuery.isLoading && !report ? (
        <PageLoader />
      ) : report ? (
        <>
          <SectionHeading
            title="Indicadores del periodo"
            subtitle={`${report.from} al ${report.to} · granularidad ${report.granularity}`}
          />

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', md: 'repeat(3, minmax(0, 1fr))', lg: 'repeat(6, minmax(0, 1fr))' },
              gap: 2,
            }}
          >
            <MetricCard label="Total" value={report.metrics.total} hint="Pendientes del periodo" />
            <MetricCard label="Creados" value={report.metrics.createdInPeriod} hint="En el periodo" tone={colors.info} />
            <MetricCard label="Completados" value={report.metrics.completedInPeriod} hint="En el periodo" tone={colors.success} />
            <MetricCard label="Vencidos" value={report.metrics.overdue} hint="Requieren atención" tone={colors.error} />
            <MetricCard label="Para hoy" value={report.metrics.dueToday} hint="Vencen hoy" tone={colors.warning} />
            <MetricCard
              label="Cumplimiento"
              value={formatPercent(report.metrics.completionRate)}
              hint="Del total"
              tone={colors.info}
            />
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', lg: '1.35fr 0.65fr' },
              gap: 2,
              mt: 3,
            }}
          >
            <Card variant="outlined">
              <CardContent>
                <SectionHeading title="Creados vs. completados" subtitle="Evolución por periodo" />
                {seriesData.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                    No hay datos para el rango seleccionado.
                  </Typography>
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={seriesData} margin={{ top: 8, right: 12, bottom: 0, left: -12 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                      <XAxis dataKey="period" tick={{ fontSize: 11 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                      <RechartsTooltip />
                      <Legend />
                      <Line type="monotone" dataKey="creados" name="Creados" stroke={colors.info} strokeWidth={2.5} dot={false} />
                      <Line type="monotone" dataKey="completados" name="Completados" stroke={colors.success} strokeWidth={2.5} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Stack spacing={2}>
              <Card variant="outlined">
                <CardContent>
                  <SectionHeading title="Por estado" />
                  <ResponsiveContainer width="100%" height={170}>
                    <BarChart data={statusData} margin={{ top: 4, right: 8, bottom: 0, left: -18 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                      <RechartsTooltip />
                      <Bar dataKey="value" name="Pendientes" radius={[6, 6, 0, 0]}>
                        {statusData.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card variant="outlined">
                <CardContent>
                  <SectionHeading title="Por prioridad" />
                  <ResponsiveContainer width="100%" height={170}>
                    <BarChart data={priorityData} margin={{ top: 4, right: 8, bottom: 0, left: -18 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                      <RechartsTooltip />
                      <Bar dataKey="value" name="Pendientes" radius={[6, 6, 0, 0]}>
                        {priorityData.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Stack>
          </Box>

          {manager && report.byUser.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <SectionHeading title="Carga por usuario" subtitle="Métricas del equipo en el periodo" />
              <Card variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Usuario</TableCell>
                      <TableCell>Área</TableCell>
                      <TableCell align="right">Total</TableCell>
                      <TableCell align="right">Completados</TableCell>
                      <TableCell align="right">Vencidos</TableCell>
                      <TableCell align="right">Cumplimiento</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {report.byUser.map((row) => (
                      <TableRow key={row.userId} hover>
                        <TableCell sx={{ fontWeight: 700 }}>{row.fullName}</TableCell>
                        <TableCell>{row.areaName}</TableCell>
                        <TableCell align="right">{row.total}</TableCell>
                        <TableCell align="right">{row.done}</TableCell>
                        <TableCell align="right">{row.overdue}</TableCell>
                        <TableCell align="right">{formatPercent(row.completionRate)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </Box>
          )}

          {report.byArea.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <SectionHeading title="Resumen por área" subtitle="Cumplimiento y vencimientos" />
              <Card variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Área</TableCell>
                      <TableCell align="right">Total</TableCell>
                      <TableCell align="right">Completados</TableCell>
                      <TableCell align="right">Vencidos</TableCell>
                      <TableCell align="right">Cumplimiento</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {report.byArea.map((row) => (
                      <TableRow key={row.area} hover>
                        <TableCell sx={{ fontWeight: 700 }}>{row.areaName}</TableCell>
                        <TableCell align="right">{row.total}</TableCell>
                        <TableCell align="right">{row.done}</TableCell>
                        <TableCell align="right">{row.overdue}</TableCell>
                        <TableCell align="right">{formatPercent(row.completionRate)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </Box>
          )}
        </>
      ) : null}
    </Box>
  );
}
