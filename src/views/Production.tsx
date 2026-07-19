import { useState } from 'react';
import { CheckCircle2, Clock, CalendarDays, Plus, Trash2, Edit3, Loader2 } from 'lucide-react';
import { useBooks } from '../contexts/BookContext';
import { useProductionTasks } from '../hooks/useProductionTasks';
import { useActivity } from '../hooks/useActivity';
import { useToast } from '../components/Toast';
import { Modal } from '../components/Modal';
import type { DbProductionTask } from '../hooks/useProductionTasks';

export function Production() {
  const { activeBook } = useBooks();
  const { tasks, loading, create, update, remove } = useProductionTasks(activeBook?.id);
  const { log } = useActivity();
  const { showToast } = useToast();
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<DbProductionTask | null>(null);

  const completedCount = tasks.filter(t => t.status === 'complete').length;

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 text-gold animate-spin" /></div>;
  }

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-cream">Production Pipeline</h2>
          <p className="text-sm text-muted mt-1">{completedCount}/{tasks.length} tasks complete</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-gold/15 border border-gold/25 text-gold text-sm font-semibold hover:bg-gold/20 transition-all">
          <Plus className="w-4 h-4" /> Add Task
        </button>
      </div>

      {tasks.length > 0 && (
        <div className="card-gradient rounded-card border border-line p-5">
          <div className="flex justify-between text-xs mb-2">
            <span className="text-muted">Overall Progress</span>
            <span className="text-gold font-semibold">{tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0}%</span>
          </div>
          <div className="progress-track">
            <div className="progress-bar" style={{ width: `${tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0}%` }} />
          </div>
        </div>
      )}

      {tasks.length === 0 ? (
        <div className="card-gradient rounded-card border border-line p-16 text-center">
          <p className="text-muted text-sm">No production tasks yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <div key={task.id} className="card-gradient rounded-card border border-line p-5 hover:border-gold/20 transition-all group">
              <div className="flex items-center gap-4">
                <button
                  onClick={async () => {
                    const newStatus = task.status === 'complete' ? 'planned' : 'complete';
                    const ok = await update(task.id, { status: newStatus });
                    if (ok) {
                      await log(newStatus === 'complete' ? 'Completed' : 'Reopened', task.task, 'production_task', task.id, activeBook?.id);
                      showToast(newStatus === 'complete' ? 'Task completed' : 'Task reopened');
                    } else {
                      showToast('Failed to update task. Please try again.');
                    }
                  }}
                  className={`shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                    task.status === 'complete' ? 'bg-accent-green/15 border border-accent-green/25' : task.status === 'in-progress' ? 'bg-gold/15 border border-gold/25' : 'bg-bg-2 border border-line hover:border-gold/30'
                  }`}
                >
                  {task.status === 'complete' ? <CheckCircle2 className="w-4 h-4 text-accent-green" /> : <Clock className="w-4 h-4 text-muted" />}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <h3 className={`text-sm font-semibold ${task.status === 'complete' ? 'text-cream/50 line-through' : 'text-cream'}`}>{task.task}</h3>
                    <span className={`status-badge status-${task.status === 'in-progress' ? 'working' : task.status === 'complete' ? 'complete' : 'planned'}`}>
                      <span className="dot" />{task.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-xs text-muted">
                    {task.category && <span>{task.category}</span>}
                    {task.assignee && <span>{task.assignee}</span>}
                  </div>
                </div>

                {task.due && (
                  <div className="flex items-center gap-1.5 text-xs text-muted shrink-0">
                    <CalendarDays className="w-3.5 h-3.5" /><span>{task.due}</span>
                  </div>
                )}

                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setEditing(task)} className="p-1.5 rounded hover:bg-line"><Edit3 className="w-3.5 h-3.5 text-muted" /></button>
                  <button onClick={async () => { const ok = await remove(task.id); if (ok) { await log('Deleted', task.task, 'production_task', task.id, activeBook?.id); showToast('Task deleted'); } else { showToast('Failed to delete task. Please try again.'); } }} className="p-1.5 rounded hover:bg-accent-red/20"><Trash2 className="w-3.5 h-3.5 text-accent-red" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ProductionFormModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onSubmit={async (data) => {
          const ok = await create(data);
          if (ok) {
            await log('Created', data.task || 'task', 'production_task', undefined, activeBook?.id);
            showToast('Task created');
            setShowCreate(false);
          } else {
            showToast('Failed to create task. Please try again.');
          }
        }}
      />

      {editing && (
        <ProductionFormModal
          open={true}
          onClose={() => setEditing(null)}
          initial={editing}
          onSubmit={async (data) => {
            const ok = await update(editing.id, data);
            if (ok) {
              await log('Updated', data.task || editing.task, 'production_task', editing.id, activeBook?.id);
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

function ProductionFormModal({ open, onClose, onSubmit, initial }: {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<DbProductionTask>) => Promise<void>;
  initial?: DbProductionTask;
}) {
  const [task, setTask] = useState(initial?.task || '');
  const [status, setStatus] = useState(initial?.status || 'planned');
  const [due, setDue] = useState(initial?.due || '');
  const [assignee, setAssignee] = useState(initial?.assignee || '');
  const [category, setCategory] = useState(initial?.category || '');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await onSubmit({ task, status, due: due || null, assignee, category });
    setSubmitting(false);
  };

  return (
    <Modal open={open} onClose={onClose} title={initial ? 'Edit Task' : 'New Production Task'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs text-muted font-medium mb-1.5 block">Task</label>
          <input value={task} onChange={e => setTask(e.target.value)} className="input-base" required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-muted font-medium mb-1.5 block">Status</label>
            <select value={status} onChange={e => setStatus(e.target.value)} className="input-base">
              <option value="planned">Planned</option>
              <option value="in-progress">In Progress</option>
              <option value="complete">Complete</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-muted font-medium mb-1.5 block">Due Date</label>
            <input type="date" value={due} onChange={e => setDue(e.target.value)} className="input-base" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-muted font-medium mb-1.5 block">Assignee</label>
            <input value={assignee} onChange={e => setAssignee(e.target.value)} className="input-base" />
          </div>
          <div>
            <label className="text-xs text-muted font-medium mb-1.5 block">Category</label>
            <input value={category} onChange={e => setCategory(e.target.value)} className="input-base" placeholder="e.g. Layout, Cover, Audio" />
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-semibold text-muted hover:text-cream rounded-lg border border-line hover:border-line-strong transition-colors">Cancel</button>
          <button type="submit" disabled={submitting || !task} className="px-4 py-2 text-xs font-bold rounded-lg bg-gold/90 text-bg-0 hover:bg-gold transition-colors disabled:opacity-50 flex items-center gap-2">
            {submitting && <Loader2 className="w-3 h-3 animate-spin" />}
            {initial ? 'Save' : 'Create'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
