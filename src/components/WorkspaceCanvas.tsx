import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Maximize2,
  Download,
  Star,
  Sparkles,
  Clapperboard,
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize,
  ChevronLeft,
  ChevronRight,
  Volume2,
  VolumeX,
  Repeat,
  Share2,
  Film,
  Camera,
  Plus,
  Loader2,
  X,
  SlidersHorizontal,
  Split,
  RefreshCw,
  Activity,
  Zap,
} from 'lucide-react';
import { useStudio } from '../context/StudioContext';
import { MediaItem } from '../types';

export const WorkspaceCanvas: React.FC = () => {
  const {
    activeProject,
    scenes,
    activeSceneId,
    setActiveSceneId,
    mediaList,
    viewingMedia,
    setViewingMedia,
    activeCanvasMedia,
    setActiveCanvasMedia,
    toggleFavorite,
    promptText,
    setPromptText,
    updateSettings,
    startGeneration,
    activeJobs,
    cancelJob,
    createScene,
    updateScene,
    notify,
  } = useStudio();

  const activeJob = activeJobs.find((j) => j.status === 'processing' || j.status === 'queued');
  const activeScene = scenes.find((s) => s.id === activeSceneId);
  const projectMedia = mediaList.filter((m) => !m.trashed);

  const activeMediaItem = activeCanvasMedia || viewingMedia;

  // Active display media index
  const currentMediaIndex = activeMediaItem
    ? projectMedia.findIndex((m) => m.id === activeMediaItem.id)
    : 0;

  const displayMedia: MediaItem | null =
    activeMediaItem ||
    (activeScene?.generatedVideoUrl || activeScene?.generatedImageUrl
      ? {
          id: 'scene_preview',
          title: activeScene.name,
          type: activeScene.generatedVideoUrl ? 'video' : 'image',
          source: 'generated',
          url: activeScene.generatedVideoUrl || activeScene.generatedImageUrl!,
          thumbnail: activeScene.generatedImageUrl || activeScene.generatedVideoUrl!,
          createdAt: 'Scene Render',
          prompt: activeScene.prompt,
          model: 'Veo 3.1 Pro',
          aspectRatio: '16:9',
          resolution: '1080p',
          duration: activeScene.duration || 8,
          cost: 30,
          status: 'completed',
          favorite: false,
          trashed: false,
          cameraMovement: activeScene.camera,
          style: 'Cinematic Film',
          detectedActions: activeScene.actions,
          motionIntensity: activeScene.motionIntensity,
        }
      : projectMedia[0] || null);

  // Video and Canvas State
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(displayMedia?.duration || 8);
  const [isMuted, setIsMuted] = useState(true);
  const [volume, setVolume] = useState(0.8);
  const [isLooping, setIsLooping] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isFit, setIsFit] = useState(true);
  const [showCompare, setShowCompare] = useState(false);
  const [compareSplit, setCompareSplit] = useState(50);

  // Sync video duration & reset playback on media change
  useEffect(() => {
    if (displayMedia?.duration) {
      setVideoDuration(displayMedia.duration);
    }
    setCurrentTime(0);
    setZoomLevel(1);
    setIsFit(true);
    if (displayMedia?.type === 'video' && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    } else {
      setIsPlaying(false);
    }
  }, [displayMedia?.id, displayMedia?.url]);

  // Video event listeners
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      if (videoRef.current.duration && !isNaN(videoRef.current.duration)) {
        setVideoDuration(Math.round(videoRef.current.duration));
      }
    }
  };

  const handleSeek = (time: number) => {
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    if (videoRef.current) {
      videoRef.current.volume = newVol;
      videoRef.current.muted = newVol === 0;
      setIsMuted(newVol === 0);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      const nextMuted = !isMuted;
      videoRef.current.muted = nextMuted;
      setIsMuted(nextMuted);
    }
  };

  const handleFullscreen = () => {
    const el = document.getElementById('workspace-canvas-viewport');
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const handlePrevMedia = () => {
    if (projectMedia.length <= 1) return;
    const prevIdx = currentMediaIndex <= 0 ? projectMedia.length - 1 : currentMediaIndex - 1;
    const item = projectMedia[prevIdx];
    setActiveCanvasMedia(item);
    notify(`Switched to: ${item.title}`, 'info');
  };

  const handleNextMedia = () => {
    if (projectMedia.length <= 1) return;
    const nextIdx = currentMediaIndex >= projectMedia.length - 1 ? 0 : currentMediaIndex + 1;
    const item = projectMedia[nextIdx];
    setActiveCanvasMedia(item);
    notify(`Switched to: ${item.title}`, 'info');
  };

  const handleDownload = () => {
    if (!displayMedia) return;
    const a = document.createElement('a');
    a.href = displayMedia.url;
    a.download = `${displayMedia.title.replace(/\s+/g, '_')}_VisionForge.${displayMedia.type === 'video' ? 'mp4' : 'jpg'}`;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    notify(`Download started for "${displayMedia.title}"`, 'success');
  };

  const handleAddToStoryboard = () => {
    if (!displayMedia) return;
    createScene({
      name: displayMedia.title || `Scene ${scenes.length + 1}`,
      prompt: displayMedia.prompt,
      location: 'Exterior Studio Stage',
      timeOfDay: 'Night',
      lighting: 'Cinematic rim lighting',
      camera: displayMedia.cameraMovement || 'Dolly Tracking',
      action: 'Character moves through frame with temporal consistency.',
      duration: displayMedia.duration || 8,
      generatedImageUrl: displayMedia.thumbnail || displayMedia.url,
      generatedVideoUrl: displayMedia.type === 'video' ? displayMedia.url : undefined,
    });
    notify(`Added "${displayMedia.title}" to Storyboard!`, 'success');
  };

  const handleRegenerate = () => {
    if (!displayMedia) return;
    setPromptText(displayMedia.prompt || '');
    updateSettings({
      mediaType: displayMedia.type === 'video' ? 'video' : 'image',
      model: displayMedia.model,
      aspectRatio: displayMedia.aspectRatio as any,
    });
    notify(`Regenerating shot: "${displayMedia.title}"...`, 'info');
    startGeneration();
  };

  return (
    <div id="workspace-canvas" className="flex-1 flex flex-col min-h-0 bg-[#07080c] relative overflow-hidden select-none">
      {/* Top Scene Sequence Timeline Ribbon */}
      <div className="h-11 border-b border-[#1b1e2b] bg-[#0c0e15] px-4 flex items-center justify-between gap-4 shrink-0 overflow-x-auto">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase text-zinc-500 flex items-center gap-1.5 shrink-0">
            <Layers className="w-3.5 h-3.5 text-amber-500" />
            Scenes:
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            {scenes.map((sc, index) => {
              const isActive = sc.id === activeSceneId;
              return (
                <button
                  key={sc.id}
                  id={`canvas-scene-pill-${sc.id}`}
                  onClick={() => {
                    setActiveSceneId(sc.id);
                    if (sc.prompt) setPromptText(sc.prompt);
                  }}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/40 shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#151824]'
                  }`}
                >
                  <span className="text-[10px] text-zinc-500 font-mono">0{index + 1}</span>
                  <span>{sc.name}</span>
                  {sc.status === 'rendered' && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Media format & count */}
        {displayMedia && (
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] font-mono text-zinc-400 bg-[#141622] px-2 py-0.5 rounded border border-[#222636]">
              {displayMedia.type === 'video' ? 'VIDEO 8S' : 'IMAGE'} • {displayMedia.aspectRatio} • {displayMedia.resolution || '1080p'}
            </span>
          </div>
        )}
      </div>

      {/* Main Canvas Viewport Area */}
      <div
        id="workspace-canvas-viewport"
        className="flex-1 flex items-center justify-center p-3 sm:p-6 overflow-hidden relative"
      >
        {/* GENERATION IN-PROGRESS ACTIVE CARD OVERLAY */}
        {activeJob ? (
          <div className="w-full max-w-lg p-6 rounded-2xl bg-[#0f111a]/95 border border-amber-500/40 backdrop-blur-xl shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-300 z-30">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <Loader2 className="w-5 h-5 animate-spin" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">Synthesizing Scene</span>
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {activeJob.status}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 font-mono mt-0.5">
                    Model: {activeJob.model} • {activeJob.duration || 8}s • {activeJob.cost} Credits
                  </p>
                </div>
              </div>

              <button
                onClick={() => cancelJob(activeJob.id)}
                className="p-1.5 text-zinc-400 hover:text-rose-400 rounded-lg hover:bg-white/5 transition-colors"
                title="Cancel Generation"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Prompt preview */}
            <div className="p-3 rounded-xl bg-[#090a0f] border border-[#1d2130] text-xs text-zinc-300 font-light italic line-clamp-2">
              "{activeJob.prompt}"
            </div>

            {/* Progress Bar & Percentage */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-zinc-400">Neural Rendering:</span>
                <span className="text-amber-400 font-bold">{activeJob.progress}%</span>
              </div>
              <div className="w-full bg-[#181a26] h-2.5 rounded-full overflow-hidden p-0.5 border border-[#262c3e]">
                <div
                  className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400 h-full rounded-full transition-all duration-300 shadow-[0_0_12px_rgba(245,158,11,0.5)]"
                  style={{ width: `${Math.max(activeJob.progress, 6)}%` }}
                />
              </div>
            </div>

            {/* Status Footer */}
            <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-1">
              <span>Temporal consistency check passed</span>
              <button
                onClick={() => cancelJob(activeJob.id)}
                className="text-zinc-400 hover:text-white underline"
              >
                Abort
              </button>
            </div>
          </div>
        ) : displayMedia ? (
          /* ACTIVE MEDIA PLAYER VIEWPORT */
          <div
            className={`relative max-h-full max-w-full rounded-2xl overflow-hidden border border-[#222636] shadow-2xl bg-[#0b0c12] group flex flex-col justify-center items-center ${
              displayMedia.aspectRatio === '9:16'
                ? 'aspect-[9/16] h-[75vh]'
                : displayMedia.aspectRatio === '1:1'
                ? 'aspect-square h-[70vh]'
                : displayMedia.aspectRatio === '4:3'
                ? 'aspect-[4/3] h-[70vh]'
                : displayMedia.aspectRatio === '3:4'
                ? 'aspect-[3/4] h-[75vh]'
                : 'aspect-video w-[92%] max-w-4xl'
            }`}
          >
            {/* Visual Canvas (Video / Image) */}
            <div className="w-full h-full relative overflow-hidden bg-black flex items-center justify-center">
              {displayMedia.type === 'video' ? (
                <video
                  ref={videoRef}
                  key={displayMedia.id + displayMedia.url}
                  src={displayMedia.url}
                  poster={displayMedia.thumbnail || displayMedia.url}
                  autoPlay
                  playsInline
                  muted={isMuted}
                  loop={isLooping}
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={() => {
                    if (videoRef.current?.duration && !isNaN(videoRef.current.duration)) {
                      setVideoDuration(Math.round(videoRef.current.duration));
                    }
                  }}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onEnded={() => {
                    if (isLooping) {
                      videoRef.current?.play();
                    } else {
                      setIsPlaying(false);
                    }
                  }}
                  className={`w-full h-full object-cover transition-transform duration-200 cursor-pointer ${
                    !isFit ? 'object-contain' : 'object-cover'
                  }`}
                  style={{ transform: `scale(${zoomLevel})` }}
                  onClick={togglePlay}
                />
              ) : (
                <img
                  src={displayMedia.url}
                  alt={displayMedia.title}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1600&q=80';
                  }}
                  className={`w-full h-full object-cover transition-transform duration-200 ${
                    !isFit ? 'object-contain' : 'object-cover'
                  }`}
                  style={{ transform: `scale(${zoomLevel})` }}
                />
              )}

              {/* Compare Split View Mode */}
              {showCompare && (
                <div
                  className="absolute inset-y-0 left-0 overflow-hidden border-r-2 border-amber-400 bg-black pointer-events-none"
                  style={{ width: `${compareSplit}%` }}
                >
                  <img
                    src={displayMedia.thumbnail || 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1600&q=80'}
                    alt="Original"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-4 left-4 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded text-[10px] text-zinc-300 font-mono">
                    Original
                  </span>
                </div>
              )}

              {/* Cinematic Vignette */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/30 pointer-events-none" />

              {/* Media Controls Toolbar Top-Right */}
              <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-md p-1 rounded-xl border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                <button
                  onClick={() => setZoomLevel((z) => Math.min(z + 0.25, 2.5))}
                  className="p-1.5 text-zinc-300 hover:text-white rounded hover:bg-white/10"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setZoomLevel((z) => Math.max(z - 0.25, 0.75))}
                  className="p-1.5 text-zinc-300 hover:text-white rounded hover:bg-white/10"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    setZoomLevel(1);
                    setIsFit(true);
                  }}
                  className="p-1.5 text-zinc-300 hover:text-white rounded hover:bg-white/10"
                  title="Reset Zoom / Fit"
                >
                  <Maximize className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setShowCompare((c) => !c)}
                  className={`p-1.5 rounded hover:bg-white/10 ${showCompare ? 'text-amber-400 font-bold' : 'text-zinc-300'}`}
                  title="Compare Mode"
                >
                  <Split className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleFullscreen}
                  className="p-1.5 text-zinc-300 hover:text-white rounded hover:bg-white/10"
                  title="Fullscreen"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Prev / Next Navigation Arrows */}
              {projectMedia.length > 1 && (
                <>
                  <button
                    onClick={handlePrevMedia}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    title="Previous Shot"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleNextMedia}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    title="Next Shot"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}

              {/* Metadata Overlay & Quick Action Buttons */}
              <div className="absolute bottom-16 left-4 right-4 flex items-end justify-between pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                <div className="max-w-lg">
                  <h4 className="text-white text-sm font-bold tracking-wide truncate drop-shadow">
                    {displayMedia.title}
                  </h4>
                  <p className="text-zinc-300 text-xs line-clamp-2 mt-0.5 font-light drop-shadow">
                    {displayMedia.prompt}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-black/70 text-zinc-300 border border-white/10">
                      {displayMedia.model}
                    </span>
                    {displayMedia.cameraMovement && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/70 text-amber-300 border border-white/10 flex items-center gap-1">
                        <Camera className="w-3 h-3" />
                        {displayMedia.cameraMovement}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 pointer-events-auto">
                  <button
                    onClick={() => toggleFavorite(displayMedia.id)}
                    className={`p-2 rounded-lg backdrop-blur-md transition-colors ${
                      displayMedia.favorite
                        ? 'bg-amber-500 text-black'
                        : 'bg-black/70 text-zinc-200 hover:bg-black/90'
                    }`}
                    title="Favorite Shot"
                  >
                    <Star className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleAddToStoryboard}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-black/70 hover:bg-black/90 text-zinc-200 text-xs backdrop-blur-md border border-white/10 transition-colors"
                    title="Add Shot to Storyboard"
                  >
                    <Plus className="w-3.5 h-3.5 text-amber-400" />
                    <span>Storyboard</span>
                  </button>
                  <button
                    onClick={handleRegenerate}
                    className="p-2 rounded-lg bg-black/70 text-zinc-200 hover:bg-black/90 backdrop-blur-md transition-colors"
                    title="Regenerate with same settings"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleDownload}
                    className="p-2 rounded-lg bg-black/70 text-zinc-200 hover:bg-black/90 backdrop-blur-md transition-colors"
                    title="Download Shot"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Video Player Scrubber & Controls with Action Choreography Track */}
            {displayMedia.type === 'video' && (
              <div className="w-full bg-[#0c0e15] border-t border-[#1e2230] px-3 py-2 space-y-1.5 shrink-0 z-20">
                {/* Real-time Kinetic Action Choreography Ribbon */}
                {displayMedia.detectedActions && displayMedia.detectedActions.length > 0 && (
                  <div className="flex items-center justify-between gap-2 px-1 text-[11px]">
                    <div className="flex items-center gap-1.5 font-mono text-amber-300 truncate">
                      <Activity className="w-3.5 h-3.5 text-amber-400 shrink-0 animate-pulse" />
                      <span className="text-zinc-500 uppercase text-[10px] font-bold">Current Action:</span>
                      {(() => {
                        const activeAct = displayMedia.detectedActions.find(
                          (a) => currentTime >= a.start && currentTime <= a.end
                        );
                        if (activeAct) {
                          return (
                            <span className="font-semibold text-amber-200">
                              {activeAct.type.toUpperCase()}{' '}
                              {activeAct.bodyParts && activeAct.bodyParts.length > 0
                                ? `(${activeAct.bodyParts.join(', ')})`
                                : ''}
                            </span>
                          );
                        }
                        return <span className="text-zinc-400 italic">Cinematic Movement / Camera Motion</span>;
                      })()}
                    </div>

                    <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                      {displayMedia.detectedActions.map((act, i) => {
                        const isCurrent = currentTime >= act.start && currentTime <= act.end;
                        return (
                          <button
                            key={i}
                            type="button"
                            onClick={() => handleSeek(act.start)}
                            className={`px-2 py-0.5 rounded text-[10px] font-mono transition-all cursor-pointer ${
                              isCurrent
                                ? 'bg-amber-500 text-black font-bold shadow-sm'
                                : 'bg-[#1a1e2b] text-zinc-400 hover:text-zinc-200 hover:bg-[#252a3d]'
                            }`}
                            title={`Jump to ${act.type} (${act.start}s - ${act.end}s)`}
                          >
                            {act.type} {act.start}s-{act.end}s
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Scrubber Controls Row */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={togglePlay}
                    className="p-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold hover:brightness-110 shadow cursor-pointer"
                  >
                    {isPlaying ? (
                      <Pause className="w-3.5 h-3.5 fill-black" />
                    ) : (
                      <Play className="w-3.5 h-3.5 fill-black" />
                    )}
                  </button>

                  <div className="flex-1 flex items-center gap-2 relative">
                    <input
                      type="range"
                      min="0"
                      max={videoDuration}
                      step="0.05"
                      value={currentTime}
                      onChange={(e) => handleSeek(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-[#232737] rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />
                  </div>

                  <div className="text-[11px] font-mono text-zinc-400 shrink-0">
                    {Math.floor(currentTime / 60).toString().padStart(2, '0')}:
                    {Math.floor(currentTime % 60).toString().padStart(2, '0')} /{' '}
                    {Math.floor(videoDuration / 60).toString().padStart(2, '0')}:
                    {Math.floor(videoDuration % 60).toString().padStart(2, '0')}
                  </div>

                  {/* Audio controls */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={toggleMute}
                      className="p-1 text-zinc-400 hover:text-zinc-200"
                      title={isMuted ? 'Unmute' : 'Mute'}
                    >
                      {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={isMuted ? 0 : volume}
                      onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                      className="w-14 h-1 bg-[#232737] rounded-lg appearance-none cursor-pointer accent-amber-500 hidden sm:block"
                    />
                  </div>

                  {/* Loop toggle */}
                  <button
                    onClick={() => setIsLooping((l) => !l)}
                    className={`p-1 rounded ${isLooping ? 'text-amber-400' : 'text-zinc-500 hover:text-zinc-300'}`}
                    title="Loop playback"
                  >
                    <Repeat className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleSeek(0)}
                    className="p-1 text-zinc-400 hover:text-zinc-200"
                    title="Restart from beginning"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* EMPTY STATE (Exactly matches user specification) */
          <div className="text-center max-w-xl p-8 rounded-2xl bg-[#0f1118]/90 border border-[#212637] shadow-2xl backdrop-blur-md">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4 shadow-lg shadow-amber-950/20">
              <Clapperboard className="w-7 h-7" />
            </div>

            <h3 className="text-xl font-extrabold text-white mb-1.5 tracking-tight">
              Create something amazing
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 mb-6 leading-relaxed max-w-md mx-auto">
              Describe your scene and generate your first shot.
            </p>

            {/* Prompt Starter Chip */}
            <div className="mb-4">
              <span className="text-[11px] uppercase font-bold text-amber-400/90 block mb-2 tracking-wider">
                Click Prompt Starter
              </span>
              <button
                onClick={() => {
                  setPromptText('A young man walking through a rainy city at night, cinematic lighting, realistic camera movement.');
                  updateSettings({ mediaType: 'video', duration: 8, style: 'Cinematic' });
                }}
                className="w-full p-3.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 hover:border-amber-500/50 text-left transition-all group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-amber-300 group-hover:underline flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    Recommended Cinema Starter:
                  </span>
                  <span className="text-[10px] font-mono uppercase bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded">
                    8s Video
                  </span>
                </div>
                <p className="text-xs text-zinc-300 font-light">
                  "A young man walking through a rainy city at night, cinematic lighting, realistic camera movement."
                </p>
              </button>
            </div>

            {/* Quick Concept Presets Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left pt-2 border-t border-[#1b1f2e]">
              <button
                onClick={() => {
                  setPromptText('Cyberpunk courier sprinting across rain-slicked skybridge under neon billboards, 35mm anamorphic.');
                  updateSettings({ mediaType: 'video', duration: 8, style: 'Sci-Fi' });
                }}
                className="p-2.5 rounded-xl bg-[#141723] hover:bg-[#1a1e2d] border border-[#24293a] text-xs text-zinc-200 transition-colors"
              >
                <div className="font-semibold text-amber-400 flex items-center justify-between">
                  <span>Cyberpunk Skybridge</span>
                  <span className="text-[10px] text-zinc-500 font-mono">VIDEO</span>
                </div>
                <div className="text-[11px] text-zinc-400 line-clamp-1 mt-1 font-light">
                  Cyberpunk courier sprinting across skybridge...
                </div>
              </button>

              <button
                onClick={() => {
                  setPromptText('Drone shot descending into a misty mountain pine forest with golden hour lighting and volumetric rays.');
                  updateSettings({ mediaType: 'video', duration: 8, style: 'Documentary' });
                }}
                className="p-2.5 rounded-xl bg-[#141723] hover:bg-[#1a1e2d] border border-[#24293a] text-xs text-zinc-200 transition-colors"
              >
                <div className="font-semibold text-amber-400 flex items-center justify-between">
                  <span>Mountain Pine Aerial</span>
                  <span className="text-[10px] text-zinc-500 font-mono">VIDEO</span>
                </div>
                <div className="text-[11px] text-zinc-400 line-clamp-1 mt-1 font-light">
                  Drone shot descending into misty mountain forest...
                </div>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
