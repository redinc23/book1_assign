import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

export interface Book {
  id: string;
  title: string;
  author: string;
  genre: string;
  cover_url: string;
  progress: number;
  phase: string;
  status: string;
  word_count: number;
  target_word_count: number;
  deadline: string | null;
  created_at: string;
  updated_at: string;
}

interface BookContextType {
  books: Book[];
  activeBook: Book | null;
  setActiveBookId: (id: string) => void;
  loading: boolean;
  refresh: () => Promise<void>;
  createBook: (data: Partial<Book>) => Promise<Book | null>;
  updateBook: (id: string, data: Partial<Book>) => Promise<void>;
  deleteBook: (id: string) => Promise<void>;
}

const BookContext = createContext<BookContextType | undefined>(undefined);

export function BookProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [activeBookId, setActiveBookId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) { setBooks([]); setLoading(false); return; }
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .order('updated_at', { ascending: false });
    if (!error && data) {
      setBooks(data);
      setActiveBookId(currentId => currentId || (data.length > 0 ? data[0].id : null));
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createBook = async (data: Partial<Book>): Promise<Book | null> => {
    const { data: created, error } = await supabase
      .from('books')
      .insert({ title: data.title || 'Untitled', author: data.author || '', genre: data.genre || '', cover_url: data.cover_url || '', target_word_count: data.target_word_count || 80000, deadline: data.deadline || null })
      .select()
      .single();
    if (error) return null;
    await refresh();
    return created;
  };

  const updateBook = async (id: string, data: Partial<Book>) => {
    await supabase.from('books').update({ ...data, updated_at: new Date().toISOString() }).eq('id', id);
    await refresh();
  };

  const deleteBook = async (id: string) => {
    await supabase.from('books').delete().eq('id', id);
    if (activeBookId === id) setActiveBookId(null);
    await refresh();
  };

  const activeBook = books.find((b) => b.id === activeBookId) || books[0] || null;

  return (
    <BookContext.Provider value={{ books, activeBook, setActiveBookId, loading, refresh, createBook, updateBook, deleteBook }}>
      {children}
    </BookContext.Provider>
  );
}

export function useBooks() {
  const context = useContext(BookContext);
  if (!context) throw new Error('useBooks must be used within BookProvider');
  return context;
}
