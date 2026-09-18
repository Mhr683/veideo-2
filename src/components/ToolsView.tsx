import React, { useState } from 'react';
import {
  Wrench,
  Sparkles,
  Clapperboard,
  Maximize2,
  Image as ImageIcon,
  Eraser,
  Scissors,
  Mic,
  Users,
  Palette,
  Eye,
  Brush,
  Smile,
  Sliders,
  LayoutGrid,
  Zap,
  ArrowRight,
} from 'lucide-react';
import { useStudio } from '../context/StudioContext';

interface CreativeTool {
  id: string;
  name: string;
  category: 'generation' | 'enhancement' | 'editing' | 'audio';
  description: string;
  credits: number;
  models: string[];
  icon: React.ReactNode;
  action: { mediaType: 'image' | 'video'; presetPrompt?: string; tab?: string };
}

export const ToolsView: React.FC = () => {
  const { setActiveTab, setPromptText, updateSettings, notify } = useStudio();
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'generation' | 'enhancement' | 'editing' | 'audio'>('all');

  const tools: CreativeTool[] = [
    {
      id: 'text-to-image',
      name: 'Text to Image',
      category: 'generation',
      description: 'Generate photorealistic images and cinematic keyframes from natural language descriptions.',
      credits: 5,
      models: ['Gemini Image Ultra', 'Flux.1 Dev', 'DALL-E 3'],
      icon: <Sparkles className="w-5 h-5 text-amber-400" />,
      action: { mediaType: 'image', tab: 'canvas' },
    },
    {
      id: 'text-to-video',
      name: 'Text to Video',
      category: 'generation',
      description: 'Synthesize dynamic 1080p video clips with physics simulation, volumetric light, and camera pans.',
      credits: 30,
      models: ['Veo 3.1 Pro', 'Runway Gen-3', 'Luma Dream'],
      icon: <Clapperboard className="w-5 h-5 text-orange-400" />,
      action: { mediaType: 'video', tab: 'canvas' },
    },
    {
      id: 'image-to-video',
      name: 'Image to Video Motionizer',
      category: 'generation',
      description: 'Breathe cinematic camera pans, parallax depth, and atmospheric motion into static still images.',
      credits: 30,
      models: ['Veo 3.1 Pro', 'Runway Gen-3'],
      icon: <ImageIcon className="w-5 h-5 text-blue-400" />,
      action: { mediaType: 'video', tab: 'canvas' },
    },
    {
      id: 'upscaler',
      name: 'Cinematic 4K Upscaler',
      category: 'enhancement',
      description: 'Increase resolution, enhance micro-textures, skin pores, and optical sharpness up to 4K resolution.',
      credits: 8,
      models: ['Clarity AI SuperRes', 'Real-ESRGAN Pro'],
      icon: <Maximize2 className="w-5 h-5 text-emerald-400" />,
      action: { mediaType: 'image', tab: 'canvas' },
    },
    {
      id: 'outpainting',
      name: 'Wide-Angle Outpainting',
      category: 'editing',
      description: 'Extend borders of your canvas seamlessly to convert 9:16 vertical clips into 16:9 anamorphic vistas.',
      credits: 10,
      models: ['Gemini Image Ultra Canvas', 'Flux.1 Infill'],
      icon: <LayoutGrid className="w-5 h-5 text-purple-400" />,
      action: { mediaType: 'image', tab: 'canvas' },
    },
    {
      id: 'inpainting',
      name: 'Inpainting & Erase-Replace',
      category: 'editing',
      description: 'Select unwanted objects, boom mics, or background extras to replace with photorealistic continuity.',
      credits: 6,
      models: ['Gemini Image Ultra Smart Infill'],
      icon: <Eraser className="w-5 h-5 text-rose-400" />,
      action: { mediaType: 'image', tab: 'canvas' },
    },
    {
      id: 'bg-remover',
      name: 'Studio Background Remover',
      category: 'editing',
      description: 'Instant green-screen keying with sub-pixel hair strand isolation and alpha transparency export.',
      credits: 3,
      models: ['RMBG 2.0 Studio Alpha'],
      icon: <Scissors className="w-5 h-5 text-cyan-400" />,
      action: { mediaType: 'image', tab: 'canvas' },
    },
    {
      id: 'voiceover-studio',
      name: 'AI Voiceover & Soundscapes',
      category: 'audio',
      description: 'Synthesize natural voiceovers, cinematic foley effects, and ambient background music tracks.',
      credits: 12,
      models: ['ElevenLabs Cinema v2', 'MusicGen Audio Pro'],
      icon: <Mic className="w-5 h-5 text-yellow-400" />,
      action: { mediaType: 'video', tab: 'canvas' },
    },
    {
      id: 'face-consistency',
      name: 'Face & Biometric Lock',
      category: 'enhancement',
      description: 'Ensure identical facial features, eye reflections, and costume details across consecutive scenes.',
      credits: 10,
      models: ['VisionForge Biometric Core'],
      icon: <Users className="w-5 h-5 text-amber-400" />,
      action: { mediaType: 'image', tab: 'characters' },
    },
    {
      id: 'style-transfer',
      name: 'Style & Director Transfer',
      category: 'enhancement',
      description: 'Apply the distinct visual aesthetics of iconic directors: vintage noir, 70s grain, or cyber-neon.',
      credits: 8,
      models: ['Director LORA Blend Engine'],
      icon: <Palette className="w-5 h-5 text-pink-400" />,
      action: { mediaType: 'image', tab: 'canvas' },
    },
    {
      id: 'depth-extractor',
      name: 'Z-Depth Map Extractor',
      category: 'editing',
      description: 'Extract 16-bit depth pass maps for stereoscopic VFX compositing and camera parallax displacement.',
      credits: 4,
      models: ['DepthAnything v2 Metric'],
      icon: <Eye className="w-5 h-5 text-indigo-400" />,
      action: { mediaType: 'image', tab: 'canvas' },
    },
    {
      id: 'motion-brush',
      name: 'Motion Brush Directing',
      category: 'generation',
      description: 'Paint specific vector trajectories onto water, clouds, or cars to govern exact directional velocities.',
      credits: 15,
      models: ['Veo Vector Flow Dynamics'],
      icon: <Brush className="w-5 h-5 text-lime-400" />,
      action: { mediaType: 'video', tab: 'canvas' },
    },
    {
      id: 'lip-sync',
      name: 'Lip Sync & Dialogue Match',
      category: 'audio',
      description: 'Synchronize realistic lip movements with uploaded audio tracks or synthesized voiceover files.',
      credits: 18,
      models: ['LivePortrait Studio Pro'],
      icon: <Smile className="w-5 h-5 text-teal-400" />,
      action: { mediaType: 'video', tab: 'canvas' },
    },
    {
      id: 'color-grading',
      name: 'Kodak Film Color Grading',
      category: 'enhancement',
      description: 'Emulate 35mm film stocks: Kodak Vision3 5219, Fuji Eterna, Technicolor, and Teal-Orange contrast.',
      credits: 4,
      models: ['3D LUT Cinema Emulator'],
      icon: <Sliders className="w-5 h-5 text-red-400" />,
      action: { mediaType: 'image', tab: 'canvas' },
    },
    {
      id: 'storyboard-generator',
      name: 'AI Storyboard Generator',
      category: 'generation',
      description: 'Turn a 1-paragraph plot synopsis into a fully illustrated 5-beat storyboard with camera instructions.',
      credits: 25,
      models: ['Director Agent Autonomous'],
      icon: <LayoutGrid className="w-5 h-5 text-amber-400" />,
      action: { mediaType: 'video', tab: 'storyboard' },
    },
  ];

  const filteredTools = tools.filter((t) => {
    if (selectedCategory === 'all') return true;
    return t.category === selectedCategory;
  });

  const handleLaunchTool = (tool: CreativeTool) => {
    updateSettings({ mediaType: tool.action.mediaType });
    if (tool.action.tab === 'storyboard') {
      setActiveTab('storyboard');
    } else if (tool.action.tab === 'characters') {
      setActiveTab('characters');
    } else {
      setActiveTab('canvas');
    }
    notify(`Loaded ${tool.name} into workspace!`, 'success');
  };

  return (
    <div id="tools-view" className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-[#0a0b10] text-zinc-100 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#1c202e]">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Wrench className="w-5 h-5 text-amber-400" />
            Creative VFX & Production Tools
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Specialized AI models for inpainting, upscaling, motion vectors, and color grading.
          </p>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          {(['all', 'generation', 'enhancement', 'editing', 'audio'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                selectedCategory === cat
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#161822]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTools.map((tool) => (
          <div
            key={tool.id}
            className="p-4 rounded-2xl bg-[#11131c] border border-[#212536] hover:border-amber-500/40 transition-all flex flex-col justify-between shadow-lg group"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-black/50 border border-white/10 flex items-center justify-center shrink-0">
                  {tool.icon}
                </div>
                <div className="flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                  <Zap className="w-3 h-3 fill-amber-400" />
                  <span>{tool.credits} Credits</span>
                </div>
              </div>

              <h3 className="font-bold text-sm text-white group-hover:text-amber-300 transition-colors">
                {tool.name}
              </h3>
              <p className="text-xs text-zinc-400 mt-1 mb-3 leading-relaxed">
                {tool.description}
              </p>
            </div>

            <div>
              <div className="flex items-center gap-1 flex-wrap mb-3">
                {tool.models.map((m, idx) => (
                  <span
                    key={idx}
                    className="text-[9px] font-mono text-zinc-500 bg-[#161824] px-1.5 py-0.5 rounded border border-[#242838]"
                  >
                    {m}
                  </span>
                ))}
              </div>

              <button
                onClick={() => handleLaunchTool(tool)}
                className="w-full py-2 rounded-xl bg-[#181a26] hover:bg-amber-500 hover:text-black border border-[#272b3c] hover:border-amber-500 text-xs font-bold text-zinc-200 flex items-center justify-center gap-1.5 transition-all"
              >
                <span>Launch Tool</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
