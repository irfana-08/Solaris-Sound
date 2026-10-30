import React, { useEffect, useRef, useState } from 'react';
import { Song, LyricLine } from '../types/music';
import { formatTime } from '../utils/format';
import { X, Mic2, MicOff, Disc, Calendar, Music4, Play, Plus, Edit3, Check } from 'lucide-react';

interface LyricsModalProps {
  isOpen: boolean;
  onClose: () => void;
  song: Song;
  currentTime: number;
  onSeek: (seconds: number) => void;
  onUpdateLyrics?: (songId: string, lyrics: LyricLine[]) => void;
}

export const LyricsModal: React.FC<LyricsModalProps> = ({
  isOpen,
  onClose,
  song,
  currentTime,
  onSeek,
  onUpdateLyrics,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const activeLineRef = useRef<HTMLDivElement>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [lyricsInputText, setLyricsInputText] = useState('');

  // Filter out any legacy placeholder lines
  const rawLyrics = song.lyrics || [];
  const validLyrics = rawLyrics.filter(
    (l) =>
      l &&
      l.text &&
      !l.text.includes('Loaded directly from your device') &&
      !l.text.startsWith('♪ [Playing ')
  );
  const hasLyrics = validLyrics.length > 0;

  // Find currently active lyric line index based on playback time
  let activeIndex = -1;
  if (hasLyrics) {
    for (let i = 0; i < validLyrics.length; i++) {
      if (currentTime >= validLyrics[i].time) {
        activeIndex = i;
      } else {
        break;
      }
    }
  }

  // Smooth auto-scroll active lyric into center
  useEffect(() => {
    if (activeLineRef.current && scrollContainerRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [activeIndex]);

  const handleStartEditing = () => {
    if (hasLyrics) {
      setLyricsInputText(validLyrics.map((l) => l.text).join('\n'));
    } else {
      setLyricsInputText('');
    }
    setIsEditing(true);
  };

  const handleSaveLyrics = () => {
    if (!onUpdateLyrics) return;
    const lines = lyricsInputText
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length === 0) {
      onUpdateLyrics(song.id, []);
      setIsEditing(false);
      return;
    }

    // Distribute timestamps across song duration
    const interval = Math.max(2, Math.floor((song.duration || 180) / lines.length));
    const newLyrics: LyricLine[] = lines.map((text, i) => ({
      time: i * interval,
      text,
    }));

    onUpdateLyrics(song.id, newLyrics);
    setIsEditing(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity"
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg max-h-[85vh] glass-panel rounded-3xl p-6 flex flex-col shadow-2xl z-10 border border-amber-500/25 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-amber-500/15">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-xl overflow-hidden border border-amber-400/30 shadow-md shrink-0">
              <img
                src={song.coverArt}
                alt={song.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <h2 className="font-display font-bold text-lg text-white tracking-tight truncate">
                {song.title}
              </h2>
              <p className="text-xs text-amber-300 font-medium truncate">
                {song.artist}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={handleStartEditing}
              title="Add or Edit lyrics"
              aria-label="Add or Edit lyrics"
              className="p-1.5 rounded-lg hover:bg-white/10 text-stone-400 hover:text-amber-300 transition-colors cursor-pointer"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              aria-label="Close Lyrics"
              className="w-8 h-8 rounded-full hover:bg-white/10 text-stone-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Track Metadata Strip */}
        <div className="py-2.5 px-3 my-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-around text-xs text-amber-200/80">
          <div className="flex items-center gap-1.5 truncate">
            <Disc className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="truncate max-w-[120px]">{song.album}</span>
          </div>
          <span className="text-white/20">·</span>
          <div className="flex items-center gap-1.5 shrink-0">
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <span>{song.year}</span>
          </div>
          <span className="text-white/20">·</span>
          <div className="flex items-center gap-1.5 truncate">
            <Music4 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="truncate max-w-[100px]">{song.genre}</span>
          </div>
        </div>

        {/* Sync Info Header */}
        <div className="flex items-center justify-between text-xs text-amber-400/70 px-2 pb-1">
          <span className="flex items-center gap-1 font-semibold uppercase tracking-wider text-[11px]">
            <Mic2 className="w-3.5 h-3.5" />
            <span>Synced Lyrics</span>
          </span>
          <span className="text-[11px] text-stone-400">
            {hasLyrics ? 'Click any line to jump audio' : 'No synced lyrics'}
          </span>
        </div>

        {/* Lyrics Editor Modal Overlay if editing */}
        {isEditing ? (
          <div className="flex-1 flex flex-col py-2 space-y-3">
            <p className="text-xs text-amber-200/80">
              Paste or type lyrics line by line (one verse/line per row):
            </p>
            <textarea
              value={lyricsInputText}
              onChange={(e) => setLyricsInputText(e.target.value)}
              placeholder="Paste lyrics here..."
              rows={8}
              className="flex-1 w-full bg-black/60 border border-amber-500/30 rounded-2xl p-3 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-400 resize-none font-mono"
            />
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-3 py-1.5 text-xs text-stone-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveLyrics}
                className="px-4 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-bold rounded-xl text-xs hover:from-amber-400 hover:to-amber-500 transition-all flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Lyrics</span>
              </button>
            </div>
          </div>
        ) : (
          /* Lyrics Body or Empty State */
          <div
            ref={scrollContainerRef}
            className="flex-1 overflow-y-auto py-4 space-y-3 px-2 scroll-smooth flex flex-col"
          >
            {hasLyrics ? (
              validLyrics.map((line, index) => {
                const isActive = index === activeIndex;
                return (
                  <div
                    key={index}
                    ref={isActive ? activeLineRef : null}
                    onClick={() => onSeek(line.time)}
                    className={`group p-2.5 rounded-2xl transition-all duration-300 cursor-pointer flex items-center justify-between gap-3 ${
                      isActive
                        ? 'bg-amber-500/25 border border-amber-400/40 text-yellow-300 shadow-lg shadow-amber-500/20 scale-[1.02]'
                        : 'hover:bg-white/5 border border-transparent text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className={`font-mono text-[11px] tabular-nums shrink-0 ${
                          isActive ? 'text-amber-300 font-bold' : 'text-stone-500 group-hover:text-stone-400'
                        }`}
                      >
                        {formatTime(line.time)}
                      </span>
                      <p
                        className={`text-sm md:text-base leading-snug transition-all ${
                          isActive
                            ? 'font-bold text-yellow-200 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                            : 'font-medium'
                        }`}
                      >
                        {line.text}
                      </p>
                    </div>

                    <div className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center">
                        <Play className="w-3 h-3 fill-current ml-0.5" />
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              /* REQUIRED: Display "No lyrics available!" when there are no lyrics */
              <div className="my-auto flex flex-col items-center justify-center text-center p-6 space-y-3.5">
                <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.2)]">
                  <MicOff className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-display font-bold text-lg text-white">
                    No lyrics available
                  </h3>
                  <p className="text-xs text-amber-200/70 max-w-xs leading-relaxed mx-auto">
                    No synchronized lyrics are currently available for "{song.title}".
                  </p>
                </div>
                <button
                  onClick={handleStartEditing}
                  className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Lyrics for this Song</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="pt-3 border-t border-amber-500/15 text-center text-[11px] text-amber-200/50 font-mono">
          {hasLyrics
            ? `Position: ${formatTime(currentTime)} / ${formatTime(song.duration)}`
            : 'Audio is playing normally in Solaris Sound'}
        </div>
      </div>
    </div>
  );
};
