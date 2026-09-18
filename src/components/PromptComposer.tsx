import React, { useState, useRef, useEffect } from 'react';
import {
  Wand2,
  Sparkles,
  Clapperboard,
  Image as ImageIcon,
  Paperclip,
  Users,
  ChevronUp,
  ChevronDown,
  X,
  Play,
  RotateCcw,
  Check,
  AlertCircle,
  AlertTriangle,
  ExternalLink,
  Loader2,
  Activity,
  Flame,
  Zap,
  Eye,
  Camera,
  Film,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import { useStudio } from '../context/StudioContext';

export const PromptComposer: React.FC = () => {
  const {
    promptText,
    setPromptText,
    negativePrompt,
    setNegativePrompt,
    referenceMediaUrl,
    setReferenceMediaUrl,
    isEnhancingPrompt,
    enhancePrompt,
    settings,
    updateSettings,
    characters,
    selectedCharacterIds,
    toggleCharacterSelection,
    activeJobs,
    startGeneration,
    cancelJob,
    extractActionsFromPrompt,
    credits,
    setUploadModalOpen,
    notify,
  } = useStudio();

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const quickIdeas = [
    { label: '🏎️ 15s Sports Car Multi-Shot', prompt: 'A cinematic 15-second shot of a powerful sports car driving through a modern city at night after heavy rain. The wet road reflects colorful neon signs and street lights. Start with a low-angle close-up of the front wheel moving through a small puddle, then smoothly transition into a side tracking shot as the car accelerates through the empty street. End with a wide aerial shot showing the glowing city skyline and the car disappearing into the distance. Realistic reflections, natural motion, atmospheric fog, dramatic cinematic lighting, shallow depth of field, smooth camera movement, photorealistic, ultra-detailed, realistic physics, movie-quality cinematography, 16:9, no text, no watermark.' },
    { label: '🌧️ Karachi Rain Scene', prompt: 'Cinematic slow motion shot of a man walking through neon rain in Karachi streets at night, reflective wet asphalt, volumetric mist, anamorphic lens flare, Kodak 5219 film grain.' },
    { label: '🌊 Emerald Ocean Sunset', prompt: 'Sweeping drone flyover over turquoise ocean waves crashing against dramatic sea cliffs at golden hour sunset, volumetric sea spray, 4K HDR.' },
    { label: '🤖 Cyberpunk Alley Encounter', prompt: 'Sci-fi detective examining floating holographic data fragments in a dimly lit rainy neon alleyway, cinematic rim lighting, photorealistic detail.' },
  ];

  const handleGenerateClick = () => {
    if (activeJob) return;
    if (!promptText.trim()) {
      notify('Please enter a prompt or click one of the quick suggestions above to generate video!', 'warning');
      textareaRef.current?.focus();
      return;
    }
    startGeneration();
  };

  const [expandedNegative, setExpandedNegative] = useState(false);
  const [characterPickerOpen, setCharacterPickerOpen] = useState(false);
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  const [aspectDropdownOpen, setAspectDropdownOpen] = useState(false);
  const [styleDropdownOpen, setStyleDropdownOpen] = useState(false);
  const [cameraDropdownOpen, setCameraDropdownOpen] = useState(false);
  const [motionIntensityOpen, setMotionIntensityOpen] = useState(false);
  const [characterAnimOpen, setCharacterAnimOpen] = useState(false);
  const [isAnalyzingActions, setIsAnalyzingActions] = useState(false);
  const [detectedActionPreview, setDetectedActionPreview] = useState<any>(null);
  const [showActionDrawer, setShowActionDrawer] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeJob = activeJobs.find((j) => j.status === 'processing' || j.status === 'queued');
  const [dismissedFailedId, setDismissedFailedId] = useState<string | null>(null);
  const latestFailedJob = activeJobs.find((j) => j.status === 'failed' && j.id !== dismissedFailedId);

  const isVideo = settings.mediaType === 'video';
  const duration = settings.duration || 8;
  const creditCost = isVideo ? (duration >= 16 ? 50 : duration >= 12 ? 40 : duration <= 4 ? 20 : 30) : 5;
  const isInsufficientCredits = credits < creditCost;

  // Real generation stages definition
  const GENERATION_STAGES = [
    { key: 'analyzing_prompt', label: 'Analyzing prompt', short: 'Prompt', minProgress: 15 },
    { key: 'detecting_characters', label: 'Detecting characters', short: 'Characters', minProgress: 25 },
    { key: 'detecting_actions', label: 'Detecting actions', short: 'Actions', minProgress: 40 },
    { key: 'building_motion_instructions', label: 'Building motion instructions', short: 'Motion', minProgress: 55 },
    { key: 'submitting_video_generation', label: 'Submitting video generation', short: 'Submit', minProgress: 65 },
    { key: 'generating_video', label: 'Generating video', short: 'Generate', minProgress: 75 },
    { key: 'retrieving_video', label: 'Retrieving video', short: 'Retrieve', minProgress: 88 },
    { key: 'validating_video', label: 'Validating video', short: 'Validate', minProgress: 95 },
  ];

  const handleAnalyzeActions = async () => {
    if (!promptText.trim()) return;
    setIsAnalyzingActions(true);
    try {
      const data = await extractActionsFromPrompt();
      if (data && data.success) {
        setDetectedActionPreview(data);
        setShowActionDrawer(true);
        notify(`Parsed ${data.actions.length} action(s) for character choreography!`, 'success');
      }
    } catch (err) {
      console.warn('Action extraction error:', err);
    } finally {
      setIsAnalyzingActions(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setReferenceMediaUrl(url);
    }
  };

  const selectedCharacters = characters.filter((c) => selectedCharacterIds.includes(c.id));

  const videoModels = [
    { id: 'Studio Demo Preview', name: 'Studio Demo Preview (Zero Quota)', provider: 'VisionForge' },
    { id: 'Veo 3.1 Pro', name: 'Veo 3.1 Pro (Cinema 1080p)', provider: 'Google' },
    { id: 'Veo 3.1 Lite', name: 'Veo 3.1 Lite (Fast)', provider: 'Google' },
    { id: 'Runway Gen-3', name: 'Runway Gen-3 Alpha', provider: 'Runway' },
    { id: 'Luma Dream', name: 'Luma Dream Machine', provider: 'Luma' },
    { id: 'Sora 2 Turbo', name: 'Sora 2 Turbo Studio', provider: 'OpenAI' },
  ];

  const imageModels = [
    { id: 'Gemini Image Ultra', name: 'Gemini 3.1 Flash Image Ultra (4K)', provider: 'Google' },
    { id: 'Gemini Flash Image', name: 'Gemini 3.1 Flash Lite Image', provider: 'Google' },
    { id: 'Flux.1 Dev', name: 'Flux.1 Dev (Photoreal)', provider: 'Black Forest' },
    { id: 'DALL-E 3', name: 'DALL-E 3 HD', provider: 'OpenAI' },
    { id: 'SD 3.5 Ultra', name: 'Stable Diffusion 3.5 Ultra', provider: 'Stability' },
  ];

  const stylePresets = [
    'Cinematic',
    'Photorealistic',
    'Anime',
    '3D Animation',
    'Documentary',
    'Commercial',
    'Sci-Fi',
    'Fantasy',
  ];

  const cameraOptions = ['Auto', 'Static', 'Cinematic', 'Dynamic'] as const;
  const motionLevels = ['Subtle', 'Natural', 'Dynamic'] as const;
  const characterAnimOptions = ['Auto', 'On', 'Off'] as const;

  const currentModels = isVideo ? videoModels : imageModels;

  const aspectRatios = isVideo
    ? (['16:9', '9:16', '1:1', '4:3', '3:4'] as const)
    : (['16:9', '4:3', '1:1', '3:4', '9:16'] as const);

  return (
    <div
      id="prompt-composer"
      className="w-full bg-[#11131a]/95 backdrop-blur-md border-t border-[#1f2331] p-3 sm:p-4 z-20 shrink-0"
    >
      <div className="max-w-5xl mx-auto space-y-2.5">
        {/* Active Generation Multi-Stage Progress Banner */}
        {activeJob && (
          <div className="p-3 rounded-xl bg-[#141824] border border-amber-500/40 shadow-xl space-y-2.5 animate-in fade-in duration-300">
            {/* Header: Stage status and cancel button */}
            <div className="flex items-center justify-between gap-3 text-xs flex-wrap">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-amber-400 animate-spin shrink-0" />
                <span className="font-semibold text-amber-300">
                  {activeJob.type === 'video' ? 'Action-Based Video Generation' : 'Image Generation'}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold">
                  {activeJob.model}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-mono text-amber-300 font-bold text-xs">
                  {activeJob.progress}%
                </span>
                <button
                  type="button"
                  onClick={() => cancelJob(activeJob.id)}
                  className="px-2.5 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-[10px] text-zinc-300 hover:text-white transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>

            {/* Stage Progress Bar */}
            <div className="w-full bg-[#1e2230] h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${activeJob.progress}%` }}
              />
            </div>

            {/* 8 Real Generation Stages Breadcrumbs */}
            {activeJob.type === 'video' && (
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-1 text-center">
                {GENERATION_STAGES.map((stg) => {
                  const isDone = (activeJob.progress || 0) >= stg.minProgress;
                  const isCurrent = activeJob.stage === stg.key;
                  return (
                    <div
                      key={stg.key}
                      className={`px-1 py-1 rounded text-[10px] truncate transition-all ${
                        isCurrent
                          ? 'bg-amber-500/30 text-amber-300 font-bold border border-amber-500/60 shadow-sm'
                          : isDone
                          ? 'bg-emerald-500/15 text-emerald-300 font-medium'
                          : 'bg-[#181a24] text-zinc-600'
                      }`}
                      title={stg.label}
                    >
                      <span className="hidden md:inline">{stg.label}</span>
                      <span className="md:hidden">{stg.short}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Current Stage Message */}
            <div className="flex items-center justify-between text-[11px] text-zinc-300 px-1 pt-0.5 flex-wrap gap-2">
              <div className="flex items-center gap-1.5 font-mono text-amber-200/90 truncate">
                <Activity className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="truncate">
                  {activeJob.stageMessage || 'Processing neural action pipeline...'}
                </span>
              </div>

              {/* Detected Actions Badges in Job */}
              {activeJob.detectedActions && activeJob.detectedActions.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-zinc-500 text-[10px] uppercase font-mono">Actions:</span>
                  {activeJob.detectedActions.map((act, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded bg-[#1e2332] text-amber-300 text-[10px] font-mono border border-amber-500/20"
                    >
                      {act.action || act.type} ({act.startTime || act.start}s-{act.endTime || act.end}s)
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Failed Job Banner */}
        {latestFailedJob && !activeJob && (() => {
          const errMsg = latestFailedJob.error || '';
          const isQuota =
            errMsg.includes('429') ||
            errMsg.includes('quota') ||
            errMsg.includes('RESOURCE_EXHAUSTED') ||
            errMsg.includes('rate-limits');

          return (
            <div
              className={`p-3.5 rounded-xl border shadow-xl space-y-2.5 text-xs ${
                isQuota
                  ? 'bg-[#181308] border-amber-500/50 text-amber-200'
                  : 'bg-red-950/40 border-red-500/50 text-red-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-semibold">
                  {isQuota ? (
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  )}
                  <span className={isQuota ? 'text-amber-300 font-bold' : 'text-red-400'}>
                    {isQuota ? 'Google Veo Generation Quota Exceeded (429)' : 'Video Generation Failed'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setDismissedFailedId(latestFailedJob.id)}
                  className="text-zinc-400 hover:text-zinc-200 text-xs px-2 py-0.5 rounded hover:bg-zinc-800/50"
                >
                  Dismiss
                </button>
              </div>

              <div
                className={`p-2.5 rounded-lg border font-mono text-[11px] break-words ${
                  isQuota
                    ? 'bg-[#120e06] border-amber-500/30 text-amber-300/90'
                    : 'bg-red-950/60 border-red-500/20 text-red-300'
                }`}
              >
                {errMsg || 'Video generation failed. Please verify provider configuration.'}
              </div>

              {isQuota && (
                <div className="flex items-center justify-between gap-2 pt-1 flex-wrap">
                  <div className="text-[11px] text-zinc-300 max-w-lg">
                    Your Gemini API key has exceeded video generation quota or is on a tier without Veo access. You can test your character choreography and timeline in Studio Demo Preview mode without consuming API quota.
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href="https://ai.google.dev/gemini-api/docs/rate-limits"
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-medium inline-flex items-center gap-1 border border-zinc-700"
                    >
                      <span>Quota Info</span>
                      <ExternalLink className="w-3 h-3 text-zinc-400" />
                    </a>
                    <button
                      type="button"
                      onClick={() => {
                        updateSettings({ demoMode: true, model: 'Studio Demo Preview' });
                        setDismissedFailedId(latestFailedJob.id);
                        notify('Switched to Studio Demo Preview! Generating video preview...', 'info');
                        setTimeout(() => {
                          startGeneration();
                        }, 250);
                      }}
                      className="px-3 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-semibold text-xs shadow-md transition-all inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Run in Studio Demo Preview</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* Selected Characters Anchor Tags Bar */}
        {selectedCharacters.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap text-xs">
            <span className="text-[11px] text-zinc-400 flex items-center gap-1">
              <Users className="w-3 h-3 text-amber-400" />
              Character Consistency Locked:
            </span>
            {selectedCharacters.map((char) => (
              <span
                key={char.id}
                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#1b1f2b] border border-amber-500/30 text-amber-200 text-[11px]"
              >
                <img src={char.avatarUrl} className="w-3.5 h-3.5 rounded-full object-cover" alt="" />
                <span>{char.name}</span>
                <button
                  type="button"
                  onClick={() => toggleCharacterSelection(char.id)}
                  className="text-zinc-400 hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Reference File Pill */}
        {referenceMediaUrl && (
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#191c28] border border-[#262c3e] text-xs text-zinc-300">
            <img src={referenceMediaUrl} className="w-4 h-4 rounded object-cover" alt="Reference" />
            <span className="text-[11px]">Visual Reference Loaded</span>
            <button
              type="button"
              onClick={() => setReferenceMediaUrl(null)}
              className="text-zinc-400 hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Quick Ideas Inspiration Bar & Mode Selector */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-0.5 no-scrollbar">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <span className="text-[10px] uppercase font-bold text-zinc-500 shrink-0 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              Quick Ideas:
            </span>
            {quickIdeas.map((idea, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setPromptText(idea.prompt);
                  updateSettings({ mediaType: 'video' });
                  notify(`Prompt filled: ${idea.label}`, 'info');
                  textareaRef.current?.focus();
                }}
                className="text-[11px] px-2.5 py-1 rounded-full bg-[#161824] hover:bg-amber-500/20 text-zinc-300 hover:text-amber-300 border border-[#232737] hover:border-amber-500/40 shrink-0 transition-colors cursor-pointer"
              >
                {idea.label}
              </button>
            ))}
          </div>

          {/* Engine Mode Toggle */}
          <button
            type="button"
            onClick={() => {
              const nextDemo = !settings.demoMode;
              updateSettings({
                demoMode: nextDemo,
                model: nextDemo ? 'Studio Demo Preview' : 'Veo 3.1 Pro',
              });
              notify(
                nextDemo
                  ? 'Studio Demo Preview active (zero API quota used)'
                  : 'Live Google Veo engine active',
                'info'
              );
            }}
            className={`shrink-0 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border transition-colors cursor-pointer ${
              settings.demoMode
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                : 'bg-[#141824] text-zinc-400 border-zinc-700/60 hover:text-zinc-200'
            }`}
            title={
              settings.demoMode
                ? 'Currently in Studio Demo Preview mode (zero quota). Click to switch to Live Veo.'
                : 'Currently in Live Veo AI mode. Click to switch to Studio Demo Preview (zero quota needed).'
            }
          >
            <Sparkles className={`w-3 h-3 ${settings.demoMode ? 'text-amber-400' : 'text-zinc-500'}`} />
            <span>{settings.demoMode ? 'Demo Preview: Active' : 'Live Veo Engine'}</span>
          </button>
        </div>

        {/* Action Choreography Drawer / Preview */}
        {showActionDrawer && detectedActionPreview && (
          <div className="p-2.5 rounded-xl bg-[#0e111a] border border-amber-500/30 text-xs space-y-1.5 animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-semibold text-amber-300 text-[11px]">
                <Activity className="w-3.5 h-3.5 text-amber-400" />
                <span>Detected Physical Actions & Kinetic Timeline:</span>
              </div>
              <button
                type="button"
                onClick={() => setShowActionDrawer(false)}
                className="text-zinc-500 hover:text-zinc-300"
              >
                ✕
              </button>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {detectedActionPreview.actions.map((act: any, i: number) => (
                <div
                  key={i}
                  className="px-2.5 py-1 rounded-lg bg-[#161a26] border border-amber-500/30 text-zinc-200 text-[11px] flex items-center gap-1.5"
                >
                  <span className="text-amber-400 font-bold uppercase text-[10px]">{act.type}</span>
                  <span className="text-zinc-400">[{act.start}s - {act.end}s]</span>
                  {act.bodyParts && act.bodyParts.length > 0 && (
                    <span className="text-zinc-500 text-[10px]">({act.bodyParts.join(', ')})</span>
                  )}
                </div>
              ))}
            </div>

            {detectedActionPreview.motionInstructions && (
              <p className="text-[10px] text-zinc-400 font-mono italic">
                Motion Spec: "{detectedActionPreview.motionInstructions.slice(0, 140)}..."
              </p>
            )}
          </div>
        )}

        {/* Primary Prompt Input Box */}
        <div className="relative rounded-xl bg-[#0b0c11] border border-[#232737] focus-within:border-amber-500/50 focus-within:ring-1 focus-within:ring-amber-500/30 transition-all shadow-inner">
          <textarea
            ref={textareaRef}
            id="prompt-input-textarea"
            rows={2}
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            onKeyDown={(e) => {
              if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                handleGenerateClick();
              }
            }}
            placeholder="What would you like to create? (e.g. Create a cinematic scene of a man walking through Karachi streets during rain, looking around at neon lights...)"
            className="w-full bg-transparent px-3.5 py-2.5 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none resize-none leading-relaxed"
          />

          {/* Prompt Box Toolbar Controls */}
          <div className="flex items-center justify-between px-3 py-2 border-t border-[#1b1e2a] bg-[#0e1017]/80 rounded-b-xl gap-2 flex-wrap">
            {/* Left Controls: Media Type, Models, Ratio, References, Motion Controls */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              {/* Image vs Video Toggle */}
              <div className="flex items-center bg-[#171a25] rounded-lg p-0.5 border border-[#252a3b]">
                <button
                  type="button"
                  onClick={() => updateSettings({ mediaType: 'image' })}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                    !isVideo
                      ? 'bg-amber-500 text-black shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <ImageIcon className="w-3 h-3" />
                  <span>Image</span>
                </button>
                <button
                  type="button"
                  onClick={() => updateSettings({ mediaType: 'video' })}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                    isVideo
                      ? 'bg-amber-500 text-black shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Clapperboard className="w-3 h-3" />
                  <span>Video</span>
                </button>
              </div>

              {/* Model Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setModelDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#161823] border border-[#242939] hover:border-zinc-700 text-xs text-zinc-300 font-medium"
                >
                  <span className="truncate max-w-[120px] sm:max-w-[150px]">{settings.model}</span>
                  <ChevronDown className="w-3 h-3 text-zinc-500" />
                </button>

                {modelDropdownOpen && (
                  <div className="absolute left-0 bottom-full mb-1.5 w-64 rounded-xl bg-[#141620] border border-[#272b38] shadow-2xl p-1.5 z-50 text-xs">
                    <div className="text-[10px] uppercase font-bold text-zinc-400 px-2 py-1">
                      {isVideo ? 'Action-Capable Video Models' : 'Image Generation Models'}
                    </div>
                    {currentModels.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          const isDemo = m.id === 'Studio Demo Preview';
                          updateSettings({
                            model: m.id,
                            demoMode: isDemo,
                          });
                          setModelDropdownOpen(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between ${
                          settings.model === m.id
                            ? 'bg-amber-500/20 text-amber-300 font-medium'
                            : 'text-zinc-300 hover:bg-[#1f2332]'
                        }`}
                      >
                        <div className="truncate">
                          <div className="truncate font-medium">{m.name}</div>
                          <div className="text-[10px] text-zinc-500">{m.provider}</div>
                        </div>
                        {settings.model === m.id && <Check className="w-3.5 h-3.5 text-amber-400 shrink-0 ml-1" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Aspect Ratio Pill */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setAspectDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#161823] border border-[#242939] hover:border-zinc-700 text-xs text-zinc-300 font-medium"
                >
                  <span>{settings.aspectRatio}</span>
                  <ChevronDown className="w-3 h-3 text-zinc-500" />
                </button>

                {aspectDropdownOpen && (
                  <div className="absolute left-0 bottom-full mb-1.5 w-28 rounded-xl bg-[#141620] border border-[#272b38] shadow-2xl p-1 z-50 text-xs">
                    {aspectRatios.map((ratio) => (
                      <button
                        key={ratio}
                        type="button"
                        onClick={() => {
                          updateSettings({ aspectRatio: ratio });
                          setAspectDropdownOpen(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between ${
                          settings.aspectRatio === ratio
                            ? 'bg-amber-500/20 text-amber-300 font-medium'
                            : 'text-zinc-300 hover:bg-[#1f2332]'
                        }`}
                      >
                        <span>{ratio}</span>
                        {settings.aspectRatio === ratio && <Check className="w-3 h-3 text-amber-400" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Duration selector for Video (4s, 8s, 12s, 16s - default 8s) */}
              {isVideo && (
                <div className="flex items-center bg-[#171a25] rounded-lg p-0.5 border border-[#252a3b]">
                  {([4, 8, 12, 16] as const).map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => updateSettings({ duration: d })}
                      className={`px-2 py-1 rounded text-[11px] font-semibold transition-all ${
                        settings.duration === d
                          ? 'bg-amber-500/25 text-amber-300 border border-amber-500/40 font-bold'
                          : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                      title={`${d} Seconds Video Duration`}
                    >
                      {d}s
                    </button>
                  ))}
                </div>
              )}

              {/* Motion Intensity Control (for Video) */}
              {isVideo && (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setMotionIntensityOpen((prev) => !prev)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#161823] border border-[#242939] hover:border-zinc-700 text-xs text-amber-300 font-medium"
                    title="Character & Physical Motion Intensity"
                  >
                    <Flame className="w-3 h-3 text-amber-400" />
                    <span>Motion: {settings.motion || 'Natural'}</span>
                    <ChevronDown className="w-3 h-3 text-zinc-500" />
                  </button>

                  {motionIntensityOpen && (
                    <div className="absolute left-0 bottom-full mb-1.5 w-40 rounded-xl bg-[#141620] border border-[#272b38] shadow-2xl p-1 z-50 text-xs">
                      <div className="text-[10px] uppercase font-bold text-zinc-400 px-2 py-1">Motion Intensity</div>
                      {motionLevels.map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => {
                            updateSettings({ motion: lvl });
                            setMotionIntensityOpen(false);
                          }}
                          className={`w-full text-left px-2 py-1.5 rounded-lg flex items-center justify-between ${
                            settings.motion === lvl
                              ? 'bg-amber-500/20 text-amber-300 font-medium'
                              : 'text-zinc-300 hover:bg-[#1f2332]'
                          }`}
                        >
                          <span>{lvl}</span>
                          {settings.motion === lvl && <Check className="w-3 h-3 text-amber-400" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Character Animation Control (for Video) */}
              {isVideo && (
                <div className="relative hidden sm:block">
                  <button
                    type="button"
                    onClick={() => setCharacterAnimOpen((prev) => !prev)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#161823] border border-[#242939] hover:border-zinc-700 text-xs text-zinc-300 font-medium"
                    title="Character Animation Mode"
                  >
                    <Users className="w-3 h-3 text-amber-400" />
                    <span>Anim: {settings.characterAnimation || 'Auto'}</span>
                    <ChevronDown className="w-3 h-3 text-zinc-500" />
                  </button>

                  {characterAnimOpen && (
                    <div className="absolute left-0 bottom-full mb-1.5 w-44 rounded-xl bg-[#141620] border border-[#272b38] shadow-2xl p-1 z-50 text-xs">
                      <div className="text-[10px] uppercase font-bold text-zinc-400 px-2 py-1">Character Animation</div>
                      {characterAnimOptions.map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => {
                            updateSettings({ characterAnimation: opt });
                            setCharacterAnimOpen(false);
                          }}
                          className={`w-full text-left px-2 py-1.5 rounded-lg flex items-center justify-between ${
                            settings.characterAnimation === opt
                              ? 'bg-amber-500/20 text-amber-300 font-medium'
                              : 'text-zinc-300 hover:bg-[#1f2332]'
                          }`}
                        >
                          <span>{opt}</span>
                          {settings.characterAnimation === opt && <Check className="w-3 h-3 text-amber-400" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Camera Motion Dropdown (for Video) */}
              {isVideo && (
                <div className="relative hidden lg:block">
                  <button
                    type="button"
                    onClick={() => setCameraDropdownOpen((prev) => !prev)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#161823] border border-[#242939] hover:border-zinc-700 text-xs text-zinc-300 font-medium"
                    title="Camera Motion Mode"
                  >
                    <Camera className="w-3 h-3 text-zinc-400" />
                    <span className="truncate max-w-[80px]">Camera: {settings.cameraMotion || 'Auto'}</span>
                    <ChevronDown className="w-3 h-3 text-zinc-500" />
                  </button>

                  {cameraDropdownOpen && (
                    <div className="absolute left-0 bottom-full mb-1.5 w-40 rounded-xl bg-[#141620] border border-[#272b38] shadow-2xl p-1 z-50 text-xs">
                      <div className="text-[10px] uppercase font-bold text-zinc-400 px-2 py-1">Camera Motion</div>
                      {cameraOptions.map((cam) => (
                        <button
                          key={cam}
                          type="button"
                          onClick={() => {
                            updateSettings({ cameraMotion: cam, cameraMovement: cam });
                            setCameraDropdownOpen(false);
                          }}
                          className={`w-full text-left px-2 py-1.5 rounded-lg flex items-center justify-between ${
                            (settings.cameraMotion || 'Auto') === cam
                              ? 'bg-amber-500/20 text-amber-300 font-medium'
                              : 'text-zinc-300 hover:bg-[#1f2332]'
                          }`}
                        >
                          <span>{cam}</span>
                          {(settings.cameraMotion || 'Auto') === cam && <Check className="w-3 h-3 text-amber-400" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Action Detection: Automatic Indicator */}
              {isVideo && (
                <div
                  className="hidden md:flex items-center gap-1 px-2 py-1 rounded-lg bg-[#161823] border border-emerald-500/30 text-xs text-emerald-300 font-medium"
                  title="Automatic physical action and gesture detection is active"
                >
                  <Zap className="w-3 h-3 text-emerald-400" />
                  <span>Action Detection: Automatic</span>
                </div>
              )}

              {/* Action Choreography Analyzer Button */}
              {isVideo && (
                <button
                  type="button"
                  onClick={handleAnalyzeActions}
                  disabled={isAnalyzingActions || !promptText.trim()}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#1b1f2e] hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold disabled:opacity-50 transition-all cursor-pointer"
                  title="Detect character actions and physical motion before generating"
                >
                  {isAnalyzingActions ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Activity className="w-3.5 h-3.5 text-amber-400" />
                  )}
                  <span>Actions</span>
                </button>
              )}

              {/* Character Consistency Picker */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setCharacterPickerOpen((prev) => !prev)}
                  className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-colors ${
                    selectedCharacterIds.length > 0
                      ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                      : 'hover:bg-[#1c1f2c] text-zinc-400 hover:text-zinc-200'
                  }`}
                  title="Lock Character Consistency"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Characters</span>
                  {selectedCharacterIds.length > 0 && (
                    <span className="bg-amber-400 text-black text-[10px] font-bold px-1 rounded-full">
                      {selectedCharacterIds.length}
                    </span>
                  )}
                </button>

                {characterPickerOpen && (
                  <div className="absolute left-0 bottom-full mb-1.5 w-64 rounded-xl bg-[#141620] border border-[#272b38] shadow-2xl p-2 z-50 text-xs">
                    <div className="text-[11px] font-semibold text-zinc-300 mb-1 px-1">
                      Preserve Character Consistency:
                    </div>
                    <div className="max-h-48 overflow-y-auto space-y-1">
                      {characters.map((char) => {
                        const isSelected = selectedCharacterIds.includes(char.id);
                        return (
                          <button
                            key={char.id}
                            type="button"
                            onClick={() => toggleCharacterSelection(char.id)}
                            className={`w-full flex items-center justify-between p-1.5 rounded-lg text-left transition-colors ${
                              isSelected
                                ? 'bg-amber-500/20 text-amber-200 border border-amber-500/30'
                                : 'hover:bg-[#1e2230] text-zinc-300'
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <img
                                src={char.avatarUrl}
                                className="w-6 h-6 rounded-full object-cover"
                                alt=""
                              />
                              <div className="truncate">
                                <div className="font-medium truncate">{char.name}</div>
                                <div className="text-[10px] text-zinc-500 truncate">{char.appearance}</div>
                              </div>
                            </div>
                            {isSelected && <Check className="w-3.5 h-3.5 text-amber-400 shrink-0 ml-1" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Upload Reference Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-[#1c1f2c] text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
                title="Upload Reference Image or Video"
              >
                <Paperclip className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reference</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              {/* AI Enhance Prompt Button */}
              <button
                type="button"
                onClick={enhancePrompt}
                disabled={isEnhancingPrompt || !promptText.trim()}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold disabled:opacity-50 transition-all"
                title="AI Director Prompt Optimization"
              >
                {isEnhancingPrompt ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Wand2 className="w-3.5 h-3.5 text-amber-400" />
                )}
                <span>Enhance</span>
              </button>

              {/* Negative Prompt toggle */}
              <button
                type="button"
                onClick={() => setExpandedNegative((prev) => !prev)}
                className="text-[11px] text-zinc-500 hover:text-zinc-300 flex items-center gap-0.5 px-1 py-1"
              >
                <span>Neg</span>
                {expandedNegative ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
              </button>
            </div>

            {/* Right: Primary Generate Button */}
            <div className="flex items-center gap-2">
              {isInsufficientCredits && (
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-rose-400 font-semibold bg-rose-500/10 px-2.5 py-1 rounded-lg border border-rose-500/30">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Insufficient credits ({credits}/{creditCost})
                </span>
              )}
              <button
                id="generate-button"
                type="button"
                onClick={handleGenerateClick}
                disabled={Boolean(activeJob)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs sm:text-sm shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${
                  isInsufficientCredits
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50 hover:bg-rose-500/30'
                    : !promptText.trim()
                    ? 'bg-[#252837] text-zinc-400 hover:text-amber-300 border border-[#353a4e] hover:border-amber-500/50'
                    : 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:brightness-110 active:scale-[0.98] text-black shadow-amber-950/30'
                }`}
                title={!promptText.trim() ? 'Click to enter prompt or select a quick idea' : 'Generate Asset'}
              >
                {activeJob ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-current" />
                    <span>Processing ({activeJob.progress}%)...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 fill-current/20" />
                    <span>{isInsufficientCredits ? 'Recharge Credits' : 'Generate Video'}</span>
                    <span className="text-[11px] font-extrabold bg-black/25 text-current px-1.5 py-0.5 rounded-full ml-1">
                      {creditCost}c
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Collapsible Negative Prompt Input */}
        {expandedNegative && (
          <div className="p-2.5 rounded-xl bg-[#0d0f16] border border-[#212534] text-xs animate-in slide-in-from-top-1 duration-200">
            <div className="flex items-center justify-between mb-1.5 text-zinc-400 text-[11px]">
              <span>Negative Prompt (Exclude features):</span>
              <button
                type="button"
                onClick={() => setExpandedNegative(false)}
                className="text-zinc-500 hover:text-zinc-300"
              >
                ✕
              </button>
            </div>
            <input
              type="text"
              value={negativePrompt}
              onChange={(e) => setNegativePrompt(e.target.value)}
              placeholder="e.g. static image, frozen character, no movement, slideshow, blurry, deformed hands, plastic skin, cartoon, text..."
              className="w-full bg-[#131622] border border-[#232737] rounded-lg px-3 py-1.5 text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-amber-500/50"
            />
          </div>
        )}
      </div>
    </div>
  );
};

