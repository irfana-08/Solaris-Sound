import React, { useState, useRef, useEffect } from 'react';
import { Song } from '../types/music';
import { ChevronLeft, ChevronRight, Play, Pause, Sparkles } from 'lucide-react';

interface CoverFlow3DProps {
  songs: Song[];
  currentIndex: number;
  isPlaying: boolean;
  onSelectSong: (index: number) => void;
  onTogglePlay: () => void;
  isMobileLayout?: boolean;
}

export const CoverFlow3D: React.FC<CoverFlow3DProps> = ({
  songs,
  currentIndex,
  isPlaying,
  onSelectSong,
  onTogglePlay,
  isMobileLayout = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);

  // Keyboard navigation for carousel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if focus is inside an input/textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        onSelectSong(Math.max(0, currentIndex - 1));
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        onSelectSong(Math.min(songs.length - 1, currentIndex + 1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, songs.length, onSelectSong]);

  // Touch and mouse drag gestures
  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    setTouchStartX(clientX);
    setIsDragging(true);
    setDragOffset(0);
  };

  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging || touchStartX === null) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const diff = clientX - touchStartX;
    setDragOffset(diff);
  };

  const handleTouchEnd = () => {
    if (!isDragging || touchStartX === null) return;
    const threshold = 45;
    if (dragOffset > threshold && currentIndex > 0) {
      onSelectSong(currentIndex - 1);
    } else if (dragOffset < -threshold && currentIndex < songs.length - 1) {
      onSelectSong(currentIndex + 1);
    }
    setIsDragging(false);
    setTouchStartX(null);
    setDragOffset(0);
  };

  // Dimensions based on layout
  const cardWidth = isMobileLayout ? 240 : 280;
  const cardHeight = isMobileLayout ? 270 : 320;
  const spacing = isMobileLayout ? 80 : 130;

  return (
    <div className="relative w-full flex flex-col items-center justify-center select-none py-4 overflow-hidden">
      {/* 3D Perspective Stage */}
      <div
        ref={containerRef}
        onMouseDown={handleTouchStart}
        onMouseMove={handleTouchMove}
        onMouseUp={handleTouchEnd}
        onMouseLeave={handleTouchEnd}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="perspective-stage relative w-full h-[320px] md:h-[390px] flex items-center justify-center cursor-grab active:cursor-grabbing"
      >
        {songs.map((song, index) => {
          const offset = index - currentIndex;
          const absOffset = Math.abs(offset);
          const isCenter = offset === 0;

          // Limit rendering range to 4 cards on each side for peak performance
          if (absOffset > 4) return null;

          // 3D positioning calculation
          let transform = '';
          let zIndex = 30 - absOffset;
          let opacity = 1;
          let filter = 'none';

          if (isCenter) {
            transform = `translateX(${dragOffset * 0.4}px) translateZ(140px) rotateY(${dragOffset * -0.05}deg) scale(1.05)`;
            zIndex = 40;
            opacity = 1;
          } else if (offset < 0) {
            // Left stack
            const x = offset * spacing - (isMobileLayout ? 25 : 50) + dragOffset * 0.2;
            const z = 100 - absOffset * 70;
            const rotate = isMobileLayout ? 48 : 52;
            const scale = Math.max(0.68, 1 - absOffset * 0.12);
            transform = `translateX(${x}px) translateZ(${z}px) rotateY(${rotate}deg) scale(${scale})`;
            opacity = Math.max(0.35, 1 - absOffset * 0.24);
            filter = 'brightness(0.7) blur(0.5px)';
          } else {
            // Right stack
            const x = offset * spacing + (isMobileLayout ? 25 : 50) + dragOffset * 0.2;
            const z = 100 - absOffset * 70;
            const rotate = isMobileLayout ? -48 : -52;
            const scale = Math.max(0.68, 1 - absOffset * 0.12);
            transform = `translateX(${x}px) translateZ(${z}px) rotateY(${rotate}deg) scale(${scale})`;
            opacity = Math.max(0.35, 1 - absOffset * 0.24);
            filter = 'brightness(0.7) blur(0.5px)';
          }

          return (
            <div
              key={song.id}
              onClick={() => {
                if (isCenter) {
                  onTogglePlay();
                } else {
                  onSelectSong(index);
                }
              }}
              className={`cover-card-3d absolute rounded-2xl md:rounded-3xl overflow-hidden cursor-pointer group ${
                isCenter ? 'album-reflect shadow-[0_20px_60px_-15px_rgba(245,158,11,0.5)] border-2 border-amber-400/50' : 'border border-amber-500/20 shadow-2xl'
              }`}
              style={{
                width: `${cardWidth}px`,
                height: `${cardHeight}px`,
                transform,
                zIndex,
                opacity,
                filter,
              }}
            >
              {/* Album Art Image with fallback */}
              <div className="relative w-full h-full bg-gradient-to-br from-amber-900 via-orange-950 to-stone-900">
                <img
                  src={song.coverArt}
                  alt={`${song.title} by ${song.artist}`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    // Graceful fallback to styled art container
                    const target = e.currentTarget;
                    target.style.display = 'none';
                    if (target.parentElement) {
                      target.parentElement.classList.add('flex', 'items-center', 'justify-center');
                    }
                  }}
                />

                {/* Subtle sheen highlight */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-amber-400/10 to-white/20 pointer-events-none" />

                {/* Center play trigger overlay on hover or active state */}
                {isCenter && (
                  <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-amber-500/90 text-stone-950 flex items-center justify-center shadow-lg shadow-amber-500/40 backdrop-blur-md transform scale-90 group-hover:scale-100 transition-transform">
                      {isPlaying ? (
                        <Pause className="w-6 h-6 fill-stone-950 text-stone-950" />
                      ) : (
                        <Play className="w-6 h-6 fill-stone-950 text-stone-950 ml-1" />
                      )}
                    </div>
                  </div>
                )}

                {/* Corner Spotify / Brand emblem badge as seen in download__14__a9edcd36.jpg */}
                <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-[10px] font-semibold text-amber-300 flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>3+</span>
                </div>

                {/* Title & Artist Card Tag (Frosted Glass bottom bar on center card) */}
                <div className={`absolute bottom-0 inset-x-0 p-3 md:p-4 glass-card-tag transition-all duration-300 ${
                  isCenter ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-90'
                }`}>
                  <div className="truncate">
                    <h3 className="font-display font-bold text-sm md:text-base text-white truncate tracking-tight drop-shadow-sm">
                      {song.title}
                    </h3>
                    <p className="text-xs md:text-sm text-amber-200/90 truncate font-medium">
                      {song.artist}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Arrows for accessibility and easy browsing */}
      <div className="flex items-center justify-between w-full max-w-sm px-6 -mt-3 z-30">
        <button
          onClick={() => onSelectSong(Math.max(0, currentIndex - 1))}
          disabled={currentIndex === 0}
          aria-label="Previous Album"
          className="w-10 h-10 rounded-full bg-amber-950/60 border border-amber-500/30 text-amber-300 hover:text-white hover:bg-amber-600/60 hover:scale-110 active:scale-95 transition-all flex items-center justify-center disabled:opacity-30 disabled:pointer-events-none shadow-lg backdrop-blur-md"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Indicator dots */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-amber-500/20">
          {songs.map((_, i) => (
            <button
              key={i}
              onClick={() => onSelectSong(i)}
              aria-label={`Go to track ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === currentIndex
                  ? 'w-6 bg-gradient-to-r from-amber-400 to-yellow-300 shadow-[0_0_8px_#fbbf24]'
                  : 'w-1.5 bg-amber-400/30 hover:bg-amber-400/60'
              }`}
            />
          ))}
        </div>

        <button
          onClick={() => onSelectSong(Math.min(songs.length - 1, currentIndex + 1))}
          disabled={currentIndex === songs.length - 1}
          aria-label="Next Album"
          className="w-10 h-10 rounded-full bg-amber-950/60 border border-amber-500/30 text-amber-300 hover:text-white hover:bg-amber-600/60 hover:scale-110 active:scale-95 transition-all flex items-center justify-center disabled:opacity-30 disabled:pointer-events-none shadow-lg backdrop-blur-md"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
