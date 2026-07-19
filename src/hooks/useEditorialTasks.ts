import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';

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
    if (!bookId) {
      setTasks([]);
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.get<{ data: DbEditorialTask[] }>(
        `/editorial_tasks?book_id=${encodeURIComponent(bookId)}`,
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

  const create = async (data: Partial<DbEditorialTask>): Promise<boolean> => {
    if (!bookId) return false;
    try {
      await api.post('/editorial_tasks', {
        book_id: bookId,
        title: data.title || 'New Task',
        chapter: data.chapter || '',
        assignee: data.assignee || '',
        severity: data.severity || 'medium',
        status: data.status || 'backlog',
        type: data.type || '',
      });
      await refresh();
      return true;
    } catch {
      return false;
    }
  };

  const update = async (id: string, data: Partial<DbEditorialTask>): Promise<boolean> => {
    try {
      await api.patch(`/editorial_tasks/${id}`, data);
      await refresh();
      return true;
    } catch {
      return false;
    }
  };

  const remove = async (id: string): Promise<boolean> => {
    try {
      await api.delete(`/editorial_tasks/${id}`);
      await refresh();
      return true;
    } catch {
      return false;
    }
  };

  return { tasks, loading, refresh, create, update, remove };
}
