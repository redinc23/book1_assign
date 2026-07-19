import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';

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
    if (!bookId) {
      setTasks([]);
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.get<{ data: DbProductionTask[] }>(
        `/production_tasks?book_id=${encodeURIComponent(bookId)}`,
      );
      setTasks(data);
    } catch {
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [bookId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const create = async (data: Partial<DbProductionTask>): Promise<boolean> => {
    if (!bookId) return false;
    try {
      await api.post('/production_tasks', {
        book_id: bookId,
        task: data.task || 'New Task',
        status: data.status || 'planned',
        due: data.due || null,
        assignee: data.assignee || '',
        category: data.category || '',
      });
      await refresh();
      return true;
    } catch {
      return false;
    }
  };

  const update = async (id: string, data: Partial<DbProductionTask>): Promise<boolean> => {
    try {
      await api.patch(`/production_tasks/${id}`, data);
      await refresh();
      return true;
    } catch {
      return false;
    }
  };

  const remove = async (id: string): Promise<boolean> => {
    try {
      await api.delete(`/production_tasks/${id}`);
      await refresh();
      return true;
    } catch {
      return false;
    }
  };

  return { tasks, loading, refresh, create, update, remove };
}
