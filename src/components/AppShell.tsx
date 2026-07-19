import { useState } from 'react';
import type { ViewId } from '../types';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { Dashboard } from '../views/Dashboard';
import { Library } from '../views/Library';
import { Lifecycle } from '../views/Lifecycle';
import { Genome } from '../views/Genome';
import { Characters } from '../views/Characters';
import { Chapters } from '../views/Chapters';
import { Editorial } from '../views/Editorial';
import { Production } from '../views/Production';
import { Marketing } from '../views/Marketing';
import { AiCenter } from '../views/AiCenter';
import { Activity } from '../views/Activity';

export function AppShell() {
  const [view, setView] = useState<ViewId>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const renderView = () => {
    switch (view) {
      case 'dashboard': return <Dashboard onNavigate={setView} />;
      case 'library': return <Library />;
      case 'lifecycle': return <Lifecycle />;
      case 'genome': return <Genome />;
      case 'characters': return <Characters />;
      case 'chapters': return <Chapters />;
      case 'editorial': return <Editorial />;
      case 'production': return <Production />;
      case 'marketing': return <Marketing />;
      case 'ai-center': return <AiCenter />;
      case 'activity': return <Activity />;
      default: return <Dashboard onNavigate={setView} />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        currentView={view}
        onNavigate={setView}
        open={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          currentView={view}
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          {renderView()}
        </main>
      </div>
    </div>
  );
}
