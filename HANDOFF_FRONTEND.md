# Handoff — Frontend DailyTasks

> Documento breve para continuar el frontend en una sesión nueva.
> El contrato completo de la API está en el repositorio backend:
> `docs/DAILYTASKS_FRONTEND_HANDOFF.md`.

## Estado

La base ya está creada y compila con `npm run build`.

- Arquitectura idéntica a Inventario: React 18 + Vite 5 + TypeScript + MUI 5 +
  Emotion + TanStack Query + React Router 6.
- Login, sesión, `/auth/me`, cambio de contraseña y layout responsive.
- Lista “Hoy” con vencidos, hoy y próximos 3/7/14; vista “Todos” con filtros,
  cambio rápido de estado/prioridad, resaltado de tareas propias y vista rápida.
- Completados de la semana en sección colapsada, cargada solo al abrirla.
- Tablero Kanban con drag-and-drop, permisos, confirmación al completar y
  tarjetas con color por estado.
- Calendario con desglose por estado y panel lateral de tareas.
- Informe del día con cierre por área/usuario e impresión/PDF; pestaña de rango.
- Auditoría global para MANAGER (`GET /api/dailytasks/audit`).
- Historial por tarea y papelera con restauración.
- SignalR + polling de respaldo.
- Se agregó el endpoint de auditoría en `DailyTasks.API`; no se tocó Inventario.

## Skills obligatorios para la siguiente etapa

- `impeccable`
- `ui-ux-pro-max`
- `modern-web-guidance`

Aplícalos dentro de la identidad visual y los componentes MUI existentes, sin
introducir Tailwind ni shadcn/ui.

## Siguiente etapa recomendada

1. Reasignar/eliminar desde lista y tablero con un flujo más guiado.
2. Pruebas automatizadas de flujos críticos.
3. Ajustes finos de accesibilidad y pulido visual con los skills.
4. Revisar el comportamiento de completados de la semana con datos reales.

## Comandos

```bash
npm install
npm run dev      # http://localhost:5175
npm run build
```

Backend:

```powershell
cd "C:\Users\raul_\OneDrive\Desktop\webCCH\Web_Camara_Comercio_Huancayo_Operaciones_Backend"
dotnet run --project Inventario\Inventario.API
```

## Reglas

- No modificar el backend sin coordinar; el endpoint de auditoría ya está acordado.
- No modificar el frontend de Inventario.
- No inventar endpoints ni campos.
- No incluir secretos en el código.
- Mantener español peruano y accesibilidad WCAG AA.
