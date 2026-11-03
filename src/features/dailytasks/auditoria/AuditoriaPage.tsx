import ManageSearchRoundedIcon from '@mui/icons-material/ManageSearchRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Pagination,
  Select,
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
import { format, parseISO, subDays } from 'date-fns';
import { useEffect, useMemo, useState } from 'react';
import { getAudit, listUsers } from '../../../api';
import { qk } from '../../../api/queryClient';
import { useAuth } from '../../../auth/AuthContext';
import { isManager } from '../../../auth/permissions';
import EmptyState from '../../../components/common/EmptyState';
import PageLoader from '../../../components/common/PageLoader';
import TaskQuickViewDrawer from '../../../components/dailytasks/TaskQuickViewDrawer';
import { useDebounced } from '../../../hooks/useDebounced';
import { colors } from '../../../theme/tokens';
import { formatDateTime, todayLima } from '../../../utils/format';
import { historyActionLabel, historyFieldLabel, historyValueLabel } from '../../../utils/labels';

const SENSITIVE_FIELDS = new Set(['Title', 'DueDate', 'AssignedTo']);

export default function AuditoriaPage() {
  const theme = useTheme();
  const { session } = useAuth();
  const manager = isManager(session);
  const today = todayLima();

  const [from, setFrom] = useState(format(subDays(parseISO(today), 6), 'yyyy-MM-dd'));
  const [to, setTo] = useState(today);
  const [userId, setUserId] = useState('');
  const [action, setAction] = useState('');
  const [field, setField] = useState('');
  const [query, setQuery] = useState('');
  const [sensitiveOnly, setSensitiveOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [quickTaskId, setQuickTaskId] = useState<number | null>(null);

  const debouncedQuery = useDebounced(query, 350);
  const invalidRange = Boolean(from && to && from > to);

  const usersQuery = useQuery({
    queryKey: qk.users(),
    queryFn: () => listUsers(),
    enabled: manager,
    staleTime: 5 * 60_000,
  });

  useEffect(() => {
    setPage(1);
  }, [from, to, userId, action, field, debouncedQuery, sensitiveOnly]);

  const filters = useMemo(
    () => ({
      from,
      to,
      userId: userId ? Number(userId) : undefined,
      action: action || undefined,
      field: field || undefined,
      q: debouncedQuery || undefined,
      sensitiveOnly: sensitiveOnly || undefined,
      page,
      pageSize: 50,
    }),
    [from, to, userId, action, field, debouncedQuery, sensitiveOnly, page],
  );

  const auditQuery = useQuery({
    queryKey: qk.audit(filters),
    queryFn: () => getAudit(filters),
    enabled: manager && !invalidRange,
  });

  if (!manager) {
    return <Alert severity="warning">Solo Gerencia General puede acceder a la auditoría.</Alert>;
  }

  const data = auditQuery.data;

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
          <Typography variant="overline" sx={{ color: theme.palette.text.disabled, fontWeight: 800, letterSpacing: '.12em' }}>
            Control de cambios
          </Typography>
          <Typography variant="h2" component="h1" sx={{ fontSize: { xs: '1.45rem', md: '1.65rem' } }}>
            Auditoría
          </Typography>
        </Box>
        <Chip
          label="Solo Gerencia General"
          sx={{ bgcolor: alpha(colors.info, 0.14), color: colors.info, fontWeight: 800 }}
        />
      </Stack>

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
              <InputLabel id="audit-user">Usuario</InputLabel>
              <Select labelId="audit-user" label="Usuario" value={userId} onChange={(e) => setUserId(e.target.value)}>
                <MenuItem value="">Todos</MenuItem>
                {(usersQuery.data ?? []).map((user) => (
                  <MenuItem key={user.id} value={String(user.id)}>
                    {user.fullName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small">
              <InputLabel id="audit-action">Acción</InputLabel>
              <Select labelId="audit-action" label="Acción" value={action} onChange={(e) => setAction(e.target.value)}>
                <MenuItem value="">Todas</MenuItem>
                {Object.entries(historyActionLabel).map(([value, label]) => (
                  <MenuItem key={value} value={value}>
                    {label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small">
              <InputLabel id="audit-field">Campo</InputLabel>
              <Select labelId="audit-field" label="Campo" value={field} onChange={(e) => setField(e.target.value)}>
                <MenuItem value="">Todos</MenuItem>
                {Object.entries(historyFieldLabel).map(([value, label]) => (
                  <MenuItem key={value} value={value}>
                    {label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              size="small"
              label="Buscar tarea o valor"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Título, valor anterior o nuevo"
            />
            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  checked={sensitiveOnly}
                  onChange={(e) => setSensitiveOnly(e.target.checked)}
                />
              }
              label={<Typography variant="body2">Solo cambios sensibles</Typography>}
            />
          </Box>
        </CardContent>
      </Card>

      {invalidRange && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          La fecha “Desde” no puede ser posterior a “Hasta”.
        </Alert>
      )}

      {auditQuery.isError && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          action={
            <Button color="inherit" size="small" onClick={() => void auditQuery.refetch()}>
              Reintentar
            </Button>
          }
        >
          No se pudo cargar la auditoría.
        </Alert>
      )}

      {auditQuery.isLoading && !data ? (
        <PageLoader />
      ) : data && data.items.length === 0 ? (
        <Card variant="outlined">
          <EmptyState
            icon={ManageSearchRoundedIcon}
            title="Sin cambios en el periodo"
            description="Prueba con otro rango de fechas, usuario o campo."
          />
        </Card>
      ) : data ? (
        <>
          <Card variant="outlined">
            <TableContainer>
              <Table size="small" sx={{ minWidth: 1020 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Fecha y hora</TableCell>
                    <TableCell>Usuario</TableCell>
                    <TableCell>Acción</TableCell>
                    <TableCell>Tarea</TableCell>
                    <TableCell>Campo</TableCell>
                    <TableCell>Antes</TableCell>
                    <TableCell>Después</TableCell>
                    <TableCell align="right">Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.items.map((entry) => {
                    const sensitive = entry.field != null && SENSITIVE_FIELDS.has(entry.field);
                    return (
                      <TableRow
                        key={entry.id}
                        sx={{
                          bgcolor: sensitive
                            ? alpha(colors.warning, 0.06)
                            : entry.action === 'DELETED'
                              ? alpha(colors.error, 0.045)
                              : undefined,
                        }}
                      >
                        <TableCell sx={{ whiteSpace: 'nowrap', fontSize: '.78rem' }}>
                          {formatDateTime(entry.changedAt)}
                        </TableCell>
                        <TableCell sx={{ fontSize: '.8rem', fontWeight: 700 }}>{entry.changedByName || 'Sistema'}</TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={historyActionLabel[entry.action] ?? entry.action}
                            sx={{
                              height: 22,
                              fontSize: '.66rem',
                              fontWeight: 800,
                              bgcolor: alpha(colors.info, 0.14),
                              color: colors.info,
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ maxWidth: 240 }}>
                          <Typography noWrap sx={{ fontSize: '.78rem', fontWeight: 700 }}>
                            {entry.taskCode} · {entry.taskTitle}
                          </Typography>
                          <Typography noWrap variant="caption" color="text.secondary">
                            {entry.areaName} · {entry.assignedToName}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ fontSize: '.78rem', fontWeight: 700 }}>
                          {entry.field ? historyFieldLabel[entry.field] ?? entry.field : '—'}
                          {sensitive && (
                            <Chip
                              size="small"
                              label="Sensible"
                              sx={{ ml: 0.5, height: 18, fontSize: '.58rem', bgcolor: colors.warningSoft, color: colors.warning }}
                            />
                          )}
                        </TableCell>
                        <TableCell sx={{ maxWidth: 220 }}>
                          <Typography noWrap variant="body2" sx={{ fontSize: '.78rem', color: theme.palette.text.secondary }}>
                            {historyValueLabel(entry.field, entry.oldValue)}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ maxWidth: 220 }}>
                          <Typography noWrap variant="body2" sx={{ fontSize: '.78rem', fontWeight: 700 }}>
                            {historyValueLabel(entry.field, entry.newValue)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Ver tarea e historial">
                            <IconButton
                              size="small"
                              onClick={() => setQuickTaskId(entry.taskId)}
                              aria-label={`Ver ${entry.taskCode}`}
                            >
                              <OpenInNewRoundedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>

          {data.totalPages > 1 && (
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 2.5 }}>
              <Typography variant="body2" color="text.secondary">
                Página {data.page} de {data.totalPages}
              </Typography>
              <Pagination
                color="primary"
                page={data.page}
                count={data.totalPages}
                onChange={(_, next) => setPage(next)}
              />
            </Stack>
          )}
        </>
      ) : null}

      <TaskQuickViewDrawer
        open={quickTaskId != null}
        taskId={quickTaskId}
        onClose={() => setQuickTaskId(null)}
      />
    </Box>
  );
}
