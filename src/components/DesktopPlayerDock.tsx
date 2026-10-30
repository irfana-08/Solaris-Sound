import React, { useState } from 'react';
import { Song, LoopMode } from '../types/music';
import { AudioWaveform } from './AudioWaveform';
import { formatTime } from '../utils/format';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  Volume1,
  ListMusic,
  MessageSquareText,
  SlidersHorizontal,
  FolderOpen,
  PlusCircle
} from 'lucide-react';

interface DesktopPlayerDockProps {
  currentSong: Song;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isShuffle: boolean;
  loopMode: LoopMode;
  onTogglePlay: () => void;
  onPrev: () => void;
  onNext: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (vol: number) => void;
  onToggleMute: () => void;
  onToggleShuffle: () => void;
  onCycleLoop: () => void;
  onOpenLyrics: () => void;
  onOpenPlaylist: () => void;
  onOpenEqualizer: () => void;
  onOpenUpload: () => void;
  onOpenCreatePlaylist: () => void;
}

export const DesktopPlayerDock: React.FC<DesktopPlayerDockProps> = ({
  currentSong,
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  isShuffle,
  loopMode,
  onTogglePlay,
  onPrev,
  onNext,
  onSeek,
  onVolumeChange,
  onToggleMute,
  onToggleShuffle,
  onCycleLoop,
  onOpenLyrics,
  onOpenPlaylist,
  onOpenEqualizer,
  onOpenUpload,
  onOpenCreatePlaylist,
}) => {
  const [showVolumePopup, setShowVolumePopup] = useState(false);
  const [isHoveringProgress, setIsHoveringProgress] = useState(false);
  const [hoverTime, setHoverTime] = useState<number | null>(null);

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleProgressBarMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setHoverTime(ratio * duration);
  };

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    onSeek(ratio * duration);
  };

  const activeVol = isMuted ? 0 : volume;

  return (
    <div className="w-full max-w-5xl mx-auto px-4 z-40">
      <div className="glass-pill rounded-full px-5 py-3.5 flex items-center justify-between gap-4 transition-all duration-300 shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
        {/* Left: Playback Controls (Prev, Play, Next) */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onPrev}
            aria-label="Previous Track"
            className="w-10 h-10 rounded-full hover:bg-white/10 active:scale-95 transition-all text-amber-200/80 hover:text-white flex items-center justify-center cursor-pointer"
          >
            <SkipBack className="w-5 h-5 fill-current" />
          </button>

          <button
            onClick={onTogglePlay}
            aria-label={isPlaying ? 'Pause' : 'Play'}
            className="w-12 h-12 rounded-full bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 text-stone-950 flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(245,158,11,0.5)] cursor-pointer"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-stone-950 text-stone-950" />
            ) : (
              <Play className="w-5 h-5 fill-stone-950 text-stone-950 ml-0.5" />
            )}
          </button>

          <button
            onClick={onNext}
            aria-label="Next Track"
            className="w-10 h-10 rounded-full hover:bg-white/10 active:scale-95 transition-all text-amber-200/80 hover:text-white flex items-center justify-center cursor-pointer"
          >
            <SkipForward className="w-5 h-5 fill-current" />
          </button>
        </div>

        {/* Center: Track Details & Interactive Scrubber Progress Bar */}
        <div className="flex-1 flex items-center gap-4 min-w-0 px-2">
          {/* Mini Thumbnail */}
          <div className="relative w-11 h-11 rounded-lg overflow-hidden shrink-0 border border-amber-500/30 shadow-md">
            <img
              src={currentSong.coverArt}
              alt={currentSong.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Title & Artist */}
          <div className="min-w-0 w-36 lg:w-44 shrink-0">
            <h4 className="text-sm font-semibold text-white truncate tracking-tight">
              {currentSong.title}
            </h4>
            <p className="text-xs text-amber-300/80 truncate">
              {currentSong.artist}
            </p>
          </div>

          {/* Progress Bar & Waveform Container */}
          <div className="flex-1 flex flex-col justify-center gap-1.5 min-w-0">
            <div className="flex items-center justify-between text-[11px] text-amber-200/70 font-mono tabular-nums">
              <span>{formatTime(currentTime)}</span>
              <div className="flex items-center gap-2">
                <AudioWaveform isPlaying={isPlaying} barCount={10} size="sm" />
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Clickable scrub track */}
            <div
              className="relative w-full h-2 rounded-full bg-white/10 cursor-pointer group py-1"
              onClick={handleProgressBarClick}
              onMouseMove={handleProgressBarMouseMove}
              onMouseEnter={() => setIsHoveringProgress(true)}
              onMouseLeave={() => {
                setIsHoveringProgress(false);
                setHoverTime(null);
              }}
            >
              {/* Progress background bar */}
              <div className="w-full h-1.5 rounded-full bg-stone-800/80 overflow-hidden relative">
                {/* Active progress with orange-yellow gradient */}
                <div
                  className="h-full bg-gradient-to-r from-amber-500 via-orange-400 to-yellow-300 transition-all duration-75 relative rounded-full"
                  style={{ width: `${progressPercent}%` }}
                >
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white shadow-[0_0_8px_#fbbf24] opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>

              {/* Hover preview tooltip */}
              {isHoveringProgress && hoverTime !== null && (
                <div
                  className="absolute -top-7 px-1.5 py-0.5 rounded bg-black/90 border border-amber-400/30 text-[10px] text-amber-200 pointer-events-none transform -translate-x-1/2 font-mono tabular-nums"
                  style={{ left: `${(hoverTime / duration) * 100}%` }}
                >
                  {formatTime(hoverTime)}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Actions, Modals & Volume Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Shuffle Toggle */}
          <button
            onClick={onToggleShuffle}
            title={isShuffle ? 'Shuffle On' : 'Shuffle Off'}
            aria-label="Toggle Shuffle"
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              isShuffle ? 'text-amber-400 bg-amber-500/20' : 'text-stone-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Shuffle className="w-4 h-4" />
          </button>

          {/* Loop Toggle */}
          <button
            onClick={onCycleLoop}
            title={`Loop: ${loopMode}`}
            aria-label="Cycle Loop Mode"
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              loopMode !== 'off' ? 'text-amber-400 bg-amber-500/20' : 'text-stone-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {loopMode === 'one' ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
          </button>

          {/* Lyrics Modal Button */}
          <button
            onClick={onOpenLyrics}
            title="Lyrics & Track Info"
            aria-label="Open Lyrics"
            className="w-9 h-9 rounded-full text-amber-200/80 hover:text-white hover:bg-white/10 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
          >
            <MessageSquareText className="w-4 h-4" />
          </button>

          {/* Playlist Queue Button */}
          <button
            onClick={onOpenPlaylist}
            title="Playlist & Queue"
            aria-label="Open Playlists"
            className="w-9 h-9 rounded-full text-amber-200/80 hover:text-white hover:bg-white/10 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
          >
            <ListMusic className="w-4 h-4" />
          </button>

          {/* Create Playlist Button */}
          <button
            onClick={onOpenCreatePlaylist}
            title="Create Custom Playlist"
            aria-label="New Playlist"
            className="w-9 h-9 rounded-full text-amber-200/80 hover:text-white hover:bg-white/10 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
          </button>

          {/* Equalizer Modal Button */}
          <button
            onClick={onOpenEqualizer}
            title="Equalizer & Sound FX"
            aria-label="Open Equalizer"
            className="w-9 h-9 rounded-full text-amber-200/80 hover:text-white hover:bg-white/10 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>

          {/* Upload Local Audio Button */}
          <button
            onClick={onOpenUpload}
            title="Upload Custom MP3 / WAV"
            aria-label="Upload Audio"
            className="w-9 h-9 rounded-full text-amber-200/80 hover:text-white hover:bg-white/10 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
          >
            <FolderOpen className="w-4 h-4" />
          </button>

          {/* Volume Control with Hover / Expand Slider */}
          <div
            className="relative flex items-center"
            onMouseEnter={() => setShowVolumePopup(true)}
            onMouseLeave={() => setShowVolumePopup(false)}
          >
            <button
              onClick={onToggleMute}
              title={isMuted ? 'Unmute' : 'Mute'}
              aria-label="Volume"
              className="w-9 h-9 rounded-full text-amber-200/80 hover:text-white hover:bg-white/10 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-red-400" />
              ) : volume < 0.5 ? (
                <Volume1 className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>

            {/* Expandable volume slider */}
            <div
              className={`transition-all duration-300 overflow-hidden flex items-center ${
                showVolumePopup ? 'w-24 opacity-100 pl-1' : 'w-0 opacity-0'
              }`}
            >
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={activeVol}
                onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                aria-label="Volume Slider"
                className="w-20"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
