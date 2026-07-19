import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';

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
    if (!bookId) {
      setItems([]);
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.get<{ data: DbMarketingItem[] }>(
        `/marketing_items?book_id=${encodeURIComponent(bookId)}`,
      );
      setItems(data);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [bookId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const create = async (data: Partial<DbMarketingItem>): Promise<boolean> => {
    if (!bookId) return false;
    try {
      await api.post('/marketing_items', {
        book_id: bookId,
        title: data.title || 'New Campaign',
        channel: data.channel || '',
        status: data.status || 'planned',
        reach: data.reach || '',
        date: data.date || null,
      });
      await refresh();
      return true;
    } catch {
      return false;
    }
  };

  const update = async (id: string, data: Partial<DbMarketingItem>): Promise<boolean> => {
    try {
      await api.patch(`/marketing_items/${id}`, data);
      await refresh();
      return true;
    } catch {
      return false;
    }
  };

  const remove = async (id: string): Promise<boolean> => {
    try {
      await api.delete(`/marketing_items/${id}`);
      await refresh();
      return true;
    } catch {
      return false;
    }
  };

  return { items, loading, refresh, create, update, remove };
}
