import AddRoundedIcon from '@mui/icons-material/AddRounded';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  Stack,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  type Modifier,
} from '@dnd-kit/core';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';
import { CSS } from '@dnd-kit/utilities';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { addDays, format, parseISO } from 'date-fns';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { changeTaskStatus, getBoard } from '../../../api';
import type { DailyTask, DailyTaskBoard, DailyTaskCard, DailyTaskStatus } from '../../../api/types';
import { qk } from '../../../api/queryClient';
import { useAuth } from '../../../auth/AuthContext';
import { canEditTask } from '../../../auth/permissions';
import PageLoader from '../../../components/common/PageLoader';
import ConfirmDialog from '../../../components/dailytasks/ConfirmDialog';
import TaskCard from '../../../components/dailytasks/TaskCard';
import TaskQuickViewDrawer from '../../../components/dailytasks/TaskQuickViewDrawer';
import { brand, colors, taskStatus } from '../../../theme/tokens';
import { formatDueDate, todayLima } from '../../../utils/format';
import TaskFormDialog from '../lista/TaskFormDialog';

const COLUMNS: Array<{ key: DailyTaskStatus; title: string }> = [
  { key: 'Pending', title: 'Pendiente' },
  { key: 'InProgress', title: 'En progreso' },
  { key: 'Done', title: 'Completados del día' },
];

/** Desplaza la tarjeta flotante para no tapar la vista previa de la columna. */
const offsetOverlay: Modifier = ({ transform }) => ({
  ...transform,
  y: transform.y + 64,
});

function moveCard(
  board: DailyTaskBoard | undefined,
  taskId: number,
  target: DailyTaskStatus,
): DailyTaskBoard | undefined {
  if (!board) return board;

  const all = [...board.pending, ...board.inProgress, ...board.done];
  const task = all.find((item) => item.id === taskId);
  if (!task) return board;

  const moved: DailyTaskCard = { ...task, status: target };
  const pending = board.pending.filter((item) => item.id !== taskId);
  const inProgress = board.inProgress.filter((item) => item.id !== taskId);
  const done = board.done.filter((item) => item.id !== taskId);

  if (target === 'Pending') return { pending: [moved, ...pending], inProgress, done };
  if (target === 'InProgress') return { pending, inProgress: [moved, ...inProgress], done };
  return { pending, inProgress, done: [moved, ...done] };
}

function DraggableTaskCard({
  task,
  editable,
  onOpen,
}: {
  task: DailyTaskCard;
  editable: boolean;
  onOpen: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    disabled: !editable,
  });

  const wasDragging = useRef(false);

  useEffect(() => {
    if (isDragging) {
      wasDragging.current = true;
      return;
    }

    const timer = window.setTimeout(() => {
      wasDragging.current = false;
    }, 180);
    return () => window.clearTimeout(timer);
  }, [isDragging]);

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.22 : 1,
    transition: isDragging ? 'none' : undefined,
    touchAction: 'none' as const,
  };

  return (
    <Box
      ref={setNodeRef}
      style={style}
      {...(editable ? attributes : {})}
      {...(editable ? listeners : {})}
      onClick={() => {
        if (wasDragging.current) return;
        onOpen();
      }}
    >
      <TaskCard task={task} draggable={editable} />
    </Box>
  );
}

function BoardColumn({
  status,
  title,
  items,
  previewTask,
  onOpen,
}: {
  status: DailyTaskStatus;
  title: string;
  items: DailyTaskCard[];
  previewTask?: DailyTaskCard | null;
  onOpen: (task: DailyTaskCard) => void;
}) {
  const { session } = useAuth();
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const tone = taskStatus[status];

  return (
    <Card
      ref={setNodeRef}
      variant="outlined"
      sx={{
        bgcolor: isOver ? alpha(tone.main, 0.06) : colors.surfaceAlt,
        borderColor: isOver ? alpha(tone.main, 0.45) : colors.border,
        transition: 'border-color .16s ease, background-color .16s ease',
      }}
    >
      <Box
        sx={{
          px: 2,
          py: 1.35,
          borderBottom: `1px solid ${colors.border}`,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <Box sx={{ width: 9, height: 9, borderRadius: '50%', bgcolor: tone.main }} />
        <Typography sx={{ fontWeight: 800, fontSize: '.88rem', flex: 1 }}>{title}</Typography>
        <Chip
          size="small"
          label={items.length}
          sx={{
            height: 21,
            fontSize: '.68rem',
            fontWeight: 800,
            bgcolor: alpha(tone.main, 0.1),
            color: tone.main,
          }}
        />
      </Box>
      <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
        <Stack spacing={1.25} sx={{ minHeight: 120 }}>
          {previewTask && (
            <Box
              sx={{
                p: 0.5,
                borderRadius: 2,
                border: `2px dashed ${tone.main}`,
                bgcolor: alpha(tone.main, 0.04),
                opacity: 0.72,
                pointerEvents: 'none',
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  display: 'block',
                  px: 0.75,
                  pt: 0.25,
                  pb: 0.5,
                  fontSize: '.62rem',
                  fontWeight: 800,
                  color: tone.main,
                  letterSpacing: '.04em',
                  textTransform: 'uppercase',
                }}
              >
                {title}
              </Typography>
              <TaskCard task={previewTask} />
            </Box>
          )}

          {items.length === 0 && !previewTask ? (
            <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
              {isOver ? 'Suelta aquí' : 'Sin pendientes'}
            </Typography>
          ) : (
            items.map((task) => (
              <DraggableTaskCard
                key={task.id}
                task={task}
                editable={canEditTask(session, task)}
                onOpen={() => onOpen(task)}
              />
            ))
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function TableroPage() {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const [params, setParams] = useSearchParams();

  const dueDate = params.get('dueDate') ?? '';
  const scope = params.get('scope') === 'all' ? 'all' : 'today';
  const [daysAhead, setDaysAhead] = useState(0);
  const [activeTaskId, setActiveTaskId] = useState<number | null>(null);
  const [overStatus, setOverStatus] = useState<DailyTaskStatus | null>(null);
  const [pendingDone, setPendingDone] = useState<DailyTaskCard | null>(null);
  const [quickTaskId, setQuickTaskId] = useState<number | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<DailyTask | null>(null);
  const [toast, setToast] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
  );

  const today = todayLima();
  const horizon = format(addDays(parseISO(today), daysAhead), 'yyyy-MM-dd');

  const filters = useMemo(
    () => (dueDate ? { dueDate } : scope === 'all' ? {} : { dueTo: horizon }),
    [dueDate, scope, horizon],
  );

  const boardQuery = useQuery({
    queryKey: qk.board(filters),
    queryFn: () => getBoard(filters),
  });

  const board = boardQuery.data;

  const tasksById = useMemo(() => {
    const map = new Map<number, DailyTaskCard>();
    for (const task of [...(board?.pending ?? []), ...(board?.inProgress ?? []), ...(board?.done ?? [])]) {
      map.set(task.id, task);
    }
    return map;
  }, [board]);

  const statusMutation = useMutation({
    mutationFn: ({ taskId, status }: { taskId: number; status: DailyTaskStatus }) =>
      changeTaskStatus(taskId, { status }),
    onMutate: async ({ taskId, status }) => {
      await queryClient.cancelQueries({ queryKey: qk.board(filters) });
      const previous = queryClient.getQueryData<DailyTaskBoard>(qk.board(filters));
      queryClient.setQueryData<DailyTaskBoard>(qk.board(filters), (old) => moveCard(old, taskId, status));
      return { previous };
    },
    onError: (err, _variables, context) => {
      if (context?.previous) queryClient.setQueryData(qk.board(filters), context.previous);
      setToast(err instanceof Error ? err.message : 'No se pudo cambiar el estado.');
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ['board'] });
      void queryClient.invalidateQueries({ queryKey: ['tasks'] });
      void queryClient.invalidateQueries({ queryKey: ['calendar'] });
      void queryClient.invalidateQueries({ queryKey: qk.summary });
      void queryClient.invalidateQueries({ queryKey: ['report'] });
      void queryClient.invalidateQueries({ queryKey: ['audit'] });
    },
  });

  const setScope = (next: 'today' | 'all') => {
    const nextParams = new URLSearchParams(params);
    if (next === 'all') nextParams.set('scope', 'all');
    else nextParams.delete('scope');
    nextParams.delete('dueDate');
    setParams(nextParams, { replace: true });
  };

  const clearDueDate = () => {
    const nextParams = new URLSearchParams(params);
    nextParams.delete('dueDate');
    setParams(nextParams, { replace: true });
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveTaskId(Number(event.active.id));
    setOverStatus(null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const overId = event.over?.id;
    let status: DailyTaskStatus | null = null;
    if (overId === 'Pending' || overId === 'InProgress' || overId === 'Done') {
      status = overId;
    } else if (typeof overId === 'number') {
      status = tasksById.get(overId)?.status ?? null;
    }
    setOverStatus(status);
  };

  const handleDragCancel = () => {
    setActiveTaskId(null);
    setOverStatus(null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTaskId(null);
    setOverStatus(null);
    const taskId = Number(event.active.id);
    const task = tasksById.get(taskId);
    if (!task || !event.over) return;

    const overId = event.over.id;
    let targetStatus: DailyTaskStatus | undefined;
    if (overId === 'Pending' || overId === 'InProgress' || overId === 'Done') {
      targetStatus = overId;
    } else if (typeof overId === 'number') {
      targetStatus = tasksById.get(overId)?.status;
    }

    if (!targetStatus || targetStatus === task.status) return;

    if (!canEditTask(session, task)) {
      setToast('Solo puedes mover tus propios pendientes.');
      return;
    }

    if (targetStatus === 'Done') {
      setPendingDone(task);
      return;
    }

    statusMutation.mutate({ taskId, status: targetStatus });
  };

  const confirmDone = () => {
    if (!pendingDone) return;
    const task = pendingDone;
    setPendingDone(null);
    statusMutation.mutate({ taskId: task.id, status: 'Done' });
  };

  const activeTask = activeTaskId != null ? tasksById.get(activeTaskId) : null;
  const overlayTask =
    activeTask && overStatus && activeTask.status !== overStatus
      ? { ...activeTask, status: overStatus }
      : activeTask;
  const previewTask =
    activeTask && overStatus && activeTask.status !== overStatus && canEditTask(session, activeTask)
      ? overlayTask
      : null;

  if (boardQuery.isLoading && !board) return <PageLoader />;

  if (boardQuery.isError && !board) {
    return (
      <Alert
        severity="error"
        action={
          <Button color="inherit" size="small" onClick={() => void boardQuery.refetch()}>
            Reintentar
          </Button>
        }
      >
        No se pudo cargar el tablero de pendientes.
      </Alert>
    );
  }

  if (!board) return null;

  const total = board.pending.length + board.inProgress.length + board.done.length;

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
            Flujo diario
          </Typography>
          <Typography variant="h2" component="h1" sx={{ fontSize: { xs: '1.45rem', md: '1.65rem' } }}>Tablero</Typography>
          <Stack direction="row" spacing={0.75} sx={{ mt: 1, flexWrap: 'wrap', rowGap: 0.75 }}>
            <Chip size="small" label={`${total} pendientes`} sx={{ bgcolor: colors.bgSubtle, fontWeight: 700 }} />
            {dueDate ? (
              <Chip
                size="small"
                color="primary"
                variant="outlined"
                label={`Vencimiento ${formatDueDate(dueDate)}`}
                onDelete={clearDueDate}
              />
            ) : (
              <Chip
                size="small"
                label={scope === 'all' ? 'Todos los pendientes' : `Hasta ${formatDueDate(horizon)}`}
                sx={{ bgcolor: colors.infoSoft, color: colors.info, fontWeight: 700 }}
              />
            )}
          </Stack>
        </Box>

        <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: 'wrap', rowGap: 1 }}>
          {!dueDate && scope === 'today' && (
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel id="board-horizon">Fecha</InputLabel>
              <Select
                labelId="board-horizon"
                label="Próximos"
                value={daysAhead}
                onChange={(e) => setDaysAhead(Number(e.target.value))}
              >
                <MenuItem value={0}>Hoy</MenuItem>
                <MenuItem value={3}>3 días</MenuItem>
                <MenuItem value={7}>7 días</MenuItem>
                <MenuItem value={14}>14 días</MenuItem>
              </Select>
            </FormControl>
          )}
          <Button variant="outlined" onClick={() => setScope(scope === 'today' ? 'all' : 'today')}>
            {scope === 'today' ? 'Ver todos' : 'Volver a hoy'}
          </Button>
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            Nuevo pendiente
          </Button>
        </Stack>
      </Stack>

      {dueDate ? (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Vista del {formatDueDate(dueDate)}. La columna Completados del día muestra solo las tareas cerradas ese día.
        </Typography>
      ) : scope === 'today' ? (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Muestra las tareas vencidas, las de hoy y las de los próximos {daysAhead} días. Arrastra solo tus tareas.
          La columna Completados del día muestra solo los cierres de hoy.
        </Typography>
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Vista general de pendientes. La columna Completados del día muestra solo las tareas cerradas hoy.
        </Typography>
      )}

      <DndContext
        sensors={sensors}
        modifiers={[offsetOverlay, restrictToWindowEdges]}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(3, 290px)', lg: 'repeat(3, minmax(0, 1fr))' },
            gap: 2,
            overflowX: { xs: 'auto', lg: 'visible' },
            pb: { xs: 1, lg: 0 },
          }}
        >
          {COLUMNS.map((column) => (
            <BoardColumn
              key={column.key}
              status={column.key}
              title={column.title}
              items={
                column.key === 'Pending'
                  ? board.pending
                  : column.key === 'InProgress'
                    ? board.inProgress
                    : board.done
              }
              previewTask={previewTask?.status === column.key ? previewTask : null}
              onOpen={(task) => setQuickTaskId(task.id)}
            />
          ))}
        </Box>

        <DragOverlay dropAnimation={null}>
          {overlayTask ? (
            <Box sx={{ width: 300, pointerEvents: 'none' }}>
              <TaskCard task={overlayTask} dragging />
            </Box>
          ) : null}
        </DragOverlay>
      </DndContext>

      <TaskFormDialog
        open={formOpen}
        task={editing}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSaved={() => {
          setToast(editing ? 'Pendiente actualizado.' : 'Pendiente creado.');
          setEditing(null);
          void boardQuery.refetch();
        }}
      />

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

      <ConfirmDialog
        open={pendingDone != null}
        title="¿Completar pendiente?"
        message={`Vas a marcar “${pendingDone?.title ?? ''}” como completado.`}
        confirmLabel="Sí, completar"
        onConfirm={confirmDone}
        onClose={() => setPendingDone(null)}
      />

      <Snackbar
        open={Boolean(toast)}
        autoHideDuration={3500}
        onClose={() => setToast('')}
        message={toast}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      />
    </Box>
  );
}
