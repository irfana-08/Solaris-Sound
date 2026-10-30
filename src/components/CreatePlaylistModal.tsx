import React, { useState } from 'react';
import { Song, Playlist } from '../types/music';
import { X, ListMusic, Plus, Check, Search, Music, Sparkles } from 'lucide-react';

interface CreatePlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  songs: Song[];
  onCreatePlaylist: (playlist: Playlist) => void;
}

const PRESET_COVERS = [
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=400&q=80',
];

export const CreatePlaylistModal: React.FC<CreatePlaylistModalProps> = ({
  isOpen,
  onClose,
  songs,
  onCreatePlaylist,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCover, setSelectedCover] = useState(PRESET_COVERS[0]);
  const [selectedSongIds, setSelectedSongIds] = useState<string[]>([]);
  const [songFilter, setSongFilter] = useState('');

  if (!isOpen) return null;

  const toggleSongSelection = (id: string) => {
    setSelectedSongIds((prev) =>
      prev.includes(id) ? prev.filter((sId) => sId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedSongIds(songs.map((s) => s.id));
  };

  const handleDeselectAll = () => {
    setSelectedSongIds([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newPlaylist: Playlist = {
      id: `custom-pl-${Date.now()}`,
      name: name.trim(),
      description: description.trim() || 'My custom curated collection',
      coverArt: selectedCover,
      songIds: selectedSongIds.length > 0 ? selectedSongIds : songs.slice(0, 3).map((s) => s.id),
      isCustom: true,
    };

    onCreatePlaylist(newPlaylist);
    setName('');
    setDescription('');
    setSelectedSongIds([]);
    onClose();
  };

  const filteredSongs = songs.filter(
    (s) =>
      s.title.toLowerCase().includes(songFilter.toLowerCase()) ||
      s.artist.toLowerCase().includes(songFilter.toLowerCase())
  );

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
              <ListMusic className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg text-white">
                Create New Playlist
              </h2>
              <p className="text-xs text-amber-300/70">
                Design your custom playlist and pick songs
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          {/* Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-amber-300/90 block mb-1">
                Playlist Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Amber Beats, Summer Hits"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-xl text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-amber-300/90 block mb-1">
                Description
              </label>
              <input
                type="text"
                placeholder="Short description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-xl text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Cover Art Selector */}
          <div>
            <label className="text-xs font-semibold text-amber-300/90 block mb-1.5">
              Choose Cover Artwork
            </label>
            <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
              {PRESET_COVERS.map((cov, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedCover(cov)}
                  className={`relative w-14 h-14 rounded-xl overflow-hidden shrink-0 cursor-pointer transition-all ${
                    selectedCover === cov
                      ? 'ring-2 ring-amber-400 scale-105 shadow-md shadow-amber-500/40'
                      : 'opacity-60 hover:opacity-100'
                  }`}
                >
                  <img
                    src={cov}
                    alt={`Cover preset ${idx + 1}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  {selectedCover === cov && (
                    <div className="absolute inset-0 bg-amber-500/30 flex items-center justify-center">
                      <Check className="w-4 h-4 text-white drop-shadow" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Song Picker with Checkboxes */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-amber-300/90">
                Select Songs ({selectedSongIds.length} chosen)
              </span>
              <div className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-amber-400 hover:underline"
                >
                  Select All
                </button>
                <span className="text-white/20">|</span>
                <button
                  type="button"
                  onClick={handleDeselectAll}
                  className="text-stone-400 hover:text-white"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Filter */}
            <div className="relative mb-2">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Filter tracks to add..."
                value={songFilter}
                onChange={(e) => setSongFilter(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* List */}
            <div className="max-h-48 overflow-y-auto space-y-1 bg-black/30 border border-white/5 rounded-2xl p-2">
              {filteredSongs.map((song) => {
                const isSelected = selectedSongIds.includes(song.id);
                return (
                  <div
                    key={song.id}
                    onClick={() => toggleSongSelection(song.id)}
                    className={`p-2 rounded-xl flex items-center justify-between gap-3 cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-amber-500/20 border border-amber-500/40 text-amber-200'
                        : 'hover:bg-white/5 text-stone-300 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                          isSelected
                            ? 'bg-amber-500 border-amber-400 text-stone-950'
                            : 'border-stone-500 bg-transparent'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>

                      <div className="w-8 h-8 rounded-md overflow-hidden shrink-0 border border-white/10">
                        <img
                          src={song.coverArt}
                          alt={song.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs font-semibold truncate text-white">
                          {song.title}
                        </p>
                        <p className="text-[10px] text-amber-300/70 truncate">
                          {song.artist}
                        </p>
                      </div>
                    </div>

                    <span className="text-[10px] text-stone-400 font-mono">
                      {Math.floor(song.duration / 60)}:
                      {String(Math.floor(song.duration % 60)).padStart(2, '0')}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={!name.trim()}
              className="w-full py-2.5 bg-gradient-to-r from-amber-500 via-orange-400 to-amber-500 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold rounded-xl text-sm transition-all shadow-lg shadow-amber-500/30 disabled:opacity-40 disabled:pointer-events-none cursor-pointer flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Create Playlist ({selectedSongIds.length} Songs)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
