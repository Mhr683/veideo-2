import React, { useState, useRef, useEffect } from 'react';
import {
  LayoutGrid,
  Play,
  Pause,
  Plus,
  ArrowUp,
  ArrowDown,
  Download,
  Film,
  Camera,
  Layers,
  Sparkles,
  Share2,
  Trash2,
  Clock,
  GripVertical,
  X,
  Volume2,
  VolumeX,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';
import { useStudio } from '../context/StudioContext';
import { Scene } from '../types';

export const StoryboardView: React.FC = () => {
  const {
    scenes,
    reorderScenes,
    setActiveSceneId,
    setActiveTab,
    setViewingMedia,
    setNewSceneModalOpen,
    notify,
  } = useStudio();

  // Full reel player modal state
  const [isPlayingFullSequence, setIsPlayingFullSequence] = useState(false);
  const [currentPlayingIndex, setCurrentPlayingIndex] = useState(0);
  const [reelPaused, setReelPaused] = useState(false);
  const [draggedSceneIndex, setDraggedSceneIndex] = useState<number | null>(null);

  const totalRuntimeSeconds = scenes.reduce((acc, s) => acc + (s.duration || 8), 0);

  // Auto advance during reel playback
  useEffect(() => {
    let timer: any;
    if (isPlayingFullSequence && !reelPaused) {
      const currentScene = scenes[currentPlayingIndex];
      const durationMs = (currentScene?.duration || 8) * 1000;

      timer = setTimeout(() => {
        if (currentPlayingIndex < scenes.length - 1) {
          setCurrentPlayingIndex((prev) => prev + 1);
        } else {
          setIsPlayingFullSequence(false);
          setCurrentPlayingIndex(0);
          notify('Reel playback completed!', 'success');
        }
      }, Math.min(durationMs, 8000));
    }
    return () => clearTimeout(timer);
  }, [isPlayingFullSequence, currentPlayingIndex, reelPaused, scenes]);

  const handleStartReel = () => {
    if (scenes.length === 0) {
      notify('No scenes in storyboard to play', 'error');
      return;
    }
    setCurrentPlayingIndex(0);
    setReelPaused(false);
    setIsPlayingFullSequence(true);
    notify(`Starting playback of ${scenes.length} sequence shots`, 'info');
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(scenes, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `visionforge_storyboard_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    notify('Storyboard exported as JSON screenplay', 'success');
  };

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedSceneIndex(index);
    e.dataTransfer.setData('text/plain', String(index));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedSceneIndex === null || draggedSceneIndex === targetIndex) {
      setDraggedSceneIndex(null);
      return;
    }
    reorderScenes(draggedSceneIndex, targetIndex);
    setDraggedSceneIndex(null);
    notify(`Moved Scene ${draggedSceneIndex + 1} to position ${targetIndex + 1}`, 'info');
  };

  return (
    <div id="storyboard-view" className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-[#0a0b10] text-zinc-100 select-none">
      {/* Top Header & Metrics */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#1c202e]">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-amber-400" />
            Storyboard & Timeline Sequencer
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Drag and reorder narrative beats, check cinematic flow, and play back the full multi-shot reel.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="px-3 py-1.5 rounded-lg bg-[#141622] border border-[#242838] flex items-center gap-2 text-xs font-mono text-zinc-300">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Total Runtime: 0:{totalRuntimeSeconds.toString().padStart(2, '0')}</span>
          </div>

          <button
            onClick={handleStartReel}
            disabled={scenes.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-110 text-black font-bold text-xs shadow-md disabled:opacity-50 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-black" />
            <span>Play Sequence Reel</span>
          </button>

          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1a1d2b] hover:bg-[#23273a] border border-[#2b3044] text-xs font-semibold text-zinc-200"
            title="Export Screenplay & Metadata"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>

          <button
            onClick={() => setNewSceneModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1e2232] hover:bg-[#282d40] border border-[#2c3248] text-xs font-semibold text-zinc-200"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Beat</span>
          </button>
        </div>
      </div>

      {/* Storyboard Sequential Cards Horizontal / Vertical Timeline */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {scenes.map((scene, index) => {
          const isDragging = draggedSceneIndex === index;
          return (
            <div
              key={scene.id}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
              className={`rounded-2xl overflow-hidden bg-[#11131c] border flex flex-col justify-between transition-all duration-200 shadow-lg cursor-grab active:cursor-grabbing ${
                isDragging
                  ? 'opacity-40 border-amber-500 border-dashed scale-95'
                  : 'border-[#212536] hover:border-zinc-600'
              }`}
            >
              {/* Scene Visual Thumbnail / Preview */}
              <div
                className="relative aspect-video bg-black group overflow-hidden"
                onClick={() => {
                  if (scene.generatedImageUrl || scene.generatedVideoUrl) {
                    setViewingMedia({
                      id: scene.id,
                      title: scene.name,
                      type: scene.generatedVideoUrl ? 'video' : 'image',
                      source: 'generated',
                      url: scene.generatedVideoUrl || scene.generatedImageUrl!,
                      thumbnail: scene.generatedImageUrl || scene.generatedVideoUrl!,
                      createdAt: 'Storyboard Render',
                      prompt: scene.prompt,
                      model: 'Veo 3.1 Pro',
                      aspectRatio: '16:9',
                      status: 'completed',
                      favorite: false,
                      trashed: false,
                      duration: scene.duration || 8,
                      cameraMovement: scene.camera,
                    });
                  } else {
                    setActiveSceneId(scene.id);
                    setActiveTab('scenes');
                  }
                }}
              >
                {scene.generatedImageUrl || scene.generatedVideoUrl ? (
                  <img
                    src={scene.generatedImageUrl || scene.generatedVideoUrl}
                    alt={scene.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-[#0d0e14] text-zinc-600 p-4 text-center">
                    <Film className="w-8 h-8 mb-2 opacity-50 text-zinc-500" />
                    <span className="text-xs font-semibold text-zinc-400">Draft Scene</span>
                    <span className="text-[10px] text-zinc-600 mt-0.5">Click to render clip</span>
                  </div>
                )}

                {/* Drag Handle Indicator */}
                <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/80 backdrop-blur-md px-2 py-0.5 rounded text-[11px] font-mono font-bold text-amber-400 border border-white/10">
                  <GripVertical className="w-3 h-3 text-zinc-400" />
                  <span>BEAT {String(index + 1).padStart(2, '0')}</span>
                </div>

                <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-mono text-zinc-300 border border-white/10">
                  {scene.duration || 8}s
                </div>
              </div>

              {/* Scene Card Body */}
              <div className="p-3.5 flex flex-col justify-between flex-1 space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-xs text-white truncate">{scene.name}</h3>
                    <span className="text-[10px] text-zinc-400 font-mono">{scene.timeOfDay}</span>
                  </div>

                  <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                    {scene.prompt || scene.description}
                  </p>
                </div>

                <div className="space-y-1.5 text-[10px] bg-[#0c0e15] p-2 rounded-lg border border-[#1d202e]">
                  <div className="flex justify-between text-zinc-400">
                    <span className="text-zinc-500">Camera:</span>
                    <span className="truncate max-w-[140px] text-amber-300/90 font-mono">
                      {scene.camera}
                    </span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span className="text-zinc-500">Lighting:</span>
                    <span className="truncate max-w-[140px] text-zinc-300">{scene.lighting}</span>
                  </div>
                </div>

                {/* Card Controls & Reordering */}
                <div className="flex items-center justify-between pt-2 border-t border-[#1c202e] text-xs">
                  <div className="flex items-center gap-1">
                    <button
                      disabled={index === 0}
                      onClick={() => {
                        reorderScenes(index, index - 1);
                        notify(`Moved "${scene.name}" earlier in storyboard`, 'info');
                      }}
                      className="p-1 rounded text-zinc-500 hover:text-white disabled:opacity-30 hover:bg-[#1a1d2b] transition-colors"
                      title="Move Earlier"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      disabled={index === scenes.length - 1}
                      onClick={() => {
                        reorderScenes(index, index + 1);
                        notify(`Moved "${scene.name}" later in storyboard`, 'info');
                      }}
                      className="p-1 rounded text-zinc-500 hover:text-white disabled:opacity-30 hover:bg-[#1a1d2b] transition-colors"
                      title="Move Later"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      setActiveSceneId(scene.id);
                      setActiveTab('scenes');
                      notify(`Loaded "${scene.name}" into Scene Director`, 'info');
                    }}
                    className="text-amber-400 hover:underline font-semibold text-[11px]"
                  >
                    Edit Scene →
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* FULL SEQUENCE REEL CINEMATIC PLAYER MODAL */}
      {isPlayingFullSequence && scenes[currentPlayingIndex] && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-50 flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-4xl flex items-center justify-between pb-3 text-white">
            <div className="flex items-center gap-3">
              <span className="text-xs uppercase font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                Shot {currentPlayingIndex + 1} of {scenes.length}
              </span>
              <h2 className="text-sm sm:text-base font-bold text-white">
                {scenes[currentPlayingIndex].name}
              </h2>
            </div>

            <button
              onClick={() => setIsPlayingFullSequence(false)}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Film Viewport */}
          <div className="relative w-full max-w-4xl aspect-video rounded-2xl overflow-hidden border border-[#2a3045] bg-black shadow-2xl">
            {scenes[currentPlayingIndex].generatedVideoUrl ? (
              <video
                src={scenes[currentPlayingIndex].generatedVideoUrl}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
                poster={scenes[currentPlayingIndex].generatedImageUrl}
              />
            ) : (
              <img
                src={scenes[currentPlayingIndex].generatedImageUrl || 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1600&q=80'}
                alt=""
                className="w-full h-full object-cover animate-pulse"
              />
            )}

            {/* Sequence Overlay */}
            <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between bg-black/70 backdrop-blur-md p-3 rounded-xl border border-white/10">
              <div>
                <p className="text-xs text-zinc-200 line-clamp-1 italic">
                  "{scenes[currentPlayingIndex].prompt}"
                </p>
                <div className="flex items-center gap-2 mt-1 text-[10px] text-zinc-400 font-mono">
                  <span>Camera: {scenes[currentPlayingIndex].camera}</span>
                  <span>•</span>
                  <span>Light: {scenes[currentPlayingIndex].lighting}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {currentPlayingIndex > 0 && (
                  <button
                    onClick={() => setCurrentPlayingIndex((p) => p - 1)}
                    className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold"
                  >
                    ← Prev
                  </button>
                )}
                <button
                  onClick={() => setReelPaused((p) => !p)}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-colors"
                >
                  {reelPaused ? 'Resume' : 'Pause'}
                </button>
                {currentPlayingIndex < scenes.length - 1 && (
                  <button
                    onClick={() => setCurrentPlayingIndex((p) => p + 1)}
                    className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold"
                  >
                    Next Shot →
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Timeline progress indicator */}
          <div className="w-full max-w-4xl flex items-center gap-1.5 mt-4">
            {scenes.map((s, idx) => (
              <div
                key={s.id}
                onClick={() => setCurrentPlayingIndex(idx)}
                className={`h-1.5 flex-1 rounded-full cursor-pointer transition-all ${
                  idx === currentPlayingIndex
                    ? 'bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]'
                    : idx < currentPlayingIndex
                    ? 'bg-amber-600/60'
                    : 'bg-zinc-800'
                }`}
                title={`Shot ${idx + 1}: ${s.name}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
