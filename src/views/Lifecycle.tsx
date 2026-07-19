import { CheckCircle2, Circle, Clock, Loader2 } from 'lucide-react';
import { useBooks } from '../contexts/BookContext';
import { useChapters } from '../hooks/useChapters';
import { useProductionTasks } from '../hooks/useProductionTasks';
import { useMarketingItems } from '../hooks/useMarketingItems';
import { progressPercent } from '../lib/progress';

export function Lifecycle() {
  const { activeBook, loading: bookLoading } = useBooks();
  const { chapters } = useChapters(activeBook?.id);
  const { tasks: prodTasks } = useProductionTasks(activeBook?.id);
  const { items: marketItems } = useMarketingItems(activeBook?.id);

  if (bookLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 text-gold animate-spin" /></div>;
  }

  if (!activeBook) {
    return <div className="card-gradient rounded-card border border-line p-16 text-center"><p className="text-muted text-sm">Select a book to view its lifecycle.</p></div>;
  }

  const workingChapters = chapters.filter(c => c.status === 'working').length;
  const completeChapters = chapters.filter(c => c.status === 'complete').length;
  const totalChapters = chapters.length;

  const prodComplete = prodTasks.filter(t => t.status === 'complete').length;
  const marketComplete = marketItems.filter(i => i.status === 'complete').length;

  const phases = [
    {
      name: 'Concept & Ideation',
      status: activeBook.phase === 'Concept' ? 'active' as const : 'complete' as const,
      progress: 100,
      tasks: [{ label: 'Premise defined', done: true }, { label: 'Genre & comps identified', done: true }, { label: 'Logline written', done: true }],
    },
    {
      name: 'Outlining',
      status: activeBook.phase === 'Outline' ? 'active' as const : ['Concept'].includes(activeBook.phase) ? 'upcoming' as const : 'complete' as const,
      progress: totalChapters > 0 ? 100 : 0,
      tasks: [{ label: `${totalChapters} chapters outlined`, done: totalChapters > 0 }, { label: 'Character profiles created', done: true }, { label: 'World-building docs', done: true }],
    },
    {
      name: 'First Draft',
      status: activeBook.phase === 'First Draft' ? 'active' as const : ['Concept', 'Outline'].includes(activeBook.phase) ? 'upcoming' as const : 'complete' as const,
      progress: progressPercent(completeChapters + workingChapters, totalChapters),
      tasks: [{ label: `${completeChapters}/${totalChapters} chapters drafted`, done: completeChapters === totalChapters && totalChapters > 0 }, { label: 'Word count target met', done: activeBook.word_count >= activeBook.target_word_count }],
    },
    {
      name: 'Revision',
      status: activeBook.phase === 'Revision' ? 'active' as const : ['Concept', 'Outline', 'First Draft'].includes(activeBook.phase) ? 'upcoming' as const : 'complete' as const,
      progress: activeBook.phase === 'Revision' ? activeBook.progress : ['Concept', 'Outline', 'First Draft'].includes(activeBook.phase) ? 0 : 100,
      tasks: [{ label: 'Structural edit pass', done: activeBook.progress > 40 }, { label: 'Line edit pass', done: activeBook.progress > 70 }, { label: 'Beta reader feedback', done: activeBook.progress > 85 }],
    },
    {
      name: 'Production',
      status: activeBook.phase === 'Production' ? 'active' as const : ['Concept', 'Outline', 'First Draft', 'Revision'].includes(activeBook.phase) ? 'upcoming' as const : 'complete' as const,
      progress: progressPercent(prodComplete, prodTasks.length),
      tasks: [{ label: `${prodComplete}/${prodTasks.length} production tasks done`, done: prodComplete === prodTasks.length && prodTasks.length > 0 }],
    },
    {
      name: 'Launch & Marketing',
      status: activeBook.phase === 'Marketing' || activeBook.phase === 'Published' ? 'active' as const : 'upcoming' as const,
      progress: progressPercent(marketComplete, marketItems.length),
      tasks: [{ label: `${marketComplete}/${marketItems.length} campaigns done`, done: marketComplete === marketItems.length && marketItems.length > 0 }],
    },
  ];

  return (
    <div className="max-w-5xl space-y-8">
      <div>
        <h2 className="text-xl font-bold text-cream">Book Lifecycle</h2>
        <p className="text-sm text-muted mt-1">{activeBook.title} — {activeBook.phase}</p>
      </div>

      <div className="relative">
        <div className="absolute left-[22px] top-4 bottom-4 w-px bg-line" />
        <div className="space-y-6">
          {phases.map((phase, idx) => (
            <div key={idx} className="relative flex gap-5">
              <div className={`shrink-0 w-11 h-11 rounded-full flex items-center justify-center z-10 ${
                phase.status === 'complete' ? 'bg-accent-green/15 border-2 border-accent-green/40'
                : phase.status === 'active' ? 'bg-gold/15 border-2 border-gold/40'
                : 'bg-bg-2 border-2 border-line'
              }`}>
                {phase.status === 'complete' ? <CheckCircle2 className="w-5 h-5 text-accent-green" />
                : phase.status === 'active' ? <Clock className="w-5 h-5 text-gold" />
                : <Circle className="w-5 h-5 text-muted/40" />}
              </div>

              <div className={`flex-1 card-gradient rounded-card border p-5 ${phase.status === 'active' ? 'border-gold/25' : 'border-line'}`}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className={`font-bold text-sm ${phase.status === 'active' ? 'text-gold' : phase.status === 'complete' ? 'text-accent-green' : 'text-cream/50'}`}>
                    {phase.name}
                  </h3>
                  <span className={`text-xs font-semibold ${phase.status === 'active' ? 'text-gold' : phase.status === 'complete' ? 'text-accent-green' : 'text-muted'}`}>
                    {phase.progress}%
                  </span>
                </div>
                <div className="progress-track mb-4">
                  <div className="progress-bar" style={{ width: `${phase.progress}%`, background: phase.status === 'complete' ? 'linear-gradient(90deg, #3a9e6b, #68d59d)' : undefined }} />
                </div>
                <div className="space-y-2">
                  {phase.tasks.map((task, i) => (
                    <div key={i} className="flex items-center gap-2.5">
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${task.done ? 'border-accent-green/60 bg-accent-green/10' : 'border-line-strong'}`}>
                        {task.done && <CheckCircle2 className="w-3 h-3 text-accent-green" />}
                      </div>
                      <span className={`text-xs ${task.done ? 'text-cream/60 line-through' : 'text-cream/80'}`}>{task.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
