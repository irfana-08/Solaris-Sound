export interface LyricLine {
  time: number; // in seconds
  text: string;
}

export interface SynthPreset {
  bpm: number;
  key: string;
  timbre: 'warm-synth' | 'rhodes' | 'pluck' | 'lofi' | '80s-retro' | 'ambient-pad' | 'marimba';
  scale: number[];
  bassline: number[];
  chords: number[][];
  melodyPattern: { noteIndex: number; dur: number }[];
  drumStyle: '80s-retro' | 'pop-punch' | 'marimba-groove' | 'lofi-chill' | 'acoustic-ballad' | 'cascading-piano' | 'tropical';
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number; // in seconds
  coverArt: string;
  genre: string;
  year: number;
  lyrics: LyricLine[];
  synthPreset: SynthPreset;
  audioUrl?: string;
  isUserUploaded?: boolean;
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  coverArt: string;
  songIds: string[];
  isCustom?: boolean;
}

export type LoopMode = 'off' | 'all' | 'one';
export type ViewMode = 'auto' | 'desktop' | 'mobile';

export interface PlaybackState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isShuffle: boolean;
  loopMode: LoopMode;
  playbackRate: number;
  isAutoplay: boolean;
}
