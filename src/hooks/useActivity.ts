import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

export interface DbActivity {
  id: string;
  user_id: string;
  book_id: string | null;
  action: string;
  target: string;
  entity_type: string;
  entity_id: string | null;
  created_at: string;
}

export function useActivity() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<DbActivity[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setEntries([]);
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.get<{ data: DbActivity[] }>('/activity');
      setEntries(data);
    } catch {
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const log = useCallback(
    async (
      action: string,
      target: string,
      entityType?: string,
      entityId?: string,
      bookId?: string,
    ): Promise<boolean> => {
      if (!user) return false;
      try {
        await api.post('/activity', {
          action,
          target,
          entity_type: entityType || '',
          entity_id: entityId || null,
          book_id: bookId || null,
        });
        await refresh();
        return true;
      } catch {
        return false;
      }
    },
    [user, refresh],
  );

  return { entries, loading, refresh, log };
}
