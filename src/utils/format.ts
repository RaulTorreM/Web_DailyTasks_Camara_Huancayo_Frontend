import { es } from 'date-fns/locale';
import { formatInTimeZone } from 'date-fns-tz';

export const LIMA_TIMEZONE = 'America/Lima';

export const formatNumber = (n: number) => n.toLocaleString('es-PE');

/** "1 pendiente" / "3 pendientes". */
export const plural = (count: number, one: string, many: string) =>
  `${count} ${count === 1 ? one : many}`;

/** Timestamp UTC -> fecha y hora de Perú. */
export const formatDateTime = (s: string) =>
  formatInTimeZone(new Date(s), LIMA_TIMEZONE, 'dd/MM/yyyy HH:mm');

/** Timestamp UTC -> fecha larga de Perú. */
export const formatDateLong = (s: string) =>
  formatInTimeZone(new Date(s), LIMA_TIMEZONE, "d 'de' MMMM 'de' yyyy", { locale: es });

/** Timestamp UTC -> solo hora de Perú. */
export const formatTime = (s: string) =>
  formatInTimeZone(new Date(s), LIMA_TIMEZONE, 'HH:mm');

/** Fecha de Perú en formato largo (hoy). */
export const formatTodayLong = () =>
  formatInTimeZone(new Date(), LIMA_TIMEZONE, "EEEE d 'de' MMMM 'de' yyyy", { locale: es });

/** "2026-11-05" -> "05/11/2026". No convierte zona horaria. */
export const formatDueDate = (s: string) => {
  const [year, month, day] = s.split('-');
  return `${day}/${month}/${year}`;
};

/** "2026-11-05" -> "5 de noviembre de 2026". No convierte zona horaria. */
export const formatDateOnlyLong = (s: string) => {
  const [year, month, day] = s.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('es-PE', { dateStyle: 'long' });
};

/** Fecha de hoy en Perú, formato aaaa-mm-dd (para inputs de tipo date). */
export const todayLima = () => formatInTimeZone(new Date(), LIMA_TIMEZONE, 'yyyy-MM-dd');

/** Fecha local de Perú en formato aaaa-mm-dd. */
export const toInputDate = (d: Date) => formatInTimeZone(d, LIMA_TIMEZONE, 'yyyy-MM-dd');

export const formatPercent = (n: number) =>
  `${n.toLocaleString('es-PE', { maximumFractionDigits: 1 })}%`;

/** "2026-11" -> "noviembre 2026" (para el calendario). */
export const formatMonthLabel = (year: number, monthIndex: number) =>
  new Date(year, monthIndex, 1).toLocaleDateString('es-PE', { month: 'long', year: 'numeric' });
