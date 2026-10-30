import { Song, Playlist } from '../types/music';

const DB_NAME = 'SolarisMusicDB';
const DB_VERSION = 1;
const STORE_SONGS = 'user_songs';
const STORE_AUDIO_BLOBS = 'audio_blobs';
const STORAGE_KEY_PLAYLISTS = 'solaris_playlists_v1';
const STORAGE_KEY_CUSTOM_LYRICS = 'solaris_custom_lyrics_v1';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_SONGS)) {
        db.createObjectStore(STORE_SONGS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_AUDIO_BLOBS)) {
        db.createObjectStore(STORE_AUDIO_BLOBS, { keyPath: 'songId' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveUserSong(song: Song, audioBlob?: Blob): Promise<void> {
  try {
    const db = await openDB();

    // 1. Save metadata (omit non-serializable fields if any)
    const songMeta = {
      ...song,
      audioUrl: undefined, // Will be restored with URL.createObjectURL on load
    };

    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction([STORE_SONGS], 'readwrite');
      const store = tx.objectStore(STORE_SONGS);
      store.put(songMeta);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });

    // 2. Save audio blob if provided
    if (audioBlob) {
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction([STORE_AUDIO_BLOBS], 'readwrite');
        const store = tx.objectStore(STORE_AUDIO_BLOBS);
        store.put({ songId: song.id, blob: audioBlob });
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    }
  } catch (err) {
    console.error('Failed to save song to IndexedDB:', err);
  }
}

export async function loadUserSongs(): Promise<Song[]> {
  try {
    const db = await openDB();

    // 1. Get all metadata
    const songsMeta: Song[] = await new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_SONGS], 'readonly');
      const store = tx.objectStore(STORE_SONGS);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });

    if (songsMeta.length === 0) return [];

    // 2. Restore audioUrl from stored blobs
    const restoredSongs: Song[] = [];
    for (const song of songsMeta) {
      try {
        const blobRecord: { songId: string; blob: Blob } | undefined = await new Promise((resolve, reject) => {
          const tx = db.transaction([STORE_AUDIO_BLOBS], 'readonly');
          const store = tx.objectStore(STORE_AUDIO_BLOBS);
          const req = store.get(song.id);
          req.onsuccess = () => resolve(req.result);
          req.onerror = () => reject(req.error);
        });

        if (blobRecord && blobRecord.blob) {
          const audioUrl = URL.createObjectURL(blobRecord.blob);
          restoredSongs.push({
            ...song,
            audioUrl,
          });
        } else {
          restoredSongs.push(song);
        }
      } catch {
        restoredSongs.push(song);
      }
    }

    return restoredSongs;
  } catch (err) {
    console.error('Failed to load songs from IndexedDB:', err);
    return [];
  }
}

export function savePlaylistsToStorage(playlists: Playlist[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_PLAYLISTS, JSON.stringify(playlists));
  } catch (err) {
    console.warn('Failed to save playlists to localStorage:', err);
  }
}

export function loadPlaylistsFromStorage(): Playlist[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PLAYLISTS);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveCustomLyrics(songId: string, lyrics: Song['lyrics']): void {
  try {
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY_CUSTOM_LYRICS) || '{}');
    existing[songId] = lyrics;
    localStorage.setItem(STORAGE_KEY_CUSTOM_LYRICS, JSON.stringify(existing));
  } catch (err) {
    console.warn('Failed to save custom lyrics to localStorage:', err);
  }
}

export function loadCustomLyricsMap(): Record<string, Song['lyrics']> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CUSTOM_LYRICS);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}
