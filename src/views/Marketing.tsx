import { useState } from 'react';
import { TrendingUp, CalendarDays, Plus, Trash2, Edit3, Loader2 } from 'lucide-react';
import { useBooks } from '../contexts/BookContext';
import { useMarketingItems } from '../hooks/useMarketingItems';
import { useActivity } from '../hooks/useActivity';
import { useToast } from '../components/Toast';
import { Modal } from '../components/Modal';
import type { DbMarketingItem } from '../hooks/useMarketingItems';

export function Marketing() {
  const { activeBook } = useBooks();
  const { items, loading, create, update, remove } = useMarketingItems(activeBook?.id);
  const { log } = useActivity();
  const { showToast } = useToast();
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<DbMarketingItem | null>(null);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 text-gold animate-spin" /></div>;
  }

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-cream">Marketing & Launch</h2>
          <p className="text-sm text-muted mt-1">Campaign tracker{activeBook ? ` for ${activeBook.title}` : ''}</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-gold/15 border border-gold/25 text-gold text-sm font-semibold hover:bg-gold/20 transition-all">
          <Plus className="w-4 h-4" /> New Campaign
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Campaigns', value: items.length.toString() },
          { label: 'Active', value: items.filter(i => i.status === 'in-progress').length.toString() },
          { label: 'Completed', value: items.filter(i => i.status === 'complete').length.toString() },
          { label: 'Planned', value: items.filter(i => i.status === 'planned' || i.status === 'draft').length.toString() },
        ].map((stat) => (
          <div key={stat.label} className="card-gradient rounded-card border border-line p-4">
            <span className="text-[10px] text-muted uppercase tracking-wider">{stat.label}</span>
            <p className="text-2xl font-bold text-cream mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {items.length === 0 ? (
        <div className="card-gradient rounded-card border border-line p-16 text-center">
          <p className="text-muted text-sm">No marketing campaigns yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="card-gradient rounded-card border border-line p-5 hover:border-gold/20 transition-all group">
              <div className="flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-sm font-semibold text-cream">{item.title}</h3>
                    <span className={`status-badge status-${item.status === 'in-progress' ? 'working' : item.status === 'complete' ? 'complete' : item.status === 'draft' ? 'draft' : 'planned'}`}>
                      <span className="dot" />{item.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted">
                    {item.channel && <span>{item.channel}</span>}
                    {item.reach && <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" />{item.reach}</span>}
                  </div>
                </div>
                {item.date && (
                  <div className="flex items-center gap-1.5 text-xs text-muted shrink-0">
                    <CalendarDays className="w-3.5 h-3.5" /><span>{item.date}</span>
                  </div>
                )}
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setEditing(item)} className="p-1.5 rounded hover:bg-line"><Edit3 className="w-3.5 h-3.5 text-muted" /></button>
                  <button onClick={async () => { const ok = await remove(item.id); if (ok) { await log('Deleted', item.title, 'marketing_item', item.id, activeBook?.id); showToast('Campaign deleted'); } else { showToast('Failed to delete campaign. Please try again.'); } }} className="p-1.5 rounded hover:bg-accent-red/20"><Trash2 className="w-3.5 h-3.5 text-accent-red" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <MarketingFormModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onSubmit={async (data) => {
          const ok = await create(data);
          if (ok) {
            await log('Created', data.title || 'campaign', 'marketing_item', undefined, activeBook?.id);
            showToast('Campaign created');
            setShowCreate(false);
          } else {
            showToast('Failed to create campaign. Please try again.');
          }
        }}
      />

      {editing && (
        <MarketingFormModal
          open={true}
          onClose={() => setEditing(null)}
          initial={editing}
          onSubmit={async (data) => {
            const ok = await update(editing.id, data);
            if (ok) {
              await log('Updated', data.title || editing.title, 'marketing_item', editing.id, activeBook?.id);
              showToast('Campaign updated');
              setEditing(null);
            } else {
              showToast('Failed to update campaign. Please try again.');
            }
          }}
        />
      )}
    </div>
  );
}

function MarketingFormModal({ open, onClose, onSubmit, initial }: {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<DbMarketingItem>) => Promise<void>;
  initial?: DbMarketingItem;
}) {
  const [title, setTitle] = useState(initial?.title || '');
  const [channel, setChannel] = useState(initial?.channel || '');
  const [status, setStatus] = useState(initial?.status || 'planned');
  const [reach, setReach] = useState(initial?.reach || '');
  const [date, setDate] = useState(initial?.date || '');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await onSubmit({ title, channel, status, reach, date: date || null });
    setSubmitting(false);
  };

  return (
    <Modal open={open} onClose={onClose} title={initial ? 'Edit Campaign' : 'New Campaign'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs text-muted font-medium mb-1.5 block">Campaign Title</label>
          <input value={title} onChange={e => setTitle(e.target.value)} className="input-base" required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-muted font-medium mb-1.5 block">Channel</label>
            <input value={channel} onChange={e => setChannel(e.target.value)} className="input-base" placeholder="e.g. Instagram, Email" />
          </div>
          <div>
            <label className="text-xs text-muted font-medium mb-1.5 block">Status</label>
            <select value={status} onChange={e => setStatus(e.target.value)} className="input-base">
              <option value="planned">Planned</option>
              <option value="draft">Draft</option>
              <option value="in-progress">In Progress</option>
              <option value="complete">Complete</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-muted font-medium mb-1.5 block">Reach / Target</label>
            <input value={reach} onChange={e => setReach(e.target.value)} className="input-base" placeholder="e.g. 12K impressions" />
          </div>
          <div>
            <label className="text-xs text-muted font-medium mb-1.5 block">Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="input-base" />
          </div>
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
