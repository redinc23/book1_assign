import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface DbProductionTask {
  id: string;
  book_id: string;
  task: string;
  status: string;
  due: string | null;
  assignee: string;
  category: string;
  created_at: string;
}

export function useProductionTasks(bookId: string | undefined) {
  const [tasks, setTasks] = useState<DbProductionTask[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!bookId) { setTasks([]); setLoading(false); return; }
    const { data, error } = await supabase
      .from('production_tasks')
      .select('*')
      .eq('book_id', bookId)
      .order('created_at', { ascending: true });
    if (!error && data) setTasks(data);
    setLoading(false);
  }, [bookId]);

  useEffect(() => { refresh(); }, [refresh]);

  const create = async (data: Partial<DbProductionTask>): Promise<boolean> => {
    if (!bookId) return false;
    const { error } = await supabase.from('production_tasks').insert({ book_id: bookId, task: data.task || 'New Task', status: data.status || 'planned', due: data.due || null, assignee: data.assignee || '', category: data.category || '' });
    if (error) return false;
    await refresh();
    return true;
  };

  const update = async (id: string, data: Partial<DbProductionTask>): Promise<boolean> => {
    const { error } = await supabase.from('production_tasks').update(data).eq('id', id);
    if (error) return false;
    await refresh();
    return true;
  };

  const remove = async (id: string): Promise<boolean> => {
    const { error } = await supabase.from('production_tasks').delete().eq('id', id);
    if (error) return false;
    await refresh();
    return true;
  };

  return { tasks, loading, refresh, create, update, remove };
}
