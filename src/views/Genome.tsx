import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useBooks } from '../contexts/BookContext';

type GenomeTab = 'overview' | 'themes' | 'worldbuilding' | 'tone';

export function Genome() {
  const [tab, setTab] = useState<GenomeTab>('overview');
  const { activeBook, loading } = useBooks();

  const tabs: { id: GenomeTab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'themes', label: 'Themes' },
    { id: 'worldbuilding', label: 'World-Building' },
    { id: 'tone', label: 'Tone & Voice' },
  ];

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 text-gold animate-spin" /></div>;
  }

  if (!activeBook) {
    return <div className="card-gradient rounded-card border border-line p-16 text-center"><p className="text-muted text-sm">Select a book to view its genome.</p></div>;
  }

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h2 className="text-xl font-bold text-cream">Book Genome</h2>
        <p className="text-sm text-muted mt-1">{activeBook.title} — DNA of your story</p>
      </div>

      <div className="flex gap-1 bg-bg-2/60 rounded-lg p-1 border border-line w-fit">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-md text-xs font-semibold transition-all ${
              tab === t.id ? 'bg-gold/15 text-gold border border-gold/25' : 'text-muted hover:text-cream border border-transparent'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="grid md:grid-cols-2 gap-5">
          <GenomeCard title="Project Details">
            <div className="space-y-3">
              <DetailRow label="Title" value={activeBook.title} />
              <DetailRow label="Author" value={activeBook.author || 'Not set'} />
              <DetailRow label="Genre" value={activeBook.genre || 'Not set'} />
              <DetailRow label="Phase" value={activeBook.phase} />
              <DetailRow label="Word Count" value={`${activeBook.word_count.toLocaleString()} / ${activeBook.target_word_count.toLocaleString()}`} />
              {activeBook.deadline && <DetailRow label="Deadline" value={activeBook.deadline} />}
            </div>
          </GenomeCard>
          <GenomeCard title="Progress Overview">
            <div className="mb-4">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-muted">Overall Progress</span>
                <span className="text-gold font-semibold">{activeBook.progress}%</span>
              </div>
              <div className="progress-track">
                <div className="progress-bar" style={{ width: `${activeBook.progress}%` }} />
              </div>
            </div>
            <p className="text-xs text-cream/70 leading-relaxed">
              This book is currently in the <span className="text-gold font-semibold">{activeBook.phase}</span> phase.
              {activeBook.word_count > 0 && ` You've written ${activeBook.word_count.toLocaleString()} words so far.`}
            </p>
          </GenomeCard>
          <GenomeCard title="Genre & Style Tags">
            <div className="flex flex-wrap gap-2">
              {(activeBook.genre || 'Untagged').split(',').map((tag) => (
                <span key={tag} className="px-2.5 py-1 rounded-full text-[11px] bg-line/60 border border-line text-cream/70">
                  {tag.trim()}
                </span>
              ))}
            </div>
          </GenomeCard>
          <GenomeCard title="Status Summary">
            <p className="text-sm text-cream/80 leading-relaxed">
              Use the Chapters, Characters, and Editorial views to build out the full genome of your book. This view provides a high-level snapshot.
            </p>
          </GenomeCard>
        </div>
      )}

      {tab === 'themes' && (
        <div className="grid md:grid-cols-2 gap-5">
          <GenomeCard title="Themes">
            <p className="text-sm text-cream/70 leading-relaxed">
              Define your major themes in the Book Genome. These help guide consistency throughout your manuscript and inform marketing positioning.
            </p>
            <div className="mt-4 space-y-3">
              {['Power & Corruption', 'Identity & Legacy', 'Sacrifice & Duty', 'Betrayal & Trust'].map((theme) => (
                <div key={theme} className="flex items-center gap-2 p-2 rounded-lg border border-line bg-bg-2/30">
                  <div className="w-2 h-2 rounded-full bg-gold" />
                  <span className="text-xs text-cream/80">{theme}</span>
                </div>
              ))}
            </div>
          </GenomeCard>
          <GenomeCard title="Thematic Guidance">
            <p className="text-sm text-cream/70 leading-relaxed">
              Strong themes create thematic resonance across your narrative. Track how each theme manifests in your chapters and character arcs.
            </p>
          </GenomeCard>
        </div>
      )}

      {tab === 'worldbuilding' && (
        <div className="grid md:grid-cols-2 gap-5">
          <GenomeCard title="World-Building Notes">
            <p className="text-sm text-cream/70 leading-relaxed">
              Document your world's geography, magic systems, political structures, and cultural elements here. Consistency in world-building is key to reader immersion.
            </p>
          </GenomeCard>
          <GenomeCard title="Key Systems">
            <div className="space-y-2">
              {['Geography', 'Magic System', 'Political Structure', 'Cultural Systems', 'Technology', 'Economy'].map((system) => (
                <div key={system} className="flex items-center gap-2 p-2 rounded-lg border border-line bg-bg-2/30">
                  <div className="w-2 h-2 rounded-full bg-accent-blue" />
                  <span className="text-xs text-cream/80">{system}</span>
                </div>
              ))}
            </div>
          </GenomeCard>
        </div>
      )}

      {tab === 'tone' && (
        <div className="grid md:grid-cols-2 gap-5">
          <GenomeCard title="Narrative Voice">
            <p className="text-sm text-cream/70 leading-relaxed">
              Define your narrative perspective, tense, and stylistic choices. This serves as a reference to maintain consistency throughout drafting and revision.
            </p>
          </GenomeCard>
          <GenomeCard title="Pacing Profile">
            <div className="flex items-end gap-1 h-16 mt-2">
              {[40, 55, 70, 45, 80, 60, 95, 75].map((h, i) => (
                <div key={i} className="flex-1 rounded-sm bg-gold/30" style={{ height: `${h}%` }} />
              ))}
            </div>
            <p className="text-[10px] text-muted mt-2">Pacing visualization based on chapter word densities</p>
          </GenomeCard>
          <GenomeCard title="Emotional Palette">
            <div className="flex flex-wrap gap-2">
              {['Tension', 'Wonder', 'Grief', 'Triumph', 'Dread', 'Tenderness'].map((emotion) => (
                <span key={emotion} className="px-2.5 py-1 rounded-full text-[11px] bg-line/60 border border-line text-cream/70">{emotion}</span>
              ))}
            </div>
          </GenomeCard>
          <GenomeCard title="Style Notes">
            <ul className="space-y-2 text-xs text-cream/70">
              <li className="flex items-start gap-2"><span className="text-gold mt-0.5">-</span> Define your dialogue style preferences</li>
              <li className="flex items-start gap-2"><span className="text-gold mt-0.5">-</span> Note sensory details priorities</li>
              <li className="flex items-start gap-2"><span className="text-gold mt-0.5">-</span> Set metaphor density guidelines</li>
              <li className="flex items-start gap-2"><span className="text-gold mt-0.5">-</span> Document sentence rhythm preferences</li>
            </ul>
          </GenomeCard>
        </div>
      )}
    </div>
  );
}

function GenomeCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card-gradient rounded-card border border-line p-5">
      <h4 className="text-xs font-bold text-gold uppercase tracking-wider mb-3">{title}</h4>
      {children}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-xs text-muted">{label}</span>
      <span className="text-xs text-cream font-medium">{value}</span>
    </div>
  );
}
