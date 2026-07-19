import { useState } from 'react';
import { Sparkles, Lightbulb, Zap, TrendingUp, Loader2 } from 'lucide-react';
import { useBooks } from '../contexts/BookContext';
import { useChapters } from '../hooks/useChapters';
import { useToast } from '../components/Toast';

interface AiInsight {
  id: string;
  type: string;
  title: string;
  description: string;
  confidence: number;
  impact: string;
}

export function AiCenter() {
  const { activeBook, loading } = useBooks();
  const { chapters } = useChapters(activeBook?.id);
  const { showToast } = useToast();
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const typeIcons: Record<string, typeof Sparkles> = {
    plot: Lightbulb,
    character: Sparkles,
    pacing: TrendingUp,
    style: Zap,
    market: TrendingUp,
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 text-gold animate-spin" /></div>;
  }

  if (!activeBook) {
    return <div className="card-gradient rounded-card border border-line p-16 text-center"><p className="text-muted text-sm">Select a book to see AI insights.</p></div>;
  }

  // Generate dynamic insights based on actual book data
  const insights: AiInsight[] = generateInsights(activeBook, chapters);
  const visibleInsights = insights.filter(i => !dismissed.has(i.id));

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h2 className="text-xl font-bold text-cream">AI Center</h2>
        <p className="text-sm text-muted mt-1">AI-powered insights for {activeBook.title}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-gradient rounded-card border border-line p-4">
          <span className="text-[10px] text-muted uppercase tracking-wider">Insights</span>
          <p className="text-2xl font-bold text-cream mt-1">{visibleInsights.length}</p>
        </div>
        <div className="card-gradient rounded-card border border-line p-4">
          <span className="text-[10px] text-muted uppercase tracking-wider">High Impact</span>
          <p className="text-2xl font-bold text-accent-red mt-1">{visibleInsights.filter(s => s.impact === 'high').length}</p>
        </div>
        <div className="card-gradient rounded-card border border-line p-4">
          <span className="text-[10px] text-muted uppercase tracking-wider">Chapters</span>
          <p className="text-2xl font-bold text-accent-blue mt-1">{chapters.length}</p>
        </div>
        <div className="card-gradient rounded-card border border-line p-4">
          <span className="text-[10px] text-muted uppercase tracking-wider">Completion</span>
          <p className="text-2xl font-bold text-gold mt-1">{activeBook.progress}%</p>
        </div>
      </div>

      {visibleInsights.length === 0 ? (
        <div className="card-gradient rounded-card border border-line p-16 text-center">
          <Sparkles className="w-8 h-8 text-gold/40 mx-auto mb-3" />
          <p className="text-muted text-sm">No active insights. Add more content to generate suggestions.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {visibleInsights.map((suggestion) => {
            const Icon = typeIcons[suggestion.type] || Sparkles;
            return (
              <div key={suggestion.id} className="card-gradient rounded-card border border-line p-6 hover:border-gold/25 transition-all">
                <div className="flex items-start gap-4">
                  <div className="shrink-0 w-10 h-10 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-gold" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-sm font-bold text-cream">{suggestion.title}</h3>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                        suggestion.impact === 'high' ? 'text-accent-red border-accent-red/25 bg-accent-red/8'
                        : suggestion.impact === 'medium' ? 'text-accent-orange border-accent-orange/25 bg-accent-orange/8'
                        : 'text-muted border-line bg-line/50'
                      }`}>
                        {suggestion.impact} impact
                      </span>
                    </div>
                    <p className="text-xs text-cream/70 leading-relaxed mt-1">{suggestion.description}</p>
                    <div className="flex items-center gap-4 mt-3">
                      <span className="text-[10px] text-muted uppercase tracking-wider">{suggestion.type}</span>
                      <div className="flex items-center gap-1.5">
                        <div className="w-16 h-1.5 rounded-full bg-bg-2 overflow-hidden">
                          <div className="h-full rounded-full bg-gold/60" style={{ width: `${suggestion.confidence}%` }} />
                        </div>
                        <span className="text-[10px] text-muted">{suggestion.confidence}%</span>
                      </div>
                    </div>
                  </div>
                  <div className="shrink-0 flex gap-2">
                    <button
                      onClick={() => { showToast('Insight noted — apply in your next session'); }}
                      className="px-3 py-1.5 text-[11px] font-semibold rounded-lg border border-gold/25 text-gold hover:bg-gold/10 transition-colors"
                    >
                      Apply
                    </button>
                    <button
                      onClick={() => { setDismissed(prev => new Set([...prev, suggestion.id])); showToast('Insight dismissed'); }}
                      className="px-3 py-1.5 text-[11px] font-semibold rounded-lg border border-line text-muted hover:text-cream hover:border-line-strong transition-colors"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function generateInsights(book: { progress: number; word_count: number; target_word_count: number; phase: string }, chapters: { status: string; word_count: number; target_word_count: number }[]): AiInsight[] {
  const insights: AiInsight[] = [];

  if (book.progress < 50 && book.phase === 'First Draft') {
    insights.push({ id: 'pace-1', type: 'pacing', title: 'Draft pace tracking', description: `You're at ${book.progress}% of your target. Consider setting daily word count goals to maintain momentum.`, confidence: 85, impact: 'medium' });
  }

  const draftChapters = chapters.filter(c => c.status === 'draft').length;
  if (draftChapters > chapters.length / 2 && chapters.length > 3) {
    insights.push({ id: 'draft-1', type: 'pacing', title: 'Many unstarted chapters', description: `${draftChapters} of ${chapters.length} chapters are still in draft. Focus on completing existing work before expanding scope.`, confidence: 78, impact: 'high' });
  }

  if (book.word_count > 0) {
    const writtenChaptersCount = chapters.filter(c => c.word_count > 0).length;
    const avgChapterWords = writtenChaptersCount > 0 ? Math.round(book.word_count / writtenChaptersCount) : 0;
    if (avgChapterWords > 5000) {
      insights.push({ id: 'len-1', type: 'style', title: 'Long chapter average', description: `Average chapter length is ${avgChapterWords.toLocaleString()} words. Consider breaking longer chapters for better pacing.`, confidence: 72, impact: 'low' });
    }
  }

  if (chapters.length >= 3) {
    const wordCounts = chapters.filter(c => c.word_count > 0).map(c => c.word_count);
    if (wordCounts.length > 2) {
      const max = Math.max(...wordCounts);
      const min = Math.min(...wordCounts);
      if (max > min * 3) {
        insights.push({ id: 'balance-1', type: 'pacing', title: 'Chapter length imbalance', description: `Significant variation in chapter lengths (${min.toLocaleString()} to ${max.toLocaleString()} words). This may affect reading rhythm.`, confidence: 80, impact: 'medium' });
      }
    }
  }

  if (book.phase === 'Revision') {
    insights.push({ id: 'rev-1', type: 'plot', title: 'Revision focus', description: 'During revision, prioritize structural issues before line edits. Check the Editorial board for outstanding items.', confidence: 92, impact: 'high' });
  }

  if (insights.length === 0) {
    insights.push({ id: 'gen-1', type: 'market', title: 'Keep building', description: 'Add more chapters and content to unlock deeper AI analysis. The more data available, the more targeted insights become.', confidence: 60, impact: 'low' });
  }

  return insights;
}
