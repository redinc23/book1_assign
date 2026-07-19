import { useState } from 'react';
import { Plus, Trash2, Edit3, Loader2 } from 'lucide-react';
import { useBooks } from '../contexts/BookContext';
import { useActivity } from '../hooks/useActivity';
import { useToast } from '../components/Toast';
import { Modal } from '../components/Modal';

export function Library() {
  const { books, loading, createBook, updateBook, deleteBook } = useBooks();
  const { log } = useActivity();
  const { showToast } = useToast();
  const [showCreate, setShowCreate] = useState(false);
  const [editingBook, setEditingBook] = useState<string | null>(null);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 text-gold animate-spin" /></div>;
  }

  return (
    <div className="max-w-7xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-cream">Your Library</h2>
          <p className="text-sm text-muted mt-1">{books.length} projects</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-gold/15 border border-gold/25 text-gold text-sm font-semibold hover:bg-gold/20 transition-all"
        >
          <Plus className="w-4 h-4" /> New Book
        </button>
      </div>

      {books.length === 0 ? (
        <div className="card-gradient rounded-card border border-line p-16 text-center">
          <p className="text-muted text-sm">No books yet. Create your first project to begin.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {books.map((book) => (
            <div key={book.id} className="card-gradient rounded-card border border-line overflow-hidden hover:border-gold/25 transition-all group">
              <div className="relative h-48 overflow-hidden bg-bg-2">
                {book.cover_url ? (
                  <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted/30 text-3xl font-serif">{book.title.charAt(0)}</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-bg-0/90 via-bg-0/30 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                  <span className={`status-badge status-${book.status === 'complete' || book.status === 'published' ? 'complete' : book.status === 'working' || book.status === 'in-progress' ? 'working' : 'draft'}`}>
                    <span className="dot" />
                    {book.phase}
                  </span>
                  <div className="flex gap-1">
                    <button onClick={() => setEditingBook(book.id)} className="p-1.5 rounded bg-bg-0/70 hover:bg-bg-0 transition-colors">
                      <Edit3 className="w-3 h-3 text-cream" />
                    </button>
                    <button
                      onClick={async () => {
                        await deleteBook(book.id);
                        await log('Deleted', book.title, 'book');
                        showToast('Book deleted');
                      }}
                      className="p-1.5 rounded bg-bg-0/70 hover:bg-accent-red/30 transition-colors"
                    >
                      <Trash2 className="w-3 h-3 text-cream" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-serif font-bold text-cream text-base group-hover:text-gold transition-colors">{book.title}</h3>
                <p className="text-xs text-muted mt-1">{book.genre || 'No genre'}</p>
                <div className="mt-3">
                  <div className="flex justify-between text-[10px] mb-1">
                    <span className="text-muted">{book.word_count.toLocaleString()} / {book.target_word_count.toLocaleString()}</span>
                    <span className="text-gold font-semibold">{book.progress}%</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-bar" style={{ width: `${book.progress}%` }} />
                  </div>
                </div>
                {book.deadline && (
                  <div className="mt-3">
                    <span className="text-[10px] text-muted">Deadline: {book.deadline}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <BookFormModal
          open={true}
          onClose={() => setShowCreate(false)}
          onSubmit={async (data) => {
            const created = await createBook(data);
            if (created) {
              await log('Created', data.title || 'Untitled', 'book', created.id);
              showToast('Book created');
            }
            setShowCreate(false);
          }}
        />
      )}

      {editingBook && (
        <BookFormModal
          open={true}
          onClose={() => setEditingBook(null)}
          initial={books.find(b => b.id === editingBook)}
          onSubmit={async (data) => {
            await updateBook(editingBook, data);
            await log('Updated', data.title || 'book', 'book', editingBook);
            showToast('Book updated');
            setEditingBook(null);
          }}
        />
      )}
    </div>
  );
}

interface BookFormData {
  title?: string;
  author?: string;
  genre?: string;
  cover_url?: string;
  target_word_count?: number;
  deadline?: string | null;
  phase?: string;
  status?: string;
}

function BookFormModal({ open, onClose, onSubmit, initial }: {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: BookFormData) => Promise<void>;
  initial?: BookFormData;
}) {
  const [title, setTitle] = useState(initial?.title || '');
  const [author, setAuthor] = useState(initial?.author || '');
  const [genre, setGenre] = useState(initial?.genre || '');
  const [coverUrl, setCoverUrl] = useState(initial?.cover_url || '');
  const [target, setTarget] = useState(initial?.target_word_count?.toString() || '80000');
  const [deadline, setDeadline] = useState(initial?.deadline || '');
  const [phase, setPhase] = useState(initial?.phase || 'Concept');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await onSubmit({ title, author, genre, cover_url: coverUrl, target_word_count: parseInt(target) || 80000, deadline: deadline || null, phase });
    setSubmitting(false);
  };

  return (
    <Modal open={open} onClose={onClose} title={initial ? 'Edit Book' : 'New Book'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Title" value={title} onChange={setTitle} required />
        <Field label="Author" value={author} onChange={setAuthor} />
        <Field label="Genre" value={genre} onChange={setGenre} placeholder="e.g. Epic Fantasy" />
        <Field label="Cover Image URL" value={coverUrl} onChange={setCoverUrl} placeholder="https://..." />
        <div className="grid grid-cols-2 gap-4">
          <Field label="Target Word Count" value={target} onChange={setTarget} type="number" />
          <Field label="Deadline" value={deadline} onChange={setDeadline} type="date" />
        </div>
        <div>
          <label className="text-xs text-muted font-medium mb-1.5 block">Phase</label>
          <select value={phase} onChange={e => setPhase(e.target.value)} className="input-base">
            {['Concept', 'Outline', 'First Draft', 'Revision', 'Production', 'Marketing', 'Published'].map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-semibold text-muted hover:text-cream rounded-lg border border-line hover:border-line-strong transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={submitting || !title} className="px-4 py-2 text-xs font-bold rounded-lg bg-gold/90 text-bg-0 hover:bg-gold transition-colors disabled:opacity-50 flex items-center gap-2">
            {submitting && <Loader2 className="w-3 h-3 animate-spin" />}
            {initial ? 'Save Changes' : 'Create Book'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function Field({ label, value, onChange, placeholder, type, required }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; required?: boolean;
}) {
  return (
    <div>
      <label className="text-xs text-muted font-medium mb-1.5 block">{label}</label>
      <input
        type={type || 'text'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="input-base"
        required={required}
      />
    </div>
  );
}
