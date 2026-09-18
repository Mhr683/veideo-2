import React, { useState, useRef } from 'react';
import {
  Upload,
  X,
  FileText,
  Image as ImageIcon,
  Film,
  Music,
  CheckCircle,
  Loader2,
} from 'lucide-react';
import { useStudio } from '../context/StudioContext';

export const UploadModal: React.FC = () => {
  const {
    uploadModalOpen,
    setUploadModalOpen,
    addMediaItem,
    activeProjectId,
    notify,
  } = useStudio();

  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [mediaTitle, setMediaTitle] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!uploadModalOpen) return null;

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    setSelectedFile(file);
    setMediaTitle(file.name.replace(/\.[^/.]+$/, ''));

    const reader = new FileReader();
    reader.onload = (e) => {
      setFilePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !filePreview) return;

    setIsUploading(true);
    setTimeout(() => {
      const isVid = selectedFile.type.startsWith('video');
      addMediaItem({
        title: mediaTitle || selectedFile.name,
        type: isVid ? 'video' : 'image',
        source: 'uploaded',
        url: filePreview,
        thumbnail: filePreview,
        aspectRatio: '16:9',
        resolution: '1080p',
        status: 'completed',
        favorite: false,
        trashed: false,
        projectId: activeProjectId,
      });

      setIsUploading(false);
      setUploadModalOpen(false);
      setSelectedFile(null);
      setFilePreview(null);
      notify(`Uploaded "${mediaTitle}" to Media Library!`, 'success');
    }, 600);
  };

  return (
    <div
      id="upload-modal"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-none"
    >
      <div className="bg-[#10121a] border border-[#272b3c] rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
        <button
          onClick={() => setUploadModalOpen(false)}
          className="absolute top-4 right-4 text-zinc-500 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-base font-bold text-white mb-1 flex items-center gap-2">
          <Upload className="w-4 h-4 text-amber-400" />
          Upload Production Asset
        </h2>
        <p className="text-xs text-zinc-400 mb-4">
          Add reference photos, visual styles, custom textures, or video plates.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Drag & Drop Target Area */}
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
              dragActive
                ? 'border-amber-500 bg-amber-500/10'
                : 'border-[#292e40] bg-[#141622] hover:border-zinc-500'
            }`}
          >
            {filePreview ? (
              <div className="space-y-2">
                <img
                  src={filePreview}
                  alt="Upload preview"
                  className="max-h-36 mx-auto rounded-lg object-contain border border-[#2e344a]"
                />
                <div className="text-xs font-semibold text-zinc-300">{selectedFile?.name}</div>
                <div className="text-[10px] text-zinc-500">
                  {((selectedFile?.size || 0) / 1024 / 1024).toFixed(2)} MB • Click to change
                </div>
              </div>
            ) : (
              <div className="space-y-2 py-4">
                <div className="w-10 h-10 mx-auto rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Upload className="w-5 h-5" />
                </div>
                <div className="font-semibold text-zinc-200">
                  Drop image, video, or audio files here
                </div>
                <div className="text-[10px] text-zinc-500">
                  Supports MP4, MOV, PNG, JPG, WebP, MP3 up to 250MB
                </div>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*,audio/*"
              onChange={(e) => handleFiles(e.target.files)}
              className="hidden"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
              Asset Title
            </label>
            <input
              type="text"
              required
              value={mediaTitle}
              onChange={(e) => setMediaTitle(e.target.value)}
              placeholder="e.g. Neon City Plate Reference"
              className="w-full bg-[#161824] border border-[#262b3c] rounded-xl px-3 py-2 text-zinc-200 focus:outline-none focus:border-amber-500/50"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setUploadModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 font-semibold text-xs hover:bg-zinc-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedFile || isUploading}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold text-xs hover:brightness-110 disabled:opacity-50 flex items-center gap-1.5"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Uploading Asset...</span>
                </>
              ) : (
                <span>Add to Library</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
