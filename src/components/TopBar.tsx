import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Plus,
  SlidersHorizontal,
  Bot,
  MessageSquareText,
  Settings,
  HelpCircle,
  FolderKanban,
  Check,
  Zap,
  Sparkles,
  Users,
  Layers,
  Shield,
  LogOut,
  Upload,
} from 'lucide-react';
import { useStudio } from '../context/StudioContext';

export const TopBar: React.FC = () => {
  const {
    user,
    credits,
    projects,
    activeProjectId,
    setActiveProjectId,
    activeProject,
    rightPanelTab,
    setRightPanelTab,
    searchQuery,
    setSearchQuery,
    mediaList,
    characters,
    scenes,
    setViewingMedia,
    setActiveTab,
    setAuthModalOpen,
    setAuthModalMode,
    logout,
    setSettingsModalOpen,
    setSettingsModalSection,
    setAdminModalOpen,
    setUploadModalOpen,
    setNewProjectModalOpen,
    setNewCharacterModalOpen,
    setNewSceneModalOpen,
    agentMode,
    setAgentMode,
  } = useStudio();

  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false);
  const [createDropdownOpen, setCreateDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [helpModalOpen, setHelpModalOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const projectRef = useRef<HTMLDivElement>(null);
  const createRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
      if (projectRef.current && !projectRef.current.contains(e.target as Node)) {
        setProjectDropdownOpen(false);
      }
      if (createRef.current && !createRef.current.contains(e.target as Node)) {
        setCreateDropdownOpen(false);
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtered search results
  const trimmedSearch = searchQuery.trim().toLowerCase();
  const searchResults = trimmedSearch
    ? {
        projects: projects.filter((p) => p.name.toLowerCase().includes(trimmedSearch)),
        media: mediaList.filter((m) => m.title.toLowerCase().includes(trimmedSearch) || m.prompt?.toLowerCase().includes(trimmedSearch)),
        characters: characters.filter((c) => c.name.toLowerCase().includes(trimmedSearch) || c.appearance?.toLowerCase().includes(trimmedSearch)),
        scenes: scenes.filter((s) => s.name.toLowerCase().includes(trimmedSearch) || s.description.toLowerCase().includes(trimmedSearch)),
      }
    : null;

  const totalResults = searchResults
    ? searchResults.projects.length + searchResults.media.length + searchResults.characters.length + searchResults.scenes.length
    : 0;

  return (
    <header id="main-topbar" className="h-16 bg-[#0c0e13] border-b border-[#1e222d] px-4 flex items-center justify-between gap-4 select-none shrink-0 z-20">
      {/* Left: Project Selector */}
      <div className="flex items-center gap-3">
        <div className="relative" ref={projectRef}>
          <button
            id="project-selector-button"
            onClick={() => setProjectDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-[#14161f] border border-[#232734] hover:border-zinc-700 transition-colors text-left"
          >
            <div className="w-5 h-5 rounded bg-zinc-800 flex items-center justify-center overflow-hidden shrink-0 border border-zinc-700">
              {activeProject?.coverImage ? (
                <img
                  src={activeProject.coverImage}
                  alt={activeProject.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <FolderKanban className="w-3 h-3 text-zinc-400" />
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-zinc-100 max-w-[140px] truncate">
                {activeProject?.name || 'Select Project'}
              </span>
              <span className="text-[10px] text-zinc-400">
                {activeProject?.sceneCount || 0} scenes
              </span>
            </div>
          </button>

          {projectDropdownOpen && (
            <div className="absolute left-0 mt-2 w-64 rounded-xl bg-[#141620] border border-[#272b38] shadow-2xl p-2 z-50">
              <div className="text-[11px] font-semibold text-zinc-400 px-2 py-1 uppercase tracking-wider">
                Projects
              </div>
              <div className="max-h-56 overflow-y-auto space-y-1 my-1">
                {projects.map((proj) => (
                  <button
                    key={proj.id}
                    onClick={() => {
                      setActiveProjectId(proj.id);
                      setProjectDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-colors ${
                      activeProjectId === proj.id
                        ? 'bg-amber-500/15 text-amber-300 font-medium'
                        : 'text-zinc-300 hover:bg-[#1b1e2a]'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FolderKanban className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      <span className="truncate">{proj.name}</span>
                    </div>
                    {activeProjectId === proj.id && <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                  </button>
                ))}
              </div>
              <div className="pt-2 border-t border-[#232734]">
                <button
                  onClick={() => {
                    setProjectDropdownOpen(false);
                    setNewProjectModalOpen(true);
                  }}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-medium bg-[#1e2230] text-zinc-200 hover:bg-[#262b3d] transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  New Project
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Center: Global Search */}
      <div className="flex-1 max-w-xl relative" ref={searchRef}>
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 pointer-events-none" />
          <input
            id="global-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            placeholder="Search projects, scenes, prompts, characters, media..."
            className="w-full bg-[#13151d] border border-[#232734] focus:border-amber-500/50 rounded-lg pl-9 pr-8 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-amber-500/30 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 text-zinc-500 hover:text-zinc-300 text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Instant Search Results Dropdown */}
        {searchFocused && trimmedSearch && (
          <div className="absolute left-0 right-0 mt-2 bg-[#12141c] border border-[#272b3a] rounded-xl shadow-2xl p-3 z-50 max-h-96 overflow-y-auto">
            <div className="text-[11px] text-zinc-400 font-semibold mb-2">
              Results for "{searchQuery}" ({totalResults})
            </div>

            {totalResults === 0 ? (
              <div className="py-6 text-center text-xs text-zinc-500">
                No matching media, characters, or scenes found.
              </div>
            ) : (
              <div className="space-y-3">
                {searchResults?.characters && searchResults.characters.length > 0 && (
                  <div>
                    <div className="text-[10px] uppercase font-bold text-amber-400/80 mb-1 flex items-center gap-1">
                      <Users className="w-3 h-3" /> Characters
                    </div>
                    {searchResults.characters.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => {
                          setActiveTab('characters');
                          setSearchFocused(false);
                        }}
                        className="p-1.5 rounded-lg hover:bg-[#1a1d29] cursor-pointer flex items-center gap-2 text-xs text-zinc-300"
                      >
                        <img src={c.avatarUrl} className="w-5 h-5 rounded-full object-cover" alt="" />
                        <span>{c.name}</span>
                        <span className="text-[10px] text-zinc-500 truncate">{c.appearance}</span>
                      </div>
                    ))}
                  </div>
                )}

                {searchResults?.scenes && searchResults.scenes.length > 0 && (
                  <div>
                    <div className="text-[10px] uppercase font-bold text-cyan-400/80 mb-1 flex items-center gap-1">
                      <Layers className="w-3 h-3" /> Scenes
                    </div>
                    {searchResults.scenes.map((s) => (
                      <div
                        key={s.id}
                        onClick={() => {
                          setActiveTab('scenes');
                          setSearchFocused(false);
                        }}
                        className="p-1.5 rounded-lg hover:bg-[#1a1d29] cursor-pointer flex items-center justify-between text-xs text-zinc-300"
                      >
                        <span>{s.name}</span>
                        <span className="text-[10px] text-zinc-500">{s.location}</span>
                      </div>
                    ))}
                  </div>
                )}

                {searchResults?.media && searchResults.media.length > 0 && (
                  <div>
                    <div className="text-[10px] uppercase font-bold text-orange-400/80 mb-1 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Media
                    </div>
                    {searchResults.media.slice(0, 5).map((m) => (
                      <div
                        key={m.id}
                        onClick={() => {
                          setViewingMedia(m);
                          setSearchFocused(false);
                        }}
                        className="p-1.5 rounded-lg hover:bg-[#1a1d29] cursor-pointer flex items-center gap-2 text-xs text-zinc-300"
                      >
                        <img src={m.thumbnail} className="w-6 h-6 rounded object-cover" alt="" />
                        <span className="truncate flex-1">{m.title}</span>
                        <span className="text-[10px] uppercase text-zinc-500 font-mono">{m.type}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5">
        {/* Create / New Button */}
        <div className="relative" ref={createRef}>
          <button
            id="create-new-dropdown-button"
            onClick={() => setCreateDropdownOpen((prev) => !prev)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-black font-semibold text-xs hover:brightness-110 shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Create</span>
          </button>

          {createDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-xl bg-[#141620] border border-[#272b38] shadow-2xl p-1.5 z-50 text-xs">
              <button
                onClick={() => {
                  setCreateDropdownOpen(false);
                  setActiveTab('canvas');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-zinc-200 hover:bg-[#1f2333] transition-colors"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>New Generation</span>
              </button>
              <button
                onClick={() => {
                  setCreateDropdownOpen(false);
                  setNewCharacterModalOpen(true);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-zinc-200 hover:bg-[#1f2333] transition-colors"
              >
                <Users className="w-4 h-4 text-cyan-400" />
                <span>New Character</span>
              </button>
              <button
                onClick={() => {
                  setCreateDropdownOpen(false);
                  setNewSceneModalOpen(true);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-zinc-200 hover:bg-[#1f2333] transition-colors"
              >
                <Layers className="w-4 h-4 text-purple-400" />
                <span>New Scene</span>
              </button>
              <button
                onClick={() => {
                  setCreateDropdownOpen(false);
                  setUploadModalOpen(true);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-zinc-200 hover:bg-[#1f2333] transition-colors"
              >
                <Upload className="w-4 h-4 text-emerald-400" />
                <span>Upload Media</span>
              </button>
            </div>
          )}
        </div>

        {/* Agent Mode Selector Pill */}
        <div className="hidden lg:flex items-center bg-[#13151d] border border-[#232734] rounded-lg p-0.5 text-[11px]">
          {(['manual', 'assisted', 'automatic'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setAgentMode(mode)}
              className={`px-2 py-1 rounded capitalize font-medium transition-all ${
                agentMode === mode
                  ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>

        {/* Right contextual drawer buttons */}
        <div className="flex items-center gap-1 bg-[#13151d] border border-[#232734] rounded-lg p-1">
          <button
            id="toggle-settings-panel"
            onClick={() => setRightPanelTab(rightPanelTab === 'settings' ? null : 'settings')}
            title="Generation Settings Drawer"
            className={`p-1.5 rounded-md transition-colors ${
              rightPanelTab === 'settings'
                ? 'bg-amber-500/20 text-amber-400'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#1c1f2c]'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
          <button
            id="toggle-assistant-panel"
            onClick={() => setRightPanelTab(rightPanelTab === 'assistant' ? null : 'assistant')}
            title="AI Creative Assistant"
            className={`p-1.5 rounded-md transition-colors ${
              rightPanelTab === 'assistant'
                ? 'bg-amber-500/20 text-amber-400'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#1c1f2c]'
            }`}
          >
            <MessageSquareText className="w-4 h-4" />
          </button>
          <button
            id="toggle-agent-panel"
            onClick={() => setRightPanelTab(rightPanelTab === 'agent' ? null : 'agent')}
            title="AI Agent Production Mode"
            className={`p-1.5 rounded-md transition-colors ${
              rightPanelTab === 'agent'
                ? 'bg-amber-500/20 text-amber-400'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#1c1f2c]'
            }`}
          >
            <Bot className="w-4 h-4" />
          </button>
        </div>

        {/* Credits Badge */}
        <button
          onClick={() => {
            setSettingsModalSection('credits');
            setSettingsModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#151722] border border-[#242837] hover:border-amber-500/40 text-xs font-semibold text-amber-300"
        >
          <Zap className="w-3.5 h-3.5 fill-amber-400/30 text-amber-400" />
          <span>{credits}</span>
        </button>

        {/* Help button */}
        <button
          onClick={() => setHelpModalOpen(true)}
          className="p-1.5 text-zinc-400 hover:text-zinc-200 rounded-lg hover:bg-[#161822] transition-colors"
          title="Studio Help & Shortcuts"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* Admin Dashboard button */}
        {user?.role === 'admin' && (
          <button
            onClick={() => setAdminModalOpen(true)}
            className="p-1.5 text-zinc-400 hover:text-amber-400 rounded-lg hover:bg-[#161822] transition-colors"
            title="Admin Console"
          >
            <Shield className="w-4 h-4" />
          </button>
        )}

        {/* Settings button */}
        <button
          onClick={() => {
            setSettingsModalSection('account');
            setSettingsModalOpen(true);
          }}
          className="p-1.5 text-zinc-400 hover:text-zinc-200 rounded-lg hover:bg-[#161822] transition-colors"
          title="Studio Settings"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* User Profile Avatar dropdown */}
        <div className="relative" ref={userRef}>
          {user ? (
            <button
              onClick={() => setUserDropdownOpen((prev) => !prev)}
              className="flex items-center gap-1.5 pl-1 rounded-full hover:ring-2 hover:ring-amber-500/40 transition-all"
            >
              <img
                src={user.profileImage}
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover border border-[#2b2f3f]"
              />
            </button>
          ) : (
            <button
              onClick={() => {
                setAuthModalMode('login');
                setAuthModalOpen(true);
              }}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 text-xs font-semibold hover:bg-zinc-700"
            >
              Sign In
            </button>
          )}

          {userDropdownOpen && user && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl bg-[#141620] border border-[#272b38] shadow-2xl p-2 z-50 text-xs">
              <div className="px-3 py-2 border-b border-[#232734]">
                <div className="font-semibold text-zinc-100 truncate">{user.name}</div>
                <div className="text-[10px] text-zinc-400 truncate">{user.email}</div>
                <div className="mt-1 flex items-center justify-between text-[10px]">
                  <span className="font-medium text-amber-400">{user.subscriptionPlan} Plan</span>
                  <span className="text-zinc-400">{credits} credits</span>
                </div>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setUserDropdownOpen(false);
                    setSettingsModalSection('account');
                    setSettingsModalOpen(true);
                  }}
                  className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-[#1d202e] text-zinc-300"
                >
                  Profile & Account
                </button>
                <button
                  onClick={() => {
                    setUserDropdownOpen(false);
                    setSettingsModalSection('credits');
                    setSettingsModalOpen(true);
                  }}
                  className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-[#1d202e] text-zinc-300 flex items-center justify-between"
                >
                  <span>Credit Balance</span>
                  <span className="text-amber-400 font-bold">{credits}</span>
                </button>
                <button
                  onClick={() => {
                    setUserDropdownOpen(false);
                    setSettingsModalSection('generation');
                    setSettingsModalOpen(true);
                  }}
                  className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-[#1d202e] text-zinc-300"
                >
                  Studio Defaults
                </button>
                {user.role === 'admin' && (
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      setAdminModalOpen(true);
                    }}
                    className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-[#1d202e] text-amber-300 font-medium"
                  >
                    Admin Console
                  </button>
                )}
              </div>

              <div className="pt-1 border-t border-[#232734]">
                <button
                  onClick={() => {
                    setUserDropdownOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-rose-500/10 text-rose-400"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Help Modal */}
      {helpModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#12141c] border border-[#272b3a] rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-amber-400" />
              VisionForge AI Studio Guide
            </h3>
            <p className="text-xs text-zinc-400 mb-4">
              A unified production studio for cinematic AI image, video, and scene creation.
            </p>
            <div className="space-y-3 text-xs text-zinc-300">
              <div className="p-2.5 rounded-lg bg-[#181a24] border border-[#242838]">
                <div className="font-semibold text-amber-300 mb-0.5">🎬 Character Consistency</div>
                <div>Select saved characters before generating to inject biometric anchors and costume identity automatically across all shots.</div>
              </div>
              <div className="p-2.5 rounded-lg bg-[#181a24] border border-[#242838]">
                <div className="font-semibold text-amber-300 mb-0.5">✨ AI Prompt Enhancer</div>
                <div>Click the wand icon in the composer to re-engineer natural language into cinematic 35mm lens, volumetric lighting, and camera motion cues.</div>
              </div>
              <div className="p-2.5 rounded-lg bg-[#181a24] border border-[#242838]">
                <div className="font-semibold text-amber-300 mb-0.5">⚡ Credit Consumption</div>
                <div>Standard image: 5 credits. High definition cinematic video: 30 credits. Prompt optimization: 2 credits.</div>
              </div>
            </div>
            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setHelpModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
