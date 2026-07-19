import { useState, useEffect, useRef, useCallback } from 'react';
import { Loader2, Save, CheckCircle2, Dna, BookOpen, Palette, Globe, TrendingUp } from 'lucide-react';
import { useBooks } from '../contexts/BookContext';
import { supabase } from '../lib/supabase';

type GenomeTab = 'identity' | 'creative' | 'world' | 'commercial';

interface GenomeData {
  premise?: string;
  elevator_pitch?: string;
  theme?: string;
  core_conflict?: string;
  tone?: string;
  narrative_voice?: string;
  pov_style?: string;
  setting?: string;
  time_period?: string;
  world_rules?: string;
  magic_system?: string;
  target_audience?: string;
  comp_titles?: string;
  unique_selling_point?: string;
  release_window?: string;
  format?: string;
  themes?: string;
  emotional_palette?: string;
  pacing_style?: string;
}

const GENOME_SECTIONS: Record<GenomeTab, { label: string; icon: typeof Dna; fields: { key: keyof GenomeData; label: string; type: 'text' | 'textarea'; placeholder: string; required?: boolean }[] }> = {
  identity: {
    label: 'Identity',
    icon: BookOpen,
    fields: [
      { key: 'premise', label: 'One-Sentence Premise', type: 'textarea', placeholder: 'The core story promise in one compelling sentence...', required: true },
      { key: 'elevator_pitch', label: 'Elevator Pitch', type: 'textarea', placeholder: 'A 2-3 sentence hook that captures the entire book...' },
      { key: 'themes', label: 'Major Themes', type: 'textarea', placeholder: 'Power & corruption, identity, sacrifice... (comma separated)' },
      { key: 'unique_selling_point', label: 'Unique Differentiator', type: 'textarea', placeholder: 'What makes this book stand apart from comparable titles?' },
    ],
  },
  creative: {
    label: 'Creative DNA',
    icon: Palette,
    fields: [
      { key: 'theme', label: 'Core Theme', type: 'text', placeholder: 'The central thematic question...', required: true },
      { key: 'core_conflict', label: 'Primary Conflict', type: 'textarea', placeholder: 'The main source of narrative tension...', required: true },
      { key: 'tone', label: 'Tone', type: 'text', placeholder: 'Dark, hopeful, sardonic, lyrical...' },
      { key: 'narrative_voice', label: 'Narrative Voice', type: 'textarea', placeholder: 'Describe the storytelling style and personality...' },
      { key: 'pov_style', label: 'POV Style', type: 'text', placeholder: 'First person, close third, omniscient...' },
      { key: 'emotional_palette', label: 'Emotional Palette', type: 'textarea', placeholder: 'Key emotions the reader should feel: tension, wonder, grief...' },
      { key: 'pacing_style', label: 'Pacing Style', type: 'text', placeholder: 'Slow burn, propulsive, episodic...' },
    ],
  },
  world: {
    label: 'World-Building',
    icon: Globe,
    fields: [
      { key: 'setting', label: 'Setting', type: 'textarea', placeholder: 'Primary location and environment...' },
      { key: 'time_period', label: 'Time Period', type: 'text', placeholder: 'Contemporary, medieval, far future...' },
      { key: 'world_rules', label: 'World Rules & Constraints', type: 'textarea', placeholder: 'Physical laws, social structures, limitations...' },
      { key: 'magic_system', label: 'Special Systems', type: 'textarea', placeholder: 'Magic, technology, powers, or unique mechanisms...' },
    ],
  },
  commercial: {
    label: 'Commercial',
    icon: TrendingUp,
    fields: [
      { key: 'target_audience', label: 'Target Audience', type: 'textarea', placeholder: 'Reader demographics, psychographics, and buying behavior...', required: true },
      { key: 'comp_titles', label: 'Comp Titles', type: 'textarea', placeholder: 'Similar books for positioning (title - author)...' },
      { key: 'release_window', label: 'Target Release Window', type: 'text', placeholder: 'Q1 2025, Summer 2025...' },
      { key: 'format', label: 'Planned Formats', type: 'text', placeholder: 'Ebook, paperback, hardcover, audiobook...' },
    ],
  },
};

export function Genome() {
  const { activeBook, loading: bookLoading } = useBooks();
  const [tab, setTab] = useState<GenomeTab>('identity');
  const [genome, setGenome] = useState<GenomeData>({});
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [dirty, setDirty] = useState(false);
  const saveTimeout = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (activeBook?.genome && typeof activeBook.genome === 'object') {
      setGenome(activeBook.genome as unknown as GenomeData);
      setDirty(false);
    } else {
      setGenome({});
    }
  }, [activeBook?.id, activeBook?.genome]);

  const saveGenome = useCallback(async (data: GenomeData) => {
    if (!activeBook) return;
    setSaving(true);
    const { error } = await supabase
      .from('books')
      .update({ genome: data as any, updated_at: new Date().toISOString() })
      .eq('id', activeBook.id);

    if (!error) {
      setLastSaved(new Date());
      setDirty(false);
    }
    setSaving(false);
  }, [activeBook]);

  const handleFieldChange = (key: keyof GenomeData, value: string) => {
    const newGenome = { ...genome, [key]: value };
    setGenome(newGenome);
    setDirty(true);

    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => saveGenome(newGenome), 1200);
  };

  const handleManualSave = () => {
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveGenome(genome);
  };

  const tabs: { id: GenomeTab; label: string; icon: typeof Dna }[] = [
    { id: 'identity', label: 'Identity', icon: BookOpen },
    { id: 'creative', label: 'Creative DNA', icon: Palette },
    { id: 'world', label: 'World-Building', icon: Globe },
    { id: 'commercial', label: 'Commercial', icon: TrendingUp },
  ];

  const getSectionProgress = (tabId: GenomeTab): number => {
    const section = GENOME_SECTIONS[tabId];
    const allFields = section.fields;
    const filled = allFields.filter(f => genome[f.key]?.trim());
    if (allFields.length === 0) return 0;
    return Math.round((filled.length / allFields.length) * 100);
  };

  const getOverallProgress = (): number => {
    const allFields = Object.values(GENOME_SECTIONS).flatMap(s => s.fields);
    const filled = allFields.filter(f => genome[f.key]?.trim());
    if (allFields.length === 0) return 0;
    return Math.round((filled.length / allFields.length) * 100);
  };

  if (bookLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 text-gold animate-spin" /></div>;
  }

  if (!activeBook) {
    return <div className="card-gradient rounded-card border border-line p-16 text-center"><p className="text-muted text-sm">Select a book to edit its genome.</p></div>;
  }

  const currentSection = GENOME_SECTIONS[tab];

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-cream flex items-center gap-2">
            <Dna className="w-5 h-5 text-gold" />
            Book Genome
          </h2>
          <p className="text-sm text-muted mt-1">{activeBook.title} — Structured DNA of your story</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wider text-muted">Completion</p>
            <p className="text-lg font-bold text-gold">{getOverallProgress()}%</p>
          </div>
          <SaveIndicator saving={saving} dirty={dirty} lastSaved={lastSaved} onSave={handleManualSave} />
        </div>
      </div>

      <div className="flex gap-1 bg-bg-2/60 rounded-lg p-1 border border-line overflow-x-auto">
        {tabs.map((t) => {
          const progress = getSectionProgress(t.id);
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-md text-xs font-semibold transition-all whitespace-nowrap ${
                tab === t.id ? 'bg-gold/15 text-gold border border-gold/25' : 'text-muted hover:text-cream border border-transparent'
              }`}
            >
              <t.icon className="w-3.5 h-3.5" />
              {t.label}
              <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                progress === 100 ? 'bg-accent-green/15 text-accent-green'
                : progress > 0 ? 'bg-gold/10 text-gold/70'
                : 'bg-line/50 text-muted/60'
              }`}>
                {progress}%
              </span>
            </button>
          );
        })}
      </div>

      <div className="space-y-4">
        {currentSection.fields.map((field) => (
          <div key={field.key} className="card-gradient rounded-card border border-line p-5 transition-all hover:border-line/80">
            <label className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold text-cream">{field.label}</span>
              {field.required && <span className="text-[9px] uppercase tracking-wider font-bold text-accent-orange/70">Required</span>}
              {genome[field.key]?.trim() && <CheckCircle2 className="w-3 h-3 text-accent-green" />}
            </label>
            {field.type === 'textarea' ? (
              <textarea
                value={genome[field.key] || ''}
                onChange={(e) => handleFieldChange(field.key, e.target.value)}
                placeholder={field.placeholder}
                rows={3}
                className="w-full bg-bg-2/60 border border-line rounded-lg px-4 py-3 text-sm text-cream placeholder:text-muted/50 focus:outline-none focus:border-gold/40 resize-none leading-relaxed transition-colors"
              />
            ) : (
              <input
                type="text"
                value={genome[field.key] || ''}
                onChange={(e) => handleFieldChange(field.key, e.target.value)}
                placeholder={field.placeholder}
                className="w-full bg-bg-2/60 border border-line rounded-lg px-4 py-3 text-sm text-cream placeholder:text-muted/50 focus:outline-none focus:border-gold/40 transition-colors"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function SaveIndicator({ saving, dirty, lastSaved, onSave }: {
  saving: boolean;
  dirty: boolean;
  lastSaved: Date | null;
  onSave: () => void;
}) {
  if (saving) {
    return (
      <div className="flex items-center gap-1.5 text-gold text-xs">
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
        <span>Saving...</span>
      </div>
    );
  }

  if (dirty) {
    return (
      <button
        onClick={onSave}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-gold border border-gold/30 hover:bg-gold/10 transition-all"
      >
        <Save className="w-3.5 h-3.5" />
        Save
      </button>
    );
  }

  if (lastSaved) {
    return (
      <div className="flex items-center gap-1.5 text-accent-green text-xs">
        <CheckCircle2 className="w-3.5 h-3.5" />
        <span>Saved</span>
      </div>
    );
  }

  return null;
}
