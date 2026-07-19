import { useState } from 'react';
import { CheckCircle2, Plus, Trash2, Edit3, Loader2 } from 'lucide-react';
import { useBooks } from '../contexts/BookContext';
import { useChapters } from '../hooks/useChapters';
import { useActivity } from '../hooks/useActivity';
import { useToast } from '../components/Toast';
import { Modal } from '../components/Modal';
import type { DbChapter } from '../hooks/useChapters';

export function Chapters() {
  const { activeBook, updateBook } = useBooks();
  const { chapters, loading, create, update, remove } = useChapters(activeBook?.id);
  const { log } = useActivity();
  const { showToast } = useToast();
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<DbChapter | null>(null);

  const totalWords = chapters.reduce((a, c) => a + c.word_count, 0);
  const targetWords = chapters.reduce((a, c) => a + c.target_word_count, 0);

  // Sync book word count
  const syncBookWordCount = async () => {
    if (activeBook && totalWords !== activeBook.word_count) {
      const progress = activeBook.target_word_count > 0 ? Math.min(100, Math.round((totalWords / activeBook.target_word_count) * 100)) : 0;
      await updateBook(activeBook.id, { word_count: totalWords, progress });
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 text-gold animate-spin" /></div>;
  }

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-cream">Chapters</h2>
          <p className="text-sm text-muted mt-1">
            {totalWords.toLocaleString()} / {targetWords.toLocaleString()} words across {chapters.length} chapters
          </p>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-gold/15 border border-gold/25 text-gold text-sm font-semibold hover:bg-gold/20 transition-all">
          <Plus className="w-4 h-4" /> Add Chapter
        </button>
      </div>

      {chapters.length === 0 ? (
        <div className="card-gradient rounded-card border border-line p-16 text-center">
          <p className="text-muted text-sm">No chapters yet. Start outlining your book.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {chapters.map((ch) => {
            const pct = ch.target_word_count > 0 ? Math.min(100, Math.round((ch.word_count / ch.target_word_count) * 100)) : 0;
            return (
              <div key={ch.id} className="card-gradient rounded-card border border-line p-5 hover:border-gold/20 transition-all group">
                <div className="flex items-start gap-4">
                  <div className={`shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold ${
                    ch.status === 'complete' ? 'bg-accent-green/15 text-accent-green border border-accent-green/25'
                    : ch.status === 'working' ? 'bg-gold/15 text-gold border border-gold/25'
                    : 'bg-bg-2 text-muted border border-line'
                  }`}>
                    {ch.status === 'complete' ? <CheckCircle2 className="w-4 h-4" /> : ch.number}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-sm text-cream group-hover:text-gold transition-colors">
                        Ch {ch.number}: {ch.title}
                      </h3>
                      <span className={`status-badge status-${ch.status}`}>
                        <span className="dot" />
                        {ch.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted">
                      {ch.pov && <span>POV: {ch.pov}</span>}
                      <span>{ch.word_count.toLocaleString()} / {ch.target_word_count.toLocaleString()} words</span>
                      {ch.notes && <span className="text-cream/40">— {ch.notes}</span>}
                    </div>
                    <div className="mt-3 max-w-sm">
                      <div className="progress-track">
                        <div className="progress-bar" style={{ width: `${pct}%`, background: ch.status === 'complete' ? 'linear-gradient(90deg, #3a9e6b, #68d59d)' : undefined }} />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setEditing(ch)} className="p-1.5 rounded hover:bg-line transition-colors">
                      <Edit3 className="w-3.5 h-3.5 text-muted" />
                    </button>
                    <button
                      onClick={async () => { await remove(ch.id); await log('Deleted', `Ch ${ch.number}: ${ch.title}`, 'chapter', ch.id, activeBook?.id); showToast('Chapter deleted'); await syncBookWordCount(); }}
                      className="p-1.5 rounded hover:bg-accent-red/20 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-accent-red" />
                    </button>
                  </div>

                  <span className="text-xs text-muted font-medium shrink-0">{pct}%</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ChapterFormModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        nextNumber={chapters.length > 0 ? Math.max(...chapters.map(c => c.number)) + 1 : 1}
        onSubmit={async (data) => {
          await create(data);
          await log('Created', `Ch ${data.number}: ${data.title}`, 'chapter', undefined, activeBook?.id);
          showToast('Chapter created');
          setShowCreate(false);
          await syncBookWordCount();
        }}
      />

      {editing && (
        <ChapterFormModal
          open={true}
          onClose={() => setEditing(null)}
          initial={editing}
          nextNumber={editing.number}
          onSubmit={async (data) => {
            await update(editing.id, data);
            await log('Updated', `Ch ${data.number || editing.number}: ${data.title || editing.title}`, 'chapter', editing.id, activeBook?.id);
            showToast('Chapter updated');
            setEditing(null);
            await syncBookWordCount();
          }}
        />
      )}
    </div>
  );
}

function ChapterFormModal({ open, onClose, onSubmit, initial, nextNumber }: {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<DbChapter>) => Promise<void>;
  initial?: DbChapter;
  nextNumber: number;
}) {
  const [title, setTitle] = useState(initial?.title || '');
  const [number, setNumber] = useState((initial?.number || nextNumber).toString());
  const [status, setStatus] = useState(initial?.status || 'draft');
  const [wordCount, setWordCount] = useState(initial?.word_count?.toString() || '0');
  const [targetWordCount, setTargetWordCount] = useState(initial?.target_word_count?.toString() || '4000');
  const [pov, setPov] = useState(initial?.pov || '');
  const [notes, setNotes] = useState(initial?.notes || '');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await onSubmit({ title, number: parseInt(number), status, word_count: parseInt(wordCount) || 0, target_word_count: parseInt(targetWordCount) || 4000, pov, notes });
    setSubmitting(false);
  };

  return (
    <Modal open={open} onClose={onClose} title={initial ? 'Edit Chapter' : 'New Chapter'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-muted font-medium mb-1.5 block">Number</label>
            <input type="number" value={number} onChange={e => setNumber(e.target.value)} className="input-base" required />
          </div>
          <div className="col-span-2">
            <label className="text-xs text-muted font-medium mb-1.5 block">Title</label>
            <input value={title} onChange={e => setTitle(e.target.value)} className="input-base" required />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-muted font-medium mb-1.5 block">Status</label>
            <select value={status} onChange={e => setStatus(e.target.value)} className="input-base">
              <option value="draft">Draft</option>
              <option value="working">Working</option>
              <option value="complete">Complete</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-muted font-medium mb-1.5 block">POV Character</label>
            <input value={pov} onChange={e => setPov(e.target.value)} className="input-base" placeholder="e.g. Amara" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-muted font-medium mb-1.5 block">Word Count</label>
            <input type="number" value={wordCount} onChange={e => setWordCount(e.target.value)} className="input-base" />
          </div>
          <div>
            <label className="text-xs text-muted font-medium mb-1.5 block">Target Words</label>
            <input type="number" value={targetWordCount} onChange={e => setTargetWordCount(e.target.value)} className="input-base" />
          </div>
        </div>
        <div>
          <label className="text-xs text-muted font-medium mb-1.5 block">Notes</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} className="input-base min-h-[60px] resize-y" />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-semibold text-muted hover:text-cream rounded-lg border border-line hover:border-line-strong transition-colors">Cancel</button>
          <button type="submit" disabled={submitting || !title} className="px-4 py-2 text-xs font-bold rounded-lg bg-gold/90 text-bg-0 hover:bg-gold transition-colors disabled:opacity-50 flex items-center gap-2">
            {submitting && <Loader2 className="w-3 h-3 animate-spin" />}
            {initial ? 'Save' : 'Create'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
