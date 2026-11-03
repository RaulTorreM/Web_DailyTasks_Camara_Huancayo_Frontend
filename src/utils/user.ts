import type { DailyTaskRole } from '../api/types';

/** Iniciales para avatares (máximo dos letras). */
export function initials(name: string | null | undefined): string {
  const clean = (name ?? '').trim();
  if (!clean) return 'U';
  return clean
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

/** Etiqueta legible del rol que devuelve el backend. */
export function roleLabel(role: DailyTaskRole | string | null | undefined): string {
  if (!role) return 'Usuario';
  if (role === 'MANAGER' || role.includes('MANAGER') || role.includes('ADMIN')) {
    return 'Gerencia General';
  }
  return 'Usuario';
}
