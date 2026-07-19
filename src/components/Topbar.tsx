import { Search, Bell, Menu, LogOut } from 'lucide-react';
import type { ViewId } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useBooks } from '../contexts/BookContext';

const viewTitles: Record<ViewId, string> = {
  dashboard: 'Dashboard',
  library: 'Library',
  lifecycle: 'Lifecycle',
  genome: 'Book Genome',
  characters: 'Characters',
  chapters: 'Chapters',
  editorial: 'Editorial Board',
  production: 'Production',
  marketing: 'Marketing',
  'ai-center': 'AI Center',
  activity: 'Activity',
};

interface TopbarProps {
  currentView: ViewId;
  onMenuToggle: () => void;
}

export function Topbar({ currentView, onMenuToggle }: TopbarProps) {
  const { signOut, user } = useAuth();
  const { activeBook, books, setActiveBookId } = useBooks();

  return (
    <header className="h-16 shrink-0 border-b border-line flex items-center justify-between px-4 lg:px-8 bg-bg-1/60 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="p-2 rounded-lg hover:bg-line transition-colors lg:hidden"
        >
          <Menu className="w-5 h-5 text-muted" />
        </button>
        <h1 className="text-lg font-bold text-cream">{viewTitles[currentView]}</h1>
        {activeBook && currentView !== 'library' && currentView !== 'dashboard' && (
          <select
            value={activeBook.id}
            onChange={(e) => setActiveBookId(e.target.value)}
            className="ml-3 text-xs bg-bg-2/60 border border-line rounded-lg px-2 py-1.5 text-muted outline-none"
          >
            {books.map((b) => (
              <option key={b.id} value={b.id}>{b.title}</option>
            ))}
          </select>
        )}
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden sm:flex items-center gap-2 bg-line/60 rounded-lg px-3 py-2 border border-line">
          <Search className="w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent text-sm text-cream placeholder:text-muted/50 outline-none w-40"
          />
        </div>

        <button className="p-2 rounded-lg hover:bg-line transition-colors relative">
          <Bell className="w-5 h-5 text-muted" />
        </button>

        <span className="hidden md:block text-xs text-muted truncate max-w-[120px]">{user?.email}</span>

        <button
          onClick={signOut}
          className="p-2 rounded-lg hover:bg-line transition-colors"
          title="Sign out"
        >
          <LogOut className="w-4 h-4 text-muted" />
        </button>
      </div>
    </header>
  );
}
