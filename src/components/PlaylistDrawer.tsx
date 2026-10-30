import React, { useState } from 'react';
import { Song, Playlist } from '../types/music';
import { formatTime } from '../utils/format';
import {
  X,
  Plus,
  Play,
  Music,
  Check,
  Search,
  Radio,
  Sparkles,
  Trash2,
  FolderPlus,
  FolderHeart,
  RotateCcw
} from 'lucide-react';

interface PlaylistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  playlists: Playlist[];
  songs: Song[];
  currentSongId: string;
  isPlaying: boolean;
  isAutoplay: boolean;
  onToggleAutoplay: () => void;
  onSelectSong: (songId: string) => void;
  onOpenCreatePlaylist: () => void;
  onOpenUpload: () => void;
  onDeletePlaylist: (id: string) => void;
  onAddSongToPlaylist: (songId: string, playlistId: string) => void;
  onRemoveSongFromPlaylist: (songId: string, playlistId: string) => void;
  onRestoreDefaultPlaylists?: () => void;
}

export const PlaylistDrawer: React.FC<PlaylistDrawerProps> = ({
  isOpen,
  onClose,
  playlists,
  songs,
  currentSongId,
  isPlaying,
  isAutoplay,
  onToggleAutoplay,
  onSelectSong,
  onOpenCreatePlaylist,
  onOpenUpload,
  onDeletePlaylist,
  onAddSongToPlaylist,
  onRemoveSongFromPlaylist,
  onRestoreDefaultPlaylists,
}) => {
  const [activeTab, setActiveTab] = useState<'queue' | 'playlists'>('queue');
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [songToAddToPlaylist, setSongToAddToPlaylist] = useState<Song | null>(null);
  const [playlistToDelete, setPlaylistToDelete] = useState<Playlist | null>(null);

  if (!isOpen) return null;

  const filteredSongs = songs.filter(
    (s) =>
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.album.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activePlaylist = playlists.find((p) => p.id === selectedPlaylistId);
  const playlistSongs = activePlaylist
    ? songs.filter((s) => activePlaylist.songIds.includes(s.id))
    : [];

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
      />

      {/* Slide-over panel */}
      <div className="relative w-full max-w-md h-full glass-panel border-l border-amber-500/20 flex flex-col shadow-2xl z-10 animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-5 border-b border-amber-500/15 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
              <Music className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg text-white">
                Music Library
              </h2>
              <p className="text-xs text-amber-300/70">
                {songs.length} tracks · {playlists.length} playlists
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close panel"
            className="w-8 h-8 rounded-full hover:bg-white/10 text-stone-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher & Autoplay */}
        <div className="px-5 pt-3 pb-2 flex items-center justify-between border-b border-amber-500/10">
          <div className="flex gap-2">
            <button
              onClick={() => {
                setActiveTab('queue');
                setSelectedPlaylistId(null);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'queue' && !selectedPlaylistId
                  ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/30'
                  : 'text-stone-300 hover:text-white hover:bg-white/5'
              }`}
            >
              All Tracks ({songs.length})
            </button>
            <button
              onClick={() => setActiveTab('playlists')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'playlists'
                  ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/30'
                  : 'text-stone-300 hover:text-white hover:bg-white/5'
              }`}
            >
              Playlists ({playlists.length})
            </button>
          </div>

          {/* Autoplay Switch */}
          <button
            onClick={onToggleAutoplay}
            className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
              isAutoplay
                ? 'border-amber-400/50 bg-amber-500/15 text-amber-300'
                : 'border-white/10 text-stone-400 hover:text-stone-200'
            }`}
          >
            <Radio className="w-3 h-3" />
            <span>Autoplay: {isAutoplay ? 'ON' : 'OFF'}</span>
          </button>
        </div>

        {/* Action Bar: Create Playlist & Batch Upload */}
        <div className="px-5 py-2.5 flex items-center gap-2 border-b border-amber-500/10 bg-amber-950/20">
          <button
            onClick={onOpenCreatePlaylist}
            className="flex-1 py-1.5 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Own Playlist</span>
          </button>

          <button
            onClick={onOpenUpload}
            className="flex-1 py-1.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-stone-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <FolderPlus className="w-3.5 h-3.5 text-amber-400" />
            <span>Upload From Device</span>
          </button>
        </div>

        {/* Search bar */}
        <div className="px-5 py-2.5">
          <div className="relative">
            <Search className="w-4 h-4 text-amber-400/60 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search tracks, artists, albums..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/40 border border-amber-500/20 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-stone-400 focus:outline-none focus:border-amber-400 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white text-xs"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Main Body */}
        <div className="flex-1 overflow-y-auto px-5 py-2 space-y-2">
          {/* PLAYLISTS LIST TAB */}
          {activeTab === 'playlists' && !selectedPlaylistId && (
            <div className="space-y-3">
              {/* Big CTA Card for creating own playlist */}
              <div
                onClick={onOpenCreatePlaylist}
                className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/20 to-orange-500/10 border-2 border-dashed border-amber-500/40 hover:border-amber-400 hover:bg-amber-500/25 transition-all flex items-center gap-3 cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-xl bg-amber-500/30 text-amber-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Plus className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                    + Create Your Own Playlist
                  </h4>
                  <p className="text-xs text-amber-200/70">
                    Add custom title, cover art, and hand-pick your favorite tracks.
                  </p>
                </div>
              </div>

              <div className="space-y-2 pt-1">
                {playlists.map((pl) => (
                  <div
                    key={pl.id}
                    className="p-3 rounded-2xl bg-white/5 hover:bg-amber-500/10 border border-amber-500/10 hover:border-amber-500/30 transition-all flex items-center justify-between gap-3 group"
                  >
                    <div
                      onClick={() => setSelectedPlaylistId(pl.id)}
                      className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
                    >
                      <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-amber-400/20 shadow">
                        <img
                          src={pl.coverArt}
                          alt={pl.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-sm font-semibold text-white group-hover:text-amber-300 transition-colors truncate">
                            {pl.name}
                          </h4>
                          {pl.isCustom && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] bg-amber-500/30 text-amber-300 font-bold">
                              Custom
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-stone-400 line-clamp-1">
                          {pl.description}
                        </p>
                        <span className="text-[11px] text-amber-400/80 mt-0.5 block font-mono">
                          {pl.songIds.length} tracks
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {playlistToDelete?.id === pl.id ? (
                        <div className="flex items-center gap-1 bg-red-950/80 border border-red-500/40 rounded-xl px-2 py-1">
                          <span className="text-[10px] text-red-200">Delete?</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeletePlaylist(pl.id);
                              setPlaylistToDelete(null);
                            }}
                            className="px-2 py-0.5 bg-red-600 hover:bg-red-500 text-white text-[10px] font-bold rounded-lg cursor-pointer transition-colors"
                          >
                            Yes
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setPlaylistToDelete(null);
                            }}
                            className="px-1.5 py-0.5 bg-white/10 hover:bg-white/20 text-stone-300 text-[10px] rounded-lg cursor-pointer transition-colors"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setPlaylistToDelete(pl);
                          }}
                          title={`Delete playlist "${pl.name}"`}
                          aria-label={`Delete ${pl.name}`}
                          className="text-stone-500 hover:text-red-400 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {onRestoreDefaultPlaylists && (
                <div className="pt-2">
                  <button
                    onClick={() => {
                      onRestoreDefaultPlaylists();
                    }}
                    className="w-full py-2 px-3 rounded-xl border border-amber-500/20 hover:border-amber-500/40 text-amber-300/80 hover:text-amber-200 text-xs flex items-center justify-center gap-1.5 hover:bg-white/5 transition-all cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restore Default Playlists</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* PLAYLIST DETAIL VIEW */}
          {selectedPlaylistId && activePlaylist && (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-1">
                <button
                  onClick={() => setSelectedPlaylistId(null)}
                  className="text-xs text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  ← Back to All Playlists
                </button>
                <div className="flex items-center gap-1">
                  {playlistToDelete?.id === activePlaylist.id ? (
                    <div className="flex items-center gap-1 bg-red-950 border border-red-500/40 rounded-xl px-2 py-0.5">
                      <span className="text-[10px] text-red-200">Delete this playlist?</span>
                      <button
                        onClick={() => {
                          onDeletePlaylist(activePlaylist.id);
                          setSelectedPlaylistId(null);
                          setPlaylistToDelete(null);
                        }}
                        className="px-2 py-0.5 bg-red-600 hover:bg-red-500 text-white text-[10px] font-bold rounded-lg cursor-pointer"
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => setPlaylistToDelete(null)}
                        className="px-1.5 py-0.5 bg-white/10 hover:bg-white/20 text-stone-300 text-[10px] rounded-lg cursor-pointer"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setPlaylistToDelete(activePlaylist)}
                      className="text-xs text-stone-400 hover:text-red-400 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Playlist</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 shadow-md">
                <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-amber-400/30">
                  <img
                    src={activePlaylist.coverArt}
                    alt={activePlaylist.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display font-bold text-sm text-white truncate">
                      {activePlaylist.name}
                    </h3>
                    {activePlaylist.isCustom && (
                      <span className="text-[10px] text-amber-400 font-semibold">
                        Custom
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone-300 line-clamp-2">
                    {activePlaylist.description}
                  </p>
                  <span className="text-[11px] text-amber-300/80 font-mono mt-0.5 block">
                    {playlistSongs.length} songs
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 pt-1">
                {playlistSongs.map((song, i) => (
                  <div key={song.id} className="relative group">
                    <TrackRow
                      song={song}
                      index={i + 1}
                      isCurrent={song.id === currentSongId}
                      isPlaying={isPlaying}
                      onSelect={() => onSelectSong(song.id)}
                      onAddToPlaylist={() => setSongToAddToPlaylist(song)}
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveSongFromPlaylist(song.id, activePlaylist.id);
                      }}
                      title="Remove from this playlist"
                      aria-label={`Remove ${song.title} from ${activePlaylist.name}`}
                      className="absolute right-12 top-1/2 -translate-y-1/2 p-1.5 text-stone-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                {playlistSongs.length === 0 && (
                  <div className="py-8 text-center text-stone-400 text-xs">
                    No tracks in this playlist yet. Use "All Tracks" to add songs!
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ALL TRACKS TAB */}
          {activeTab === 'queue' && (
            <div className="space-y-1.5">
              {filteredSongs.map((song, i) => (
                <TrackRow
                  key={song.id}
                  song={song}
                  index={i + 1}
                  isCurrent={song.id === currentSongId}
                  isPlaying={isPlaying}
                  onSelect={() => onSelectSong(song.id)}
                  onAddToPlaylist={() => setSongToAddToPlaylist(song)}
                />
              ))}

              {filteredSongs.length === 0 && (
                <div className="py-12 text-center text-stone-400 text-xs">
                  No matching tracks found for "{searchQuery}".
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal: Add Song to Playlist */}
        {songToAddToPlaylist && (
          <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md p-6 flex flex-col justify-center">
            <div className="glass-panel rounded-2xl p-5 border border-amber-500/30 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <FolderHeart className="w-4 h-4 text-amber-400" />
                  <span>Add "{songToAddToPlaylist.title}" to:</span>
                </span>
                <button
                  onClick={() => setSongToAddToPlaylist(null)}
                  className="text-stone-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="max-h-48 overflow-y-auto space-y-1.5">
                {playlists.map((pl) => {
                  const alreadyIn = pl.songIds.includes(songToAddToPlaylist.id);
                  return (
                    <button
                      key={pl.id}
                      onClick={() => {
                        if (!alreadyIn) {
                          onAddSongToPlaylist(songToAddToPlaylist.id, pl.id);
                        }
                        setSongToAddToPlaylist(null);
                      }}
                      className={`w-full p-2.5 rounded-xl text-left text-xs flex items-center justify-between transition-colors ${
                        alreadyIn
                          ? 'bg-amber-500/20 text-amber-300 font-semibold'
                          : 'bg-white/5 hover:bg-white/10 text-stone-200'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{pl.name}</span>
                        {pl.isCustom && (
                          <span className="text-[9px] px-1 bg-amber-500/20 text-amber-300 rounded">
                            Custom
                          </span>
                        )}
                      </div>
                      {alreadyIn ? (
                        <span className="text-[10px] text-amber-400">Added ✓</span>
                      ) : (
                        <Plus className="w-3.5 h-3.5 text-stone-400" />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="pt-2 flex justify-between items-center text-xs">
                <button
                  onClick={() => {
                    setSongToAddToPlaylist(null);
                    onOpenCreatePlaylist();
                  }}
                  className="text-amber-400 hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Playlist</span>
                </button>
                <button
                  onClick={() => setSongToAddToPlaylist(null)}
                  className="px-3 py-1 bg-white/10 rounded-lg text-stone-300 hover:text-white"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer info */}
        <div className="p-3 border-t border-amber-500/15 bg-black/40 text-center text-[11px] text-amber-200/60">
          Tap any track to play in 3D Cover Flow immediately.
        </div>
      </div>
    </div>
  );
};

interface TrackRowProps {
  song: Song;
  index: number;
  isCurrent: boolean;
  isPlaying: boolean;
  onSelect: () => void;
  onAddToPlaylist: () => void;
}

const TrackRow: React.FC<TrackRowProps> = ({
  song,
  index,
  isCurrent,
  isPlaying,
  onSelect,
  onAddToPlaylist,
}) => {
  return (
    <div
      onClick={onSelect}
      className={`p-2.5 rounded-xl transition-all flex items-center justify-between gap-3 cursor-pointer group ${
        isCurrent
          ? 'bg-amber-500/20 border border-amber-500/40 text-amber-200 shadow-sm'
          : 'hover:bg-white/5 border border-transparent text-stone-300'
      }`}
    >
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <div className="w-5 text-center text-xs text-stone-400 group-hover:text-amber-300 font-mono shrink-0">
          {isCurrent && isPlaying ? (
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
          ) : (
            index
          )}
        </div>

        <div className="relative w-9 h-9 rounded-md overflow-hidden shrink-0 border border-white/10">
          <img
            src={song.coverArt}
            alt={song.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="min-w-0 flex-1">
          <h4
            className={`text-xs font-semibold truncate ${
              isCurrent ? 'text-amber-300' : 'text-white group-hover:text-amber-200'
            }`}
          >
            {song.title}
          </h4>
          <p className="text-[11px] text-stone-400 truncate">
            {song.artist}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 text-xs text-stone-400 font-mono tabular-nums shrink-0">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddToPlaylist();
          }}
          title="Add to playlist"
          className="p-1 rounded-md hover:bg-white/10 text-stone-400 hover:text-amber-300 transition-colors cursor-pointer"
        >
          <FolderHeart className="w-3.5 h-3.5" />
        </button>

        <span>{formatTime(song.duration)}</span>

        <button
          aria-label={`Play ${song.title}`}
          className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
            isCurrent
              ? 'bg-amber-500 text-stone-950 shadow-sm'
              : 'opacity-0 group-hover:opacity-100 hover:bg-white/10 text-stone-300'
          }`}
        >
          <Play className="w-3 h-3 fill-current ml-0.5" />
        </button>
      </div>
    </div>
  );
};
