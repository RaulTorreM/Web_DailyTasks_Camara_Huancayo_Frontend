import { clearSession, getSession } from '../auth/session';

// Única variable de entorno para la API, igual que en Inventario.
// Ej: VITE_API_URL=/api/dailytasks
const configuredApiUrl = (import.meta.env.VITE_API_URL ?? '/api/dailytasks').replace(/\/+$/, '');

// Si el .env apunta a localhost pero la app se abrió desde otro equipo (celular),
// usamos la ruta relativa: el celular no debe llamar a SU propio localhost.
// Vite se encarga de reenviar /api al backend en desarrollo.
const pointsToLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?(?:\/|$)/i.test(configuredApiUrl);
const runningOnLocalhost =
  typeof window === 'undefined' || ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname);
const API_URL: string = pointsToLocalhost && !runningOnLocalhost ? '/api/dailytasks' : configuredApiUrl;

// Origen del backend para recursos estáticos, derivado de VITE_API_URL.
const API_ORIGIN: string = /^https?:\/\//i.test(API_URL) ? new URL(API_URL).origin : '';

/** Convierte una ruta del backend (/uploads/...) en URL usable desde otro origen. */
export function assetUrl(path: string | null | undefined): string {
  if (!path) return '';
  if (/^(https?:|data:|blob:)/i.test(path)) return path;
  return `${API_ORIGIN}${path}`;
}

interface ErrorBody {
  error?: string;
  title?: string;
  id?: number;
}

export class ApiError extends Error {
  constructor(message: string, public status: number, public data: ErrorBody | null) {
    super(message);
    this.name = 'ApiError';
  }
}

export interface RequestOptions {
  /** Señal externa (React Query la usa para cancelar al desmontar o cambiar la búsqueda). */
  signal?: AbortSignal;
  /** Tiempo máximo de espera; evita dejar requests colgadas. */
  timeoutMs?: number;
}

const DEFAULT_TIMEOUT = 20_000;

/** Peticiones GET en vuelo: dos pantallas que piden lo mismo comparten una sola request. */
const inflight = new Map<string, Promise<unknown>>();

interface RequestStats {
  total: number;
  byRoute: Record<string, number>;
}

function countRequest(method: string, url: string) {
  if (!import.meta.env.DEV) return;
  const w = window as Window & { __dailytasksRequests?: RequestStats };
  const stats = (w.__dailytasksRequests ??= { total: 0, byRoute: {} });
  const route = `${method} ${url.split('?')[0]}`;
  stats.total += 1;
  stats.byRoute[route] = (stats.byRoute[route] ?? 0) + 1;
}

/** Solo en desarrollo: contador de requests para verificar la optimización. */
export function requestStats(): RequestStats {
  const w = window as Window & { __dailytasksRequests?: RequestStats };
  return w.__dailytasksRequests ?? { total: 0, byRoute: {} };
}

export function resetRequestStats() {
  if (!import.meta.env.DEV) return;
  (window as Window & { __dailytasksRequests?: RequestStats }).__dailytasksRequests = {
    total: 0,
    byRoute: {},
  };
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError';
}

async function request<T>(
  method: string,
  url: string,
  body?: unknown,
  options: RequestOptions = {},
): Promise<T> {
  const { signal: externalSignal, timeoutMs = DEFAULT_TIMEOUT } = options;
  const dedupeKey = method === 'GET' && !externalSignal ? `${method} ${url}` : '';

  if (dedupeKey && inflight.has(dedupeKey)) {
    return inflight.get(dedupeKey) as Promise<T>;
  }

  const run = (async (): Promise<T> => {
    const controller = new AbortController();
    let timedOut = false;
    const timer = window.setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, timeoutMs);

    const onAbort = () => controller.abort();
    if (externalSignal) {
      if (externalSignal.aborted) controller.abort();
      else externalSignal.addEventListener('abort', onAbort, { once: true });
    }

    const session = getSession();
    const headers: Record<string, string> = {};
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    if (session?.token) headers.Authorization = `Bearer ${session.token}`;

    countRequest(method, url);

    let res: Response;
    try {
      res = await fetch(API_URL + url, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });
    } catch (error) {
      if (externalSignal?.aborted) throw error;
      if (timedOut) {
        throw new ApiError('El servidor tardó demasiado en responder. Intenta de nuevo.', 0, null);
      }
      if (isAbortError(error) && !externalSignal) {
        throw new ApiError('Se canceló la conexión con el servidor.', 0, null);
      }
      throw new ApiError('No se pudo conectar con el servidor. Revisa tu conexión a internet.', 0, null);
    } finally {
      window.clearTimeout(timer);
      externalSignal?.removeEventListener('abort', onAbort);
    }

    if (res.status === 401 && !url.startsWith('/auth')) {
      clearSession();
      if (window.location.pathname !== '/login') window.location.assign('/login');
      throw new ApiError('Tu sesión venció. Ingresa de nuevo.', 401, null);
    }

    let data: unknown = null;
    if (res.status !== 204) {
      try {
        data = await res.json();
      } catch {
        /* respuesta sin cuerpo */
      }
    }

    if (!res.ok) {
      const d = data as ErrorBody | null;
      throw new ApiError(
        d?.error ?? d?.title ?? 'Ocurrió un error. Intenta de nuevo.',
        res.status,
        d,
      );
    }
    return data as T;
  })();

  if (dedupeKey) {
    inflight.set(dedupeKey, run);
    void run.then(
      () => inflight.delete(dedupeKey),
      () => inflight.delete(dedupeKey),
    );
  }

  return run;
}

export const http = {
  get: <T>(url: string, options?: RequestOptions) => request<T>('GET', url, undefined, options),
  post: <T>(url: string, body?: unknown, options?: RequestOptions) =>
    request<T>('POST', url, body ?? {}, options),
  put: <T>(url: string, body?: unknown, options?: RequestOptions) =>
    request<T>('PUT', url, body, options),
  patch: <T>(url: string, body?: unknown, options?: RequestOptions) =>
    request<T>('PATCH', url, body ?? {}, options),
  delete: <T = void>(url: string, options?: RequestOptions) =>
    request<T>('DELETE', url, undefined, options),
};

/** Arma una cadena de consulta ignorando los valores vacíos. */
export function qs(params: Record<string, string | number | boolean | undefined | null>): string {
  const p = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') p.set(k, String(v));
  });
  const s = p.toString();
  return s ? `?${s}` : '';
}
