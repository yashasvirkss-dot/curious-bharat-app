import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  RotateCw, 
  Settings, 
  Volume2, 
  Maximize, 
  Compass, 
  BookOpen, 
  User, 
  CheckCircle,
  Clock,
  Download,
  Notebook,
  AlertTriangle,
  FileText,
  Video,
  Bookmark,
  ChevronRight,
  Sun,
  Laptop
} from 'lucide-react';
import { Chapter } from '../types';
import CommunityComments from './CommunityComments';

interface LecturePlayerProps {
  chapter: Chapter;
  studentName: string;
  isTeacher: boolean;
  onBack: () => void;
}

export default function LecturePlayer({ chapter, studentName, isTeacher, onBack }: LecturePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [quality, setQuality] = useState('1080p');
  const [volume, setVolume] = useState(80);
  const [brightness, setBrightness] = useState(100);
  const [currentTime, setCurrentTime] = useState(0); // in seconds
  const [duration, setDuration] = useState(1450); // mock duration fallback
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'about' | 'community' | 'notes' | 'assignments'>('about');
  const [personalNotes, setPersonalNotes] = useState<string[]>([]);
  const [noteInput, setNoteInput] = useState('');
  const [bookmarkedTimestamps, setBookmarkedTimestamps] = useState<Array<{ id: string; seconds: number; note: string }>>([]);
  const [reportedIssues, setReportedIssues] = useState(false);

  // Video download simulation states
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
  const [downloadingQuality, setDownloadingQuality] = useState<string | null>(null);

  const triggerVideoDownload = (selectedQual: string) => {
    if (downloadProgress !== null) {
      alert("Another download is already in progress!");
      return;
    }
    setDownloadingQuality(selectedQual);
    setDownloadProgress(0);
    
    let current = 0;
    const interval = setInterval(() => {
      current += Math.floor(Math.random() * 15) + 5;
      if (current >= 100) {
        current = 100;
        setDownloadProgress(100);
        clearInterval(interval);
        setTimeout(() => {
          alert(`Success! "${chapter.title}" (${selectedQual}) has been cached locally in your PWA application container for high-fidelity offline playback.`);
          setDownloadProgress(null);
          setDownloadingQuality(null);
        }, 600);
      } else {
        setDownloadProgress(current);
      }
    }, 300);
  };

  // YouTube Player Ref & Loading State
  const playerRef = useRef<any>(null);
  const playerContainerId = `yt-player-${chapter.id}`;
  const iframeTimerRef = useRef<any>(null);

  // Parse Video ID
  const getVideoId = (url: string) => {
    if (!url) return 'dQw4w9WgXcQ'; // Default placeholder
    let videoId = 'dQw4w9WgXcQ';
    if (url.includes('embed/')) {
      videoId = url.split('embed/')[1]?.split('?')[0];
    } else if (url.includes('v=')) {
      videoId = url.split('v=')[1]?.split('&')[0];
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0];
    }
    return videoId;
  };

  const videoId = getVideoId(chapter.lectureUrl || '');

  // Load saved notes and bookmarks
  useEffect(() => {
    const savedNotes = localStorage.getItem(`curious_notes_${chapter.id}`);
    if (savedNotes) {
      setPersonalNotes(JSON.parse(savedNotes));
    }
    const savedBookmarks = localStorage.getItem(`curious_bookmarks_${chapter.id}`);
    if (savedBookmarks) {
      setBookmarkedTimestamps(JSON.parse(savedBookmarks));
    }
  }, [chapter.id]);

  // Load YouTube IFrame Player API dynamically
  useEffect(() => {
    // Only load if not already loaded
    if (!(window as any).YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }

    // Bind global callback
    const previousCallback = (window as any).onYouTubeIframeAPIReady;
    (window as any).onYouTubeIframeAPIReady = () => {
      if (previousCallback) previousCallback();
      initYouTubePlayer();
    };

    if ((window as any).YT && (window as any).YT.Player) {
      initYouTubePlayer();
    }

    return () => {
      if (iframeTimerRef.current) clearInterval(iframeTimerRef.current);
      if (playerRef.current && playerRef.current.destroy) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [videoId, isPlaying]);

  const initYouTubePlayer = () => {
    if (!isPlaying) return; // Only init when user starts playback
    if (playerRef.current) return;

    try {
      playerRef.current = new (window as any).YT.Player(playerContainerId, {
        videoId: videoId,
        playerVars: {
          autoplay: 1,
          controls: 0, // Hide default controls to let our custom controls dominate
          rel: 0,
          showinfo: 0,
          modestbranding: 1,
          iv_load_policy: 3,
          disablekb: 1,
          fs: 0
        },
        events: {
          onReady: (event: any) => {
            event.target.setVolume(volume);
            event.target.setPlaybackRate(playbackSpeed);
            if (event.target.getDuration) {
              setDuration(event.target.getDuration() || 1450);
            }
            // Start time tracking interval
            startTimeTracking();
          },
          onStateChange: (event: any) => {
            // YT.PlayerState: 1 is playing, 2 is paused
            if (event.data === 1) {
              setIsPlaying(true);
            } else if (event.data === 2) {
              setIsPlaying(false);
            }
          }
        }
      });
    } catch (e) {
      console.warn("Could not load YouTube Player API. Operating in simulated preview mode.", e);
    }
  };

  const startTimeTracking = () => {
    if (iframeTimerRef.current) clearInterval(iframeTimerRef.current);
    iframeTimerRef.current = setInterval(() => {
      if (playerRef.current && playerRef.current.getCurrentTime) {
        const time = playerRef.current.getCurrentTime();
        setCurrentTime(time);
        const dur = playerRef.current.getDuration();
        if (dur && dur !== duration) {
          setDuration(dur);
        }
      } else if (isPlaying) {
        // Mock progression fallback
        setCurrentTime((prev) => Math.min(duration, prev + 1));
      }
    }, 1000);
  };

  const handlePlayToggle = () => {
    const nextPlay = !isPlaying;
    setIsPlaying(nextPlay);

    if (playerRef.current) {
      if (nextPlay) {
        playerRef.current.playVideo();
      } else {
        playerRef.current.pauseVideo();
      }
    } else if (nextPlay) {
      // Lazy init player
      setTimeout(() => initYouTubePlayer(), 100);
    }
  };

  const handleSeek = (seconds: number) => {
    setCurrentTime(seconds);
    if (playerRef.current && playerRef.current.seekTo) {
      playerRef.current.seekTo(seconds, true);
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (playerRef.current && playerRef.current.setPlaybackRate) {
      playerRef.current.setPlaybackRate(speed);
    }
  };

  const handleVolumeChange = (vol: number) => {
    setVolume(vol);
    if (playerRef.current && playerRef.current.setVolume) {
      playerRef.current.setVolume(vol);
    }
  };

  const saveNotes = (updated: string[]) => {
    setPersonalNotes(updated);
    localStorage.setItem(`curious_notes_${chapter.id}`, JSON.stringify(updated));
  };

  const handleAddNote = () => {
    if (!noteInput.trim()) return;
    const updated = [noteInput.trim(), ...personalNotes];
    saveNotes(updated);
    setNoteInput('');
  };

  const handleAddTimestampBookmark = () => {
    const formattedTime = formatTime(currentTime);
    const newB = {
      id: Math.random().toString(36).substring(2, 9),
      seconds: currentTime,
      note: `Bookmark created at ${formattedTime}`
    };
    const updated = [...bookmarkedTimestamps, newB];
    setBookmarkedTimestamps(updated);
    localStorage.setItem(`curious_bookmarks_${chapter.id}`, JSON.stringify(updated));
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-orange-400 font-mono">
            {chapter.subject} • Class {chapter.classLevel}
          </span>
          <h2 className="text-lg font-extrabold text-white">{chapter.title} Lecture</h2>
        </div>
        <button
          onClick={onBack}
          className="px-3 py-1.5 bg-zinc-950 border border-zinc-900 hover:border-zinc-700 text-xs font-bold rounded-xl cursor-pointer text-zinc-400 hover:text-white transition"
        >
          Back to Course
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col - Video and custom controls */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Custom Player Window */}
          <div className="relative aspect-video rounded-2xl overflow-hidden bg-black border border-zinc-900 shadow-2xl group">
            
            {/* Brightness overlay layer */}
            <div 
              className="absolute inset-0 bg-black pointer-events-none z-10 transition-opacity duration-300"
              style={{ opacity: `${(100 - brightness) / 100}` }}
            />

            {/* Embed container / cover */}
            {!isPlaying && !playerRef.current ? (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 bg-gradient-to-t from-black via-zinc-950/80 to-black/30 text-center">
                <div 
                  onClick={handlePlayToggle}
                  className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center cursor-pointer hover:scale-105 transition shadow-2xl shadow-orange-500/10 mb-4 animate-pulse"
                >
                  <Play className="w-8 h-8 fill-black translate-x-0.5" />
                </div>
                <p className="text-xs text-zinc-500 font-mono tracking-wider uppercase">Click to start lecture</p>
                <h3 className="text-sm font-bold text-zinc-300 mt-1 max-w-sm">{chapter.title}</h3>
                <span className="text-[10px] bg-zinc-900 border border-zinc-800 text-zinc-400 px-2.5 py-1 rounded-full mt-3 font-mono">
                  NCERT Complete Chapter Session
                </span>
              </div>
            ) : (
              <div className="w-full h-full">
                <div id={playerContainerId} className="w-full h-full" />
              </div>
            )}

            {/* CUSTOM YOUTUBE-LIKE CONTROL PANEL (Visible on hover) */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30 space-y-3">
              
              {/* Progress Seek Bar */}
              <div className="space-y-1">
                <input
                  type="range"
                  min="0"
                  max={duration}
                  value={currentTime}
                  onChange={(e) => handleSeek(Number(e.target.value))}
                  className="w-full h-1 bg-zinc-850 rounded-lg appearance-none cursor-pointer accent-orange-500"
                />
                <div className="flex justify-between items-center text-[10px] text-zinc-400 font-mono">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Control Action Buttons */}
              <div className="flex items-center justify-between">
                
                {/* Play/Pause & seeking */}
                <div className="flex items-center gap-4">
                  <button
                    onClick={handlePlayToggle}
                    className="p-1.5 hover:bg-zinc-900/60 rounded-lg text-white transition cursor-pointer"
                  >
                    {isPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white" />}
                  </button>

                  <button
                    onClick={() => handleSeek(Math.max(0, currentTime - 10))}
                    className="p-1.5 hover:bg-zinc-900/60 rounded-lg text-zinc-400 hover:text-white transition cursor-pointer"
                    title="Skip 10s backward"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleSeek(Math.min(duration, currentTime + 10))}
                    className="p-1.5 hover:bg-zinc-900/60 rounded-lg text-zinc-400 hover:text-white transition cursor-pointer"
                    title="Skip 10s forward"
                  >
                    <RotateCw className="w-4 h-4" />
                  </button>

                  {/* Bookmark timestamp */}
                  <button
                    onClick={handleAddTimestampBookmark}
                    className="p-1.5 hover:bg-zinc-900/60 rounded-lg text-zinc-400 hover:text-white transition cursor-pointer"
                    title="Bookmark current timestamp"
                  >
                    <Bookmark className="w-4 h-4" />
                  </button>
                </div>

                {/* Speed, Quality, Volume, Brightness */}
                <div className="flex items-center gap-3 text-xs text-zinc-400">
                  
                  {/* Brightness Control */}
                  <div className="flex items-center gap-1.5" title="Brightness adjust">
                    <Sun className="w-3.5 h-3.5 text-zinc-500" />
                    <input
                      type="range"
                      min="30"
                      max="100"
                      value={brightness}
                      onChange={(e) => setBrightness(Number(e.target.value))}
                      className="w-12 h-1 accent-orange-500"
                    />
                  </div>

                  {/* Volume Control */}
                  <div className="flex items-center gap-1.5" title="Volume level">
                    <Volume2 className="w-3.5 h-3.5 text-zinc-500" />
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={volume}
                      onChange={(e) => handleVolumeChange(Number(e.target.value))}
                      className="w-12 h-1 accent-orange-500"
                    />
                  </div>

                  {/* Playback speed menu */}
                  <div className="relative">
                    <button
                      onClick={() => {
                        setShowSpeedMenu(!showSpeedMenu);
                        setShowQualityMenu(false);
                      }}
                      className="hover:text-white cursor-pointer py-1 font-mono font-bold"
                    >
                      {playbackSpeed}x
                    </button>
                    {showSpeedMenu && (
                      <div className="absolute bottom-8 right-0 bg-zinc-950 border border-zinc-900 rounded-xl p-1.5 space-y-1 w-20 shadow-2xl z-40">
                        {[0.5, 1, 1.25, 1.5, 2].map((s) => (
                          <button
                            key={s}
                            onClick={() => {
                              handleSpeedChange(s);
                              setShowSpeedMenu(false);
                            }}
                            className={`w-full text-left px-2 py-1 rounded text-[10px] font-mono cursor-pointer hover:bg-zinc-900 ${
                              playbackSpeed === s ? 'text-orange-400 font-bold' : 'text-zinc-500'
                            }`}
                          >
                            {s}x
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Playback Quality Menu */}
                  <div className="relative">
                    <button
                      onClick={() => {
                        setShowQualityMenu(!showQualityMenu);
                        setShowSpeedMenu(false);
                      }}
                      className="hover:text-white cursor-pointer py-1 font-mono font-bold uppercase"
                    >
                      {quality}
                    </button>
                    {showQualityMenu && (
                      <div className="absolute bottom-8 right-0 bg-zinc-950 border border-zinc-900 rounded-xl p-1.5 space-y-1 w-20 shadow-2xl z-40">
                        {['1080p', '720p', '480p', '360p'].map((q) => (
                          <button
                            key={q}
                            onClick={() => {
                              setQuality(q);
                              setShowQualityMenu(false);
                            }}
                            className={`w-full text-left px-2 py-1 rounded text-[10px] font-mono cursor-pointer hover:bg-zinc-900 ${
                              quality === q ? 'text-orange-400 font-bold' : 'text-zinc-500'
                            }`}
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                </div>

              </div>

            </div>

          </div>

          {/* Quick Media Controls & Offline Download Section */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-4 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-2.5">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-orange-400 animate-spin-slow" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-350 font-mono">
                  Lecture Action desk & offline download
                </h4>
              </div>
              <span className="text-[9px] font-mono text-zinc-500 uppercase">Interactive play & save</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Speed & Quality Quick Toggles */}
              <div className="space-y-3 bg-zinc-900/10 border border-zinc-900/65 rounded-xl p-3">
                {/* Playback Speed Controller */}
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-zinc-500 font-mono block">Playback Speed Control</span>
                  <div className="flex flex-wrap gap-1.5">
                    {[0.5, 1, 1.25, 1.5, 2].map((s) => (
                      <button
                        key={s}
                        onClick={() => handleSpeedChange(s)}
                        className={`px-2.5 py-1 text-[10px] font-bold font-mono rounded-lg transition-all border cursor-pointer ${
                          playbackSpeed === s
                            ? "bg-white text-black border-white shadow-md shadow-white/5 scale-105"
                            : "bg-zinc-950 text-zinc-400 border-zinc-900 hover:border-zinc-700 hover:text-white"
                        }`}
                      >
                        {s === 1 ? "Normal (1x)" : `${s}x`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Playback Quality Controller */}
                <div className="space-y-1.5 pt-1.5 border-t border-zinc-900/50">
                  <span className="text-[10px] uppercase font-bold text-zinc-500 font-mono block">Video Resolution Mode</span>
                  <div className="flex flex-wrap gap-1.5">
                    {["1080p", "720p", "480p", "360p"].map((q) => (
                      <button
                        key={q}
                        onClick={() => setQuality(q)}
                        className={`px-2.5 py-1 text-[10px] font-bold font-mono rounded-lg transition-all border cursor-pointer ${
                          quality === q
                            ? "bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/10 scale-105"
                            : "bg-zinc-950 text-zinc-400 border-zinc-900 hover:border-zinc-700 hover:text-white"
                        }`}
                      >
                        {q === "1080p" ? "1080p (FHD)" : q === "720p" ? "720p (HD)" : q}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Download Control Center */}
              <div className="space-y-3 bg-zinc-900/10 border border-zinc-900/65 rounded-xl p-3 flex flex-col justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-zinc-500 font-mono block">Secure Offline Downloads</span>
                  <p className="text-[10px] text-zinc-400 leading-normal">
                    Save this full lecture into your local database container for zero-data offline learning.
                  </p>
                </div>

                {downloadProgress !== null ? (
                  <div className="bg-zinc-950 border border-zinc-900 p-2.5 rounded-lg space-y-1.5 animate-pulse">
                    <div className="flex justify-between text-[10px] font-mono">
                      <span className="text-orange-400 font-bold">Caching Video ({downloadingQuality})...</span>
                      <span className="text-white">{downloadProgress}%</span>
                    </div>
                    <div className="w-full bg-zinc-900 h-1 rounded-full overflow-hidden">
                      <div className="bg-orange-500 h-full transition-all duration-300" style={{ width: `${downloadProgress}%` }} />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { label: "1080p", size: "320 MB" },
                      { label: "720p", size: "180 MB" },
                      { label: "360p", size: "85 MB" }
                    ].map((item) => (
                      <button
                        key={item.label}
                        onClick={() => triggerVideoDownload(item.label)}
                        className="bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 hover:border-zinc-750 p-1.5 rounded-lg text-center cursor-pointer transition text-zinc-300 hover:text-white"
                      >
                        <span className="text-[10px] font-black block font-mono text-orange-400">{item.label}</span>
                        <span className="text-[8px] text-zinc-500 block font-mono mt-0.5">{item.size}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Subtabs Below Video Area */}
          <div className="border-b border-zinc-900 flex gap-4 text-xs font-mono">
            {[
              { id: 'about', label: 'Overview' },
              { id: 'community', label: 'Discussion Board' },
              { id: 'notes', label: 'My Notes' },
              { id: 'assignments', label: 'PDFs & Homework' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`pb-2 border-b-2 cursor-pointer transition-colors ${
                  activeSubTab === tab.id
                    ? 'border-orange-500 text-white font-bold'
                    : 'border-transparent text-zinc-500 hover:text-zinc-350'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Render Switch */}
          <div className="bg-zinc-950/20 rounded-2xl p-4 border border-zinc-900/60 min-h-[250px]">
            {activeSubTab === 'about' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-white mb-1">Learning Objectives</h3>
                  <ul className="list-disc list-inside text-xs text-zinc-400 space-y-1.5 leading-relaxed">
                    {chapter.keyConcepts.map((concept, i) => (
                      <li key={i}>
                        Understand <span className="text-zinc-200 font-semibold">{concept}</span> including experimental proof and standard formulae.
                      </li>
                    ))}
                    <li>Apply learned rules to resolve numerical problems and CBSE Boards high-scoring inquiries.</li>
                  </ul>
                </div>

                <div className="border-t border-zinc-900 pt-3 flex flex-wrap gap-4 text-xs text-zinc-500">
                  <div className="flex items-center gap-1.5">
                    <User className="w-4 h-4 text-zinc-400" />
                    <span>Instructor: <strong className="text-zinc-300">Priyanshu (Science Lead)</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-zinc-400" />
                    <span>Duration: <strong className="text-zinc-300">24 mins</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Video className="w-4 h-4 text-zinc-400" />
                    <span>Format: <strong className="text-zinc-300">Ultra Full-HD (1080p)</strong></span>
                  </div>
                </div>

                {/* Personal reported issue mechanism */}
                <div className="border-t border-zinc-900 pt-3">
                  {!reportedIssues ? (
                    <button
                      onClick={() => {
                        setReportedIssues(true);
                        alert("Thank you! Your issue report has been logged and sent to educator Priyanshu for review.");
                      }}
                      className="text-[10px] text-zinc-500 hover:text-red-400 flex items-center gap-1 font-mono uppercase tracking-wider cursor-pointer"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Report playback or translation mismatch issue
                    </button>
                  ) : (
                    <p className="text-[10px] text-yellow-400 font-mono">⚠️ Feedback logged. Educator notified!</p>
                  )}
                </div>
              </div>
            )}

            {activeSubTab === 'community' && (
              <CommunityComments
                lectureId={chapter.id}
                studentName={studentName}
                isTeacher={isTeacher}
              />
            )}

            {activeSubTab === 'notes' && (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type a key takeaway, reminder, or formula..."
                    value={noteInput}
                    onChange={(e) => setNoteInput(e.target.value)}
                    className="flex-1 bg-zinc-950 border border-zinc-900 rounded-xl py-2 px-3 text-xs text-white outline-none focus:border-zinc-700 placeholder-zinc-600"
                  />
                  <button
                    onClick={handleAddNote}
                    className="bg-white text-black font-extrabold text-xs px-4 rounded-xl hover:bg-zinc-200 cursor-pointer"
                  >
                    Save Note
                  </button>
                </div>

                <div className="space-y-2">
                  {personalNotes.map((note, idx) => (
                    <div key={idx} className="bg-zinc-950 border border-zinc-900 rounded-xl p-3 flex justify-between items-start">
                      <p className="text-xs text-zinc-300 leading-normal">{note}</p>
                      <button
                        onClick={() => {
                          const updated = personalNotes.filter((_, i) => i !== idx);
                          saveNotes(updated);
                        }}
                        className="text-[10px] text-zinc-650 hover:text-red-400 font-mono cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  ))}

                  {personalNotes.length === 0 && (
                    <div className="text-center py-6 text-xs text-zinc-650">
                      Save personal takeaways or dynamic learning references here.
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeSubTab === 'assignments' && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">Downloadable Core PDFs</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <a
                    href={chapter.pdfUrl || '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-3 bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 rounded-xl transition cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-red-950/20 border border-red-900/40 text-red-400 rounded-lg">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">Interactive Class Notes PDF</p>
                        <p className="text-[9px] text-zinc-500 font-mono">1.2 MB • Ready Offline</p>
                      </div>
                    </div>
                    <Download className="w-4 h-4 text-zinc-500 hover:text-white" />
                  </a>

                  {chapter.dppFiles && chapter.dppFiles.length > 0 ? (
                    chapter.dppFiles.map((file, idx) => (
                      <a
                        key={file.id || idx}
                        href={file.url || '#'}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between p-3 bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 rounded-xl transition cursor-pointer text-left"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 bg-blue-950/20 border border-blue-900/40 text-blue-400 rounded-lg">
                            <Notebook className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-white">{file.name || `Practice Sheet Day #${idx + 1}`}</p>
                            <p className="text-[9px] text-zinc-500 font-mono">Day Wise DPP • Daily Sheet</p>
                          </div>
                        </div>
                        <Download className="w-4 h-4 text-zinc-500 hover:text-white" />
                      </a>
                    ))
                  ) : (
                    <a
                      href={chapter.dppUrl || '#'}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between p-3 bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 rounded-xl transition cursor-pointer text-left"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-blue-950/20 border border-blue-900/40 text-blue-400 rounded-lg">
                          <Notebook className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">Daily Practice Problem (DPP)</p>
                          <p className="text-[9px] text-zinc-500 font-mono">10 Questions • Recommended</p>
                        </div>
                      </div>
                      <Download className="w-4 h-4 text-zinc-500 hover:text-white" />
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Right Col */}
        <div className="space-y-4">
          
          <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-4 space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-zinc-400 font-mono flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-orange-400" />
              Dynamic Progress
            </h4>
            
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-zinc-400">
                <span>Completed Tasks</span>
                <span className="font-mono text-white">80%</span>
              </div>
              <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-orange-500 to-emerald-500 h-full rounded-full" style={{ width: '80%' }} />
              </div>
            </div>

            <div className="text-[11px] text-zinc-500 leading-normal bg-zinc-900/30 p-2.5 border border-zinc-900 rounded-xl">
              💡 Completed the study cards? Jump right into the practice quiz to score coins and gain rank bonuses!
            </div>
          </div>

          {/* Saved Timestamp Bookmarks */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-4 space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-zinc-400 font-mono flex items-center gap-1.5">
              <Bookmark className="w-3.5 h-3.5 text-orange-400" />
              Saved Bookmarks ({bookmarkedTimestamps.length})
            </h4>

            <div className="space-y-2">
              {bookmarkedTimestamps.map((b) => (
                <div 
                  key={b.id}
                  onClick={() => handleSeek(b.seconds)}
                  className="p-2 bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-850 rounded-xl flex items-center justify-between text-xs cursor-pointer transition group"
                >
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white" />
                    <span className="font-bold font-mono text-white">{formatTime(b.seconds)}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-500 font-bold" />
                </div>
              ))}

              {bookmarkedTimestamps.length === 0 && (
                <div className="text-center py-4 text-[10px] text-zinc-600 font-medium">
                  Click the bookmark button in player controls to save any video timestamps.
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
