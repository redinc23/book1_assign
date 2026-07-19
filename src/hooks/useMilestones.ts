import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface MilestoneTemplate {
  id: string;
  code: string;
  name: string;
  description: string;
  gate_mode: 'soft' | 'hard';
  threshold: number;
  sort_order: number;
}

export interface MilestoneTemplateItem {
  id: string;
  template_id: string;
  label: string;
  description: string;
  required: boolean;
  sort_order: number;
}

export interface Milestone {
  id: string;
  book_id: string;
  template_id: string;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked' | 'overridden';
  readiness_score: number;
  started_at: string | null;
  completed_at: string | null;
  override_reason: string | null;
  created_at: string;
  template?: MilestoneTemplate;
  items?: MilestoneItem[];
}

export interface MilestoneItem {
  id: string;
  milestone_id: string;
  template_item_id: string;
  completed: boolean;
  completed_at: string | null;
  notes: string;
  created_at: string;
  template_item?: MilestoneTemplateItem;
}

export function useMilestones(bookId: string | undefined) {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [templates, setTemplates] = useState<MilestoneTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!bookId) { setMilestones([]); setLoading(false); return; }

    const [templatesRes, milestonesRes] = await Promise.all([
      supabase.from('milestone_templates').select('*').order('sort_order'),
      supabase.from('milestones').select('*, milestone_items(*)').eq('book_id', bookId),
    ]);

    if (templatesRes.data) setTemplates(templatesRes.data);

    if (milestonesRes.data && templatesRes.data) {
      const templateItemsRes = await supabase
        .from('milestone_template_items')
        .select('*')
        .order('sort_order');

      const templateItems = templateItemsRes.data || [];

      const enriched = milestonesRes.data.map((m) => {
        const template = templatesRes.data.find((t) => t.id === m.template_id);
        const items = (m.milestone_items || []).map((item: MilestoneItem) => ({
          ...item,
          template_item: templateItems.find((ti) => ti.id === item.template_item_id),
        }));
        items.sort((a: MilestoneItem, b: MilestoneItem) =>
          (a.template_item?.sort_order ?? 0) - (b.template_item?.sort_order ?? 0)
        );
        return { ...m, template, items };
      });

      enriched.sort((a, b) => (a.template?.sort_order ?? 0) - (b.template?.sort_order ?? 0));
      setMilestones(enriched);
    }

    setLoading(false);
  }, [bookId]);

  useEffect(() => { refresh(); }, [refresh]);

  const seedMilestones = useCallback(async (targetBookId: string) => {
    const { data: existingMilestones } = await supabase
      .from('milestones')
      .select('id')
      .eq('book_id', targetBookId);

    if (existingMilestones && existingMilestones.length > 0) return;

    const { data: allTemplates } = await supabase
      .from('milestone_templates')
      .select('*, milestone_template_items(*)')
      .order('sort_order');

    if (!allTemplates) return;

    for (const template of allTemplates) {
      const { data: milestone } = await supabase
        .from('milestones')
        .insert({
          book_id: targetBookId,
          template_id: template.id,
          status: template.sort_order === 0 ? 'in_progress' : 'pending',
          readiness_score: 0,
          started_at: template.sort_order === 0 ? new Date().toISOString() : null,
        })
        .select()
        .single();

      if (!milestone) continue;

      const items = (template.milestone_template_items || []).map((ti: MilestoneTemplateItem) => ({
        milestone_id: milestone.id,
        template_item_id: ti.id,
        completed: false,
      }));

      if (items.length > 0) {
        await supabase.from('milestone_items').insert(items);
      }
    }

    await refresh();
  }, [refresh]);

  const toggleItem = useCallback(async (itemId: string, completed: boolean) => {
    const { error } = await supabase
      .from('milestone_items')
      .update({
        completed,
        completed_at: completed ? new Date().toISOString() : null,
      })
      .eq('id', itemId);

    if (error) return false;
    await recomputeReadiness();
    await refresh();
    return true;
  }, [refresh]);

  const recomputeReadiness = useCallback(async () => {
    if (!bookId) return;

    const { data: allMilestones } = await supabase
      .from('milestones')
      .select('*, milestone_items(*)')
      .eq('book_id', bookId);

    if (!allMilestones) return;

    for (const m of allMilestones) {
      const items = m.milestone_items || [];
      if (items.length === 0) continue;

      const completedCount = items.filter((i: MilestoneItem) => i.completed).length;
      const score = Math.round((completedCount / items.length) * 100);

      await supabase
        .from('milestones')
        .update({ readiness_score: score })
        .eq('id', m.id);
    }
  }, [bookId]);

  const advanceMilestone = useCallback(async (milestoneId: string, overrideReason?: string) => {
    if (!bookId) return false;

    const milestone = milestones.find((m) => m.id === milestoneId);
    if (!milestone || !milestone.template) return false;

    const status = overrideReason ? 'overridden' : 'completed';

    const { error: updateError } = await supabase
      .from('milestones')
      .update({
        status,
        completed_at: new Date().toISOString(),
        override_reason: overrideReason || null,
      })
      .eq('id', milestoneId);

    if (updateError) return false;

    const nextMilestone = milestones.find(
      (m) => (m.template?.sort_order ?? 0) === (milestone.template!.sort_order + 1)
    );

    if (nextMilestone) {
      await supabase
        .from('milestones')
        .update({ status: 'in_progress', started_at: new Date().toISOString() })
        .eq('id', nextMilestone.id);

      await supabase
        .from('books')
        .update({ current_milestone: nextMilestone.template?.code || 'M0' })
        .eq('id', bookId);
    }

    await refresh();
    return true;
  }, [bookId, milestones, refresh]);

  const currentMilestone = milestones.find(
    (m) => m.status === 'in_progress'
  ) || milestones.find((m) => m.status === 'pending') || null;

  return {
    milestones,
    templates,
    currentMilestone,
    loading,
    refresh,
    seedMilestones,
    toggleItem,
    advanceMilestone,
  };
}
