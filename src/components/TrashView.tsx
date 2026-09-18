import React from 'react';
import { Trash2, RotateCcw, XCircle, AlertTriangle } from 'lucide-react';
import { useStudio } from '../context/StudioContext';

export const TrashView: React.FC = () => {
  const { mediaList, restoreMedia, permanentlyDeleteMedia, emptyTrash } = useStudio();
  const trashedItems = mediaList.filter((m) => m.trashed);

  return (
    <div id="trash-view" className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-[#0a0b10] text-zinc-100 select-none">
      <div className="flex items-center justify-between pb-4 border-b border-[#1c202e]">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-rose-400" />
            Trash ({trashedItems.length})
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Items in trash can be restored back to your Media Library or permanently purged.
          </p>
        </div>

        {trashedItems.length > 0 && (
          <button
            onClick={emptyTrash}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold"
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Empty Trash</span>
          </button>
        )}
      </div>

      {trashedItems.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#0f1118] border border-[#212534]">
          <Trash2 className="w-10 h-10 mx-auto text-zinc-600 mb-2" />
          <h3 className="font-bold text-sm text-zinc-300">Trash is empty</h3>
          <p className="text-xs text-zinc-500 mt-1">Deleted items will appear here before permanent removal.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {trashedItems.map((item) => (
            <div
              key={item.id}
              className="rounded-xl overflow-hidden bg-[#11131c] border border-rose-500/20 flex flex-col justify-between shadow-md"
            >
              <div className="relative aspect-video bg-black opacity-75">
                <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" />
              </div>

              <div className="p-3">
                <h4 className="text-xs font-semibold text-zinc-300 truncate">{item.title}</h4>
                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-[#1d202e]">
                  <button
                    onClick={() => restoreMedia(item.id)}
                    className="flex-1 py-1 rounded bg-[#181a26] hover:bg-[#202434] text-emerald-400 text-[10px] font-semibold flex items-center justify-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Restore</span>
                  </button>
                  <button
                    onClick={() => permanentlyDeleteMedia(item.id)}
                    className="flex-1 py-1 rounded bg-[#181a26] hover:bg-rose-500/20 text-rose-400 text-[10px] font-semibold flex items-center justify-center gap-1"
                  >
                    <XCircle className="w-3 h-3" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
