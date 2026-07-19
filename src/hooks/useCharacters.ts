import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';

export interface DbCharacter {
  id: string;
  book_id: string;
  name: string;
  role: string;
  archetype: string;
  arc: string;
  connections: number;
  image_url: string;
  notes: string;
  created_at: string;
}

export function useCharacters(bookId: string | undefined) {
  const [characters, setCharacters] = useState<DbCharacter[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!bookId) {
      setCharacters([]);
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.get<{ data: DbCharacter[] }>(`/characters?book_id=${encodeURIComponent(bookId)}`);
      setCharacters(data);
    } catch {
      setCharacters([]);
    } finally {
      setLoading(false);
    }
  }, [bookId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const create = async (data: Partial<DbCharacter>): Promise<boolean> => {
    if (!bookId) return false;
    try {
      await api.post('/characters', {
        book_id: bookId,
        name: data.name || 'New Character',
        role: data.role || '',
        archetype: data.archetype || '',
        arc: data.arc || '',
        connections: data.connections || 0,
        image_url: data.image_url || '',
        notes: data.notes || '',
      });
      await refresh();
      return true;
    } catch {
      return false;
    }
  };

  const update = async (id: string, data: Partial<DbCharacter>): Promise<boolean> => {
    try {
      await api.patch(`/characters/${id}`, data);
      await refresh();
      return true;
    } catch {
      return false;
    }
  };

  const remove = async (id: string): Promise<boolean> => {
    try {
      await api.delete(`/characters/${id}`);
      await refresh();
      return true;
    } catch {
      return false;
    }
  };

  return { characters, loading, refresh, create, update, remove };
}
