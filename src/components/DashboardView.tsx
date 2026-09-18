import React from 'react';
import {
  Sparkles,
  Clapperboard,
  Users,
  LayoutGrid,
  Plus,
  Play,
  ArrowRight,
  TrendingUp,
  FolderKanban,
  Clock,
  Eye,
  Star,
  Upload,
} from 'lucide-react';
import { useStudio } from '../context/StudioContext';

export const DashboardView: React.FC = () => {
  const {
    user,
    credits,
    projects,
    setActiveProjectId,
    mediaList,
    setActiveTab,
    setViewingMedia,
    setNewProjectModalOpen,
    setUploadModalOpen,
    setPromptText,
    updateSettings,
  } = useStudio();

  const recentMedia = mediaList.filter((m) => !m.trashed).slice(0, 8);

  const quickStartTemplates = [
    {
      title: 'Cinematic Anamorphic Film',
      subtitle: 'Veo 3.1 Pro • 1080p Cinema',
      type: 'video' as const,
      prompt: 'Cinematic night scene of a detective walking through rain-slicked city streets, moody volumetric light.',
      bg: 'from-amber-600/30 to-purple-900/40',
      icon: <Clapperboard className="w-5 h-5 text-amber-400" />,
    },
    {
      title: 'Hyper-Realistic Keyframe',
      subtitle: 'Gemini Image Ultra • 4K Photoreal',
      type: 'image' as const,
      prompt: 'Architectural photograph of a brutalist concrete villa perched on Norwegian cliff edge during twilight.',
      bg: 'from-blue-600/30 to-slate-900/40',
      icon: <Sparkles className="w-5 h-5 text-blue-400" />,
    },
    {
      title: 'Character Consistency Sheet',
      subtitle: 'Multi-angle Biometric Anchor',
      type: 'image' as const,
      prompt: 'Character sheet, three angles, front, side, three-quarters portrait of a distinguished sci-fi astronaut.',
      bg: 'from-emerald-600/30 to-teal-900/40',
      icon: <Users className="w-5 h-5 text-emerald-400" />,
    },
    {
      title: 'Automated Storyboard',
      subtitle: 'Full 5-Scene Narrative Pipeline',
      type: 'video' as const,
      prompt: 'A pilot embarks on an emergency deep-space planetary descent.',
      bg: 'from-orange-600/30 to-red-900/40',
      icon: <LayoutGrid className="w-5 h-5 text-orange-400" />,
    },
  ];

  return (
    <div id="dashboard-view" className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8 bg-[#0a0b10] text-zinc-100 select-none">
      {/* Welcome Hero Banner */}
      <div className="relative rounded-2xl bg-gradient-to-r from-[#171926] via-[#151724] to-[#12141f] border border-[#262a3c] p-6 sm:p-8 overflow-hidden shadow-2xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>VisionForge AI Production Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
            Welcome, {user?.name || 'Director'}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-xl mb-6">
            Direct films, construct reusable consistent characters, and sequence multi-shot storyboards with state-of-the-art cinematic image and video synthesis.
          </p>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setActiveTab('canvas')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-110 text-black font-bold text-xs shadow-lg transition-all"
            >
              <Clapperboard className="w-4 h-4" />
              <span>Open Studio Canvas</span>
            </button>

            <button
              onClick={() => setNewProjectModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1e2230] hover:bg-[#282d3f] border border-[#2b3044] text-xs font-semibold text-zinc-200 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>New Project</span>
            </button>

            <button
              onClick={() => setUploadModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1e2230] hover:bg-[#282d3f] border border-[#2b3044] text-xs font-semibold text-zinc-200 transition-colors"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Media</span>
            </button>
          </div>
        </div>

        {/* Ambient background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Quick Launch Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-amber-400" />
            Quick Creation Workflows
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickStartTemplates.map((t, idx) => (
            <div
              key={idx}
              onClick={() => {
                setPromptText(t.prompt);
                updateSettings({ mediaType: t.type });
                setActiveTab('canvas');
              }}
              className={`p-4 rounded-xl bg-gradient-to-br ${t.bg} border border-[#262c3e] hover:border-amber-500/50 cursor-pointer transition-all hover:scale-[1.02] group shadow-lg`}
            >
              <div className="w-10 h-10 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center mb-3">
                {t.icon}
              </div>
              <h3 className="font-bold text-sm text-white group-hover:text-amber-300 transition-colors">
                {t.title}
              </h3>
              <p className="text-[11px] text-zinc-400 mt-1 mb-3">{t.subtitle}</p>
              <div className="flex items-center gap-1 text-[11px] text-amber-400 font-semibold">
                <span>Start in Canvas</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Projects */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <FolderKanban className="w-4 h-4 text-amber-400" />
            Active Projects
          </h2>
          <button
            onClick={() => setActiveTab('projects')}
            className="text-xs text-zinc-400 hover:text-amber-400 flex items-center gap-1 font-medium"
          >
            <span>View all</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {projects.slice(0, 3).map((proj) => (
            <div
              key={proj.id}
              onClick={() => {
                setActiveProjectId(proj.id);
                setActiveTab('canvas');
              }}
              className="p-3 rounded-xl bg-[#12141d] border border-[#212534] hover:border-zinc-700 cursor-pointer transition-all group overflow-hidden"
            >
              <div className="h-32 rounded-lg overflow-hidden relative mb-3 bg-black">
                {proj.coverImage && (
                  <img
                    src={proj.coverImage}
                    alt={proj.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                )}
                <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded text-[10px] text-zinc-300 font-mono">
                  {proj.sceneCount} Scenes
                </div>
              </div>
              <h3 className="font-bold text-xs text-white truncate">{proj.name}</h3>
              <p className="text-[11px] text-zinc-400 truncate mt-0.5">{proj.description}</p>
              <div className="flex items-center justify-between text-[10px] text-zinc-500 mt-2.5 pt-2 border-t border-[#1c202d]">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {proj.lastEdited}
                </span>
                <span className="text-amber-400 group-hover:underline font-semibold">Open Studio →</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Generations Gallery */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Recent Studio Creations
          </h2>
          <button
            onClick={() => setActiveTab('media')}
            className="text-xs text-zinc-400 hover:text-amber-400 flex items-center gap-1 font-medium"
          >
            <span>Media Library</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {recentMedia.map((media) => (
            <div
              key={media.id}
              onClick={() => setViewingMedia(media)}
              className="relative aspect-video rounded-xl overflow-hidden bg-black border border-[#212534] hover:border-amber-500/50 cursor-pointer group shadow-md"
            >
              <img
                src={media.thumbnail}
                alt={media.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-black/70 text-zinc-300">
                    {media.type}
                  </span>
                  {media.favorite && <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white truncate">{media.title}</h4>
                  <div className="text-[10px] text-zinc-400 truncate">{media.model}</div>
                </div>
              </div>

              {media.type === 'video' && (
                <div className="absolute bottom-2 right-2 bg-black/70 rounded-full p-1 text-white group-hover:scale-110 transition-transform">
                  <Play className="w-3 h-3 fill-white" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
