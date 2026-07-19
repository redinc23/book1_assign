import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';

export interface DbChapter {
  id: string;
  book_id: string;
  number: number;
  title: string;
  status: string;
  word_count: number;
  target_word_count: number;
  pov: string;
  notes: string;
  created_at: string;
}

export function useChapters(bookId: string | undefined) {
  const [chapters, setChapters] = useState<DbChapter[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!bookId) {
      setChapters([]);
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.get<{ data: DbChapter[] }>(`/chapters?book_id=${encodeURIComponent(bookId)}`);
      setChapters(data);
    } catch {
      setChapters([]);
    } finally {
      setLoading(false);
    }
  }, [bookId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const create = async (data: Partial<DbChapter>): Promise<boolean> => {
    if (!bookId) return false;
    const nextNum = chapters.length > 0 ? Math.max(...chapters.map((c) => c.number)) + 1 : 1;
    try {
      await api.post('/chapters', {
        book_id: bookId,
        number: data.number ?? nextNum,
        title: data.title || 'Untitled Chapter',
        status: data.status || 'draft',
        word_count: data.word_count || 0,
        target_word_count: data.target_word_count || 4000,
        pov: data.pov || '',
        notes: data.notes || '',
      });
      await refresh();
      return true;
    } catch {
      return false;
    }
  };

  const update = async (id: string, data: Partial<DbChapter>): Promise<boolean> => {
    try {
      await api.patch(`/chapters/${id}`, data);
      await refresh();
      return true;
    } catch {
      return false;
    }
  };

  const remove = async (id: string): Promise<boolean> => {
    try {
      await api.delete(`/chapters/${id}`);
      await refresh();
      return true;
    } catch {
      return false;
    }
  };

  return { chapters, loading, refresh, create, update, remove };
}
