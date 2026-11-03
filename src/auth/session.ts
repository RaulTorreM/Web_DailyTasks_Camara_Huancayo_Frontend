import type { DailyTaskRole } from '../api/types';

export interface Session {
  token: string;
  id: number;
  username: string;
  name: string;
  area: string;
  areaName: string;
  role: DailyTaskRole;
}

const KEY = 'dailytasks_session';

export function getSession(): Session | null {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? 'null') as Session | null;
  } catch {
    return null;
  }
}

export const setSession = (s: Session) => localStorage.setItem(KEY, JSON.stringify(s));
export const clearSession = () => localStorage.removeItem(KEY);
