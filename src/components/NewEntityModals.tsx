import React, { useState } from 'react';
import {
  X,
  FolderKanban,
  Users,
  Layers,
  Sparkles,
  Camera,
  MapPin,
  Clock,
  Plus,
} from 'lucide-react';
import { useStudio } from '../context/StudioContext';

export const NewEntityModals: React.FC = () => {
  const {
    newProjectModalOpen,
    setNewProjectModalOpen,
    createProject,
    newCharacterModalOpen,
    setNewCharacterModalOpen,
    createCharacter,
    newSceneModalOpen,
    setNewSceneModalOpen,
    createScene,
    activeProjectId,
  } = useStudio();

  // Project state
  const [projName, setProjName] = useState('');
  const [projDesc, setProjDesc] = useState('');

  // Character state
  const [charName, setCharName] = useState('');
  const [charDesc, setCharDesc] = useState('');
  const [charAppearance, setCharAppearance] = useState('Sharp jawline, athletic build, distinctive piercing amber eyes');
  const [charClothing, setCharClothing] = useState('Matte black technical trench coat with orange interior lining');
  const [charAnchor, setCharAnchor] = useState('35-year-old male, olive skin, short textured dark hair');
  const [charAvatarUrl, setCharAvatarUrl] = useState(
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80'
  );

  // Scene state
  const [sceneName, setSceneName] = useState('');
  const [sceneDesc, setSceneDesc] = useState('');
  const [sceneLocation, setSceneLocation] = useState('High-Rise Penthouse');
  const [sceneTime, setSceneTime] = useState('Golden Hour Dusk');
  const [sceneCamera, setSceneCamera] = useState('Slow Dolly Push-In 35mm');
  const [sceneLighting, setSceneLighting] = useState('Warm amber rim light with moody silhouettes');
  const [scenePrompt, setScenePrompt] = useState('');

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projName.trim()) return;
    createProject(projName, projDesc || 'New film workspace');
    setNewProjectModalOpen(false);
    setProjName('');
    setProjDesc('');
  };

  const handleCreateCharacter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!charName.trim()) return;
    createCharacter({
      name: charName,
      description: charDesc || 'Cinematic recurring character',
      appearance: charAppearance,
      clothing: charClothing,
      consistencyAnchor: charAnchor,
      avatarUrl: charAvatarUrl,
      referenceImages: [charAvatarUrl],
      projectId: activeProjectId,
    });
    setNewCharacterModalOpen(false);
    setCharName('');
    setCharDesc('');
  };

  const handleCreateScene = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sceneName.trim()) return;
    createScene({
      name: sceneName,
      description: sceneDesc || 'Cinematic sequence',
      location: sceneLocation,
      timeOfDay: sceneTime,
      camera: sceneCamera,
      lighting: sceneLighting,
      prompt: scenePrompt || `Cinematic shot at ${sceneLocation} during ${sceneTime}. ${sceneCamera}, ${sceneLighting}.`,
      duration: 5,
    });
    setNewSceneModalOpen(false);
    setSceneName('');
    setSceneDesc('');
    setScenePrompt('');
  };

  return (
    <>
      {/* 1. NEW PROJECT MODAL */}
      {newProjectModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-none">
          <div className="bg-[#10121a] border border-[#272b3c] rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button
              onClick={() => setNewProjectModalOpen(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-base font-bold text-white mb-1 flex items-center gap-2">
              <FolderKanban className="w-4 h-4 text-amber-400" />
              Create New Production Project
            </h2>
            <p className="text-xs text-zinc-400 mb-4">
              Group related scenes, characters, and generated assets into a dedicated workspace.
            </p>

            <form onSubmit={handleCreateProject} className="space-y-3.5 text-xs">
              <div>
                <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                  Project Title
                </label>
                <input
                  type="text"
                  required
                  value={projName}
                  onChange={(e) => setProjName(e.target.value)}
                  placeholder="e.g. Neon Horizon Feature"
                  className="w-full bg-[#161824] border border-[#262b3c] rounded-xl px-3 py-2 text-zinc-200 focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                  Logline / Description
                </label>
                <textarea
                  rows={2}
                  value={projDesc}
                  onChange={(e) => setProjDesc(e.target.value)}
                  placeholder="Brief synopsis of the film or commercial concept..."
                  className="w-full bg-[#161824] border border-[#262b3c] rounded-xl px-3 py-2 text-zinc-200 focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNewProjectModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold hover:brightness-110"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. NEW CHARACTER MODAL */}
      {newCharacterModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-none">
          <div className="bg-[#10121a] border border-[#272b3c] rounded-2xl w-full max-w-lg p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setNewCharacterModalOpen(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-base font-bold text-white mb-1 flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-400" />
              Add Character to Consistency Bank
            </h2>
            <p className="text-xs text-zinc-400 mb-4">
              Configure physical traits and biometric directives for persistent rendering across scenes.
            </p>

            <form onSubmit={handleCreateCharacter} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                    Character Name
                  </label>
                  <input
                    type="text"
                    required
                    value={charName}
                    onChange={(e) => setCharName(e.target.value)}
                    placeholder="e.g. Maya Lin"
                    className="w-full bg-[#161824] border border-[#262b3c] rounded-xl px-3 py-2 text-zinc-200 focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                    Role / Archetype
                  </label>
                  <input
                    type="text"
                    value={charDesc}
                    onChange={(e) => setCharDesc(e.target.value)}
                    placeholder="e.g. Lead protagonist / Detective"
                    className="w-full bg-[#161824] border border-[#262b3c] rounded-xl px-3 py-2 text-zinc-200 focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                  Biometric Facial & Physical Appearance
                </label>
                <input
                  type="text"
                  value={charAppearance}
                  onChange={(e) => setCharAppearance(e.target.value)}
                  placeholder="Facial structure, skin tone, hair color..."
                  className="w-full bg-[#161824] border border-[#262b3c] rounded-xl px-3 py-2 text-zinc-200 focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                  Default Costume / Wardrobe
                </label>
                <input
                  type="text"
                  value={charClothing}
                  onChange={(e) => setCharClothing(e.target.value)}
                  placeholder="Clothing style, fabric textures, colors..."
                  className="w-full bg-[#161824] border border-[#262b3c] rounded-xl px-3 py-2 text-zinc-200 focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                  Consistency Anchor Directive (AI Prompt Injector)
                </label>
                <textarea
                  rows={2}
                  value={charAnchor}
                  onChange={(e) => setCharAnchor(e.target.value)}
                  placeholder="Precise prompt anchor tags injected into models..."
                  className="w-full bg-[#161824] border border-[#262b3c] rounded-xl px-3 py-2 text-zinc-200 focus:outline-none focus:border-amber-500/50 font-mono text-[11px]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNewCharacterModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold hover:brightness-110"
                >
                  Save Character
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. NEW SCENE MODAL */}
      {newSceneModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-none">
          <div className="bg-[#10121a] border border-[#272b3c] rounded-2xl w-full max-w-lg p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setNewSceneModalOpen(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-base font-bold text-white mb-1 flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              Add Storyboard Scene
            </h2>
            <p className="text-xs text-zinc-400 mb-4">
              Sequence a new cinematic camera beat with custom lighting and location parameters.
            </p>

            <form onSubmit={handleCreateScene} className="space-y-3.5 text-xs">
              <div>
                <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                  Scene Title
                </label>
                <input
                  type="text"
                  required
                  value={sceneName}
                  onChange={(e) => setSceneName(e.target.value)}
                  placeholder="e.g. Scene 04: The Rooftop Confrontation"
                  className="w-full bg-[#161824] border border-[#262b3c] rounded-xl px-3 py-2 text-zinc-200 focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={sceneLocation}
                    onChange={(e) => setSceneLocation(e.target.value)}
                    placeholder="e.g. Neon Chinatown Alley"
                    className="w-full bg-[#161824] border border-[#262b3c] rounded-xl px-3 py-2 text-zinc-200"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                    Time of Day
                  </label>
                  <input
                    type="text"
                    value={sceneTime}
                    onChange={(e) => setSceneTime(e.target.value)}
                    placeholder="e.g. Midnight Rain"
                    className="w-full bg-[#161824] border border-[#262b3c] rounded-xl px-3 py-2 text-zinc-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                    Camera Movement
                  </label>
                  <input
                    type="text"
                    value={sceneCamera}
                    onChange={(e) => setSceneCamera(e.target.value)}
                    placeholder="e.g. 50mm Anamorphic Low-Angle Pan"
                    className="w-full bg-[#161824] border border-[#262b3c] rounded-xl px-3 py-2 text-zinc-200"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                    Lighting
                  </label>
                  <input
                    type="text"
                    value={sceneLighting}
                    onChange={(e) => setSceneLighting(e.target.value)}
                    placeholder="e.g. Neon sign reflections, chiaroscuro"
                    className="w-full bg-[#161824] border border-[#262b3c] rounded-xl px-3 py-2 text-zinc-200"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                  Cinematic Screenplay Prompt
                </label>
                <textarea
                  rows={2}
                  value={scenePrompt}
                  onChange={(e) => setScenePrompt(e.target.value)}
                  placeholder="Detailed generation prompt describing action, wardrobe, atmosphere..."
                  className="w-full bg-[#161824] border border-[#262b3c] rounded-xl px-3 py-2 text-zinc-200 focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNewSceneModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold hover:brightness-110"
                >
                  Add Scene
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
