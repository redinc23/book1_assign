import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';
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
    if (!user) {
      setBooks([]);
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.get<{ data: Book[] }>('/books');
      setBooks(data);
      setActiveBookId((currentId) =>
        currentId && data.some((b) => b.id === currentId)
          ? currentId
          : data.length > 0
            ? data[0].id
            : null,
      );
    } catch (err) {
      console.error('Failed to load books:', err);
      setBooks([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createBook = async (data: Partial<Book>): Promise<Book | null> => {
    try {
      const { data: created } = await api.post<{ data: Book }>('/books', {
        title: data.title || 'Untitled',
        author: data.author || '',
        genre: data.genre || '',
        cover_url: data.cover_url || '',
        target_word_count: data.target_word_count || 80000,
        deadline: data.deadline || null,
      });
      await refresh();
      return created;
    } catch {
      return null;
    }
  };

  const updateBook = async (id: string, data: Partial<Book>) => {
    await api.patch(`/books/${id}`, data);
    await refresh();
  };

  const deleteBook = async (id: string) => {
    await api.delete(`/books/${id}`);
    if (activeBookId === id) setActiveBookId(null);
    await refresh();
  };

  const activeBook = books.find((b) => b.id === activeBookId) || books[0] || null;

  return (
    <BookContext.Provider
      value={{ books, activeBook, setActiveBookId, loading, refresh, createBook, updateBook, deleteBook }}
    >
      {children}
    </BookContext.Provider>
  );
}

export function useBooks() {
  const context = useContext(BookContext);
  if (!context) throw new Error('useBooks must be used within BookProvider');
  return context;
}
