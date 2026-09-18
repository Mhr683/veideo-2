import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Download,
  Star,
  Copy,
  Trash2,
  Share2,
  Paperclip,
  Check,
  Camera,
  Layers,
  Sparkles,
  Maximize2,
  Volume2,
  VolumeX,
  Activity,
} from 'lucide-react';
import { useStudio } from '../context/StudioContext';

export const MediaViewerModal: React.FC = () => {
  const {
    viewingMedia,
    setViewingMedia,
    toggleFavorite,
    trashMedia,
    setPromptText,
    setReferenceMediaUrl,
    setActiveTab,
    notify,
  } = useStudio();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(8);
  const [isMuted, setIsMuted] = useState(false);
  const [isLooping, setIsLooping] = useState(true);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  useEffect(() => {
    if (viewingMedia?.type === 'video') {
      setCurrentTime(0);
      setIsPlaying(true);
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(() => {
          if (videoRef.current) {
            videoRef.current.muted = true;
            setIsMuted(true);
            videoRef.current.play().catch(() => setIsPlaying(false));
          }
        });
      }
    }
  }, [viewingMedia?.id, viewingMedia?.url]);

  if (!viewingMedia) return null;

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
      }
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current && videoRef.current.duration) {
      setDuration(videoRef.current.duration);
    } else if (viewingMedia.duration) {
      setDuration(viewingMedia.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setCurrentTime(val);
    if (videoRef.current) {
      videoRef.current.currentTime = val;
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
    setIsMuted((m) => !m);
  };

  const handleRestart = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const formatTime = (secs: number) => {
    const s = Math.floor(secs || 0);
    const m = Math.floor(s / 60);
    const rem = s % 60;
    return `${String(m).padStart(2, '0')}:${String(rem).padStart(2, '0')}`;
  };

  const handleCopyPrompt = () => {
    if (viewingMedia.prompt) {
      navigator.clipboard.writeText(viewingMedia.prompt);
      setCopiedPrompt(true);
      notify('Prompt copied to clipboard', 'info');
      setTimeout(() => setCopiedPrompt(false), 2000);
    }
  };

  const handleUseAsReference = () => {
    setReferenceMediaUrl(viewingMedia.url);
    if (viewingMedia.prompt) {
      setPromptText(viewingMedia.prompt);
    }
    setViewingMedia(null);
    setActiveTab('canvas');
    notify('Loaded asset into Canvas as visual reference', 'success');
  };

  const handleDownload = () => {
    const isVideo = viewingMedia.type === 'video';
    const ext = isVideo ? 'mp4' : 'jpg';
    const a = document.createElement('a');
    a.href = viewingMedia.url;
    a.download = `${viewingMedia.title.replace(/\s+/g, '_')}_render.${ext}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    notify(`Download started (${ext.toUpperCase()})`, 'info');
  };

  return (
    <div
      id="media-viewer-modal"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-6 select-none"
    >
      <div className="bg-[#0e1017] border border-[#262b3d] rounded-2xl w-full max-w-6xl h-[90vh] flex flex-col md:flex-row overflow-hidden shadow-2xl">
        {/* Main Viewport Left Side */}
        <div className="flex-1 bg-black flex flex-col justify-between relative overflow-hidden">
          {/* Top Floating Header */}
          <div className="absolute top-0 inset-x-0 p-4 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-between z-10">
            <div className="flex items-center gap-2">
              <span className={`text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded border ${
                viewingMedia.type === 'video'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
              }`}>
                {viewingMedia.type === 'video' ? 'AI VIDEO (1080P)' : 'IMAGE'}
              </span>
              <span className="text-xs text-white font-medium truncate max-w-sm">
                {viewingMedia.title}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleFavorite(viewingMedia.id)}
                className={`p-2 rounded-lg bg-black/60 backdrop-blur-sm transition-colors ${
                  viewingMedia.favorite ? 'text-amber-400 fill-amber-400' : 'text-zinc-300 hover:text-white'
                }`}
              >
                <Star className="w-4 h-4" />
              </button>
              <button
                onClick={handleDownload}
                className="p-2 rounded-lg bg-black/60 text-zinc-300 hover:text-white backdrop-blur-sm cursor-pointer"
                title="Download Media File"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewingMedia(null)}
                className="p-2 rounded-lg bg-black/60 text-zinc-300 hover:text-white backdrop-blur-sm cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Media Center Stage */}
          <div className="flex-1 flex items-center justify-center p-4 relative overflow-hidden bg-black">
            {viewingMedia.type === 'video' ? (
              <video
                ref={videoRef}
                key={viewingMedia.id + viewingMedia.url}
                src={viewingMedia.url}
                poster={viewingMedia.thumbnail}
                autoPlay
                playsInline
                muted={isMuted}
                loop={isLooping}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onClick={togglePlay}
                className="max-h-full max-w-full object-contain rounded-lg shadow-2xl cursor-pointer"
              />
            ) : (
              <img
                src={viewingMedia.url}
                alt={viewingMedia.title}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1600&q=80';
                }}
                className="max-h-full max-w-full object-contain rounded-lg shadow-2xl"
              />
            )}
          </div>

          {/* Bottom Player Bar (if video) */}
          {viewingMedia.type === 'video' && (
            <div className="p-3 bg-[#0a0c12] border-t border-[#1c202e] flex flex-col gap-2">
              {/* Scrubbing timeline */}
              <div className="flex items-center gap-3 w-full">
                <input
                  type="range"
                  min={0}
                  max={duration || 8}
                  step={0.1}
                  value={currentTime}
                  onChange={handleSeek}
                  className="flex-1 h-1.5 bg-[#232737] accent-amber-500 rounded-lg cursor-pointer"
                />
                <span className="text-[11px] font-mono text-zinc-400 whitespace-nowrap">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={togglePlay}
                    className="p-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold transition-colors cursor-pointer"
                    title={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? <Pause className="w-4 h-4 fill-black" /> : <Play className="w-4 h-4 fill-black" />}
                  </button>

                  <button
                    onClick={handleRestart}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    title="Restart from beginning"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>

                  <button
                    onClick={toggleMute}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    title={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    24 FPS • 1080P
                  </span>
                  <button
                    onClick={() => setIsLooping((l) => !l)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors cursor-pointer ${
                      isLooping ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    Loop: {isLooping ? 'ON' : 'OFF'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Inspector Sidebar Right Side */}
        <div className="w-full md:w-80 lg:w-96 bg-[#0e1017] border-t md:border-t-0 md:border-l border-[#1f2331] p-5 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                Asset Metadata
              </span>
              <h2 className="text-base font-bold text-white mt-0.5">{viewingMedia.title}</h2>
              <div className="text-[11px] text-zinc-500 font-mono mt-0.5">
                Created: {viewingMedia.createdAt}
              </div>
            </div>

            {/* Prompt Box with One-Click Copy */}
            {viewingMedia.prompt && (
              <div className="p-3 rounded-xl bg-[#141622] border border-[#232737] space-y-2">
                <div className="flex items-center justify-between text-[11px] text-zinc-400">
                  <span className="font-semibold text-amber-400">Director Prompt:</span>
                  <button
                    onClick={handleCopyPrompt}
                    className="flex items-center gap-1 text-[10px] text-zinc-400 hover:text-white"
                  >
                    {copiedPrompt ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    <span>{copiedPrompt ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <p className="text-xs text-zinc-200 leading-relaxed font-light">
                  {viewingMedia.prompt}
                </p>
              </div>
            )}

            {/* Kinetic Action Choreography */}
            {viewingMedia.detectedActions && viewingMedia.detectedActions.length > 0 && (
              <div className="p-3 rounded-xl bg-[#141622] border border-[#232737] space-y-2">
                <div className="flex items-center justify-between text-[11px] text-zinc-400">
                  <span className="font-semibold text-amber-400 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-amber-400" />
                    Action Choreography
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500">
                    {viewingMedia.detectedActions.length} Action{viewingMedia.detectedActions.length > 1 ? 's' : ''}
                  </span>
                </div>
                <div className="space-y-1.5">
                  {viewingMedia.detectedActions.map((act, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-1.5 rounded-lg bg-[#0e1017] border border-[#1b1e2a] text-xs"
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="text-amber-400 font-bold capitalize">{act.type}</span>
                        {act.bodyParts && act.bodyParts.length > 0 && (
                          <span className="text-[10px] text-zinc-500">({act.bodyParts.join(', ')})</span>
                        )}
                      </div>
                      <span className="text-[10px] font-mono text-zinc-400 bg-[#161924] px-1.5 py-0.5 rounded">
                        {act.start}s – {act.end}s
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Technical Specifications */}
            <div className="space-y-2 text-xs bg-[#12141e] p-3 rounded-xl border border-[#202436]">
              <div className="flex justify-between py-1 border-b border-[#1b1f2e]">
                <span className="text-zinc-500">AI Model</span>
                <span className="font-mono text-zinc-200">{viewingMedia.model || 'Veo 3.1 Pro'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#1b1f2e]">
                <span className="text-zinc-500">Aspect Ratio</span>
                <span className="font-mono text-zinc-200">{viewingMedia.aspectRatio}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#1b1f2e]">
                <span className="text-zinc-500">Resolution</span>
                <span className="font-mono text-zinc-200">{viewingMedia.resolution || '1080p'}</span>
              </div>
              {viewingMedia.cameraMovement && (
                <div className="flex justify-between py-1 border-b border-[#1b1f2e]">
                  <span className="text-zinc-500">Camera</span>
                  <span className="text-amber-300 font-mono">{viewingMedia.cameraMovement}</span>
                </div>
              )}
              {viewingMedia.style && (
                <div className="flex justify-between py-1 border-b border-[#1b1f2e]">
                  <span className="text-zinc-500">Style</span>
                  <span className="text-zinc-200">{viewingMedia.style}</span>
                </div>
              )}
              <div className="flex justify-between py-1">
                <span className="text-zinc-500">Credit Cost</span>
                <span className="text-amber-400 font-bold">{viewingMedia.cost || 5} Credits</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-4 border-t border-[#1f2331]">
            <button
              onClick={handleUseAsReference}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-110 text-black font-bold text-xs flex items-center justify-center gap-1.5 shadow"
            >
              <Paperclip className="w-3.5 h-3.5" />
              <span>Use as Visual Reference in Studio</span>
            </button>

            <button
              onClick={() => {
                trashMedia(viewingMedia.id);
                setViewingMedia(null);
              }}
              className="w-full py-2 rounded-xl bg-[#171924] hover:bg-rose-500/10 text-rose-400 border border-[#252837] hover:border-rose-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Move to Trash</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
