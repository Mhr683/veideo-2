import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Play,
  Sparkles,
  Camera,
  Sun,
  MapPin,
  Clock,
  Users,
  Film,
  Trash2,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Copy,
  Sliders,
} from 'lucide-react';
import { useStudio } from '../context/StudioContext';
import { Scene } from '../types';

export const ScenesView: React.FC = () => {
  const {
    scenes,
    activeSceneId,
    setActiveSceneId,
    createScene,
    updateScene,
    deleteScene,
    characters,
    setNewSceneModalOpen,
    setActiveTab,
    setPromptText,
    updateSettings,
    startGeneration,
    setViewingMedia,
  } = useStudio();

  const selectedScene = scenes.find((s) => s.id === activeSceneId) || scenes[0];

  const handleGenerateMediaForScene = (scene: Scene, type: 'image' | 'video') => {
    setActiveSceneId(scene.id);
    setPromptText(scene.prompt);
    updateSettings({
      mediaType: type,
      cameraMovement: (scene.camera as any) || 'Pan Right',
      duration: (scene.duration === 10 ? 10 : scene.duration === 15 ? 15 : 5),
    });
    setActiveTab('canvas');
  };

  return (
    <div id="scenes-view" className="flex-1 overflow-hidden flex flex-col md:flex-row bg-[#0a0b10] text-zinc-100 select-none">
      {/* Left List of Scenes */}
      <div className="w-full md:w-80 lg:w-96 border-r border-[#1c202e] flex flex-col h-full bg-[#0d0f16]">
        <div className="p-4 border-b border-[#1c202e] flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              Scenes ({scenes.length})
            </h2>
            <p className="text-[11px] text-zinc-400">Sequential film breakdown</p>
          </div>

          <button
            onClick={() => setNewSceneModalOpen(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-110 text-black font-bold text-xs shadow"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Add Scene</span>
          </button>
        </div>

        {/* Scene Cards Column */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {scenes.map((scene, index) => {
            const isCurrent = scene.id === selectedScene?.id;
            return (
              <div
                key={scene.id}
                onClick={() => setActiveSceneId(scene.id)}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  isCurrent
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-100 shadow-md'
                    : 'bg-[#12141d] border-[#202434] text-zinc-300 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-amber-400">
                      #{String(index + 1).padStart(2, '0')}
                    </span>
                    <h4 className="font-bold text-xs text-white truncate max-w-[170px]">
                      {scene.name}
                    </h4>
                  </div>

                  <span
                    className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-mono font-bold ${
                      scene.status === 'rendered'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : scene.status === 'generating'
                        ? 'bg-amber-500/20 text-amber-400 animate-pulse'
                        : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {scene.status}
                  </span>
                </div>

                <p className="text-[11px] text-zinc-400 line-clamp-1 mb-2">
                  {scene.description}
                </p>

                <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-1.5 border-t border-[#1b1e2c]">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {scene.location}
                  </span>
                  <span>{scene.duration}s</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Scene Inspector / Detailed Editor */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[#090a0f]">
        {selectedScene ? (
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Top Bar of Inspector */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#1d2130]">
              <div>
                <span className="text-xs font-mono text-amber-400 uppercase font-bold">
                  Scene #{selectedScene.order}
                </span>
                <input
                  type="text"
                  value={selectedScene.name}
                  onChange={(e) => updateScene(selectedScene.id, { name: e.target.value })}
                  className="block text-xl font-extrabold text-white bg-transparent border-b border-transparent hover:border-zinc-700 focus:border-amber-500 focus:outline-none mt-1"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleGenerateMediaForScene(selectedScene, 'image')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#181a26] hover:bg-[#202434] border border-[#272c3d] text-xs font-semibold text-zinc-200"
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                  <span>Gen Image</span>
                </button>

                <button
                  onClick={() => handleGenerateMediaForScene(selectedScene, 'video')}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-110 text-black font-bold text-xs shadow"
                >
                  <Film className="w-3.5 h-3.5" />
                  <span>Gen Video (30c)</span>
                </button>

                <button
                  onClick={() => deleteScene(selectedScene.id)}
                  className="p-2 text-zinc-500 hover:text-rose-400 rounded-lg"
                  title="Delete Scene"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Generated Visual Preview Card */}
            {selectedScene.generatedImageUrl && (
              <div className="rounded-2xl overflow-hidden bg-black border border-[#212536] relative aspect-video group">
                <img
                  src={selectedScene.generatedImageUrl}
                  alt={selectedScene.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end justify-between p-4">
                  <div>
                    <span className="text-xs font-bold text-white">Active Shot Render</span>
                    <p className="text-[11px] text-zinc-300 font-mono">{selectedScene.camera}</p>
                  </div>
                  <button
                    onClick={() => {
                      setViewingMedia({
                        id: selectedScene.id,
                        title: selectedScene.name,
                        type: selectedScene.generatedVideoUrl ? 'video' : 'image',
                        source: 'generated',
                        url: selectedScene.generatedVideoUrl || selectedScene.generatedImageUrl!,
                        thumbnail: selectedScene.generatedImageUrl!,
                        createdAt: 'Render',
                        prompt: selectedScene.prompt,
                        model: 'Veo 3.1 Cinema',
                        aspectRatio: '16:9',
                        status: 'completed',
                        favorite: false,
                        trashed: false,
                      });
                    }}
                    className="px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur-md text-xs font-semibold text-white"
                  >
                    View Fullscreen
                  </button>
                </div>
              </div>
            )}

            {/* Scene Description & Screenplay Prompt */}
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase text-zinc-400 block mb-1.5">
                  Cinematic Prompt / Screenplay Direction
                </label>
                <textarea
                  rows={3}
                  value={selectedScene.prompt}
                  onChange={(e) => updateScene(selectedScene.id, { prompt: e.target.value })}
                  className="w-full bg-[#12141e] border border-[#222637] rounded-xl p-3 text-xs sm:text-sm text-zinc-200 focus:outline-none focus:border-amber-500/50"
                  placeholder="Describe camera framing, light direction, character movement, action..."
                />
              </div>

              {/* Grid of Scene Directives */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl bg-[#12141e] border border-[#222637] space-y-3 text-xs">
                  <div className="font-bold text-amber-300 flex items-center gap-1.5 text-xs">
                    <MapPin className="w-3.5 h-3.5" />
                    Environment & Setting
                  </div>

                  <div>
                    <span className="text-[11px] text-zinc-400 block mb-1">Location:</span>
                    <input
                      type="text"
                      value={selectedScene.location}
                      onChange={(e) => updateScene(selectedScene.id, { location: e.target.value })}
                      className="w-full bg-[#181b28] border border-[#2a2f44] rounded-lg px-2.5 py-1.5 text-zinc-200"
                    />
                  </div>

                  <div>
                    <span className="text-[11px] text-zinc-400 block mb-1">Time of Day:</span>
                    <input
                      type="text"
                      value={selectedScene.timeOfDay}
                      onChange={(e) => updateScene(selectedScene.id, { timeOfDay: e.target.value })}
                      className="w-full bg-[#181b28] border border-[#2a2f44] rounded-lg px-2.5 py-1.5 text-zinc-200"
                    />
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#12141e] border border-[#222637] space-y-3 text-xs">
                  <div className="font-bold text-amber-300 flex items-center gap-1.5 text-xs">
                    <Camera className="w-3.5 h-3.5" />
                    Camera & Optics
                  </div>

                  <div>
                    <span className="text-[11px] text-zinc-400 block mb-1">Camera Movement:</span>
                    <input
                      type="text"
                      value={selectedScene.camera}
                      onChange={(e) => updateScene(selectedScene.id, { camera: e.target.value })}
                      className="w-full bg-[#181b28] border border-[#2a2f44] rounded-lg px-2.5 py-1.5 text-zinc-200"
                    />
                  </div>

                  <div>
                    <span className="text-[11px] text-zinc-400 block mb-1">Lighting Setup:</span>
                    <input
                      type="text"
                      value={selectedScene.lighting}
                      onChange={(e) => updateScene(selectedScene.id, { lighting: e.target.value })}
                      className="w-full bg-[#181b28] border border-[#2a2f44] rounded-lg px-2.5 py-1.5 text-zinc-200"
                    />
                  </div>
                </div>
              </div>

              {/* Characters Assigned in Scene */}
              <div className="p-4 rounded-xl bg-[#12141e] border border-[#222637]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-amber-400" />
                    Cast & Characters in Scene
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {characters.map((c) => {
                    const isAssigned = selectedScene.characterIds?.includes(c.id);
                    return (
                      <button
                        key={c.id}
                        onClick={() => {
                          const newIds = isAssigned
                            ? (selectedScene.characterIds || []).filter((id) => id !== c.id)
                            : [...(selectedScene.characterIds || []), c.id];
                          updateScene(selectedScene.id, { characterIds: newIds });
                        }}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                          isAssigned
                            ? 'bg-amber-500/20 text-amber-200 border border-amber-500/40'
                            : 'bg-[#181b28] text-zinc-400 border border-[#282d3f] hover:text-zinc-200'
                        }`}
                      >
                        <img src={c.avatarUrl} className="w-4 h-4 rounded-full object-cover" alt="" />
                        <span>{c.name}</span>
                        {isAssigned && <span className="text-amber-400 font-bold">✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center p-12 text-zinc-500">Select or create a scene to inspect.</div>
        )}
      </div>
    </div>
  );
};
