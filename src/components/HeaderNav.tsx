import React from 'react';
import { ViewMode } from '../types/music';
import {
  Flame,
  Smartphone,
  Monitor,
  Sparkles,
  FolderPlus,
  ListMusic,
  PlusCircle
} from 'lucide-react';

interface HeaderNavProps {
  viewMode: ViewMode;
  onSetViewMode: (mode: ViewMode) => void;
  onOpenPlaylist: () => void;
  onOpenCreatePlaylist: () => void;
  onOpenUpload: () => void;
  songCount: number;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  viewMode,
  onSetViewMode,
  onOpenPlaylist,
  onOpenCreatePlaylist,
  onOpenUpload,
  songCount,
}) => {
  return (
    <header className="relative w-full max-w-7xl mx-auto px-4 md:px-8 py-3.5 flex items-center justify-between gap-4 z-40 border-b border-amber-500/10">
      {/* Zone 1: Brand Wordmark */}
      <div className="flex items-center gap-2.5 shrink-0">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-yellow-300 p-0.5 shadow-[0_0_15px_rgba(245,158,11,0.4)] flex items-center justify-center">
          <div className="w-full h-full bg-stone-950 rounded-[10px] flex items-center justify-center">
            <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
          </div>
        </div>
        <div>
          <span className="font-display font-extrabold text-lg md:text-xl text-white tracking-tight flex items-center gap-1.5">
            Solaris <span className="text-amber-400 font-light">Sound</span>
          </span>
        </div>
      </div>

      {/* Zone 2: Screen Option / Device Layout Switcher */}
      <div className="flex items-center bg-black/40 backdrop-blur-md border border-amber-500/20 p-1 rounded-xl shadow-inner text-xs">
        <button
          onClick={() => onSetViewMode('auto')}
          title="Responsive CSS media query (adapts to screen size)"
          className={`px-2.5 md:px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
            viewMode === 'auto'
              ? 'bg-amber-500 text-stone-950 font-bold shadow-sm'
              : 'text-stone-300 hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Auto CSS</span>
          <span className="sm:hidden">Auto</span>
        </button>

        <button
          onClick={() => onSetViewMode('desktop')}
          title="Force Desktop Glass Dock layout (download__13__cbe6f334.jpg)"
          className={`px-2.5 md:px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
            viewMode === 'desktop'
              ? 'bg-amber-500 text-stone-950 font-bold shadow-sm'
              : 'text-stone-300 hover:text-white'
          }`}
        >
          <Monitor className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Desktop Dock</span>
          <span className="sm:hidden">PC</span>
        </button>

        <button
          onClick={() => onSetViewMode('mobile')}
          title="Force Mobile Curved Coverflow layout (download__14__a9edcd36.jpg)"
          className={`px-2.5 md:px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
            viewMode === 'mobile'
              ? 'bg-amber-500 text-stone-950 font-bold shadow-sm'
              : 'text-stone-300 hover:text-white'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Mobile Screen</span>
          <span className="sm:hidden">Phone</span>
        </button>
      </div>

      {/* Zone 3: Primary Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onOpenCreatePlaylist}
          title="Create custom playlist"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 hover:text-white text-xs font-semibold transition-all cursor-pointer"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>New Playlist</span>
        </button>

        <button
          onClick={onOpenUpload}
          title="Upload multiple songs from your computer or phone"
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-stone-200 text-xs font-semibold transition-all cursor-pointer"
        >
          <FolderPlus className="w-3.5 h-3.5 text-amber-400" />
          <span>Upload Songs</span>
        </button>

        <button
          onClick={onOpenPlaylist}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-xs transition-all shadow-md shadow-amber-500/25 cursor-pointer"
        >
          <ListMusic className="w-3.5 h-3.5" />
          <span>Library</span>
          <span className="px-1.5 py-0.2 bg-black/25 text-white rounded-full text-[10px]">
            {songCount}
          </span>
        </button>
      </div>
    </header>
  );
};
