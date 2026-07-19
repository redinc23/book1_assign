import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
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
    if (!user) { setEntries([]); setLoading(false); return; }
    const { data, error } = await supabase
      .from('activity_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    if (!error && data) setEntries(data);
    setLoading(false);
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  const log = useCallback(async (action: string, target: string, entityType?: string, entityId?: string, bookId?: string) => {
    if (!user) return;
    await supabase.from('activity_log').insert({
      action,
      target,
      entity_type: entityType || '',
      entity_id: entityId || null,
      book_id: bookId || null,
    });
    await refresh();
  }, [user, refresh]);

  return { entries, loading, refresh, log };
}
