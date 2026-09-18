import React from 'react';
import {
  Home,
  Film,
  Sparkles,
  Users,
  Layers,
  LayoutGrid,
  Wrench,
  FolderKanban,
  Star,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Zap,
} from 'lucide-react';
import { useStudio } from '../context/StudioContext';
import { ActiveNavTab } from '../types';

export const Sidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    sidebarCollapsed,
    setSidebarCollapsed,
    credits,
    activeJobs,
    setSettingsModalOpen,
    setSettingsModalSection,
  } = useStudio();

  const navItems: { tab: ActiveNavTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { tab: 'canvas', label: 'Studio Canvas', icon: <Film className="w-4 h-4" />, badge: activeJobs.length || undefined },
    { tab: 'home', label: 'Home', icon: <Home className="w-4 h-4" /> },
    { tab: 'media', label: 'All Media', icon: <Sparkles className="w-4 h-4" /> },
    { tab: 'characters', label: 'Characters', icon: <Users className="w-4 h-4" /> },
    { tab: 'scenes', label: 'Scenes', icon: <Layers className="w-4 h-4" /> },
    { tab: 'storyboard', label: 'Storyboard', icon: <LayoutGrid className="w-4 h-4" /> },
    { tab: 'tools', label: 'Tools', icon: <Wrench className="w-4 h-4" /> },
    { tab: 'projects', label: 'Projects', icon: <FolderKanban className="w-4 h-4" /> },
    { tab: 'favorites', label: 'Favorites', icon: <Star className="w-4 h-4" /> },
    { tab: 'trash', label: 'Trash', icon: <Trash2 className="w-4 h-4" /> },
  ];

  return (
    <aside
      id="main-sidebar"
      className={`h-screen bg-[#0e1015] border-r border-[#1e222d] flex flex-col justify-between transition-all duration-300 z-30 shrink-0 select-none ${
        sidebarCollapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Top branding */}
      <div className="flex flex-col">
        <div className="h-16 flex items-center px-4 border-b border-[#1e222d] justify-between">
          {!sidebarCollapsed ? (
            <div
              className="flex items-center gap-2.5 cursor-pointer"
              onClick={() => setActiveTab('canvas')}
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-950/40 text-black font-extrabold text-sm tracking-tighter">
                VF
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm tracking-wide text-white flex items-center gap-1.5">
                  VisionForge
                  <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    Studio
                  </span>
                </span>
                <span className="text-[10px] text-zinc-400 tracking-wider">AI Film & Story Suite</span>
              </div>
            </div>
          ) : (
            <div
              className="w-8 h-8 mx-auto rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-black font-extrabold text-sm cursor-pointer"
              onClick={() => setActiveTab('canvas')}
              title="VisionForge AI"
            >
              VF
            </div>
          )}
        </div>

        {/* Navigation list */}
        <nav className="p-2 space-y-1 mt-2">
          {navItems.map((item) => {
            const isActive = activeTab === item.tab;
            return (
              <button
                key={item.tab}
                id={`sidebar-nav-${item.tab}`}
                onClick={() => setActiveTab(item.tab)}
                title={sidebarCollapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#161822]'
                }`}
              >
                <span className={`${isActive ? 'text-amber-400' : 'text-zinc-400'}`}>
                  {item.icon}
                </span>

                {!sidebarCollapsed && (
                  <span className="flex-1 text-left truncate">{item.label}</span>
                )}

                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                      isActive
                        ? 'bg-amber-400 text-black'
                        : 'bg-[#272b38] text-amber-300 animate-pulse'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom section: Credits & Collapse toggle */}
      <div className="p-3 border-t border-[#1e222d] space-y-2">
        {!sidebarCollapsed ? (
          <div
            className="p-2.5 rounded-lg bg-[#14161f] border border-[#232734] cursor-pointer hover:border-amber-500/40 transition-colors"
            onClick={() => {
              setSettingsModalSection('credits');
              setSettingsModalOpen(true);
            }}
          >
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400 flex items-center gap-1.5 font-medium">
                <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" />
                Credits
              </span>
              <span className="font-bold text-amber-300">{credits}</span>
            </div>
            <div className="w-full bg-[#202431] h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-amber-500 to-orange-500 h-full rounded-full"
                style={{ width: `${Math.min(100, (credits / 500) * 100)}%` }}
              />
            </div>
            <div className="flex justify-between items-center mt-2 text-[10px] text-zinc-400">
              <span>Pro Plan</span>
              <span className="text-amber-400 hover:underline font-semibold">+ Top Up</span>
            </div>
          </div>
        ) : (
          <button
            onClick={() => {
              setSettingsModalSection('credits');
              setSettingsModalOpen(true);
            }}
            title={`Credits: ${credits}`}
            className="w-10 h-10 mx-auto rounded-lg bg-[#14161f] border border-[#232734] flex flex-col items-center justify-center text-amber-400 hover:border-amber-500/40"
          >
            <Zap className="w-3.5 h-3.5 fill-amber-400/20" />
            <span className="text-[9px] font-bold mt-0.5">{credits}</span>
          </button>
        )}

        {/* Sidebar collapse button */}
        <button
          id="toggle-sidebar-button"
          onClick={() => setSidebarCollapsed((prev) => !prev)}
          className="w-full flex items-center justify-center p-2 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-[#161822] transition-colors"
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <div className="flex items-center gap-2 text-xs w-full px-2"><ChevronLeft className="w-4 h-4" /><span>Collapse Sidebar</span></div>}
        </button>
      </div>
    </aside>
  );
};
