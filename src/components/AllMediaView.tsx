import React, { useState } from 'react';
import {
  Sparkles,
  Image as ImageIcon,
  Clapperboard,
  Music,
  Upload,
  Star,
  Trash2,
  Grid,
  List,
  Search,
  Filter,
  Download,
  Eye,
  Camera,
  Layers,
  ArrowUpDown,
  ExternalLink,
} from 'lucide-react';
import { useStudio } from '../context/StudioContext';
import { MediaItem } from '../types';

export const AllMediaView: React.FC = () => {
  const {
    mediaList,
    setViewingMedia,
    toggleFavorite,
    trashMedia,
    setPromptText,
    setActiveTab,
    setUploadModalOpen,
    notify,
  } = useStudio();

  const handleDownload = (item: MediaItem) => {
    const isVideo = item.type === 'video';
    const ext = isVideo ? 'mp4' : 'jpg';
    const a = document.createElement('a');
    a.href = item.url;
    a.download = `${item.title.replace(/\s+/g, '_')}_render.${ext}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    notify(`Download started for "${item.title}"`, 'info');
  };

  const [activeFilter, setActiveFilter] = useState<'all' | 'image' | 'video' | 'uploaded' | 'generated'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');

  // Filter media (exclude trashed by default)
  const filtered = mediaList
    .filter((m) => !m.trashed)
    .filter((m) => {
      if (activeFilter === 'image') return m.type === 'image';
      if (activeFilter === 'video') return m.type === 'video';
      if (activeFilter === 'uploaded') return m.source === 'uploaded';
      if (activeFilter === 'generated') return m.source === 'generated';
      return true;
    })
    .filter((m) => {
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      return (
        m.title.toLowerCase().includes(term) ||
        m.prompt?.toLowerCase().includes(term) ||
        m.model?.toLowerCase().includes(term)
      );
    });

  const filterTabs = [
    { id: 'all', label: 'All Media', count: mediaList.filter((m) => !m.trashed).length },
    { id: 'video', label: 'Videos', icon: <Clapperboard className="w-3.5 h-3.5" />, count: mediaList.filter((m) => !m.trashed && m.type === 'video').length },
    { id: 'image', label: 'Images', icon: <ImageIcon className="w-3.5 h-3.5" />, count: mediaList.filter((m) => !m.trashed && m.type === 'image').length },
    { id: 'generated', label: 'Generated', count: mediaList.filter((m) => !m.trashed && m.source === 'generated').length },
    { id: 'uploaded', label: 'Uploaded', count: mediaList.filter((m) => !m.trashed && m.source === 'uploaded').length },
  ];

  return (
    <div id="all-media-view" className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-[#0a0b10] text-zinc-100 select-none">
      {/* Top Header & Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            Media Library
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Manage synthesized clips, reference visuals, and uploaded production assets.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={() => setUploadModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1a1d2b] hover:bg-[#23273a] border border-[#2b3044] text-xs font-semibold text-zinc-200 transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Media</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#1c202e]">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 w-full sm:w-auto">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id as any)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                activeFilter === tab.id
                  ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/40'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#151722]'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#1e2231] text-zinc-400">
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search, Sort, View Mode */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <div className="relative flex-1 sm:w-48">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search library..."
              className="w-full bg-[#12141c] border border-[#212534] rounded-lg pl-8 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-500/50"
            />
          </div>

          <div className="flex items-center bg-[#12141c] border border-[#212534] rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-[#1e2230] text-white' : 'text-zinc-400'}`}
              title="Grid View"
            >
              <Grid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-[#1e2230] text-white' : 'text-zinc-400'}`}
              title="List View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Media Grid / List View */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#0f1118] border border-[#212534]">
          <Sparkles className="w-10 h-10 mx-auto text-zinc-600 mb-2" />
          <h3 className="font-bold text-sm text-zinc-300">No media found in this filter</h3>
          <p className="text-xs text-zinc-500 mt-1">Try switching filters or generating new clips in Studio Canvas.</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="group rounded-xl overflow-hidden bg-[#11131c] border border-[#212534] hover:border-amber-500/50 transition-all flex flex-col shadow-md"
            >
              {/* Media Thumbnail */}
              <div
                className="relative aspect-video bg-black cursor-pointer overflow-hidden"
                onClick={() => setViewingMedia(item)}
              >
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                <div className="absolute top-2 left-2 flex items-center gap-1">
                  <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-black/70 text-zinc-300 backdrop-blur-sm">
                    {item.type}
                  </span>
                  {item.duration && (
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-black/70 text-amber-300 backdrop-blur-sm">
                      {item.duration}s
                    </span>
                  )}
                </div>

                <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(item.id);
                    }}
                    className={`p-1 rounded bg-black/70 text-white hover:text-amber-400 ${
                      item.favorite ? 'text-amber-400 fill-amber-400' : ''
                    }`}
                  >
                    <Star className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      trashMedia(item.id);
                    }}
                    className="p-1 rounded bg-black/70 text-white hover:text-rose-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-2.5 flex flex-col justify-between flex-1">
                <div>
                  <h4 className="text-xs font-bold text-zinc-200 truncate">{item.title}</h4>
                  <div className="text-[10px] text-zinc-500 truncate mt-0.5 font-mono">
                    {item.model || 'Uploaded'}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#1c202d] text-[10px]">
                  <span className="text-zinc-500">{item.createdAt}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDownload(item)}
                      className="text-zinc-400 hover:text-white"
                      title="Download Asset"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        const promptToUse = item.prompt || `Cinematic rendition of ${item.title}`;
                        setPromptText(promptToUse);
                        setActiveTab('canvas');
                        notify(`Loaded prompt into Canvas Studio`, 'info');
                      }}
                      className="text-amber-400 hover:underline font-semibold"
                    >
                      Remix Prompt
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="rounded-xl border border-[#212534] bg-[#11131c] overflow-hidden">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-[#151824] text-[10px] uppercase font-bold text-zinc-400 border-b border-[#212534]">
              <tr>
                <th className="p-3">Item</th>
                <th className="p-3">Type</th>
                <th className="p-3">Model</th>
                <th className="p-3">Ratio</th>
                <th className="p-3">Date</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2230]">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-[#161824] transition-colors">
                  <td className="p-3 flex items-center gap-2.5">
                    <img
                      src={item.thumbnail}
                      alt=""
                      className="w-10 h-7 rounded object-cover cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => setViewingMedia(item)}
                    />
                    <div className="truncate max-w-xs">
                      <div className="font-semibold text-zinc-100 truncate">{item.title}</div>
                      <div className="text-[10px] text-zinc-500 truncate">{item.prompt}</div>
                    </div>
                  </td>
                  <td className="p-3 uppercase font-mono text-[10px]">{item.type}</td>
                  <td className="p-3 text-zinc-400">{item.model || 'Upload'}</td>
                  <td className="p-3 font-mono text-[10px]">{item.aspectRatio}</td>
                  <td className="p-3 text-zinc-500 text-[11px]">{item.createdAt}</td>
                  <td className="p-3 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        onClick={() => handleDownload(item)}
                        className="p-1 rounded text-zinc-400 hover:text-white hover:bg-[#202434]"
                        title="Download Asset"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => toggleFavorite(item.id)}
                        className={`p-1 rounded hover:bg-[#202434] ${
                          item.favorite ? 'text-amber-400 fill-amber-400' : 'text-zinc-400'
                        }`}
                        title="Favorite"
                      >
                        <Star className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setViewingMedia(item)}
                        className="p-1 text-zinc-400 hover:text-white rounded hover:bg-[#202434]"
                        title="View Fullscreen"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => trashMedia(item.id)}
                        className="p-1 text-zinc-400 hover:text-rose-400 rounded hover:bg-[#202434]"
                        title="Delete Media"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
