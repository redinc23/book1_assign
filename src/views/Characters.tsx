import { useState } from 'react';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import { useBooks } from '../contexts/BookContext';
import { useCharacters } from '../hooks/useCharacters';
import { useActivity } from '../hooks/useActivity';
import { useToast } from '../components/Toast';
import { Modal } from '../components/Modal';
import type { DbCharacter } from '../hooks/useCharacters';

export function Characters() {
  const { activeBook } = useBooks();
  const { characters, loading, create, update, remove } = useCharacters(activeBook?.id);
  const { log } = useActivity();
  const { showToast } = useToast();
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<DbCharacter | null>(null);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 text-gold animate-spin" /></div>;
  }

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-cream">Characters</h2>
          <p className="text-sm text-muted mt-1">{activeBook?.title || 'No book selected'} — {characters.length} characters</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-gold/15 border border-gold/25 text-gold text-sm font-semibold hover:bg-gold/20 transition-all">
          <Plus className="w-4 h-4" /> Add Character
        </button>
      </div>

      {characters.length === 0 ? (
        <div className="card-gradient rounded-card border border-line p-16 text-center">
          <p className="text-muted text-sm">No characters yet. Add your first character to begin building your cast.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {characters.map((char) => (
            <div key={char.id} className="card-gradient rounded-card border border-line p-5 hover:border-gold/25 transition-all cursor-pointer group" onClick={() => setEditing(char)}>
              <div className="flex items-start gap-4">
                {char.image_url ? (
                  <img src={char.image_url} alt={char.name} className="w-14 h-14 rounded-full object-cover border-2 border-line group-hover:border-gold/30 transition-colors" />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-bg-2 border-2 border-line flex items-center justify-center text-lg font-bold text-muted group-hover:border-gold/30 transition-colors">
                    {char.name.charAt(0)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-cream text-sm group-hover:text-gold transition-colors">{char.name}</h3>
                  <p className="text-xs text-muted mt-0.5">{char.role || 'No role'}</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); remove(char.id); log('Deleted', char.name, 'character', char.id, activeBook?.id); showToast('Character deleted'); }}
                  className="p-1.5 rounded hover:bg-accent-red/20 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-3.5 h-3.5 text-accent-red" />
                </button>
              </div>
              <div className="mt-4 space-y-2.5">
                {char.archetype && <Row label="Archetype" value={char.archetype} />}
                {char.arc && <Row label="Arc" value={char.arc} />}
                {char.connections > 0 && <Row label="Connections" value={`${char.connections} characters`} />}
              </div>
            </div>
          ))}
        </div>
      )}

      <CharacterFormModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onSubmit={async (data) => {
          await create(data);
          await log('Created', data.name || 'character', 'character', undefined, activeBook?.id);
          showToast('Character created');
          setShowCreate(false);
        }}
      />

      {editing && (
        <CharacterFormModal
          open={true}
          onClose={() => setEditing(null)}
          initial={editing}
          onSubmit={async (data) => {
            await update(editing.id, data);
            await log('Updated', data.name || editing.name, 'character', editing.id, activeBook?.id);
            showToast('Character updated');
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-[10px] text-muted uppercase tracking-wider">{label}</span>
      <span className="text-xs text-cream/80 font-medium">{value}</span>
    </div>
  );
}

function CharacterFormModal({ open, onClose, onSubmit, initial }: {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<DbCharacter>) => Promise<void>;
  initial?: DbCharacter;
}) {
  const [name, setName] = useState(initial?.name || '');
  const [role, setRole] = useState(initial?.role || '');
  const [archetype, setArchetype] = useState(initial?.archetype || '');
  const [arc, setArc] = useState(initial?.arc || '');
  const [connections, setConnections] = useState(initial?.connections?.toString() || '0');
  const [imageUrl, setImageUrl] = useState(initial?.image_url || '');
  const [notes, setNotes] = useState(initial?.notes || '');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await onSubmit({ name, role, archetype, arc, connections: parseInt(connections) || 0, image_url: imageUrl, notes });
    setSubmitting(false);
  };

  return (
    <Modal open={open} onClose={onClose} title={initial ? 'Edit Character' : 'New Character'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Fld label="Name" value={name} onChange={setName} required />
        <div className="grid grid-cols-2 gap-4">
          <Fld label="Role" value={role} onChange={setRole} placeholder="e.g. Protagonist" />
          <Fld label="Archetype" value={archetype} onChange={setArchetype} placeholder="e.g. The Sage" />
        </div>
        <Fld label="Character Arc" value={arc} onChange={setArc} placeholder="e.g. Redemption" />
        <div className="grid grid-cols-2 gap-4">
          <Fld label="Connections" value={connections} onChange={setConnections} type="number" />
          <Fld label="Image URL" value={imageUrl} onChange={setImageUrl} placeholder="https://..." />
        </div>
        <div>
          <label className="text-xs text-muted font-medium mb-1.5 block">Notes</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} className="input-base min-h-[80px] resize-y" />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-semibold text-muted hover:text-cream rounded-lg border border-line hover:border-line-strong transition-colors">Cancel</button>
          <button type="submit" disabled={submitting || !name} className="px-4 py-2 text-xs font-bold rounded-lg bg-gold/90 text-bg-0 hover:bg-gold transition-colors disabled:opacity-50 flex items-center gap-2">
            {submitting && <Loader2 className="w-3 h-3 animate-spin" />}
            {initial ? 'Save' : 'Create'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function Fld({ label, value, onChange, placeholder, type, required }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; required?: boolean;
}) {
  return (
    <div>
      <label className="text-xs text-muted font-medium mb-1.5 block">{label}</label>
      <input type={type || 'text'} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="input-base" required={required} />
    </div>
  );
}
