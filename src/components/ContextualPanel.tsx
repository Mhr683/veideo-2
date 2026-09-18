import React, { useState } from 'react';
import {
  SlidersHorizontal,
  MessageSquareText,
  Bot,
  X,
  Sparkles,
  Send,
  Loader2,
  Wand2,
  Camera,
  Layers,
  Users,
  Check,
  Shield,
  Zap,
} from 'lucide-react';
import { useStudio } from '../context/StudioContext';

export const ContextualPanel: React.FC = () => {
  const {
    rightPanelTab,
    setRightPanelTab,
    settings,
    updateSettings,
    promptText,
    setPromptText,
    createCharacter,
    createScene,
    activeProject,
    agentMode,
    setAgentMode,
    notify,
  } = useStudio();

  // Assistant Chat State
  const [messages, setMessages] = useState<
    { sender: 'assistant' | 'user'; text: string; action?: { label: string; prompt: string } }[]
  >([
    {
      sender: 'assistant',
      text: 'Hi! What would you like to create? I can craft cinematic prompts, design consistent characters, or direct scene lighting and camera moves.',
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isAssistantThinking, setIsAssistantThinking] = useState(false);

  // Agent Mode State
  const [agentConcept, setAgentConcept] = useState('Cyberpunk courier trapped in an orbital skybridge shootout');
  const [agentGenre, setAgentGenre] = useState('Sci-Fi Thriller');
  const [isAgentExecuting, setIsAgentExecuting] = useState(false);
  const [agentGeneratedPackage, setAgentGeneratedPackage] = useState<any>(null);

  if (!rightPanelTab) return null;

  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || chatInput.trim();
    if (!textToSend) return;

    const newMessages = [...messages, { sender: 'user' as const, text: textToSend }];
    setMessages(newMessages);
    if (!customPrompt) setChatInput('');
    setIsAssistantThinking(true);

    try {
      const res = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.sender, content: m.text })),
          projectContext: activeProject,
        }),
      });

      const data = await res.json();
      const reply = data.reply || 'Let us explore that concept further. What mood are you aiming for?';

      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: reply,
          action: {
            label: 'Apply to Studio Prompt',
            prompt: textToSend,
          },
        },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: 'Here is a recommended camera setup: 35mm anamorphic prime lens at f/2.0 with slow push-in, capturing wet neon reflections and high atmospheric density.',
        },
      ]);
    } finally {
      setIsAssistantThinking(false);
    }
  };

  const handleAgentExecute = async () => {
    if (!agentConcept.trim()) return;
    setIsAgentExecuting(true);
    try {
      const res = await fetch('/api/agent/workflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ concept: agentConcept, genre: agentGenre }),
      });
      const data = await res.json();
      setAgentGeneratedPackage(data);
      notify('AI Agent generated characters and scenes!', 'success');
    } catch (err: any) {
      notify('Agent generation failed: ' + err.message, 'error');
    } finally {
      setIsAgentExecuting(false);
    }
  };

  const handleImportAgentPackage = () => {
    if (!agentGeneratedPackage) return;
    // Add characters
    agentGeneratedPackage.characters?.forEach((c: any) => {
      createCharacter({
        name: c.name,
        description: c.description,
        age: '30',
        appearance: c.appearance,
        clothing: c.clothing,
        hair: 'Dark styled',
        skinTone: 'Natural',
        personality: c.personality,
        referenceImages: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'],
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
        projectId: activeProject?.id,
      });
    });

    // Add scenes
    agentGeneratedPackage.scenes?.forEach((s: any) => {
      createScene({
        name: s.name,
        location: s.location,
        timeOfDay: s.timeOfDay,
        lighting: s.lighting,
        camera: s.camera,
        action: s.action,
        prompt: s.prompt,
        duration: s.duration || 5,
      });
    });

    notify('Package imported to Storyboard & Characters!', 'success');
  };

  const cameraOptions = [
    'Static',
    'Pan Left',
    'Pan Right',
    'Tilt Up',
    'Tilt Down',
    'Zoom In',
    'Zoom Out',
    'Orbit',
    'Drone Tracking',
  ];

  const styleOptions = [
    'Cinematic Film',
    'Hyper-Realistic',
    '3D Render',
    'Anime & Cel',
    'Cyberpunk Neon',
    'Vintage Noir',
  ];

  return (
    <aside
      id="right-contextual-panel"
      className="w-80 sm:w-96 h-full bg-[#0d0f15] border-l border-[#1f2331] flex flex-col shrink-0 select-none z-20"
    >
      {/* Header Tabs */}
      <div className="h-14 border-b border-[#1f2331] px-3 flex items-center justify-between shrink-0 bg-[#0f1118]">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setRightPanelTab('settings')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              rightPanelTab === 'settings'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#181b26]'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Settings</span>
          </button>

          <button
            onClick={() => setRightPanelTab('assistant')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              rightPanelTab === 'assistant'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#181b26]'
            }`}
          >
            <MessageSquareText className="w-3.5 h-3.5" />
            <span>Assistant</span>
          </button>

          <button
            onClick={() => setRightPanelTab('agent')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              rightPanelTab === 'agent'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#181b26]'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Agent</span>
          </button>
        </div>

        <button
          onClick={() => setRightPanelTab(null)}
          className="p-1.5 text-zinc-500 hover:text-zinc-300 rounded-lg hover:bg-[#181b26]"
          title="Close Drawer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs text-zinc-300">
        {/* TAB 1: SETTINGS */}
        {rightPanelTab === 'settings' && (
          <div className="space-y-4">
            <div>
              <label className="text-[11px] font-bold uppercase text-zinc-400 mb-1.5 block">
                Aspect Ratio
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {(['16:9', '4:3', '1:1', '3:4', '9:16'] as const).map((ratio) => (
                  <button
                    key={ratio}
                    onClick={() => updateSettings({ aspectRatio: ratio })}
                    className={`py-2 rounded-lg font-mono text-[11px] text-center border transition-all ${
                      settings.aspectRatio === ratio
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold'
                        : 'bg-[#141620] border-[#252837] text-zinc-400 hover:border-zinc-600'
                    }`}
                  >
                    {ratio}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase text-zinc-400 mb-1.5 block">
                Output Resolution & Quality
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['Standard 720p', 'High 1080p', 'Ultra 4K'] as const).map((q) => (
                  <button
                    key={q}
                    onClick={() => updateSettings({ quality: q })}
                    className={`p-2 rounded-lg text-center border text-[11px] transition-all ${
                      settings.quality === q
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold'
                        : 'bg-[#141620] border-[#252837] text-zinc-400 hover:border-zinc-600'
                    }`}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase text-zinc-400 mb-1.5 block">
                Visual Style
              </label>
              <select
                value={settings.style}
                onChange={(e) => updateSettings({ style: e.target.value as any })}
                className="w-full bg-[#141620] border border-[#252837] rounded-lg px-3 py-2 text-zinc-200 focus:outline-none focus:border-amber-500/50"
              >
                {styleOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Video-Specific Controls */}
            {settings.mediaType === 'video' && (
              <>
                <div>
                  <div className="flex justify-between text-[11px] font-bold uppercase text-zinc-400 mb-1.5">
                    <span>Clip Duration</span>
                    <span className="text-amber-400">{settings.duration} Seconds</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {([4, 8, 12, 16] as const).map((d) => (
                      <button
                        key={d}
                        onClick={() => updateSettings({ duration: d })}
                        className={`py-1.5 rounded-lg border text-center font-medium ${
                          settings.duration === d
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                            : 'bg-[#141620] border-[#252837] text-zinc-400'
                        }`}
                      >
                        {d}s
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-bold uppercase text-zinc-400 mb-1.5">
                    <span>Motion Dynamics</span>
                    <span className="text-amber-400">Level {settings.motionLevel}/10</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={settings.motionLevel}
                    onChange={(e) => updateSettings({ motionLevel: parseInt(e.target.value) })}
                    className="w-full accent-amber-500 bg-[#252939] h-1.5 rounded-lg cursor-pointer"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase text-zinc-400 mb-1.5 block">
                    Camera Movement
                  </label>
                  <select
                    value={settings.cameraMovement}
                    onChange={(e) => updateSettings({ cameraMovement: e.target.value as any })}
                    className="w-full bg-[#141620] border border-[#252837] rounded-lg px-3 py-2 text-zinc-200 focus:outline-none focus:border-amber-500/50"
                  >
                    {cameraOptions.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {/* Global Toggles */}
            <div className="pt-3 border-t border-[#1e2230] space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-zinc-200">Auto-generation</div>
                  <div className="text-[10px] text-zinc-500">Render immediately on prompt commit</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.autoGenerate}
                  onChange={(e) => updateSettings({ autoGenerate: e.target.checked })}
                  className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-zinc-200">Credit Confirmation</div>
                  <div className="text-[10px] text-zinc-500">Ask before executing paid renders</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.creditConfirmation}
                  onChange={(e) => updateSettings({ creditConfirmation: e.target.checked })}
                  className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: AI ASSISTANT CHAT */}
        {rightPanelTab === 'assistant' && (
          <div className="h-full flex flex-col justify-between -m-4 p-4">
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl leading-relaxed text-xs ${
                    m.sender === 'assistant'
                      ? 'bg-[#151722] border border-[#232737] text-zinc-200'
                      : 'bg-amber-500/15 border border-amber-500/30 text-amber-200 ml-4'
                  }`}
                >
                  <div className="font-bold text-[10px] uppercase mb-1 text-zinc-500">
                    {m.sender === 'assistant' ? 'Director Assistant' : 'You'}
                  </div>
                  <div className="whitespace-pre-line">{m.text}</div>
                  {m.action && (
                    <button
                      onClick={() => setPromptText(m.action!.prompt)}
                      className="mt-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500 text-black font-bold text-[10px] hover:brightness-110"
                    >
                      <Sparkles className="w-3 h-3 fill-black/30" />
                      {m.action.label}
                    </button>
                  )}
                </div>
              ))}

              {isAssistantThinking && (
                <div className="p-3 rounded-xl bg-[#151722] border border-[#232737] text-xs flex items-center gap-2 text-zinc-400">
                  <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                  <span>Director is analyzing screenplay and visual parameters...</span>
                </div>
              )}
            </div>

            {/* Quick Prompt Presets */}
            <div className="my-2 flex items-center gap-1 overflow-x-auto py-1">
              {[
                'Turn concept into prompts',
                'Create a character',
                'Build a storyboard',
                'Camera directions',
              ].map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(suggestion)}
                  className="px-2 py-1 rounded-full bg-[#181a24] hover:bg-[#202434] text-[10px] text-zinc-300 border border-[#282d3f] whitespace-nowrap shrink-0"
                >
                  {suggestion}
                </button>
              ))}
            </div>

            {/* Chat Input */}
            <div className="relative pt-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask director about lighting, camera, scenes..."
                className="w-full bg-[#13151e] border border-[#242939] focus:border-amber-500/50 rounded-xl pl-3 pr-9 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!chatInput.trim()}
                className="absolute right-2 top-4 p-1 rounded-lg text-amber-400 hover:text-amber-300 disabled:opacity-30"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: AGENT MODE */}
        {rightPanelTab === 'agent' && (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
              <div className="font-bold text-amber-300 mb-1 flex items-center gap-1.5 text-xs">
                <Bot className="w-4 h-4" />
                Autonomous Film Agent
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Feed the agent a high-level creative synopsis. It will automatically generate consistent characters, sequence scenes, structure shot-by-shot prompts, and assemble a ready-to-render storyboard.
              </p>
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase text-zinc-400 mb-1.5 block">
                Story Concept
              </label>
              <textarea
                rows={3}
                value={agentConcept}
                onChange={(e) => setAgentConcept(e.target.value)}
                placeholder="Describe your film or commercial concept..."
                className="w-full bg-[#141620] border border-[#252837] rounded-xl p-3 text-xs text-zinc-200 focus:outline-none focus:border-amber-500/50"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase text-zinc-400 mb-1.5 block">
                Genre Preset
              </label>
              <select
                value={agentGenre}
                onChange={(e) => setAgentGenre(e.target.value)}
                className="w-full bg-[#141620] border border-[#252837] rounded-lg px-3 py-2 text-zinc-200 focus:outline-none focus:border-amber-500/50"
              >
                <option value="Sci-Fi Thriller">Sci-Fi Thriller</option>
                <option value="Cinematic Commercial">Cinematic Commercial</option>
                <option value="Neo-Noir Mystery">Neo-Noir Mystery</option>
                <option value="Documentary Drama">Documentary Drama</option>
              </select>
            </div>

            <button
              onClick={handleAgentExecute}
              disabled={isAgentExecuting || !agentConcept.trim()}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold text-xs flex items-center justify-center gap-2 hover:brightness-110 disabled:opacity-50"
            >
              {isAgentExecuting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                  <span>Agent Generating Production Package...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  <span>Synthesize Full Storyboard Package</span>
                </>
              )}
            </button>

            {/* Generated Package Preview */}
            {agentGeneratedPackage && (
              <div className="p-3 rounded-xl bg-[#141723] border border-[#262c3e] space-y-3 mt-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-300 text-xs">
                    Package Ready ({agentGeneratedPackage.scenes?.length} Scenes)
                  </span>
                  <button
                    onClick={handleImportAgentPackage}
                    className="px-2.5 py-1 rounded bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-[10px]"
                  >
                    Import All
                  </button>
                </div>

                <div className="text-[11px] text-zinc-300 italic border-l-2 border-amber-500 pl-2">
                  "{agentGeneratedPackage.logline}"
                </div>

                <div className="space-y-1.5">
                  <div className="text-[10px] font-bold uppercase text-zinc-500">Generated Scenes:</div>
                  {agentGeneratedPackage.scenes?.map((s: any, idx: number) => (
                    <div key={idx} className="p-2 rounded bg-[#0d0f17] text-[11px]">
                      <div className="font-semibold text-zinc-200">
                        {idx + 1}. {s.name} ({s.timeOfDay})
                      </div>
                      <div className="text-zinc-400 truncate">{s.location}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};
