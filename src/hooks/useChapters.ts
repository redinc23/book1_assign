import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

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
    if (!bookId) { setChapters([]); setLoading(false); return; }
    const { data, error } = await supabase
      .from('chapters')
      .select('*')
      .eq('book_id', bookId)
      .order('number', { ascending: true });
    if (!error && data) setChapters(data);
    setLoading(false);
  }, [bookId]);

  useEffect(() => { refresh(); }, [refresh]);

  const create = async (data: Partial<DbChapter>): Promise<boolean> => {
    if (!bookId) return false;
    const nextNum = chapters.length > 0 ? Math.max(...chapters.map(c => c.number)) + 1 : 1;
    const { error } = await supabase.from('chapters').insert({ book_id: bookId, number: data.number ?? nextNum, title: data.title || 'Untitled Chapter', status: data.status || 'draft', word_count: data.word_count || 0, target_word_count: data.target_word_count || 4000, pov: data.pov || '', notes: data.notes || '' });
    if (error) return false;
    await refresh();
    return true;
  };

  const update = async (id: string, data: Partial<DbChapter>): Promise<boolean> => {
    const { error } = await supabase.from('chapters').update(data).eq('id', id);
    if (error) return false;
    await refresh();
    return true;
  };

  const remove = async (id: string): Promise<boolean> => {
    const { error } = await supabase.from('chapters').delete().eq('id', id);
    if (error) return false;
    await refresh();
    return true;
  };

  return { chapters, loading, refresh, create, update, remove };
}
