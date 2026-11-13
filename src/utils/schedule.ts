import { formatInTimeZone } from 'date-fns-tz';
import type { DailyTaskSettings } from '../api/types';
import { LIMA_TIMEZONE } from './format';

/** "08:30:00" -> "08:30" (valor para inputs de tipo time). */
export const toHm = (value: string) => value.slice(0, 5);

/** Hora actual de Perú, formato HH:mm. */
export const nowLimaTime = () => formatInTimeZone(new Date(), LIMA_TIMEZONE, 'HH:mm');

/** Hoy en Perú es sábado o domingo. */
export const isWeekendLima = () => {
  const isoDay = formatInTimeZone(new Date(), LIMA_TIMEZONE, 'i');
  return isoDay === '6' || isoDay === '7';
};

export type CreationSchedule = Pick<
  DailyTaskSettings,
  'creationStartTime' | 'creationEndTime' | 'allowWeekendCreation'
>;

/** Indica si en este momento se puede crear un pendiente según el horario configurado. */
export const isCreationAllowedNow = (settings: CreationSchedule) => {
  if (isWeekendLima() && !settings.allowWeekendCreation) return false;
  const now = nowLimaTime();
  return now >= toHm(settings.creationStartTime) && now <= toHm(settings.creationEndTime);
};

/** Texto corto del horario, por ejemplo "08:30 a 19:00 · lunes a viernes". */
export const scheduleLabel = (settings: CreationSchedule) =>
  `${toHm(settings.creationStartTime)} a ${toHm(settings.creationEndTime)} · ${
    settings.allowWeekendCreation ? 'todos los días' : 'lunes a viernes'
  }`;
