import React from 'react';
import {
  FolderKanban,
  Plus,
  Clock,
  Layers,
  Sparkles,
  Trash2,
  ExternalLink,
  Edit,
} from 'lucide-react';
import { useStudio } from '../context/StudioContext';

export const ProjectsView: React.FC = () => {
  const {
    projects,
    activeProjectId,
    setActiveProjectId,
    deleteProject,
    setNewProjectModalOpen,
    setActiveTab,
    notify,
  } = useStudio();

  return (
    <div id="projects-view" className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-[#0a0b10] text-zinc-100 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#1c202e]">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-amber-400" />
            Film Projects & Workspaces
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Organize shots, storyboards, characters, and assets into production projects.
          </p>
        </div>

        <button
          onClick={() => setNewProjectModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-110 text-black font-bold text-xs shadow-md transition-all"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Project</span>
        </button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {projects.map((proj) => {
          const isActive = proj.id === activeProjectId;
          return (
            <div
              key={proj.id}
              className={`rounded-2xl overflow-hidden bg-[#11131c] border transition-all flex flex-col justify-between shadow-xl group ${
                isActive
                  ? 'border-amber-500/50 ring-1 ring-amber-500/30'
                  : 'border-[#212536] hover:border-zinc-700'
              }`}
            >
              <div>
                {/* Project Cover */}
                <div
                  className="relative aspect-video bg-black cursor-pointer overflow-hidden"
                  onClick={() => {
                    setActiveProjectId(proj.id);
                    setActiveTab('canvas');
                    notify(`Opened workspace for "${proj.name}"`, 'success');
                  }}
                >
                  <img
                    src={proj.coverImage}
                    alt={proj.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {isActive && (
                    <div className="absolute top-3 left-3 bg-amber-500 text-black font-bold text-[10px] px-2 py-0.5 rounded-full shadow">
                      ACTIVE PROJECT
                    </div>
                  )}

                  <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                    <div>
                      <h3 className="font-bold text-base text-white truncate">{proj.name}</h3>
                      <p className="text-xs text-zinc-300 truncate font-light">{proj.description}</p>
                    </div>
                  </div>
                </div>

                {/* Metadata & Tag List */}
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    {proj.tags?.map((t, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-[#181a26] text-amber-300/80 border border-[#272b3d]"
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-400 bg-[#0d0f16] p-2.5 rounded-xl border border-[#1b1f2e]">
                    <div className="flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-zinc-500" />
                      <span>{proj.sceneCount} Scenes</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-zinc-500" />
                      <span>{proj.lastEdited}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-4 pt-0 flex items-center justify-between border-t border-[#1b1f2e] mt-2">
                <button
                  onClick={() => {
                    setActiveProjectId(proj.id);
                    setActiveTab('canvas');
                    notify(`Opened workspace for "${proj.name}"`, 'success');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center gap-1"
                >
                  <span>Open Studio</span>
                  <ExternalLink className="w-3 h-3" />
                </button>

                <button
                  onClick={() => deleteProject(proj.id)}
                  className="p-1.5 text-zinc-500 hover:text-rose-400 rounded-lg hover:bg-[#1a1d2c]"
                  title="Delete Project"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
