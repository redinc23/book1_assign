import { useState } from 'react';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import { useBooks } from '../contexts/BookContext';
import { useEditorialTasks } from '../hooks/useEditorialTasks';
import { useActivity } from '../hooks/useActivity';
import { useToast } from '../components/Toast';
import { Modal } from '../components/Modal';
import type { DbEditorialTask } from '../hooks/useEditorialTasks';

const columns: { id: string; label: string }[] = [
  { id: 'backlog', label: 'Backlog' },
  { id: 'in-progress', label: 'In Progress' },
  { id: 'review', label: 'Review' },
  { id: 'resolved', label: 'Resolved' },
];

export function Editorial() {
  const { activeBook } = useBooks();
  const { tasks, loading, create, update, remove } = useEditorialTasks(activeBook?.id);
  const { log } = useActivity();
  const { showToast } = useToast();
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<DbEditorialTask | null>(null);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 text-gold animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-cream">Editorial Board</h2>
          <p className="text-sm text-muted mt-1">Track issues, revisions, and editorial feedback</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-gold/15 border border-gold/25 text-gold text-sm font-semibold hover:bg-gold/20 transition-all">
          <Plus className="w-4 h-4" /> New Task
        </button>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4 min-h-[500px]">
        {columns.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.id);
          return (
            <div key={col.id} className="flex flex-col">
              <div className="flex items-center gap-2 mb-3 px-1">
                <h3 className="text-xs font-bold text-cream uppercase tracking-wider">{col.label}</h3>
                <span className="text-[10px] text-muted bg-line/60 rounded-full px-2 py-0.5">{colTasks.length}</span>
              </div>
              <div
                className="flex-1 space-y-3 p-3 rounded-card bg-bg-2/40 border border-line/50"
                onDragOver={(e) => e.preventDefault()}
                onDrop={async (e) => {
                  const taskId = e.dataTransfer.getData('taskId');
                  if (taskId) {
                    const task = tasks.find(t => t.id === taskId);
                    const ok = await update(taskId, { status: col.id });
                    if (ok) {
                      if (task) {
                        await log('Updated status', `${task.title} -> ${col.label}`, 'editorial_task', taskId, activeBook?.id);
                      }
                      showToast(`Moved to ${col.label}`);
                    } else {
                      showToast('Failed to move task. Please try again.');
                    }
                  }
                }}
              >
                {colTasks.map((task) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData('taskId', task.id)}
                    onClick={() => setEditing(task)}
                    className="card-gradient rounded-lg border border-line p-4 hover:border-gold/20 transition-all cursor-pointer group"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold severity-${task.severity}`}>
                        {task.severity}
                      </span>
                      <span className="text-[10px] text-muted">{task.chapter}</span>
                    </div>
                    <h4 className="text-xs font-semibold text-cream/90 mb-2 leading-relaxed">{task.title}</h4>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-muted">{task.type}</span>
                      <div className="flex items-center gap-2">
                        {task.assignee && (
                          <div className="w-5 h-5 rounded-full bg-line border border-line-strong flex items-center justify-center text-[8px] text-muted font-bold">
                            {task.assignee.charAt(0)}
                          </div>
                        )}
                        <button
                          onClick={async (e) => { e.stopPropagation(); const ok = await remove(task.id); if (ok) { await log('Deleted', task.title, 'editorial_task', task.id, activeBook?.id); showToast('Task deleted'); } else { showToast('Failed to delete task. Please try again.'); } }}
                          className="p-1 rounded hover:bg-accent-red/20 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-3 h-3 text-accent-red" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {colTasks.length === 0 && (
                  <div className="flex items-center justify-center h-24 text-xs text-muted/50">
                    Drop items here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <EditorialFormModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onSubmit={async (data) => {
          const ok = await create(data);
          if (ok) {
            await log('Created', data.title || 'task', 'editorial_task', undefined, activeBook?.id);
            showToast('Task created');
            setShowCreate(false);
          } else {
            showToast('Failed to create task. Please try again.');
          }
        }}
      />

      {editing && (
        <EditorialFormModal
          open={true}
          onClose={() => setEditing(null)}
          initial={editing}
          onSubmit={async (data) => {
            const ok = await update(editing.id, data);
            if (ok) {
              await log('Updated', data.title || editing.title, 'editorial_task', editing.id, activeBook?.id);
              showToast('Task updated');
              setEditing(null);
            } else {
              showToast('Failed to update task. Please try again.');
            }
          }}
        />
      )}
    </div>
  );
}

function EditorialFormModal({ open, onClose, onSubmit, initial }: {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<DbEditorialTask>) => Promise<void>;
  initial?: DbEditorialTask;
}) {
  const [title, setTitle] = useState(initial?.title || '');
  const [chapter, setChapter] = useState(initial?.chapter || '');
  const [assignee, setAssignee] = useState(initial?.assignee || '');
  const [severity, setSeverity] = useState(initial?.severity || 'medium');
  const [status, setStatus] = useState(initial?.status || 'backlog');
  const [type, setType] = useState(initial?.type || '');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await onSubmit({ title, chapter, assignee, severity, status, type });
    setSubmitting(false);
  };

  return (
    <Modal open={open} onClose={onClose} title={initial ? 'Edit Task' : 'New Editorial Task'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs text-muted font-medium mb-1.5 block">Title</label>
          <input value={title} onChange={e => setTitle(e.target.value)} className="input-base" required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-muted font-medium mb-1.5 block">Chapter</label>
            <input value={chapter} onChange={e => setChapter(e.target.value)} className="input-base" placeholder="e.g. Ch 4" />
          </div>
          <div>
            <label className="text-xs text-muted font-medium mb-1.5 block">Assignee</label>
            <input value={assignee} onChange={e => setAssignee(e.target.value)} className="input-base" placeholder="e.g. Editor A" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-muted font-medium mb-1.5 block">Severity</label>
            <select value={severity} onChange={e => setSeverity(e.target.value)} className="input-base">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-muted font-medium mb-1.5 block">Status</label>
            <select value={status} onChange={e => setStatus(e.target.value)} className="input-base">
              <option value="backlog">Backlog</option>
              <option value="in-progress">In Progress</option>
              <option value="review">Review</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-muted font-medium mb-1.5 block">Type</label>
            <input value={type} onChange={e => setType(e.target.value)} className="input-base" placeholder="e.g. Structural" />
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
