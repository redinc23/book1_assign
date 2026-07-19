import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface DbMarketingItem {
  id: string;
  book_id: string;
  title: string;
  channel: string;
  status: string;
  reach: string;
  date: string | null;
  created_at: string;
}

export function useMarketingItems(bookId: string | undefined) {
  const [items, setItems] = useState<DbMarketingItem[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!bookId) { setItems([]); setLoading(false); return; }
    const { data, error } = await supabase
      .from('marketing_items')
      .select('*')
      .eq('book_id', bookId)
      .order('created_at', { ascending: true });
    if (!error && data) setItems(data);
    setLoading(false);
  }, [bookId]);

  useEffect(() => { refresh(); }, [refresh]);

  const create = async (data: Partial<DbMarketingItem>): Promise<boolean> => {
    if (!bookId) return false;
    const { error } = await supabase.from('marketing_items').insert({ book_id: bookId, title: data.title || 'New Campaign', channel: data.channel || '', status: data.status || 'planned', reach: data.reach || '', date: data.date || null });
    if (error) return false;
    await refresh();
    return true;
  };

  const update = async (id: string, data: Partial<DbMarketingItem>): Promise<boolean> => {
    const { error } = await supabase.from('marketing_items').update(data).eq('id', id);
    if (error) return false;
    await refresh();
    return true;
  };

  const remove = async (id: string): Promise<boolean> => {
    const { error } = await supabase.from('marketing_items').delete().eq('id', id);
    if (error) return false;
    await refresh();
    return true;
  };

  return { items, loading, refresh, create, update, remove };
}
