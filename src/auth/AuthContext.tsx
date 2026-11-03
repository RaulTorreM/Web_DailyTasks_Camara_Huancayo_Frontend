import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { login as apiLogin, me as apiMe } from '../api';
import { queryClient } from '../api/queryClient';
import { clearSession, getSession, setSession, type Session } from './session';

interface AuthValue {
  session: Session | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  refreshMe: () => Promise<void>;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSessionState] = useState<Session | null>(getSession());

  const applySession = (next: Session) => {
    setSession(next);
    setSessionState(next);
  };

  const login = async (username: string, password: string) => {
    const r = await apiLogin(username, password);
    // Nunca reutilizar datos de una sesión anterior.
    queryClient.clear();
    applySession({
      token: r.token,
      id: r.user.id,
      username: r.user.username,
      name: r.user.fullName,
      area: r.user.area,
      areaName: r.user.areaName,
      role: r.user.role,
    });
  };

  const logout = () => {
    queryClient.clear();
    clearSession();
    setSessionState(null);
  };

  const refreshMe = async () => {
    const current = getSession();
    if (!current) return;
    const user = await apiMe();
    applySession({
      ...current,
      id: user.id,
      username: user.username,
      name: user.fullName,
      area: user.area,
      areaName: user.areaName,
      role: user.role,
    });
  };

  useEffect(() => {
    if (!getSession()) return;
    void refreshMe().catch(() => {
      // Si /auth/me falla (sesión vencida o usuario inactivo), se limpia la sesión.
      logout();
    });
    // Solo al montar la aplicación.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AuthContext.Provider value={{ session, login, logout, refreshMe }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
