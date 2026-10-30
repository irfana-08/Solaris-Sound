/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Song, Playlist, LoopMode, ViewMode, PlaybackState } from './types/music';
import { INITIAL_SONGS, INITIAL_PLAYLISTS } from './data/songs';
import { audioEngine } from './services/audioEngine';
import { HeaderNav } from './components/HeaderNav';
import { CoverFlow3D } from './components/CoverFlow3D';
import { DesktopPlayerDock } from './components/DesktopPlayerDock';
import { MobilePlayerBar } from './components/MobilePlayerBar';
import { PlaylistDrawer } from './components/PlaylistDrawer';
import { CreatePlaylistModal } from './components/CreatePlaylistModal';
import { LyricsModal } from './components/LyricsModal';
import { EqualizerModal } from './components/EqualizerModal';
import { UploadModal } from './components/UploadModal';
import {
  saveUserSong,
  loadUserSongs,
  savePlaylistsToStorage,
  loadPlaylistsFromStorage,
  saveCustomLyrics,
  loadCustomLyricsMap,
} from './services/storage';

export default function App() {
  const [songs, setSongs] = useState<Song[]>(INITIAL_SONGS);
  const [playlists, setPlaylists] = useState<Playlist[]>(INITIAL_PLAYLISTS);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [viewMode, setViewMode] = useState<ViewMode>('auto');

  // Player state
  const [playback, setPlayback] = useState<PlaybackState>({
    isPlaying: false,
    currentTime: 0,
    duration: INITIAL_SONGS[0].duration,
    volume: 0.85,
    isMuted: false,
    isShuffle: false,
    loopMode: 'off',
    playbackRate: 1.0,
    isAutoplay: true,
  });

  // Modals and Drawers
  const [isPlaylistOpen, setIsPlaylistOpen] = useState(false);
  const [isCreatePlaylistOpen, setIsCreatePlaylistOpen] = useState(false);
  const [isLyricsOpen, setIsLyricsOpen] = useState(false);
  const [isEqualizerOpen, setIsEqualizerOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification((cur) => (cur === msg ? null : cur));
    }, 3500);
  };

  // Load persisted user songs, playlists, and custom lyrics on mount
  useEffect(() => {
    async function initStorage() {
      // 1. Load playlists from localStorage if previously saved
      const storedPlaylists = loadPlaylistsFromStorage();
      if (storedPlaylists && storedPlaylists.length > 0) {
        // Sanitize playlists to remove any removed song references like song-3
        const sanitized = storedPlaylists.map((pl) => ({
          ...pl,
          songIds: pl.songIds.filter((id) => id !== 'song-3'),
        }));
        setPlaylists(sanitized);
        savePlaylistsToStorage(sanitized);
      }

      // 2. Load custom lyrics map
      const lyricsMap = loadCustomLyricsMap();

      // 3. Load user-uploaded songs from IndexedDB
      try {
        const userUploadedSongs = await loadUserSongs();

        setSongs(() => {
          // Base songs with custom lyrics applied if any
          const initialWithLyrics = INITIAL_SONGS
            .filter((s) => s.id !== 'song-3' && !s.artist.toLowerCase().includes('billie eilish'))
            .map((s) =>
              lyricsMap[s.id] !== undefined ? { ...s, lyrics: lyricsMap[s.id] } : s
            );

          const filteredUserSongs = userUploadedSongs.filter(
            (s) => s.id !== 'song-3' && !s.artist.toLowerCase().includes('billie eilish')
          );

          if (filteredUserSongs.length === 0) {
            return initialWithLyrics;
          }

          // Apply custom lyrics to user songs if any
          const userSongsWithLyrics = filteredUserSongs.map((s) =>
            lyricsMap[s.id] !== undefined ? { ...s, lyrics: lyricsMap[s.id] } : s
          );

          return [...userSongsWithLyrics, ...initialWithLyrics];
        });
      } catch (err) {
        console.error('Failed to load user songs from IndexedDB:', err);
      }
    }

    initStorage();
  }, []);

  const currentSong = useMemo(() => songs[currentIndex] || songs[0], [songs, currentIndex]);

  // Audio Engine time and ended listeners
  useEffect(() => {
    audioEngine.setCallbacks(
      (time, dur) => {
        setPlayback((prev) => ({
          ...prev,
          currentTime: time,
          duration: dur || prev.duration,
        }));
      },
      () => {
        handleTrackEnded();
      }
    );
  }, [currentIndex, playback.loopMode, playback.isAutoplay, playback.isShuffle, songs.length]);

  const playSongAtIndex = (index: number) => {
    const songToPlay = songs[index];
    if (!songToPlay) return;

    setCurrentIndex(index);
    setPlayback((prev) => ({
      ...prev,
      isPlaying: true,
      currentTime: 0,
      duration: songToPlay.duration,
    }));
    audioEngine.playSong(songToPlay, 0);
  };

  const handleNext = useCallback(() => {
    if (playback.isShuffle) {
      let randIndex = Math.floor(Math.random() * songs.length);
      if (randIndex === currentIndex && songs.length > 1) {
        randIndex = (randIndex + 1) % songs.length;
      }
      playSongAtIndex(randIndex);
    } else {
      const nextIndex = (currentIndex + 1) % songs.length;
      playSongAtIndex(nextIndex);
    }
  }, [currentIndex, playback.isShuffle, songs.length]);

  const handlePrev = useCallback(() => {
    if (playback.currentTime > 3) {
      audioEngine.seek(0);
      setPlayback((prev) => ({ ...prev, currentTime: 0 }));
    } else {
      const prevIndex = (currentIndex - 1 + songs.length) % songs.length;
      playSongAtIndex(prevIndex);
    }
  }, [currentIndex, playback.currentTime, songs.length]);

  const handleTrackEnded = useCallback(() => {
    if (playback.loopMode === 'one') {
      audioEngine.seek(0);
      audioEngine.playSong(currentSong, 0);
      setPlayback((prev) => ({ ...prev, isPlaying: true, currentTime: 0 }));
    } else if (playback.loopMode === 'all' || playback.isAutoplay) {
      handleNext();
    } else {
      setPlayback((prev) => ({ ...prev, isPlaying: false }));
    }
  }, [playback.loopMode, playback.isAutoplay, currentSong, handleNext]);

  const handleTogglePlay = () => {
    if (playback.isPlaying) {
      audioEngine.pause();
      setPlayback((prev) => ({ ...prev, isPlaying: false }));
    } else {
      audioEngine.playSong(currentSong, playback.currentTime);
      setPlayback((prev) => ({ ...prev, isPlaying: true }));
    }
  };

  const handleSeek = (seconds: number) => {
    audioEngine.seek(seconds);
    setPlayback((prev) => ({ ...prev, currentTime: seconds }));
  };

  const handleVolumeChange = (vol: number) => {
    audioEngine.setVolume(vol);
    setPlayback((prev) => ({ ...prev, volume: vol, isMuted: vol === 0 }));
  };

  const handleToggleMute = () => {
    const nextMuted = !playback.isMuted;
    audioEngine.setVolume(nextMuted ? 0 : playback.volume);
    setPlayback((prev) => ({ ...prev, isMuted: nextMuted }));
  };

  const handleToggleShuffle = () => {
    setPlayback((prev) => {
      const next = !prev.isShuffle;
      showToast(next ? 'Shuffle enabled' : 'Shuffle disabled');
      return { ...prev, isShuffle: next };
    });
  };

  const handleCycleLoop = () => {
    const modes: LoopMode[] = ['off', 'all', 'one'];
    const nextIdx = (modes.indexOf(playback.loopMode) + 1) % modes.length;
    const nextMode = modes[nextIdx];
    setPlayback((prev) => ({ ...prev, loopMode: nextMode }));
    showToast(`Repeat mode: ${nextMode.toUpperCase()}`);
  };

  const handleToggleAutoplay = () => {
    setPlayback((prev) => {
      const next = !prev.isAutoplay;
      showToast(next ? 'Autoplay next song: ON' : 'Autoplay next song: OFF');
      return { ...prev, isAutoplay: next };
    });
  };

  const handleRateChange = (rate: number) => {
    audioEngine.setPlaybackRate(rate);
    setPlayback((prev) => ({ ...prev, playbackRate: rate }));
  };

  // MULTIPLE Songs upload from device with IndexedDB persistence
  const handleAddMultipleSongs = async (
    items: { song: Song; file?: File }[],
    targetPlaylistId?: string
  ) => {
    if (items.length === 0) return;

    const newSongObjects = items.map((it) => it.song);

    // Persist each uploaded song and its audio blob into IndexedDB
    for (const it of items) {
      await saveUserSong(it.song, it.file);
    }

    setSongs((prev) => [...newSongObjects, ...prev]);

    // If target playlist specified, add them to it
    if (targetPlaylistId) {
      setPlaylists((prev) => {
        const updated = prev.map((pl) =>
          pl.id === targetPlaylistId
            ? { ...pl, songIds: [...newSongObjects.map((s) => s.id), ...pl.songIds] }
            : pl
        );
        savePlaylistsToStorage(updated);
        return updated;
      });
    }

    // Immediately play the first uploaded song
    setCurrentIndex(0);
    setPlayback((prev) => ({
      ...prev,
      isPlaying: true,
      currentTime: 0,
      duration: newSongObjects[0].duration,
    }));
    audioEngine.playSong(newSongObjects[0], 0);

    showToast(`Saved & imported ${newSongObjects.length} song(s) from device!`);
  };

  // CREATE custom playlist with localStorage persistence
  const handleCreatePlaylist = (newPlaylist: Playlist) => {
    setPlaylists((prev) => {
      const updated = [newPlaylist, ...prev];
      savePlaylistsToStorage(updated);
      return updated;
    });
    showToast(`Created playlist "${newPlaylist.name}" with ${newPlaylist.songIds.length} tracks!`);
    setIsPlaylistOpen(true);
  };

  // DELETE playlist with immediate state and localStorage update
  const handleDeletePlaylist = (id: string) => {
    setPlaylists((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      savePlaylistsToStorage(updated);
      return updated;
    });
    showToast('Playlist deleted successfully');
  };

  // Add song to playlist with localStorage persistence
  const handleAddSongToPlaylist = (songId: string, playlistId: string) => {
    setPlaylists((prev) => {
      const updated = prev.map((pl) =>
        pl.id === playlistId && !pl.songIds.includes(songId)
          ? { ...pl, songIds: [...pl.songIds, songId] }
          : pl
      );
      savePlaylistsToStorage(updated);
      return updated;
    });
    showToast('Song added to playlist');
  };

  // Remove song from playlist with localStorage persistence
  const handleRemoveSongFromPlaylist = (songId: string, playlistId: string) => {
    setPlaylists((prev) => {
      const updated = prev.map((pl) =>
        pl.id === playlistId
          ? { ...pl, songIds: pl.songIds.filter((id) => id !== songId) }
          : pl
      );
      savePlaylistsToStorage(updated);
      return updated;
    });
    showToast('Song removed from playlist');
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          handleTogglePlay();
          break;
        case 'ArrowUp':
          e.preventDefault();
          handleVolumeChange(Math.min(1, playback.volume + 0.05));
          break;
        case 'ArrowDown':
          e.preventDefault();
          handleVolumeChange(Math.max(0, playback.volume - 0.05));
          break;
        case 'KeyM':
          handleToggleMute();
          break;
        case 'KeyN':
          handleNext();
          break;
        case 'KeyP':
          handlePrev();
          break;
        case 'KeyL':
          setIsLyricsOpen((prev) => !prev);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleTogglePlay, handleVolumeChange, handleToggleMute, handleNext, handlePrev, playback.volume]);

  // CSS media query determination
  const isForcedDesktop = viewMode === 'desktop';
  const isForcedMobile = viewMode === 'mobile';

  return (
    <div className="relative min-h-screen w-full bg-stone-950 text-white flex flex-col justify-between overflow-x-hidden">
      {/* Toast Notification Banner */}
      {notification && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-2xl glass-pill border border-amber-400/40 text-amber-200 text-xs font-semibold shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-3 duration-200">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          <span>{notification}</span>
        </div>
      )}

      {/* Dynamic Ambient Background: Orange and Yellow radiant glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] md:w-[1000px] h-[500px] md:h-[700px] bg-gradient-to-b from-amber-500/25 via-orange-600/20 to-transparent blur-[120px] rounded-full animate-ambient" />
        <div className="absolute bottom-10 left-10 w-[350px] h-[350px] bg-yellow-500/15 blur-[100px] rounded-full" />
        <div className="absolute top-10 right-10 w-[400px] h-[400px] bg-orange-600/15 blur-[110px] rounded-full" />
        <div className="absolute inset-0 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.04]" />
      </div>

      {/* Top Header Navigation */}
      <HeaderNav
        viewMode={viewMode}
        onSetViewMode={setViewMode}
        onOpenPlaylist={() => setIsPlaylistOpen(true)}
        onOpenCreatePlaylist={() => setIsCreatePlaylistOpen(true)}
        onOpenUpload={() => setIsUploadOpen(true)}
        songCount={songs.length}
      />

      {/* Main Experience Viewport */}
      <main className="relative flex-1 flex flex-col items-center justify-center w-full max-w-7xl mx-auto px-4 py-3 md:py-6 z-10">
        <div className="text-center mb-2 md:mb-4 select-none">
          <span className="text-[11px] md:text-xs font-semibold tracking-wider text-amber-400 uppercase">
            3D Cover Flow Audio Experience
          </span>
          <h1 className="font-display font-extrabold text-2xl md:text-4xl text-white tracking-tight mt-0.5">
            {currentSong.title}
          </h1>
          <p className="text-xs md:text-sm text-amber-200/80 max-w-md mx-auto mt-0.5 font-medium">
            {currentSong.artist} · <span className="text-stone-400">{currentSong.genre}</span>
          </p>
        </div>

        {/* 3D Cover Flow Carousel */}
        <CoverFlow3D
          songs={songs}
          currentIndex={currentIndex}
          isPlaying={playback.isPlaying}
          onSelectSong={playSongAtIndex}
          onTogglePlay={handleTogglePlay}
          isMobileLayout={isForcedMobile}
        />
      </main>

      {/* Responsive Player Controls: CSS-only responsive display */}
      <div className="relative w-full pb-4 md:pb-6 z-30">
        {/* Case 1: Forced Desktop View */}
        {isForcedDesktop && (
          <DesktopPlayerDock
            currentSong={currentSong}
            isPlaying={playback.isPlaying}
            currentTime={playback.currentTime}
            duration={playback.duration}
            volume={playback.volume}
            isMuted={playback.isMuted}
            isShuffle={playback.isShuffle}
            loopMode={playback.loopMode}
            onTogglePlay={handleTogglePlay}
            onPrev={handlePrev}
            onNext={handleNext}
            onSeek={handleSeek}
            onVolumeChange={handleVolumeChange}
            onToggleMute={handleToggleMute}
            onToggleShuffle={handleToggleShuffle}
            onCycleLoop={handleCycleLoop}
            onOpenLyrics={() => setIsLyricsOpen(true)}
            onOpenPlaylist={() => setIsPlaylistOpen(true)}
            onOpenEqualizer={() => setIsEqualizerOpen(true)}
            onOpenUpload={() => setIsUploadOpen(true)}
            onOpenCreatePlaylist={() => setIsCreatePlaylistOpen(true)}
          />
        )}

        {/* Case 2: Forced Mobile View */}
        {isForcedMobile && (
          <MobilePlayerBar
            currentSong={currentSong}
            isPlaying={playback.isPlaying}
            currentTime={playback.currentTime}
            duration={playback.duration}
            isShuffle={playback.isShuffle}
            loopMode={playback.loopMode}
            onTogglePlay={handleTogglePlay}
            onPrev={handlePrev}
            onNext={handleNext}
            onSeek={handleSeek}
            onToggleShuffle={handleToggleShuffle}
            onCycleLoop={handleCycleLoop}
            onOpenLyrics={() => setIsLyricsOpen(true)}
            onOpenPlaylist={() => setIsPlaylistOpen(true)}
            onOpenEqualizer={() => setIsEqualizerOpen(true)}
            onOpenCreatePlaylist={() => setIsCreatePlaylistOpen(true)}
            onOpenUpload={() => setIsUploadOpen(true)}
          />
        )}

        {/* Case 3: Auto Mode (Pure CSS Media Queries with Tailwind hidden/block classes) */}
        {!isForcedDesktop && !isForcedMobile && (
          <>
            <div className="hidden md:block">
              <DesktopPlayerDock
                currentSong={currentSong}
                isPlaying={playback.isPlaying}
                currentTime={playback.currentTime}
                duration={playback.duration}
                volume={playback.volume}
                isMuted={playback.isMuted}
                isShuffle={playback.isShuffle}
                loopMode={playback.loopMode}
                onTogglePlay={handleTogglePlay}
                onPrev={handlePrev}
                onNext={handleNext}
                onSeek={handleSeek}
                onVolumeChange={handleVolumeChange}
                onToggleMute={handleToggleMute}
                onToggleShuffle={handleToggleShuffle}
                onCycleLoop={handleCycleLoop}
                onOpenLyrics={() => setIsLyricsOpen(true)}
                onOpenPlaylist={() => setIsPlaylistOpen(true)}
                onOpenEqualizer={() => setIsEqualizerOpen(true)}
                onOpenUpload={() => setIsUploadOpen(true)}
                onOpenCreatePlaylist={() => setIsCreatePlaylistOpen(true)}
              />
            </div>

            <div className="block md:hidden">
              <MobilePlayerBar
                currentSong={currentSong}
                isPlaying={playback.isPlaying}
                currentTime={playback.currentTime}
                duration={playback.duration}
                isShuffle={playback.isShuffle}
                loopMode={playback.loopMode}
                onTogglePlay={handleTogglePlay}
                onPrev={handlePrev}
                onNext={handleNext}
                onSeek={handleSeek}
                onToggleShuffle={handleToggleShuffle}
                onCycleLoop={handleCycleLoop}
                onOpenLyrics={() => setIsLyricsOpen(true)}
                onOpenPlaylist={() => setIsPlaylistOpen(true)}
                onOpenEqualizer={() => setIsEqualizerOpen(true)}
                onOpenCreatePlaylist={() => setIsCreatePlaylistOpen(true)}
                onOpenUpload={() => setIsUploadOpen(true)}
              />
            </div>
          </>
        )}
      </div>

      {/* Playlist Drawer */}
      <PlaylistDrawer
        isOpen={isPlaylistOpen}
        onClose={() => setIsPlaylistOpen(false)}
        playlists={playlists}
        songs={songs}
        currentSongId={currentSong.id}
        isPlaying={playback.isPlaying}
        isAutoplay={playback.isAutoplay}
        onToggleAutoplay={handleToggleAutoplay}
        onSelectSong={(id) => {
          const idx = songs.findIndex((s) => s.id === id);
          if (idx !== -1) playSongAtIndex(idx);
        }}
        onOpenCreatePlaylist={() => {
          setIsPlaylistOpen(false);
          setIsCreatePlaylistOpen(true);
        }}
        onOpenUpload={() => {
          setIsPlaylistOpen(false);
          setIsUploadOpen(true);
        }}
        onDeletePlaylist={handleDeletePlaylist}
        onAddSongToPlaylist={handleAddSongToPlaylist}
        onRemoveSongFromPlaylist={handleRemoveSongFromPlaylist}
        onRestoreDefaultPlaylists={() => {
          setPlaylists(INITIAL_PLAYLISTS);
          savePlaylistsToStorage(INITIAL_PLAYLISTS);
          showToast('Default playlists restored!');
        }}
      />

      {/* Create Custom Playlist Modal */}
      <CreatePlaylistModal
        isOpen={isCreatePlaylistOpen}
        onClose={() => setIsCreatePlaylistOpen(false)}
        songs={songs}
        onCreatePlaylist={handleCreatePlaylist}
      />

      {/* Synchronized Lyrics Modal */}
      <LyricsModal
        isOpen={isLyricsOpen}
        onClose={() => setIsLyricsOpen(false)}
        song={currentSong}
        currentTime={playback.currentTime}
        onSeek={handleSeek}
        onUpdateLyrics={(songId, newLyrics) => {
          saveCustomLyrics(songId, newLyrics);
          setSongs((prev) =>
            prev.map((s) => (s.id === songId ? { ...s, lyrics: newLyrics } : s))
          );
          showToast(newLyrics.length > 0 ? 'Lyrics updated!' : 'Lyrics cleared');
        }}
      />

      {/* 5-Band Equalizer Modal */}
      <EqualizerModal
        isOpen={isEqualizerOpen}
        onClose={() => setIsEqualizerOpen(false)}
        playbackRate={playback.playbackRate}
        onRateChange={handleRateChange}
      />

      {/* Batch Multiple Songs Upload Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        playlists={playlists}
        onAddMultipleSongs={handleAddMultipleSongs}
      />
    </div>
  );
}
