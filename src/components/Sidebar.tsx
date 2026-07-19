import {
  LayoutDashboard,
  Library,
  GitBranch,
  Dna,
  Users,
  ListOrdered,
  KanbanSquare,
  Printer,
  Megaphone,
  Sparkles,
  Activity,
  Menu,
  BookOpen,
} from 'lucide-react';
import type { ViewId } from '../types';

const navItems: { id: ViewId; label: string; icon: typeof LayoutDashboard; group?: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'library', label: 'Library', icon: Library },
  { id: 'lifecycle', label: 'Lifecycle', icon: GitBranch, group: 'Book' },
  { id: 'genome', label: 'Book Genome', icon: Dna },
  { id: 'characters', label: 'Characters', icon: Users },
  { id: 'chapters', label: 'Chapters', icon: ListOrdered },
  { id: 'editorial', label: 'Editorial', icon: KanbanSquare, group: 'Workflow' },
  { id: 'production', label: 'Production', icon: Printer },
  { id: 'marketing', label: 'Marketing', icon: Megaphone },
  { id: 'ai-center', label: 'AI Center', icon: Sparkles, group: 'Intelligence' },
  { id: 'activity', label: 'Activity', icon: Activity },
];

interface SidebarProps {
  currentView: ViewId;
  onNavigate: (view: ViewId) => void;
  open: boolean;
  onToggle: () => void;
}

export function Sidebar({ currentView, onNavigate, open, onToggle }: SidebarProps) {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}
      <aside
        className={`
          fixed lg:static z-50 top-0 left-0 h-full
          w-[260px] sidebar-gradient border-r border-line
          flex flex-col transition-transform duration-200
          ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-[72px]'}
        `}
      >
        <div className="flex items-center gap-3 px-5 h-16 border-b border-line shrink-0">
          <div className="w-9 h-9 rounded-lg bg-gold/20 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-gold" />
          </div>
          {open && (
            <div className="flex flex-col">
              <span className="text-sm font-bold text-cream tracking-wide">MANGU</span>
              <span className="text-[10px] text-muted tracking-widest uppercase">Book OS</span>
            </div>
          )}
          <button
            onClick={onToggle}
            className="ml-auto p-1.5 rounded-lg hover:bg-line transition-colors lg:hidden"
          >
            <Menu className="w-4 h-4 text-muted" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
          {navItems.map((item, idx) => {
            const showGroup = item.group && (idx === 0 || navItems[idx - 1].group !== item.group);
            return (
              <div key={item.id}>
                {showGroup && (
                  <div className="pt-5 pb-2 px-3">
                    <span className="text-[10px] uppercase tracking-widest text-muted/60 font-semibold">
                      {item.group}
                    </span>
                  </div>
                )}
                <button
                  onClick={() => onNavigate(item.id)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all
                    ${currentView === item.id
                      ? 'bg-gold/12 text-gold border border-gold/20'
                      : 'text-cream/70 hover:text-cream hover:bg-line border border-transparent'}
                  `}
                >
                  <item.icon className="w-[18px] h-[18px] shrink-0" />
                  {open && <span>{item.label}</span>}
                </button>
              </div>
            );
          })}
        </nav>

        <div className="border-t border-line p-4 shrink-0">
          {open && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold/40 to-gold/10 flex items-center justify-center text-xs font-bold text-gold">
                KM
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-cream truncate">Kai Mansa</span>
                <span className="text-[10px] text-muted truncate">Author & Publisher</span>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
