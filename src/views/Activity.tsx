import { Edit3, MessageSquare, Plus, Award, Sparkles, Loader2 } from 'lucide-react';
import { useActivity } from '../hooks/useActivity';

const typeIcons: Record<string, typeof Edit3> = {
  book: Plus,
  character: Sparkles,
  chapter: Edit3,
  editorial_task: MessageSquare,
  production_task: Award,
  marketing_item: Award,
};

const typeColors: Record<string, string> = {
  book: 'bg-accent-green/15 text-accent-green border-accent-green/25',
  character: 'bg-accent-violet/15 text-accent-violet border-accent-violet/25',
  chapter: 'bg-accent-blue/15 text-accent-blue border-accent-blue/25',
  editorial_task: 'bg-accent-orange/15 text-accent-orange border-accent-orange/25',
  production_task: 'bg-gold/15 text-gold border-gold/25',
  marketing_item: 'bg-accent-blue/15 text-accent-blue border-accent-blue/25',
};

export function Activity() {
  const { entries, loading } = useActivity();

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 text-gold animate-spin" /></div>;
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2 className="text-xl font-bold text-cream">Activity Log</h2>
        <p className="text-sm text-muted mt-1">All project activity in one timeline</p>
      </div>

      {entries.length === 0 ? (
        <div className="card-gradient rounded-card border border-line p-16 text-center">
          <p className="text-muted text-sm">No activity yet. Start working on your books to see events here.</p>
        </div>
      ) : (
        <div className="relative">
          <div className="absolute left-[19px] top-4 bottom-4 w-px bg-line" />
          <div className="space-y-4">
            {entries.map((entry) => {
              const Icon = typeIcons[entry.entity_type] || Edit3;
              const colorClass = typeColors[entry.entity_type] || 'bg-line text-muted border-line';
              return (
                <div key={entry.id} className="relative flex gap-4 items-start">
                  <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center border z-10 ${colorClass}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 card-gradient rounded-card border border-line p-4 hover:border-gold/15 transition-all">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-cream/80">
                        <span className="font-semibold text-cream">{entry.action}</span>{' '}
                        <span className="font-medium text-cream/70">{entry.target}</span>
                        {entry.entity_type && <span className="text-muted ml-2">({entry.entity_type.replace('_', ' ')})</span>}
                      </p>
                      <span className="text-[10px] text-muted shrink-0 ml-3">{formatTime(entry.created_at)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
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
