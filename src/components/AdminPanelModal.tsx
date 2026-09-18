import React, { useState } from 'react';
import {
  Shield,
  X,
  Users,
  Activity,
  Zap,
  Server,
  ToggleLeft,
  ToggleRight,
  Sliders,
  Check,
} from 'lucide-react';
import { useStudio } from '../context/StudioContext';

export const AdminPanelModal: React.FC = () => {
  const { adminModalOpen, setAdminModalOpen, providers, updateProvider, notify } = useStudio();
  const [activeTab, setActiveTab] = useState<'stats' | 'providers' | 'flags'>('stats');

  if (!adminModalOpen) return null;

  return (
    <div
      id="admin-panel-modal"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 select-none"
    >
      <div className="bg-[#0f111a] border border-[#272b3c] rounded-2xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-[#1f2331] flex items-center justify-between bg-[#121420]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">VisionForge Admin Console</h2>
              <p className="text-[11px] text-zinc-400">Cluster health, provider routing, and credit economics</p>
            </div>
          </div>

          <button onClick={() => setAdminModalOpen(false)} className="text-zinc-500 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Strip */}
        <div className="px-6 border-b border-[#1f2331] flex items-center gap-4 bg-[#0d0e15] text-xs font-semibold">
          {[
            { id: 'stats', label: 'Cluster Analytics' },
            { id: 'providers', label: 'Model Provider & Routing' },
            { id: 'flags', label: 'Feature Flags & Experiments' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`py-3 border-b-2 transition-all ${
                activeTab === t.id
                  ? 'border-amber-400 text-amber-300'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Body Content */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6 text-xs text-zinc-300">
          {activeTab === 'stats' && (
            <div className="space-y-6">
              {/* Stat Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Active Creators', value: '14,290', change: '+12% this week', icon: <Users className="w-4 h-4 text-amber-400" /> },
                  { label: 'Render Jobs (24h)', value: '88,410', change: '99.8% success', icon: <Activity className="w-4 h-4 text-emerald-400" /> },
                  { label: 'Credits Consumed', value: '1.42M', change: 'Est. $71.2k burn', icon: <Zap className="w-4 h-4 text-yellow-400" /> },
                  { label: 'GPU Cluster Load', value: '42%', change: 'Normal latency (3.2s)', icon: <Server className="w-4 h-4 text-cyan-400" /> },
                ].map((s, i) => (
                  <div key={i} className="p-4 rounded-xl bg-[#141622] border border-[#232737]">
                    <div className="flex items-center justify-between text-zinc-400 mb-2">
                      <span className="text-[11px]">{s.label}</span>
                      {s.icon}
                    </div>
                    <div className="text-xl font-extrabold text-white">{s.value}</div>
                    <div className="text-[10px] text-zinc-500 mt-1">{s.change}</div>
                  </div>
                ))}
              </div>

              {/* Service Status */}
              <div className="p-4 rounded-xl bg-[#141622] border border-[#232737] space-y-3">
                <h4 className="font-bold text-white text-xs">Production Node Health</h4>
                <div className="space-y-2">
                  {[
                    { name: 'Gemini 3.1 Flash Service', status: 'Operational', latency: '420ms' },
                    { name: 'Veo 3.1 Pro Cinema Engine', status: 'Operational', latency: '2,800ms' },
                    { name: 'Character Biometric Anchor Vault', status: 'Operational', latency: '150ms' },
                    { name: 'Global Asset CDN Storage', status: 'Operational', latency: '35ms' },
                  ].map((srv, idx) => (
                    <div key={idx} className="flex items-center justify-between text-[11px] p-2 bg-[#0c0e15] rounded-lg">
                      <span className="text-zinc-200 font-medium">{srv.name}</span>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-zinc-400">{srv.latency}</span>
                        <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          {srv.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'providers' && (
            <div className="space-y-4">
              <p className="text-zinc-400 text-xs">
                Manage provider prioritization, token costs, and failover fallbacks.
              </p>
              {providers.map((p) => (
                <div
                  key={p.id}
                  className="p-4 rounded-xl bg-[#141622] border border-[#232737] space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-white text-sm">{p.name}</span>
                      <span className="text-[10px] text-zinc-500 font-mono ml-2">ID: {p.id}</span>
                    </div>
                    <button
                      onClick={() => {
                        updateProvider(p.id, {
                          status: p.status === 'active' ? 'disabled' : 'active',
                        });
                        notify(`Provider ${p.name} ${p.status === 'active' ? 'disabled' : 'enabled'}`, 'info');
                      }}
                      className="px-3 py-1 rounded-lg bg-[#1f2334] text-xs font-semibold text-zinc-200"
                    >
                      {p.status === 'active' ? 'Active' : 'Disabled'}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                    {p.models.map((m) => (
                      <div
                        key={m.id}
                        className="p-2 rounded bg-[#0d0f17] flex items-center justify-between"
                      >
                        <span className="text-zinc-300">{m.name}</span>
                        <span className="font-bold text-amber-400">{m.costCredits} credits</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'flags' && (
            <div className="space-y-3">
              {[
                { name: 'Veo 3.1 60fps Real-Time Cinema Mode', enabled: true, desc: 'Enables high-frame-rate interpolation for pro accounts' },
                { name: 'Autonomous Multi-Shot Screenplay Generation', enabled: true, desc: 'Allow AI agent to sequence entire 10-beat narrative reels' },
                { name: 'Multi-Perspective 3D Mesh Extraction', enabled: false, desc: 'Experimental NeRF point-cloud generation' },
                { name: 'Real-Time Voice Directing', enabled: true, desc: 'Audio prompting via WebAudio speech-to-intent' },
              ].map((flag, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-[#141622] border border-[#232737] flex items-center justify-between"
                >
                  <div className="max-w-md">
                    <div className="font-bold text-zinc-200">{flag.name}</div>
                    <div className="text-[10px] text-zinc-500 mt-0.5">{flag.desc}</div>
                  </div>
                  <input
                    type="checkbox"
                    defaultChecked={flag.enabled}
                    className="w-4 h-4 accent-amber-500"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
