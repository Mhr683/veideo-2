import React, { useState } from 'react';
import {
  X,
  User,
  Sliders,
  Zap,
  Key,
  Bell,
  Check,
  CreditCard,
  History,
  Layers,
  Sparkles,
  Shield,
  Palette,
} from 'lucide-react';
import { useStudio } from '../context/StudioContext';

export const SettingsModal: React.FC = () => {
  const {
    settingsModalOpen,
    setSettingsModalOpen,
    settingsModalSection,
    setSettingsModalSection,
    user,
    updateUser,
    credits,
    transactions,
    settings,
    updateSettings,
    providers,
    updateProvider,
    notify,
  } = useStudio();

  const [name, setName] = useState(user?.name || 'Studio Director');
  const [email, setEmail] = useState(user?.email || 'director@visionforge.ai');

  if (!settingsModalOpen) return null;

  const handleSaveProfile = () => {
    updateUser({ name, email });
  };

  const handleBuyCredits = (amount: number, price: number) => {
    updateUser({ creditsBalance: credits + amount });
    notify(`Added ${amount} credits to account for $${price}!`, 'success');
  };

  const handleSelectPlan = (planName: 'Basic' | 'Pro' | 'Studio', planCredits: number) => {
    updateUser({
      subscriptionPlan: planName,
      creditsBalance: credits + planCredits,
    });
    notify(`Upgraded subscription to ${planName} Plan! Added ${planCredits} credits.`, 'success');
  };

  return (
    <div
      id="settings-modal"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 select-none"
    >
      <div className="bg-[#10121a] border border-[#272b3c] rounded-2xl w-full max-w-4xl h-[85vh] flex flex-col md:flex-row overflow-hidden shadow-2xl">
        {/* Navigation Sidebar */}
        <div className="w-full md:w-56 bg-[#0d0e15] border-b md:border-b-0 md:border-r border-[#1f2331] p-3 shrink-0">
          <div className="px-3 py-2 text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
            Studio Preferences
          </div>
          <div className="space-y-1">
            {[
              { id: 'account', label: 'Profile & Account', icon: <User className="w-4 h-4" /> },
              { id: 'credits', label: 'Credits & Billing', icon: <Zap className="w-4 h-4 text-amber-400" /> },
              { id: 'generation', label: 'Generation Defaults', icon: <Sliders className="w-4 h-4" /> },
              { id: 'api', label: 'AI Provider Keys', icon: <Key className="w-4 h-4" /> },
              { id: 'appearance', label: 'Appearance', icon: <Palette className="w-4 h-4" /> },
              { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
            ].map((sec) => (
              <button
                key={sec.id}
                onClick={() => setSettingsModalSection(sec.id as any)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                  settingsModalSection === sec.id
                    ? 'bg-amber-500/15 text-amber-300 font-bold border border-amber-500/30'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#161822]'
                }`}
              >
                {sec.icon}
                <span>{sec.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content Pane */}
        <div className="flex-1 bg-[#10121a] p-6 overflow-y-auto flex flex-col justify-between">
          <div>
            {/* Top Close Button */}
            <div className="flex items-center justify-between pb-4 border-b border-[#1f2331] mb-6">
              <h2 className="text-base font-bold text-white capitalize">
                {settingsModalSection === 'account' && 'Account & Profile'}
                {settingsModalSection === 'credits' && 'Credit Top-Up & Subscriptions'}
                {settingsModalSection === 'generation' && 'Generation Presets & Defaults'}
                {settingsModalSection === 'api' && 'AI Provider Connectors'}
                {settingsModalSection === 'appearance' && 'Studio Appearance'}
                {settingsModalSection === 'notifications' && 'System Notifications'}
              </h2>
              <button
                onClick={() => setSettingsModalOpen(false)}
                className="text-zinc-500 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* SECTION 1: ACCOUNT */}
            {settingsModalSection === 'account' && (
              <div className="space-y-4 max-w-md text-xs">
                <div className="flex items-center gap-4">
                  <img
                    src={user?.profileImage}
                    alt=""
                    className="w-16 h-16 rounded-full object-cover border border-[#2b2f3f]"
                  />
                  <div>
                    <h3 className="font-bold text-sm text-white">{user?.name}</h3>
                    <p className="text-zinc-400 text-[11px]">{user?.email}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                      {user?.subscriptionPlan} Member
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-zinc-400 block mb-1">Display Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#161824] border border-[#262b3c] rounded-xl px-3 py-2 text-zinc-200"
                  />
                </div>

                <div>
                  <label className="text-zinc-400 block mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#161824] border border-[#262b3c] rounded-xl px-3 py-2 text-zinc-200"
                  />
                </div>

                <button
                  onClick={handleSaveProfile}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs"
                >
                  Save Profile
                </button>
              </div>
            )}

            {/* SECTION 2: CREDITS & BILLING */}
            {settingsModalSection === 'credits' && (
              <div className="space-y-6 text-xs">
                {/* Credit Balance Card */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent border border-amber-500/30 flex items-center justify-between">
                  <div>
                    <span className="text-zinc-400 text-[11px]">Available Studio Credits</span>
                    <div className="text-2xl font-extrabold text-amber-300 mt-0.5">
                      {credits} <span className="text-xs text-zinc-400 font-normal">credits</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-zinc-400">Current Plan</span>
                    <div className="font-bold text-zinc-200 text-sm">{user?.subscriptionPlan}</div>
                  </div>
                </div>

                {/* Quick Credit Packs */}
                <div>
                  <h3 className="font-bold text-sm text-white mb-2">Instant Credit Top-Up</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { amount: 250, price: 10, bonus: 'Standard' },
                      { amount: 650, price: 25, bonus: '+150 Bonus' },
                      { amount: 1500, price: 50, bonus: '+500 Bonus (Best Value)' },
                    ].map((pack) => (
                      <div
                        key={pack.amount}
                        className="p-3.5 rounded-xl bg-[#141622] border border-[#242838] hover:border-amber-500/50 flex flex-col justify-between space-y-3"
                      >
                        <div>
                          <div className="flex justify-between items-center">
                            <span className="font-extrabold text-base text-white">
                              {pack.amount}
                            </span>
                            <span className="font-bold text-amber-400">${pack.price}</span>
                          </div>
                          <span className="text-[10px] text-zinc-400">{pack.bonus}</span>
                        </div>
                        <button
                          onClick={() => handleBuyCredits(pack.amount, pack.price)}
                          className="w-full py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs"
                        >
                          Buy Pack
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Subscription Tiers */}
                <div>
                  <h3 className="font-bold text-sm text-white mb-2">Subscription Plans</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { name: 'Basic' as const, price: 19, credits: 500, features: ['1080p Video', 'Standard Queue', '500 Monthly Credits'] },
                      { name: 'Pro' as const, price: 49, credits: 1500, features: ['4K Video Upscale', 'Priority Generation Queue', 'Character Consistency Bank', '1500 Monthly Credits'] },
                      { name: 'Studio' as const, price: 99, credits: 4000, features: ['Commercial Film License', 'Ultra Dedicated Cluster', 'Full Screenplay Agent', '4000 Monthly Credits'] },
                    ].map((tier) => (
                      <div
                        key={tier.name}
                        className={`p-3.5 rounded-xl bg-[#141622] border flex flex-col justify-between space-y-3 ${
                          user?.subscriptionPlan === tier.name
                            ? 'border-amber-500/60 ring-1 ring-amber-500/40'
                            : 'border-[#242838]'
                        }`}
                      >
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-bold text-sm text-white">{tier.name}</span>
                            <span className="font-extrabold text-amber-400">${tier.price}/mo</span>
                          </div>
                          <div className="text-[10px] text-zinc-400 space-y-1 mt-2">
                            {tier.features.map((f, i) => (
                              <div key={i} className="flex items-center gap-1.5">
                                <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                                <span>{f}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <button
                          onClick={() => handleSelectPlan(tier.name, tier.credits)}
                          disabled={user?.subscriptionPlan === tier.name}
                          className={`w-full py-1.5 rounded-lg text-xs font-bold ${
                            user?.subscriptionPlan === tier.name
                              ? 'bg-[#1e2230] text-zinc-400 cursor-default'
                              : 'bg-gradient-to-r from-amber-500 to-orange-500 text-black hover:brightness-110'
                          }`}
                        >
                          {user?.subscriptionPlan === tier.name ? 'Active Plan' : 'Upgrade Plan'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Transaction History Ledger */}
                <div>
                  <h3 className="font-bold text-sm text-white mb-2 flex items-center gap-1.5">
                    <History className="w-4 h-4 text-zinc-400" />
                    Transaction & Usage Ledger
                  </h3>
                  <div className="rounded-xl border border-[#212534] bg-[#12141c] overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#171926] text-[10px] uppercase font-bold text-zinc-500 border-b border-[#212534]">
                        <tr>
                          <th className="p-2.5">Date</th>
                          <th className="p-2.5">Service</th>
                          <th className="p-2.5">Description</th>
                          <th className="p-2.5 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1e2230]">
                        {transactions.map((t) => (
                          <tr key={t.id}>
                            <td className="p-2.5 text-zinc-500">{t.date}</td>
                            <td className="p-2.5 text-zinc-300 font-medium">{t.service}</td>
                            <td className="p-2.5 text-zinc-400 truncate max-w-xs">{t.description}</td>
                            <td
                              className={`p-2.5 text-right font-mono font-bold ${
                                t.amount > 0 ? 'text-emerald-400' : 'text-amber-400'
                              }`}
                            >
                              {t.amount > 0 ? `+${t.amount}` : t.amount}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 3: GENERATION DEFAULTS */}
            {settingsModalSection === 'generation' && (
              <div className="space-y-4 max-w-md text-xs">
                <div>
                  <label className="text-zinc-400 block mb-1">Default Video Model</label>
                  <select
                    value={settings.model}
                    onChange={(e) => updateSettings({ model: e.target.value })}
                    className="w-full bg-[#161824] border border-[#262b3c] rounded-xl px-3 py-2 text-zinc-200"
                  >
                    <option value="Veo 3.1 Pro">Veo 3.1 Pro</option>
                    <option value="Gemini Image Ultra">Gemini Image Ultra</option>
                    <option value="Runway Gen-3">Runway Gen-3</option>
                    <option value="Flux.1 Dev">Flux.1 Dev</option>
                  </select>
                </div>

                <div>
                  <label className="text-zinc-400 block mb-1">Default Aspect Ratio</label>
                  <select
                    value={settings.aspectRatio}
                    onChange={(e) => updateSettings({ aspectRatio: e.target.value as any })}
                    className="w-full bg-[#161824] border border-[#262b3c] rounded-xl px-3 py-2 text-zinc-200"
                  >
                    <option value="16:9">16:9 Widescreen Cinema</option>
                    <option value="9:16">9:16 Vertical Reel</option>
                    <option value="1:1">1:1 Square</option>
                    <option value="4:3">4:3 Classic TV</option>
                  </select>
                </div>

                <div>
                  <label className="text-zinc-400 block mb-1">Safety Filtration</label>
                  <select
                    value={settings.safetyLevel}
                    onChange={(e) => updateSettings({ safetyLevel: e.target.value as any })}
                    className="w-full bg-[#161824] border border-[#262b3c] rounded-xl px-3 py-2 text-zinc-200"
                  >
                    <option value="Strict">Strict (Family Friendly)</option>
                    <option value="Standard">Standard Studio</option>
                    <option value="Permissive">Permissive (Creative Fiction)</option>
                  </select>
                </div>
              </div>
            )}

            {/* SECTION 4: API PROVIDERS */}
            {settingsModalSection === 'api' && (
              <div className="space-y-3 text-xs">
                <p className="text-zinc-400 text-xs mb-3">
                  VisionForge AI integrates dynamically across leading generative backends. Toggle providers and monitor API connectivity.
                </p>
                {providers.map((p) => (
                  <div
                    key={p.id}
                    className="p-3.5 rounded-xl bg-[#141622] border border-[#242838] flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-white text-sm">{p.name}</div>
                      <div className="text-[10px] text-zinc-500 font-mono mt-0.5">
                        Models: {p.models.map((m) => m.name).join(', ')}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                          p.status === 'active'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-zinc-800 text-zinc-400'
                        }`}
                      >
                        {p.status}
                      </span>
                      <button
                        onClick={() =>
                          updateProvider(p.id, {
                            status: p.status === 'active' ? 'disabled' : 'active',
                          })
                        }
                        className="px-2.5 py-1 rounded bg-[#1e2230] text-zinc-300 hover:text-white"
                      >
                        {p.status === 'active' ? 'Disable' : 'Enable'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* SECTION 5: APPEARANCE */}
            {settingsModalSection === 'appearance' && (
              <div className="space-y-4 max-w-md text-xs">
                <div>
                  <label className="text-zinc-400 block mb-1">Studio Color Theme</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['OLED Dark', 'Midnight Studio', 'Carbon Neutral'].map((theme, i) => (
                      <div
                        key={theme}
                        className={`p-3 rounded-xl border text-center font-semibold cursor-pointer ${
                          i === 0
                            ? 'border-amber-500 bg-amber-500/10 text-amber-300'
                            : 'border-[#242838] bg-[#141622] text-zinc-400'
                        }`}
                      >
                        {theme}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 6: NOTIFICATIONS */}
            {settingsModalSection === 'notifications' && (
              <div className="space-y-3 max-w-md text-xs">
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#141622] border border-[#242838]">
                  <span>Render Completion Sound</span>
                  <input type="checkbox" defaultChecked className="accent-amber-500" />
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#141622] border border-[#242838]">
                  <span>In-App Toast Alerts</span>
                  <input type="checkbox" defaultChecked className="accent-amber-500" />
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#141622] border border-[#242838]">
                  <span>Credit Depletion Warning</span>
                  <input type="checkbox" defaultChecked className="accent-amber-500" />
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-[#1f2331] flex justify-end">
            <button
              onClick={() => setSettingsModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
