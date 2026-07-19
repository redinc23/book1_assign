import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface DbEditorialTask {
  id: string;
  book_id: string;
  title: string;
  chapter: string;
  assignee: string;
  severity: string;
  status: string;
  type: string;
  created_at: string;
}

export function useEditorialTasks(bookId: string | undefined) {
  const [tasks, setTasks] = useState<DbEditorialTask[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!bookId) { setTasks([]); setLoading(false); return; }
    const { data, error } = await supabase
      .from('editorial_tasks')
      .select('*')
      .eq('book_id', bookId)
      .order('created_at', { ascending: true });
    if (!error && data) setTasks(data);
    setLoading(false);
  }, [bookId]);

  useEffect(() => { refresh(); }, [refresh]);

  const create = async (data: Partial<DbEditorialTask>) => {
    if (!bookId) return;
    await supabase.from('editorial_tasks').insert({ book_id: bookId, title: data.title || 'New Task', chapter: data.chapter || '', assignee: data.assignee || '', severity: data.severity || 'medium', status: data.status || 'backlog', type: data.type || '' });
    await refresh();
  };

  const update = async (id: string, data: Partial<DbEditorialTask>) => {
    await supabase.from('editorial_tasks').update(data).eq('id', id);
    await refresh();
  };

  const remove = async (id: string) => {
    await supabase.from('editorial_tasks').delete().eq('id', id);
    await refresh();
  };

  return { tasks, loading, refresh, create, update, remove };
}
