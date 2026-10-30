import React from 'react';
import { Song, LoopMode } from '../types/music';
import { AudioWaveform } from './AudioWaveform';
import { formatTimeElapsedTotal } from '../utils/format';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  ListMusic,
  MessageSquareText,
  SlidersHorizontal,
  PlusCircle,
  FolderPlus
} from 'lucide-react';

interface MobilePlayerBarProps {
  currentSong: Song;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  isShuffle: boolean;
  loopMode: LoopMode;
  onTogglePlay: () => void;
  onPrev: () => void;
  onNext: () => void;
  onSeek: (time: number) => void;
  onToggleShuffle: () => void;
  onCycleLoop: () => void;
  onOpenLyrics: () => void;
  onOpenPlaylist: () => void;
  onOpenEqualizer: () => void;
  onOpenCreatePlaylist: () => void;
  onOpenUpload: () => void;
}

export const MobilePlayerBar: React.FC<MobilePlayerBarProps> = ({
  currentSong,
  isPlaying,
  currentTime,
  duration,
  isShuffle,
  loopMode,
  onTogglePlay,
  onPrev,
  onNext,
  onSeek,
  onToggleShuffle,
  onCycleLoop,
  onOpenLyrics,
  onOpenPlaylist,
  onOpenEqualizer,
  onOpenCreatePlaylist,
  onOpenUpload,
}) => {
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    onSeek(ratio * duration);
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 pb-4 pt-1 flex flex-col gap-4 z-40">
      {/* Floating Glass Pill Player Card (Matches download__14__a9edcd36.jpg) */}
      <div className="glass-pill rounded-full p-2.5 pl-3 pr-4 flex items-center justify-between gap-3 shadow-[0_15px_35px_rgba(0,0,0,0.5)] relative overflow-hidden">
        {/* Top edge glowing progress bar */}
        <div
          onClick={handleProgressBarClick}
          className="absolute top-0 left-0 right-0 h-1 bg-white/10 cursor-pointer"
        >
          <div
            className="h-full bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-300 transition-all duration-75 shadow-[0_0_8px_#f59e0b]"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Thumbnail */}
        <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 border border-amber-400/40 shadow-sm mt-0.5">
          <img
            src={currentSong.coverArt}
            alt={currentSong.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Song Title & Artist */}
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-semibold text-white truncate tracking-tight">
            {currentSong.title}
          </h4>
          <p className="text-xs text-amber-300/80 truncate">
            {currentSong.artist}
          </p>
        </div>

        {/* Live Audio Waveform & Elapsed/Total Duration */}
        <div className="flex items-center gap-2.5 shrink-0 text-amber-200/90 font-mono text-xs tabular-nums">
          <AudioWaveform isPlaying={isPlaying} barCount={8} size="sm" />
          <span>{formatTimeElapsedTotal(currentTime, duration)}</span>
        </div>
      </div>

      {/* Circular Playback Control Row (Matches download__14__a9edcd36.jpg) */}
      <div className="flex items-center justify-between px-3">
        {/* Shuffle Button */}
        <button
          onClick={onToggleShuffle}
          aria-label="Shuffle"
          className={`w-11 h-11 rounded-full flex items-center justify-center transition-all active:scale-90 ${
            isShuffle ? 'text-amber-400 bg-amber-500/20' : 'text-stone-400 hover:text-white'
          }`}
        >
          <Shuffle className="w-5 h-5" />
        </button>

        {/* Previous Button */}
        <button
          onClick={onPrev}
          aria-label="Previous Track"
          className="w-12 h-12 rounded-full flex items-center justify-center text-amber-200/90 hover:text-white active:scale-90 transition-all"
        >
          <SkipBack className="w-6 h-6 fill-current" />
        </button>

        {/* Large Center Glowing Play/Pause Button */}
        <button
          onClick={onTogglePlay}
          aria-label={isPlaying ? 'Pause' : 'Play'}
          className="relative w-16 h-16 rounded-full bg-stone-900 border border-amber-400/50 flex items-center justify-center text-amber-300 shadow-[0_0_30px_rgba(245,158,11,0.45)] hover:scale-105 active:scale-95 transition-all group cursor-pointer"
        >
          {/* Subtle outer glowing amber ring */}
          <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-300 opacity-60 blur-xs group-hover:opacity-90 transition-opacity" />

          {/* Inner circle button */}
          <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 text-stone-950 flex items-center justify-center shadow-inner">
            {isPlaying ? (
              <Pause className="w-7 h-7 fill-stone-950 text-stone-950" />
            ) : (
              <Play className="w-7 h-7 fill-stone-950 text-stone-950 ml-1" />
            )}
          </div>
        </button>

        {/* Next Button */}
        <button
          onClick={onNext}
          aria-label="Next Track"
          className="w-12 h-12 rounded-full flex items-center justify-center text-amber-200/90 hover:text-white active:scale-90 transition-all"
        >
          <SkipForward className="w-6 h-6 fill-current" />
        </button>

        {/* Repeat Button */}
        <button
          onClick={onCycleLoop}
          aria-label="Cycle Repeat"
          className={`w-11 h-11 rounded-full flex items-center justify-center transition-all active:scale-90 ${
            loopMode !== 'off' ? 'text-amber-400 bg-amber-500/20' : 'text-stone-400 hover:text-white'
          }`}
        >
          {loopMode === 'one' ? <Repeat1 className="w-5 h-5" /> : <Repeat className="w-5 h-5" />}
        </button>
      </div>

      {/* Quick Mobile Action Bar (Lyrics, Queue, New Playlist, Upload, EQ) */}
      <div className="flex items-center justify-between px-2 pt-1 text-[11px] text-amber-300/80">
        <button
          onClick={onOpenLyrics}
          className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
        >
          <MessageSquareText className="w-3.5 h-3.5" />
          <span>Lyrics</span>
        </button>

        <button
          onClick={onOpenPlaylist}
          className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
        >
          <ListMusic className="w-3.5 h-3.5" />
          <span>Library</span>
        </button>

        <button
          onClick={onOpenCreatePlaylist}
          className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer font-semibold text-amber-400"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>+ Playlist</span>
        </button>

        <button
          onClick={onOpenUpload}
          className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
        >
          <FolderPlus className="w-3.5 h-3.5" />
          <span>Device</span>
        </button>

        <button
          onClick={onOpenEqualizer}
          className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>EQ</span>
        </button>
      </div>
    </div>
  );
};
