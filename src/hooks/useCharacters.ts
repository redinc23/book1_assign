import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

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
    if (!bookId) { setCharacters([]); setLoading(false); return; }
    const { data, error } = await supabase
      .from('characters')
      .select('*')
      .eq('book_id', bookId)
      .order('created_at', { ascending: true });
    if (!error && data) setCharacters(data);
    setLoading(false);
  }, [bookId]);

  useEffect(() => { refresh(); }, [refresh]);

  const create = async (data: Partial<DbCharacter>): Promise<boolean> => {
    if (!bookId) return false;
    const { error } = await supabase.from('characters').insert({ book_id: bookId, name: data.name || 'New Character', role: data.role || '', archetype: data.archetype || '', arc: data.arc || '', connections: data.connections || 0, image_url: data.image_url || '', notes: data.notes || '' });
    if (error) return false;
    await refresh();
    return true;
  };

  const update = async (id: string, data: Partial<DbCharacter>): Promise<boolean> => {
    const { error } = await supabase.from('characters').update(data).eq('id', id);
    if (error) return false;
    await refresh();
    return true;
  };

  const remove = async (id: string): Promise<boolean> => {
    const { error } = await supabase.from('characters').delete().eq('id', id);
    if (error) return false;
    await refresh();
    return true;
  };

  return { characters, loading, refresh, create, update, remove };
}
