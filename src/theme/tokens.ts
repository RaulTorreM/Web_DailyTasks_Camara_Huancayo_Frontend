/**
 * Tokens de diseño de DailyTasks.
 *
 * Los colores neutros y semánticos se actualizan al cambiar de modo claro/oscuro.
 * Los colores de marca institucional se mantienen estables.
 */

/** Colores institucionales de la Cámara de Comercio de Huancayo. */
export const brand = {
  indigo: '#1D1F6E',
  navy: '#131347',
  navyDeep: '#0C0C2E',
  gold: '#BA9907',
  goldLight: '#D8B84A',
  goldSoft: '#F5EDCF',
} as const;

const lightColors = {
  bg: '#F5F6FA',
  bgSubtle: '#EDEFF6',
  surface: '#FFFFFF',
  surfaceAlt: '#F8F9FC',
  border: '#E4E7F0',
  borderStrong: '#CFD4E4',
  text: '#14162B',
  textSecondary: '#565B75',
  textMuted: '#878DA3',
  onDark: '#FFFFFF',
  onDarkMuted: '#ADB1D2',
  success: '#0F7B55',
  successSoft: '#E7F5EF',
  warning: '#A85B00',
  warningSoft: '#FDF2E3',
  error: '#B42318',
  errorSoft: '#FDECEA',
  info: '#1D4ED8',
  infoSoft: '#EAF0FD',
} as const;

type ColorTokens = { [K in keyof typeof lightColors]: string };

const darkColors: ColorTokens = {
  bg: '#0B0D18',
  bgSubtle: '#121524',
  surface: '#161A2A',
  surfaceAlt: '#1B2033',
  border: '#2A3045',
  borderStrong: '#3A425C',
  text: '#F2F4FA',
  textSecondary: '#B8BED1',
  textMuted: '#858CA3',
  onDark: '#FFFFFF',
  onDarkMuted: '#ADB1D2',
  success: '#4ADE80',
  successSoft: '#123326',
  warning: '#FBBF24',
  warningSoft: '#3A2A0A',
  error: '#F87171',
  errorSoft: '#3A1518',
  info: '#60A5FA',
  infoSoft: '#10233F',
};

/** Paleta neutra y semántica mutable según el modo activo. */
export const colors: ColorTokens = { ...lightColors };

/** Medidas del armazón (sidebar, barras y ancho de contenido). */
export const layout = {
  sidebar: 272,
  topbar: 68,
  bottomNav: 68,
  contentMax: 1240,
} as const;

export const shadow = {
  card: '0 1px 2px rgba(17, 20, 45, 0.04), 0 10px 28px -18px rgba(17, 20, 45, 0.22)',
  raised: '0 14px 34px -14px rgba(17, 20, 45, 0.28)',
  nav: '0 -10px 28px -18px rgba(17, 20, 45, 0.35)',
} as const;

/** Serif reservada a documentos oficiales (actas, constancias). */
export const serif = 'Georgia, "Times New Roman", serif';

/** Familia tipográfica de la interfaz. */
export const sans =
  '"Manrope Variable", Manrope, "Segoe UI", system-ui, -apple-system, BlinkMacSystemFont, sans-serif';

const lightTaskStatus = {
  Pending: { main: '#565B75', soft: '#EDEFF6' },
  InProgress: { main: '#1D4ED8', soft: '#EAF0FD' },
  Done: { main: '#0F7B55', soft: '#E7F5EF' },
} as const;

type TaskStatusTokens = { [K in keyof typeof lightTaskStatus]: { main: string; soft: string } };

const darkTaskStatus: TaskStatusTokens = {
  Pending: { main: '#AAB2C8', soft: '#1B2030' },
  InProgress: { main: '#7CB3FF', soft: '#12233F' },
  Done: { main: '#5DD39E', soft: '#12352A' },
};

/** Colores semánticos de los estados del tablero. */
export const taskStatus: TaskStatusTokens = { ...lightTaskStatus };

const lightTaskPriority = {
  Low: { main: '#565B75', soft: '#EDEFF6' },
  Medium: { main: '#1D4ED8', soft: '#EAF0FD' },
  High: { main: '#A85B00', soft: '#FDF2E3' },
  Overdue: { main: '#B42318', soft: '#FDECEA' },
} as const;

type TaskPriorityTokens = { [K in keyof typeof lightTaskPriority]: { main: string; soft: string } };

const darkTaskPriority: TaskPriorityTokens = {
  Low: { main: '#AAB2C8', soft: '#1B2030' },
  Medium: { main: '#7CB3FF', soft: '#12233F' },
  High: { main: '#FBBF24', soft: '#3A2A0A' },
  Overdue: { main: '#F87171', soft: '#3A1518' },
};

/** Colores semánticos de prioridad y vencimiento. */
export const taskPriority: TaskPriorityTokens = { ...lightTaskPriority };

const lightOwnTask = {
  bg: '#FBF7E8',
  border: '#D8B84A',
  text: '#7A6400',
} as const;

type OwnTaskTokens = { [K in keyof typeof lightOwnTask]: string };

const darkOwnTask: OwnTaskTokens = {
  bg: '#2A2410',
  border: '#D8B84A',
  text: '#F1D77A',
};

/** Tinte sutil para las tareas que pertenecen al usuario actual. */
export const ownTask: OwnTaskTokens = { ...lightOwnTask };

export type ColorMode = 'light' | 'dark';

/** Actualiza los tokens mutables al modo activo. */
export function applyColorMode(mode: ColorMode) {
  Object.assign(colors, mode === 'dark' ? darkColors : lightColors);
  Object.assign(taskStatus, mode === 'dark' ? darkTaskStatus : lightTaskStatus);
  Object.assign(taskPriority, mode === 'dark' ? darkTaskPriority : lightTaskPriority);
  Object.assign(ownTask, mode === 'dark' ? darkOwnTask : lightOwnTask);
}
