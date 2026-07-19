import { BookOpen, TrendingUp, Target, ArrowRight, Sparkles, Plus, Loader2 } from 'lucide-react';
import { useBooks } from '../contexts/BookContext';
import { useActivity } from '../hooks/useActivity';
import type { ViewId } from '../types';

interface DashboardProps {
  onNavigate: (view: ViewId) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const { books, activeBook, loading } = useBooks();
  const { entries } = useActivity();

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 text-gold animate-spin" /></div>;
  }

  const activeProjects = books.filter(b => b.status !== 'complete' && b.status !== 'published').length;

  if (books.length === 0) {
    return <EmptyDashboard onNavigate={onNavigate} />;
  }

  return (
    <div className="space-y-8 max-w-7xl">
      {activeBook && (
        <section className="hero-gradient rounded-card p-8 border border-line relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 rounded-full blur-3xl" />
          <div className="relative flex flex-col lg:flex-row gap-6 items-start">
            {activeBook.cover_url && (
              <img src={activeBook.cover_url} alt={activeBook.title} className="w-24 h-36 rounded-lg object-cover shadow-heavy" />
            )}
            <div className="flex-1 min-w-0">
              <span className={`status-badge status-${activeBook.status === 'complete' ? 'complete' : 'working'} mb-3`}>
                <span className="dot" />
                {activeBook.phase}
              </span>
              <h2 className="text-2xl lg:text-3xl font-serif font-bold text-cream mt-2">{activeBook.title}</h2>
              <p className="text-muted text-sm mt-1">{activeBook.genre}{activeBook.author ? ` — ${activeBook.author}` : ''}</p>
              <div className="mt-4 flex items-center gap-4">
                <div className="flex-1 max-w-xs">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-cream/70">{activeBook.word_count.toLocaleString()} words</span>
                    <span className="text-gold font-semibold">{activeBook.progress}%</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-bar" style={{ width: `${activeBook.progress}%` }} />
                  </div>
                </div>
                <button onClick={() => onNavigate('chapters')} className="flex items-center gap-1.5 text-gold text-sm font-semibold hover:text-gold-2 transition-colors">
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Projects', value: activeProjects.toString(), icon: BookOpen, color: 'text-accent-blue' },
          { label: 'Total Books', value: books.length.toString(), icon: TrendingUp, color: 'text-accent-green' },
          { label: 'Next Deadline', value: getNextDeadline(books), icon: Target, color: 'text-accent-orange' },
          { label: 'Activity', value: entries.length.toString(), icon: Sparkles, color: 'text-gold-2' },
        ].map((stat) => (
          <div key={stat.label} className="card-gradient rounded-card p-5 border border-line">
            <div className="flex items-center gap-2 mb-2">
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
              <span className="text-xs text-muted">{stat.label}</span>
            </div>
            <span className="text-2xl font-bold text-cream">{stat.value}</span>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 card-gradient rounded-card border border-line p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-bold text-cream">Recent Activity</h3>
            <button onClick={() => onNavigate('activity')} className="text-xs text-gold hover:text-gold-2 transition-colors">View All</button>
          </div>
          {entries.length === 0 ? (
            <p className="text-xs text-muted py-8 text-center">No activity yet. Start creating!</p>
          ) : (
            <div className="space-y-3">
              {entries.slice(0, 6).map((entry) => (
                <div key={entry.id} className="flex items-center gap-3 py-2 border-b border-line last:border-0">
                  <div className="w-7 h-7 rounded-full bg-gold/15 flex items-center justify-center text-xs font-bold text-gold shrink-0">
                    {entry.action.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-cream/80 truncate">
                      <span className="font-semibold text-cream">{entry.action}</span>{' '}
                      <span className="text-cream/60">{entry.target}</span>
                    </p>
                  </div>
                  <span className="text-[10px] text-muted shrink-0">{formatTime(entry.created_at)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-2 card-gradient rounded-card border border-line p-6">
          <h3 className="text-sm font-bold text-cream mb-4">Your Books</h3>
          <div className="space-y-3">
            {books.slice(0, 4).map((book) => (
              <div key={book.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-line/50 transition-colors cursor-pointer">
                <div className="w-8 h-12 rounded bg-bg-2 border border-line overflow-hidden shrink-0">
                  {book.cover_url && <img src={book.cover_url} alt="" className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-cream truncate">{book.title}</p>
                  <p className="text-[10px] text-muted">{book.phase} — {book.progress}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyDashboard({ onNavigate }: { onNavigate: (view: ViewId) => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center">
      <div className="w-16 h-16 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center mb-6">
        <BookOpen className="w-8 h-8 text-gold" />
      </div>
      <h2 className="text-xl font-bold text-cream mb-2">Welcome to MANGU Book OS</h2>
      <p className="text-sm text-muted max-w-md mb-6">Your publishing operating system is ready. Create your first book to get started.</p>
      <button onClick={() => onNavigate('library')} className="flex items-center gap-2 px-5 py-3 rounded-lg bg-gold/90 text-bg-0 font-bold text-sm hover:bg-gold transition-colors">
        <Plus className="w-4 h-4" /> Create Your First Book
      </button>
    </div>
  );
}

function getNextDeadline(books: { deadline: string | null }[]): string {
  const upcoming = books
    .filter(b => b.deadline && new Date(b.deadline) > new Date())
    .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime());
  if (upcoming.length === 0) return 'None';
  return new Date(upcoming[0].deadline!).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}
