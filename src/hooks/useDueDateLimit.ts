import { useQuery } from '@tanstack/react-query';
import { addDays, format, parseISO } from 'date-fns';
import { getTaskSettings } from '../api';
import { qk } from '../api/queryClient';
import { useAuth } from '../auth/AuthContext';
import { isManager } from '../auth/permissions';
import { todayLima } from '../utils/format';

/**
 * Límite de vencimiento configurado por Gerencia para usuarios regulares.
 * Gerencia no tiene límite.
 */
export function useDueDateLimit() {
  const { session } = useAuth();
  const manager = isManager(session);
  const today = todayLima();

  const settingsQuery = useQuery({
    queryKey: qk.settings,
    queryFn: getTaskSettings,
    enabled: Boolean(session?.id) && !manager,
    staleTime: 60_000,
  });

  const days = settingsQuery.data?.userDueDateWindowDays;
  const maxDate =
    !manager && days != null
      ? format(addDays(parseISO(today), days), 'yyyy-MM-dd')
      : undefined;

  return {
    manager,
    today,
    days,
    maxDate,
    loading: !manager && settingsQuery.isLoading,
  };
}
