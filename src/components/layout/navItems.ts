import type { SvgIconComponent } from '@mui/icons-material';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import FormatListBulletedRoundedIcon from '@mui/icons-material/FormatListBulletedRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import InsertChartRoundedIcon from '@mui/icons-material/InsertChartRounded';
import ManageSearchRoundedIcon from '@mui/icons-material/ManageSearchRounded';
import ViewKanbanRoundedIcon from '@mui/icons-material/ViewKanbanRounded';

export interface NavItem {
  to: string;
  label: string;
  icon: SvgIconComponent;
  /** Solo activo en la ruta exacta (Inicio). */
  end?: boolean;
  /** Solo visible para Gerencia General. */
  managerOnly?: boolean;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Principal',
    items: [
      { to: '/', label: 'Inicio', icon: HomeRoundedIcon, end: true },
      { to: '/lista', label: 'Lista', icon: FormatListBulletedRoundedIcon },
      { to: '/tablero', label: 'Tablero', icon: ViewKanbanRoundedIcon },
      { to: '/calendario', label: 'Calendario', icon: CalendarMonthRoundedIcon },
      { to: '/informes', label: 'Informes', icon: InsertChartRoundedIcon },
    ],
  },
  {
    label: 'Administración',
    items: [
      { to: '/auditoria', label: 'Auditoría', icon: ManageSearchRoundedIcon, managerOnly: true },
      { to: '/papelera', label: 'Papelera', icon: DeleteOutlineRoundedIcon, managerOnly: true },
    ],
  },
];

/** Destinos fijos de la barra inferior móvil (el centro lo ocupa "Nuevo"). */
export const MOBILE_TABS: NavItem[] = [
  { to: '/', label: 'Inicio', icon: HomeRoundedIcon, end: true },
  { to: '/lista', label: 'Lista', icon: FormatListBulletedRoundedIcon },
  { to: '/tablero', label: 'Tablero', icon: ViewKanbanRoundedIcon },
];

/** Filtra los grupos según el rol. */
export function navGroupsFor(role?: string | null): NavGroup[] {
  const manager = role === 'MANAGER';
  return NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => !item.managerOnly || manager),
  })).filter((group) => group.items.length > 0);
}

export function isActive(pathname: string, item: NavItem): boolean {
  if (item.end) return pathname === item.to;
  return pathname === item.to || pathname.startsWith(`${item.to}/`);
}

export interface PageMeta {
  /** Título de sección que muestra la barra superior (evita duplicar el H1 de la página). */
  title: string;
  section: string;
  /** Título específico para la pestaña del navegador. */
  documentTitle?: string;
}

/** Título y sección que muestra la barra superior. */
export function getPageMeta(pathname: string): PageMeta {
  if (pathname === '/') return { title: 'Inicio', section: 'Resumen del día' };
  if (pathname.startsWith('/lista')) return { title: 'Lista', section: 'Pendientes diarios' };
  if (pathname.startsWith('/tablero')) return { title: 'Tablero', section: 'Flujo de trabajo' };
  if (pathname.startsWith('/calendario')) return { title: 'Calendario', section: 'Vencimientos' };
  if (pathname.startsWith('/informes')) return { title: 'Informes', section: 'Métricas y cumplimiento' };
  if (pathname.startsWith('/auditoria')) return { title: 'Auditoría', section: 'Control de cambios' };
  if (pathname.startsWith('/papelera')) return { title: 'Papelera', section: 'Administración' };
  return { title: 'DailyTasks', section: 'Cámara de Comercio' };
}
