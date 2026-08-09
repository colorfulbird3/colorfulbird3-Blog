"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  ReactNode,
} from 'react';
import { siteConfig } from '../siteConfig';
import { musicPlaylists, MusicTrack } from '../data/musicLibrary';

function parseLrc(lrcText: string) {
  if (!lrcText || lrcText.length > 30000) return [];

  const lines = lrcText.split(/\r?\n/);
  const result: { time: number; text: string }[] = [];

  for (const line of lines) {
    const matches = [
      ...line.matchAll(/\[(\d{2,}):(\d{2})(?:[.:](\d{2,3}))?\]/g),
    ];

    if (matches.length === 0) continue;

    const cleanText = line
      .replace(/\[\d{2,}:\d{2}(?:[.:]\d{2,3})?\]/g, '')
      .replace(/[\u0000-\u001F\u007F-\u009F\u200B-\u200D\uFEFF]/g, '')
      .trim();

    if (!cleanText) continue;

    for (const match of matches) {
      const min = parseInt(match[1], 10);
      const sec = parseInt(match[2], 10);
      const fraction = match[3] || '';
      const ms =
        fraction.length === 3
          ? parseInt(fraction, 10) / 1000
          : fraction
            ? parseInt(fraction, 10) / 100
            : 0;

      result.push({
        time: min * 60 + sec + ms,
        text: cleanText,
      });
    }
  }

  return result.sort((a, b) => a.time - b.time);
}

type PlayMode = 'loop' | 'single' | 'random';

type Song = {
  id: string;
  title: string;
  name?: string;
  artist: string;
  author?: string;
  cover?: string;
  pic?: string;
  src: string;
  lrc?: string;
  lyric?: string;
  lyrics?: { time: number; text: string }[];
  source?: string;
  sourcePlaylist?: string;
  sourceTrackId?: string;
};

interface MusicContextType {
  playlist: Song[];
  currentIndex: number;
  currentSong?: Song;
  isPlaying: boolean;
  progress: number;
  currentTime: number;
  duration: number;
  currentLyric: string;
  isLoading: boolean;
  volume: number;
  isMuted: boolean;
  playMode: PlayMode;

  togglePlay: () => void;
  nextSong: () => void;
  prevSong: () => void;
  handleSeek: (e: React.ChangeEvent<HTMLInputElement>) => void;
  playSong: (index: number) => void;
  selectSong: (index: number) => void;
  setVolume: (value: number) => void;
  toggleMute: () => void;
  togglePlayMode: () => void;
}

const MusicContext = createContext<MusicContextType | null>(null);

function flattenLibrary() {
  const result: Array<MusicTrack & { sourcePlaylist?: string }> = [];

  for (const playlist of musicPlaylists || []) {
    if (playlist.enabled === false) continue;

    for (const track of playlist.tracks || []) {
      if (track.enabled === false || track.playable === false) continue;

      result.push({
        ...track,
        sourcePlaylist: playlist.name,
      } as any);
    }
  }

  return result;
}

function fallbackLegacyTracks(): Array<MusicTrack & { sourcePlaylist?: string }> {
  const ids = siteConfig.cloudMusicIds || [];

  return ids.map((id: string | number) => ({
    id: `legacy_netease_${id}`,
    title: '',
    artist: '',
    source: 'netease',
    sourceId: String(id),
    playableSource: 'netease',
    playableId: String(id),
    enabled: true,
    sourcePlaylist: '旧版歌单',
  })) as any;
}

export function MusicProvider({ children }: { children: ReactNode }) {
  const [playlist, setPlaylist] = useState<Song[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [lyrics, setLyrics] = useState<{ time: number; text: string }[]>([]);
  const [currentLyric, setCurrentLyric] = useState('正在连接音乐库...');
  const [isLoading, setIsLoading] = useState(true);
  const [volume, setVolumeState] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playMode, setPlayMode] = useState<PlayMode>('loop');

  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    let alive = true;

    async function load() {
      setIsLoading(true);

      try {
        let tracks = flattenLibrary();

        if (tracks.length === 0 && (musicPlaylists || []).length === 0) {
          tracks = fallbackLegacyTracks();
        }

        const neteaseIds = Array.from(
          new Set(
            tracks
              .map((track) => {
                if (track.src) return null;

                if (
                  track.playableSource === 'netease' &&
                  track.playableId
                ) {
                  return String(track.playableId);
                }

                if (track.source === 'netease' && track.sourceId) {
                  return String(track.sourceId);
                }

                return null;
              })
              .filter(Boolean) as string[]
          )
        );

        const neteaseMap = new Map<string, any>();

        for (let start = 0; start < neteaseIds.length; start += 100) {
          const batch = neteaseIds.slice(start, start + 100);

          try {
            const res = await fetch(`/api/music?ids=${batch.join(',')}`);
            const songs = await res.json();

            if (Array.isArray(songs)) {
              for (const song of songs) {
                if (song?.id) {
                  neteaseMap.set(String(song.id), song);
                }
              }
            }
          } catch {
            // 单个批次失败不影响本地歌曲。
          }
        }

        const merged: Song[] = [];

        for (const track of tracks) {
          if (track.src) {
            merged.push({
              id: track.id,
              title: track.title || '未知歌曲',
              name: track.title || '未知歌曲',
              artist: track.artist || '未知歌手',
              author: track.artist || '未知歌手',
              cover: track.cover || '',
              pic: track.cover || '',
              src: track.src,
              lrc: track.lrc || '',
              lyrics: track.lrc ? parseLrc(track.lrc) : [],
              source: track.source,
              sourcePlaylist: (track as any).sourcePlaylist,
              sourceTrackId: track.sourceId,
            });
            continue;
          }

          let playableId = '';

          if (
            track.playableSource === 'netease' &&
            track.playableId
          ) {
            playableId = String(track.playableId);
          } else if (track.source === 'netease' && track.sourceId) {
            playableId = String(track.sourceId);
          }

          if (!playableId) {
            continue;
          }

          const remote = neteaseMap.get(playableId);

          if (!remote?.url || remote?.error) {
            continue;
          }

          merged.push({
            id: track.id || `netease_${playableId}`,
            title: track.title || remote.name || '未知歌曲',
            name: track.title || remote.name || '未知歌曲',
            artist:
              track.artist ||
              remote.artist ||
              remote.author ||
              '未知歌手',
            author:
              track.artist ||
              remote.artist ||
              remote.author ||
              '未知歌手',
            cover:
              track.cover ||
              remote.cover ||
              remote.pic ||
              '',
            pic:
              track.cover ||
              remote.cover ||
              remote.pic ||
              '',
            src: remote.url,
            lrc: track.lrc || remote.lrc || '',
            lyrics: parseLrc(track.lrc || remote.lrc || ''),
            source: track.source,
            sourcePlaylist: (track as any).sourcePlaylist,
            sourceTrackId: track.sourceId,
          });
        }

        if (!alive) return;

        setPlaylist(merged);
        setCurrentIndex(0);

        if (merged.length === 0) {
          setCurrentLyric('音乐库里暂时没有可播放歌曲');
        } else {
          setCurrentLyric('♪ 音乐库已连接 ♪');
        }
      } catch {
        if (alive) {
          setCurrentLyric('音乐库初始化失败');
        }
      } finally {
        if (alive) setIsLoading(false);
      }
    }

    // 音乐元数据不应阻塞首屏，等待页面首次绘制后再请求。
    const loadTimer = window.setTimeout(load, 1200);

    return () => {
      alive = false;
      window.clearTimeout(loadTimer);
    };
  }, []);

  const currentSong = playlist[currentIndex];

  useEffect(() => {
    if (!currentSong) {
      setLyrics([]);
      return;
    }

    const parsed =
      currentSong.lyrics?.length
        ? currentSong.lyrics
        : currentSong.lrc
          ? parseLrc(currentSong.lrc)
          : [];

    setLyrics(parsed);
    setCurrentLyric(parsed[0]?.text || '♪ 纯享音乐 ♪');

    if (isPlaying && audioRef.current) {
      audioRef.current.play().catch(() => setIsPlaying(false));
    }
  }, [currentIndex, currentSong?.id]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const nextSong = () => {
    if (playlist.length === 0) return;

    if (playMode === 'random') {
      setCurrentIndex(Math.floor(Math.random() * playlist.length));
    } else {
      setCurrentIndex((prev) => (prev + 1) % playlist.length);
    }
  };

  const prevSong = () => {
    if (playlist.length === 0) return;

    if (playMode === 'random') {
      setCurrentIndex(Math.floor(Math.random() * playlist.length));
    } else {
      setCurrentIndex(
        (prev) => (prev - 1 + playlist.length) % playlist.length
      );
    }
  };

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio || !currentSong) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  };

  const playSong = (index: number) => {
    if (index < 0 || index >= playlist.length) return;

    setCurrentIndex(index);
    setIsPlaying(true);

    requestAnimationFrame(() => {
      audioRef.current?.play().catch(() => setIsPlaying(false));
    });
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newProgress = Number(e.target.value);
    setProgress(newProgress);

    if (audioRef.current && audioRef.current.duration) {
      audioRef.current.currentTime =
        (newProgress / 100) * audioRef.current.duration;
    }
  };

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio) return;

    const now = audio.currentTime || 0;
    const total = audio.duration || 0;

    setCurrentTime(now);
    setDuration(total);
    setProgress(total > 0 ? (now / total) * 100 : 0);

    if (lyrics.length > 0) {
      let active = '';

      for (let index = lyrics.length - 1; index >= 0; index -= 1) {
        if (now >= lyrics[index].time) {
          active = lyrics[index].text;
          break;
        }
      }

      if (active && active !== currentLyric) {
        setCurrentLyric(active);
      }
    }
  };

  const handleEnded = () => {
    if (playMode === 'single' && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => setIsPlaying(false));
      return;
    }

    nextSong();
  };

  const setVolume = (value: number) => {
    setVolumeState(value);
    if (isMuted && value > 0) setIsMuted(false);
  };

  const toggleMute = () => setIsMuted((prev) => !prev);

  const togglePlayMode = () => {
    setPlayMode((prev) => {
      if (prev === 'loop') return 'single';
      if (prev === 'single') return 'random';
      return 'loop';
    });
  };

  const value = useMemo<MusicContextType>(
    () => ({
      playlist,
      currentIndex,
      currentSong,
      isPlaying,
      progress,
      currentTime,
      duration,
      currentLyric,
      isLoading,
      volume,
      isMuted,
      playMode,

      togglePlay,
      nextSong,
      prevSong,
      handleSeek,
      playSong,
      selectSong: playSong,
      setVolume,
      toggleMute,
      togglePlayMode,
    }),
    [
      playlist,
      currentIndex,
      currentSong,
      isPlaying,
      progress,
      currentTime,
      duration,
      currentLyric,
      isLoading,
      volume,
      isMuted,
      playMode,
      lyrics,
    ]
  );

  return (
    <MusicContext.Provider value={value}>
      {children}

      {currentSong && (
        <audio
          ref={audioRef}
          src={currentSong.src}
          preload="metadata"
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
          onLoadedMetadata={handleTimeUpdate}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
      )}
    </MusicContext.Provider>
  );
}

export const useMusic = () => {
  const context = useContext(MusicContext);

  if (!context) {
    throw new Error('useMusic must be used within MusicProvider');
  }

  return context;
};
