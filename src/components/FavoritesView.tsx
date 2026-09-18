import React from 'react';
import { Star, Sparkles, Eye, Trash2 } from 'lucide-react';
import { useStudio } from '../context/StudioContext';

export const FavoritesView: React.FC = () => {
  const { mediaList, setViewingMedia, toggleFavorite, trashMedia } = useStudio();
  const favorites = mediaList.filter((m) => m.favorite && !m.trashed);

  return (
    <div id="favorites-view" className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-[#0a0b10] text-zinc-100 select-none">
      <div>
        <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
          <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
          Starred & Favorited Assets
        </h1>
        <p className="text-xs text-zinc-400 mt-0.5">
          Quickly access your top selected film shots, concept art, and generated sequences.
        </p>
      </div>

      {favorites.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#0f1118] border border-[#212534]">
          <Star className="w-10 h-10 mx-auto text-zinc-600 mb-2" />
          <h3 className="font-bold text-sm text-zinc-300">No favorited media yet</h3>
          <p className="text-xs text-zinc-500 mt-1">Star items in your Media Library or Canvas to pin them here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {favorites.map((item) => (
            <div
              key={item.id}
              className="group rounded-xl overflow-hidden bg-[#11131c] border border-[#212534] hover:border-amber-500/50 transition-all flex flex-col shadow-md"
            >
              <div
                className="relative aspect-video bg-black cursor-pointer overflow-hidden"
                onClick={() => setViewingMedia(item)}
              >
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(item.id);
                  }}
                  className="absolute top-2 right-2 p-1 rounded bg-black/70 text-amber-400 fill-amber-400"
                >
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                </button>
              </div>

              <div className="p-2.5 flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-200 truncate">{item.title}</span>
                <button
                  onClick={() => trashMedia(item.id)}
                  className="text-zinc-500 hover:text-rose-400 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
