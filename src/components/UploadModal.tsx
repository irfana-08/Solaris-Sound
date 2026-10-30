import React, { useState, useRef } from 'react';
import { Song, Playlist } from '../types/music';
import { X, UploadCloud, FileAudio, CheckCircle2, Trash2, Plus, Sparkles, Music } from 'lucide-react';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  playlists: Playlist[];
  onAddMultipleSongs: (
    newSongs: { song: Song; file?: File }[],
    targetPlaylistId?: string
  ) => void;
}

interface PendingFile {
  id: string;
  file: File;
  title: string;
  artist: string;
  sizeMb: string;
}

const ART_PRESETS = [
  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=800&q=80',
];

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  playlists,
  onAddMultipleSongs,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [targetPlaylistId, setTargetPlaylistId] = useState<string>('all');
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFiles = (fileList: FileList | File[]) => {
    const validFiles: PendingFile[] = [];

    Array.from(fileList).forEach((f) => {
      if (f.type.startsWith('audio/') || f.name.match(/\.(mp3|wav|ogg|m4a|aac|flac)$/i)) {
        // Parse Title and Artist from filename (e.g. "The Weeknd - After Hours.mp3" or "SongName.mp3")
        const cleanName = f.name.replace(/\.[^/.]+$/, '');
        let artist = 'Local Artist';
        let title = cleanName;

        if (cleanName.includes('-')) {
          const parts = cleanName.split('-');
          artist = parts[0].trim();
          title = parts.slice(1).join('-').trim();
        }

        validFiles.push({
          id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          file: f,
          title,
          artist,
          sizeMb: (f.size / (1024 * 1024)).toFixed(2),
        });
      }
    });

    if (validFiles.length > 0) {
      setPendingFiles((prev) => [...prev, ...validFiles]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleRemovePending = (id: string) => {
    setPendingFiles((prev) => prev.filter((p) => p.id !== id));
  };

  const handleUpdateTitle = (id: string, newTitle: string) => {
    setPendingFiles((prev) =>
      prev.map((p) => (p.id === id ? { ...p, title: newTitle } : p))
    );
  };

  const handleUpdateArtist = (id: string, newArtist: string) => {
    setPendingFiles((prev) =>
      prev.map((p) => (p.id === id ? { ...p, artist: newArtist } : p))
    );
  };

  const handleImportAll = async () => {
    if (pendingFiles.length === 0 || isProcessing) return;
    setIsProcessing(true);

    const loadedSongs: { song: Song; file: File }[] = [];

    for (let i = 0; i < pendingFiles.length; i++) {
      const p = pendingFiles[i];
      const audioUrl = URL.createObjectURL(p.file);
      const coverArt = ART_PRESETS[i % ART_PRESETS.length];

      // Measure duration
      const duration = await new Promise<number>((resolve) => {
        const audio = new Audio();
        audio.src = audioUrl;
        audio.onloadedmetadata = () => {
          resolve(Math.round(audio.duration) || 180);
        };
        audio.onerror = () => {
          resolve(180);
        };
      });

      const songObj: Song = {
        id: `local-${Date.now()}-${i}`,
        title: p.title || 'Untitled Track',
        artist: p.artist || 'Local Artist',
        album: 'Device Music',
        duration,
        year: new Date().getFullYear(),
        genre: 'User Audio',
        coverArt,
        audioUrl,
        isUserUploaded: true,
        lyrics: [],
        synthPreset: {
          bpm: 120,
          key: 'C Major',
          timbre: 'warm-synth',
          drumStyle: 'pop-punch',
          scale: [261.63, 293.66, 329.63, 392.0, 440.0],
          bassline: [130.81, 164.81],
          chords: [[261.63, 329.63, 392.0]],
          melodyPattern: [{ noteIndex: 0, dur: 1 }, { noteIndex: 2, dur: 1 }]
        }
      };

      loadedSongs.push({ song: songObj, file: p.file });
    }

    onAddMultipleSongs(
      loadedSongs,
      targetPlaylistId === 'all' ? undefined : targetPlaylistId
    );
    setIsProcessing(false);
    setPendingFiles([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity"
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-xl max-h-[90vh] glass-panel rounded-3xl p-6 flex flex-col shadow-2xl z-10 border border-amber-500/25 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-amber-500/15">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg text-white">
                Add Multiple Songs from Device
              </h2>
              <p className="text-xs text-amber-300/70">
                Select or drag & drop multiple MP3, WAV, FLAC, M4A audio files
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-full hover:bg-white/10 text-stone-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dropzone */}
        <div className="py-4 space-y-4 flex-1 overflow-y-auto pr-1">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-amber-400 bg-amber-500/25 scale-[1.01]'
                : 'border-amber-500/30 hover:border-amber-400 bg-black/40'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="audio/*,.mp3,.wav,.ogg,.m4a,.aac,.flac"
              className="hidden"
              onChange={(e) => {
                if (e.target.files) {
                  handleFiles(e.target.files);
                }
              }}
            />

            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shadow-inner">
                <FileAudio className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-white">
                Drag & Drop multiple audio files here, or <span className="text-amber-400 underline">Browse Device</span>
              </p>
              <p className="text-xs text-stone-400">
                Choose multiple songs simultaneously (MP3, WAV, AAC, M4A, OGG)
              </p>
            </div>
          </div>

          {/* Target Playlist Selector */}
          {pendingFiles.length > 0 && (
            <div className="flex items-center justify-between p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20">
              <span className="text-xs font-semibold text-amber-200 flex items-center gap-1.5">
                <Music className="w-4 h-4 text-amber-400" />
                <span>Add these songs to:</span>
              </span>
              <select
                value={targetPlaylistId}
                onChange={(e) => setTargetPlaylistId(e.target.value)}
                className="bg-black/60 border border-amber-500/30 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                <option value="all">Main Library (All Songs)</option>
                {playlists.map((pl) => (
                  <option key={pl.id} value={pl.id}>
                    Playlist: {pl.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Selected File List */}
          {pendingFiles.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-amber-300 font-semibold px-1">
                <span>Selected Tracks ({pendingFiles.length})</span>
                <button
                  onClick={() => setPendingFiles([])}
                  className="text-stone-400 hover:text-red-400 text-[11px]"
                >
                  Clear all
                </button>
              </div>

              <div className="max-h-52 overflow-y-auto space-y-2 bg-black/30 border border-white/5 rounded-2xl p-2.5">
                {pendingFiles.map((p) => (
                  <div
                    key={p.id}
                    className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <FileAudio className="w-4 h-4 text-amber-400 shrink-0" />
                      <div className="grid grid-cols-2 gap-2 flex-1 min-w-0">
                        <input
                          type="text"
                          value={p.title}
                          onChange={(e) => handleUpdateTitle(p.id, e.target.value)}
                          placeholder="Title"
                          className="bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-white text-xs focus:outline-none focus:border-amber-400 truncate"
                        />
                        <input
                          type="text"
                          value={p.artist}
                          onChange={(e) => handleUpdateArtist(p.id, e.target.value)}
                          placeholder="Artist"
                          className="bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-stone-300 text-xs focus:outline-none focus:border-amber-400 truncate"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] text-stone-400 font-mono">
                        {p.sizeMb} MB
                      </span>
                      <button
                        onClick={() => handleRemovePending(p.id)}
                        className="text-stone-400 hover:text-red-400 p-1 transition-colors cursor-pointer"
                        title="Remove file"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-amber-500/15 flex items-center justify-between gap-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 rounded-xl border border-amber-500/30 text-amber-300 hover:text-white hover:bg-white/5 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Select More Files</span>
          </button>

          <button
            onClick={handleImportAll}
            disabled={pendingFiles.length === 0 || isProcessing}
            className="flex-1 max-w-xs py-2.5 bg-gradient-to-r from-amber-500 via-orange-400 to-amber-500 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold rounded-xl text-xs transition-all shadow-lg shadow-amber-500/30 disabled:opacity-40 disabled:pointer-events-none cursor-pointer flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <span>Importing & Processing...</span>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>
                  Import {pendingFiles.length} {pendingFiles.length === 1 ? 'Song' : 'Songs'} & Play
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
