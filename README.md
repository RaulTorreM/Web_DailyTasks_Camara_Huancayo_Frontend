# DailyTasks — Frontend

Frontend del módulo **DailyTasks / Pendientes Diarios** de la Cámara de Comercio de Huancayo.

## Arquitectura

Este proyecto reutiliza la misma arquitectura del frontend de Inventario:

- React 18 + Vite 5 + TypeScript estricto.
- MUI 5 + Emotion + Manrope Variable.
- `@tanstack/react-query` v5.
- `react-router-dom` v6 con rutas lazy.
- Cliente HTTP propio basado en `fetch` (`src/api/client.ts`).
- `AuthContext` + `session.ts` con `localStorage`.
- Tema MUI centralizado (`src/theme/theme.ts` y `src/theme/tokens.ts`).
- Layout y componentes comunes equivalentes a Inventario.

Dependencias adicionales para las funciones nuevas:

- `recharts` para gráficos.
- `@microsoft/signalr` para tiempo real.
- `@dnd-kit` para el tablero Kanban.
- `date-fns` + `date-fns-tz` para fechas de Perú.

No se usa Tailwind, shadcn/ui ni otro sistema de diseño.

## Requisitos

- Node.js 20+.
- Backend DailyTasks corriendo en `http://localhost:5095`.

## Configuración

`.env.development`:

```env
VITE_API_URL=/api/dailytasks
VITE_HUB_URL=/hubs/dailytasks
```

Vite hace proxy de `/api` y `/hubs` (incluido WebSocket) hacia `http://localhost:5095`.
Para producción, usa URLs absolutas en `.env`.

## Scripts

```bash
npm install
npm run dev        # http://localhost:5175
npm run build      # tsc --noEmit && vite build
npm run preview
npm run dev:https  # HTTPS de prueba para celular
```

## Backend

```powershell
cd "C:\Users\raul_\OneDrive\Desktop\webCCH\Web_Camara_Comercio_Huancayo_Operaciones_Backend"
dotnet run --project Inventario\Inventario.API
```

API: `http://localhost:5095` · Hub: `http://localhost:5095/hubs/dailytasks`.

## Rutas

| Ruta | Vista |
|---|---|
| `/login` | Login |
| `/` | Resumen / Inicio |
| `/lista` | Lista filtrable de pendientes |
| `/tablero` | Tablero Kanban |
| `/calendario` | Calendario mensual |
| `/informes` | Informe del día + histórico |
| `/auditoria` | Auditoría global (solo MANAGER) |
| `/papelera` | Eliminados (solo MANAGER) |

## Permisos

- `USER`: crea y modifica sus propios pendientes; consulta el historial solo de sus tareas.
- `MANAGER` (Gerencia General): ve todo, asigna, elimina, restaura, consulta el historial de cualquier tarea y accede a informes globales.

El backend es la fuente de verdad; la UI oculta o deshabilita acciones no permitidas.

## Estado actual

Implementado:

- Login, sesión persistente, `/auth/me`, logout y cambio de contraseña.
- Layout responsive con sidebar, topbar y navegación móvil.
- Resumen con indicadores personales y foco en hoy; Gerencia puede alternar entre indicadores del equipo y sus pendientes.
- Lista con vista “Hoy” (vencidos + hoy + próximos 3/7/14), vista “Todos”, filtros, paginación, cambio rápido de estado/prioridad, resaltado de tareas propias y vista rápida.
- Sección colapsada “Completados de esta semana”, cargada solo al abrirla.
- Creación y edición de pendientes.
- Tablero Kanban con drag-and-drop, permisos por responsable, confirmación al completar y tarjetas con color por estado.
- Calendario mensual con desglose por estado y panel lateral de tareas agrupadas.
- Informe del día con cierre por área/usuario y botón Imprimir/PDF; pestaña histórica por rango.
- Auditoría global para MANAGER conectada a `GET /api/dailytasks/audit`.
- Historial por tarea desde la vista rápida.
- Papelera con restauración para MANAGER.
- SignalR con invalidación de caché y polling de respaldo.
- Build de producción sin errores.

Pendiente para una siguiente iteración:

- Reasignar/eliminar desde lista y tablero con un flujo más guiado.
- Pruebas automatizadas de flujos críticos.
- Ajustes finos de accesibilidad y pulido visual con los skills `impeccable`, `ui-ux-pro-max` y `modern-web-guidance`.

## Notas

- No modificar el backend desde este proyecto.
- No incluir contraseñas ni secretos en el código.
- El contrato completo de la API está en:
  `C:\Users\raul_\OneDrive\Desktop\webCCH\Web_Camara_Comercio_Huancayo_Operaciones_Backend\docs\DAILYTASKS_FRONTEND_HANDOFF.md`
