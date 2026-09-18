import React, { useState } from 'react';
import {
  Users,
  Plus,
  Lock,
  Unlock,
  Check,
  Trash2,
  Edit2,
  Sparkles,
  Camera,
  Layers,
  Copy,
  CheckCheck,
} from 'lucide-react';
import { useStudio } from '../context/StudioContext';
import { Character } from '../types';

export const CharactersView: React.FC = () => {
  const {
    characters,
    selectedCharacterIds,
    toggleCharacterSelection,
    deleteCharacter,
    setNewCharacterModalOpen,
    setActiveTab,
    setPromptText,
    notify,
  } = useStudio();

  const [activeSheetChar, setActiveSheetChar] = useState<Character | null>(characters[0] || null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyId = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(code);
    notify(`Copied character code ${code}`, 'info');
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div id="characters-view" className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-[#0a0b10] text-zinc-100 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-400" />
            Character Consistency Bank
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Lock biometric identities, styling, and wardrobes across consecutive shots and storyboards.
          </p>
        </div>

        <button
          onClick={() => setNewCharacterModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-110 text-black font-bold text-xs shadow-md transition-all"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Character</span>
        </button>
      </div>

      {/* Main Grid of Characters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {characters.map((char) => {
          const isLocked = selectedCharacterIds.includes(char.id);
          return (
            <div
              key={char.id}
              className={`rounded-2xl bg-[#11131d] border transition-all p-4 flex flex-col justify-between shadow-lg relative ${
                isLocked
                  ? 'border-amber-500/50 shadow-amber-950/20 ring-1 ring-amber-500/30'
                  : 'border-[#222637] hover:border-zinc-700'
              }`}
            >
              <div>
                {/* Character Head Card */}
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-black shrink-0 border border-[#2b3044] relative group">
                    <img
                      src={char.avatarUrl}
                      alt={char.name}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => setActiveSheetChar(char)}
                      className="absolute inset-0 bg-black/60 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold"
                    >
                      Angles
                    </button>
                  </div>

                  <div className="flex-1 truncate">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-sm text-white truncate">{char.name}</h3>
                      <button
                        onClick={() => deleteCharacter(char.id)}
                        className="text-zinc-600 hover:text-rose-400 p-1 rounded"
                        title="Delete Character"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] font-mono text-zinc-400 bg-[#191c28] px-2 py-0.5 rounded border border-[#262b3b]">
                        {char.characterIdCode}
                      </span>
                      <button
                        onClick={() => handleCopyId(char.characterIdCode)}
                        className="text-zinc-500 hover:text-zinc-300"
                        title="Copy Code"
                      >
                        {copiedId === char.characterIdCode ? (
                          <CheckCheck className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>

                    <p className="text-[11px] text-zinc-400 truncate mt-1">{char.description}</p>
                  </div>
                </div>

                {/* Character Specification Badges */}
                <div className="space-y-1.5 text-[11px] bg-[#0c0e15] p-2.5 rounded-xl border border-[#1d202e] mb-3">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Appearance:</span>
                    <span className="text-zinc-300 truncate max-w-[150px]">{char.appearance}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Wardrobe:</span>
                    <span className="text-zinc-300 truncate max-w-[150px]">{char.clothing}</span>
                  </div>
                  {char.consistencyAnchor && (
                    <div className="pt-1.5 border-t border-[#1a1d2b]">
                      <span className="text-[10px] text-amber-400 font-semibold block mb-0.5">
                        Anchor Anchor Directive:
                      </span>
                      <span className="text-[10px] text-zinc-400 font-mono line-clamp-2">
                        {char.consistencyAnchor}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-[#1c202e]">
                <button
                  onClick={() => toggleCharacterSelection(char.id)}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    isLocked
                      ? 'bg-amber-500 text-black shadow-sm'
                      : 'bg-[#181a26] text-zinc-300 hover:bg-[#202434] border border-[#262b3c]'
                  }`}
                >
                  {isLocked ? (
                    <>
                      <Lock className="w-3 h-3" />
                      <span>Consistency Active</span>
                    </>
                  ) : (
                    <>
                      <Unlock className="w-3 h-3 text-zinc-400" />
                      <span>Lock In Prompt</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    toggleCharacterSelection(char.id);
                    setPromptText(`Cinematic medium portrait of ${char.name}, ${char.appearance}, wearing ${char.clothing}. High atmospheric contrast.`);
                    setActiveTab('canvas');
                    notify(`Loaded character prompt for "${char.name}" into Studio Canvas!`, 'success');
                  }}
                  className="p-1.5 rounded-lg bg-[#181a26] hover:bg-[#202434] border border-[#262b3c] text-zinc-300 hover:text-amber-400 transition-colors"
                  title="Generate shot with this character"
                >
                  <Sparkles className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Multiview Character Sheet Inspection Drawer */}
      {activeSheetChar && (
        <div className="p-5 rounded-2xl bg-[#11131c] border border-[#232737] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-amber-400" />
              <h3 className="font-bold text-sm text-white">
                Multi-Angle Character Sheet: {activeSheetChar.name}
              </h3>
            </div>
            <button
              onClick={() => setActiveSheetChar(null)}
              className="text-xs text-zinc-500 hover:text-zinc-300"
            >
              Hide Sheet
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Front Eyeline 0°', img: activeSheetChar.avatarUrl },
              { label: 'Profile 90°', img: activeSheetChar.referenceImages[0] || activeSheetChar.avatarUrl },
              { label: 'Three-Quarter 45°', img: activeSheetChar.referenceImages[1] || activeSheetChar.avatarUrl },
              { label: 'Full Wardrobe Shot', img: activeSheetChar.avatarUrl },
            ].map((angle, i) => (
              <div key={i} className="rounded-xl overflow-hidden bg-black border border-[#222637]">
                <div className="aspect-[3/4] relative">
                  <img src={angle.img} alt="" className="w-full h-full object-cover" />
                  <div className="absolute bottom-0 inset-x-0 bg-black/70 p-1.5 text-center text-[10px] font-mono text-zinc-300">
                    {angle.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
