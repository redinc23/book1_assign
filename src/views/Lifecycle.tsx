import { useState, useEffect } from 'react';
import { CheckCircle2, Circle, Clock, Loader2, ChevronRight, AlertTriangle, Shield, Lock } from 'lucide-react';
import { useBooks } from '../contexts/BookContext';
import { useMilestones } from '../hooks/useMilestones';
import type { Milestone, MilestoneItem } from '../hooks/useMilestones';

export function Lifecycle() {
  const { activeBook, loading: bookLoading, updateBook } = useBooks();
  const { milestones, currentMilestone, loading: msLoading, seedMilestones, toggleItem, advanceMilestone } = useMilestones(activeBook?.id);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [overrideId, setOverrideId] = useState<string | null>(null);
  const [overrideReason, setOverrideReason] = useState('');
  const [toggling, setToggling] = useState<string | null>(null);

  useEffect(() => {
    if (activeBook && milestones.length === 0 && !msLoading) {
      seedMilestones(activeBook.id);
    }
  }, [activeBook, milestones.length, msLoading, seedMilestones]);

  useEffect(() => {
    if (currentMilestone) {
      setExpandedId(currentMilestone.id);
    }
  }, [currentMilestone]);

  if (bookLoading || msLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 text-gold animate-spin" /></div>;
  }

  if (!activeBook) {
    return <div className="card-gradient rounded-card border border-line p-16 text-center"><p className="text-muted text-sm">Select a book to view its lifecycle.</p></div>;
  }

  const handleToggleItem = async (itemId: string, completed: boolean) => {
    setToggling(itemId);
    await toggleItem(itemId, completed);
    setToggling(null);
  };

  const handleAdvance = async (milestoneId: string) => {
    const success = await advanceMilestone(milestoneId);
    if (success && activeBook) {
      const ms = milestones.find(m => m.id === milestoneId);
      const next = milestones.find(m => (m.template?.sort_order ?? 0) === ((ms?.template?.sort_order ?? 0) + 1));
      if (next?.template) {
        await updateBook(activeBook.id, { current_milestone: next.template.code } as any);
      }
    }
  };

  const handleOverride = async (milestoneId: string) => {
    if (!overrideReason.trim()) return;
    await advanceMilestone(milestoneId, overrideReason);
    setOverrideId(null);
    setOverrideReason('');
  };

  const overallProgress = milestones.length > 0
    ? Math.round(milestones.filter(m => m.status === 'completed' || m.status === 'overridden').length / milestones.length * 100)
    : 0;

  return (
    <div className="max-w-5xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-cream">Book Lifecycle</h2>
          <p className="text-sm text-muted mt-1">{activeBook.title} — Milestone-Driven Progress</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wider text-muted">Overall</p>
            <p className="text-lg font-bold text-gold">{overallProgress}%</p>
          </div>
          <div className="w-12 h-12 rounded-full border-2 border-gold/30 flex items-center justify-center">
            <span className="text-xs font-bold text-gold">{currentMilestone?.template?.code || 'M0'}</span>
          </div>
        </div>
      </div>

      <div className="relative">
        <div className="absolute left-[22px] top-4 bottom-4 w-px bg-line" />
        <div className="space-y-4">
          {milestones.map((milestone) => (
            <MilestoneCard
              key={milestone.id}
              milestone={milestone}
              isExpanded={expandedId === milestone.id}
              onToggleExpand={() => setExpandedId(expandedId === milestone.id ? null : milestone.id)}
              onToggleItem={handleToggleItem}
              togglingItem={toggling}
              onAdvance={handleAdvance}
              onOverrideStart={() => setOverrideId(milestone.id)}
              isOverriding={overrideId === milestone.id}
              overrideReason={overrideReason}
              onOverrideReasonChange={setOverrideReason}
              onOverrideConfirm={() => handleOverride(milestone.id)}
              onOverrideCancel={() => { setOverrideId(null); setOverrideReason(''); }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface MilestoneCardProps {
  milestone: Milestone;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onToggleItem: (itemId: string, completed: boolean) => void;
  togglingItem: string | null;
  onAdvance: (id: string) => void;
  onOverrideStart: () => void;
  isOverriding: boolean;
  overrideReason: string;
  onOverrideReasonChange: (v: string) => void;
  onOverrideConfirm: () => void;
  onOverrideCancel: () => void;
}

function MilestoneCard({
  milestone, isExpanded, onToggleExpand, onToggleItem,
  togglingItem, onAdvance, onOverrideStart, isOverriding,
  overrideReason, onOverrideReasonChange, onOverrideConfirm, onOverrideCancel,
}: MilestoneCardProps) {
  const template = milestone.template;
  if (!template) return null;

  const isCompleted = milestone.status === 'completed' || milestone.status === 'overridden';
  const isPending = milestone.status === 'pending';
  const isActive = milestone.status === 'in_progress';
  const items = milestone.items || [];
  const completedItems = items.filter((i) => i.completed).length;
  const totalItems = items.length;
  const canAdvance = milestone.readiness_score >= template.threshold;
  const isHardGate = template.gate_mode === 'hard';

  return (
    <div className="relative flex gap-5">
      <div className={`shrink-0 w-11 h-11 rounded-full flex items-center justify-center z-10 transition-all ${
        isCompleted ? 'bg-accent-green/15 border-2 border-accent-green/40'
        : isActive ? 'bg-gold/15 border-2 border-gold/40 shadow-[0_0_12px_rgba(212,175,55,0.2)]'
        : 'bg-bg-2 border-2 border-line'
      }`}>
        {isCompleted ? <CheckCircle2 className="w-5 h-5 text-accent-green" />
        : isActive ? <Clock className="w-5 h-5 text-gold" />
        : <Circle className="w-5 h-5 text-muted/40" />}
      </div>

      <div className={`flex-1 card-gradient rounded-card border transition-all ${
        isActive ? 'border-gold/25 shadow-[0_0_20px_rgba(212,175,55,0.05)]'
        : isCompleted ? 'border-accent-green/20'
        : 'border-line'
      }`}>
        <button
          onClick={onToggleExpand}
          className="w-full p-5 text-left flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <span className={`text-xs font-bold px-2 py-0.5 rounded ${
              isCompleted ? 'bg-accent-green/10 text-accent-green'
              : isActive ? 'bg-gold/10 text-gold'
              : 'bg-line/60 text-muted'
            }`}>
              {template.code}
            </span>
            <div>
              <h3 className={`font-bold text-sm ${
                isCompleted ? 'text-accent-green' : isActive ? 'text-cream' : 'text-cream/50'
              }`}>
                {template.name}
              </h3>
              {isActive && (
                <p className="text-[11px] text-muted mt-0.5">{template.description}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isHardGate && (
              <Lock className="w-3.5 h-3.5 text-accent-orange" />
            )}
            <div className="flex items-center gap-2">
              <div className="w-20 h-1.5 bg-line rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isCompleted ? 'bg-accent-green' : 'bg-gold'
                  }`}
                  style={{ width: `${milestone.readiness_score}%` }}
                />
              </div>
              <span className={`text-xs font-semibold min-w-[2.5rem] text-right ${
                isCompleted ? 'text-accent-green' : isActive ? 'text-gold' : 'text-muted'
              }`}>
                {milestone.readiness_score}%
              </span>
            </div>
            <ChevronRight className={`w-4 h-4 text-muted transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
          </div>
        </button>

        {isExpanded && (
          <div className="px-5 pb-5 border-t border-line/50 pt-4 space-y-4">
            {items.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] uppercase tracking-wider text-muted font-semibold">Checklist</span>
                  <span className="text-xs text-cream/60">{completedItems}/{totalItems} complete</span>
                </div>
                {items.map((item) => (
                  <ChecklistItem
                    key={item.id}
                    item={item}
                    disabled={isPending || isCompleted}
                    toggling={togglingItem === item.id}
                    onToggle={(completed) => onToggleItem(item.id, completed)}
                  />
                ))}
              </div>
            )}

            {isActive && !isOverriding && (
              <div className="flex items-center gap-3 pt-2 border-t border-line/30">
                <button
                  onClick={() => onAdvance(milestone.id)}
                  disabled={!canAdvance}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    canAdvance
                      ? 'bg-gold/90 text-bg-0 hover:bg-gold'
                      : 'bg-line/40 text-muted cursor-not-allowed'
                  }`}
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                  Advance to Next Milestone
                </button>
                {!canAdvance && !isHardGate && (
                  <button
                    onClick={onOverrideStart}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-accent-orange border border-accent-orange/30 hover:bg-accent-orange/10 transition-all"
                  >
                    <Shield className="w-3 h-3" />
                    Override
                  </button>
                )}
                {!canAdvance && (
                  <span className="text-[11px] text-muted">
                    {isHardGate
                      ? `Hard gate: ${template.threshold}% required`
                      : `${template.threshold}% threshold (overridable)`}
                  </span>
                )}
              </div>
            )}

            {isOverriding && (
              <div className="bg-accent-orange/5 border border-accent-orange/20 rounded-lg p-4 space-y-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-accent-orange shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-cream">Override Milestone Gate</p>
                    <p className="text-[11px] text-muted mt-0.5">This will advance the milestone without meeting the threshold. Provide a reason.</p>
                  </div>
                </div>
                <input
                  type="text"
                  value={overrideReason}
                  onChange={(e) => onOverrideReasonChange(e.target.value)}
                  placeholder="Reason for override..."
                  className="w-full px-3 py-2 rounded-lg bg-bg-2 border border-line text-cream text-xs placeholder:text-muted/60 focus:outline-none focus:border-gold/50"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={onOverrideConfirm}
                    disabled={!overrideReason.trim()}
                    className="px-3 py-1.5 rounded-md text-xs font-bold bg-accent-orange/80 text-white hover:bg-accent-orange disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    Confirm Override
                  </button>
                  <button
                    onClick={onOverrideCancel}
                    className="px-3 py-1.5 rounded-md text-xs text-muted border border-line hover:bg-line/50 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {isCompleted && milestone.status === 'overridden' && milestone.override_reason && (
              <div className="bg-accent-orange/5 border border-accent-orange/20 rounded-lg p-3 flex items-start gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-accent-orange shrink-0 mt-0.5" />
                <p className="text-[11px] text-cream/70">Overridden: {milestone.override_reason}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ChecklistItem({ item, disabled, toggling, onToggle }: {
  item: MilestoneItem;
  disabled: boolean;
  toggling: boolean;
  onToggle: (completed: boolean) => void;
}) {
  const templateItem = item.template_item;

  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${
      item.completed ? 'border-accent-green/15 bg-accent-green/5' : 'border-line/50 hover:border-line'
    }`}>
      <button
        onClick={() => !disabled && onToggle(!item.completed)}
        disabled={disabled || toggling}
        className="mt-0.5 shrink-0"
      >
        {toggling ? (
          <Loader2 className="w-4.5 h-4.5 text-gold animate-spin" />
        ) : item.completed ? (
          <CheckCircle2 className="w-4.5 h-4.5 text-accent-green" />
        ) : (
          <Circle className={`w-4.5 h-4.5 ${disabled ? 'text-muted/30' : 'text-muted/60 hover:text-gold'} transition-colors`} />
        )}
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className={`text-xs leading-relaxed ${item.completed ? 'text-cream/50 line-through' : 'text-cream/90'}`}>
            {templateItem?.label || 'Item'}
          </span>
          {templateItem?.required && !item.completed && (
            <span className="text-[9px] uppercase tracking-wider font-bold text-accent-orange/70 shrink-0">Required</span>
          )}
        </div>
        {templateItem?.description && !item.completed && (
          <p className="text-[11px] text-muted mt-0.5">{templateItem.description}</p>
        )}
      </div>
    </div>
  );
}
