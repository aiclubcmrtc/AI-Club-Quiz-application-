import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'wouter';
import {
  Tv,
  Users,
  Play,
  SkipForward,
  Trophy,
  Maximize2,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Flame,
  Award,
  RefreshCw,
  Lock,
  ShieldCheck,
  ChevronRight,
  Trash2,
  UserPlus,
  ArrowRight,
  Square
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SAMPLE_QUIZZES, Question, CHOICE_ICONS, CHOICE_COLORS } from '../data/quizData';
import { sounds } from '../utils/soundEngine';
import { useAdminAuth } from '../context/AdminAuthContext';
import { isRealParticipant } from '../data/adminAccounts';

interface LobbyPlayer {
  id: string;
  name: string;
  branch: string;
  avatar: string;
}

export const HostGamePage: React.FC = () => {
  const {
    batches,
    activeBatchId,
    setActiveBatchId,
    getQuestionsForBatch,
    questions: adminQuestions,
    clubLogo,
    venue,
    roomPin,
    generateNewRoomPin,
    eventName,
    isAuthenticated
  } = useAdminAuth();

  // Host Phases: 'lobby' | 'question' | 'breakdown' | 'leaderboard' | 'podium'
  const [phase, setPhase] = useState<'lobby' | 'question' | 'breakdown' | 'leaderboard' | 'podium'>('lobby');

  // Multi-round batch selection for tournament
  const [selectedBatchId, setSelectedBatchId] = useState<string>(activeBatchId || 'batch-1');
  const currentBatch = batches.find((b) => b.id === selectedBatchId) || batches[0] || {
    id: 'batch-1',
    name: 'Round 1: Screening & Fundamentals',
    description: '',
    roundNumber: 1,
    isPublished: true
  };

  const batchQuestions = currentBatch ? getQuestionsForBatch(currentBatch.id) : [];
  const activeQuestions: Question[] = batchQuestions.length > 0 
    ? (batchQuestions as unknown as Question[]) 
    : (adminQuestions.length > 0 ? (adminQuestions as unknown as Question[]) : SAMPLE_QUIZZES[0].questions);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [answeredCount, setAnsweredCount] = useState(0);

  // Live Lobby Players (starts completely clean & empty, real participants only)
  const [players, setPlayers] = useState<LobbyPlayer[]>(() => {
    try {
      const saved = localStorage.getItem('cmrtc_live_lobby_players');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const cleaned = parsed.filter(isRealParticipant);
          if (cleaned.length !== parsed.length) {
            localStorage.setItem('cmrtc_live_lobby_players', JSON.stringify(cleaned));
          }
          return cleaned;
        }
      }
    } catch {}
    return [];
  });

  const [leaderboardScores, setLeaderboardScores] = useState<
    { name: string; branch: string; score: number; streak: number; avatar: string }[]
  >([]);

  const [liveDistribution, setLiveDistribution] = useState<number[]>([0, 0, 0, 0]);
  const [showDistribution, setShowDistribution] = useState<boolean>(true);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const currentQ = activeQuestions[currentIndex] || activeQuestions[0];
  const cleanPin = (roomPin || '').replace(/[\s-_]/g, '').toLowerCase();

  // Register room with backend on mount or whenever PIN/Batch changes
  useEffect(() => {
    if (cleanPin) {
      fetch('/api/quiz/room/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pin: cleanPin,
          title: currentBatch.name || eventName,
          batchId: selectedBatchId
        })
      }).catch((err) => console.warn('Room register notice:', err));
    }
  }, [cleanPin, currentBatch.name, eventName, selectedBatchId]);

  // Sync real-time participants joining from /play across browser tabs & phones
  useEffect(() => {
    const syncPlayers = async () => {
      // 1. Fetch from network server room
      if (cleanPin) {
        try {
          const res = await fetch(`/api/quiz/room/${cleanPin}`);
          if (res.ok) {
            const data = await res.json();
            if (data) {
              if (data.optionDistribution && Array.isArray(data.optionDistribution[currentIndex])) {
                setLiveDistribution(data.optionDistribution[currentIndex]);
              }
              if (Array.isArray(data.players)) {
                const remotePlayers: LobbyPlayer[] = data.players.filter(isRealParticipant);
                if (phase === 'lobby') {
                  setPlayers(remotePlayers);
                  try {
                    localStorage.setItem('cmrtc_live_lobby_players', JSON.stringify(remotePlayers));
                  } catch {}
                } else {
                  if (typeof data.answeredCount === 'number') {
                    setAnsweredCount(data.answeredCount);
                  }
                  // CASE 1: When all participants entered their answer!
                  if (phase === 'question') {
                    if (
                      data.status === 'breakdown' ||
                      (remotePlayers.length > 0 && typeof data.answeredCount === 'number' && data.answeredCount >= remotePlayers.length)
                    ) {
                      handleRevealBreakdown();
                    }
                  }
                  if (remotePlayers.length > 0) {
                    setLeaderboardScores(
                      remotePlayers.map((rp: any) => ({
                        name: rp.name,
                        branch: rp.branch,
                        score: rp.score || 0,
                        streak: rp.streak || 0,
                        avatar: rp.avatar || '⚡'
                      })).sort((a: any, b: any) => (b.score || 0) - (a.score || 0))
                    );
                  }
                }
              }
            }
          }
        } catch {}
      }
    };

    window.addEventListener('storage', syncPlayers);
    const pollInterval = setInterval(syncPlayers, 1000);
    return () => {
      window.removeEventListener('storage', syncPlayers);
      clearInterval(pollInterval);
    };
  }, [cleanPin, phase]);

  // Admin Lobby Controls
  const clearLobby = () => {
    sounds.playPop();
    setPlayers([]);
    setLiveDistribution([0, 0, 0, 0]);
    localStorage.removeItem('cmrtc_live_lobby_players');
    localStorage.removeItem('cmrtc_live_tournament_scores');
    if (cleanPin) {
      fetch(`/api/quiz/room/${cleanPin}/clear`, { method: 'POST' }).catch(() => {});
    }
    window.dispatchEvent(new Event('storage'));
  };

  const addDemoStudent = () => {
    sounds.playPop();
    const demoAvatars = ['⚡', '🚀', '🧠', '🛡️', '🤖', '💻', '🔥', '✨'];
    const demoBranches = ['CSE (AI&ML)', 'CSE Core', 'CSE (DS)', 'CSE (Cyber)', 'ECE', 'IT'];
    const bIdx = Math.floor(Math.random() * demoBranches.length);
    const aIdx = Math.floor(Math.random() * demoAvatars.length);
    const newPlayer: LobbyPlayer = {
      id: `test-${Date.now()}`,
      name: `Joined Player #${Math.floor(Math.random() * 89 + 10)}`,
      branch: demoBranches[bIdx],
      avatar: demoAvatars[aIdx]
    };
    const updated = [...players, newPlayer];
    setPlayers(updated);
    localStorage.setItem('cmrtc_live_lobby_players', JSON.stringify(updated));
  };

  const removePlayer = (id: string) => {
    sounds.playPop();
    const updated = players.filter((p) => p.id !== id);
    setPlayers(updated);
    localStorage.setItem('cmrtc_live_lobby_players', JSON.stringify(updated));
  };

  // Question countdown - Questions change ONLY when all participants mark answers (Case 1) OR admin ends question / timer ends (Case 2)
  useEffect(() => {
    if (phase === 'question') {
      const qDuration = currentQ.timeLimit || 15;
      setTimeLeft(qDuration);
      setAnsweredCount(0);

      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // CASE 2: Official Question Time Ran Out!
            clearInterval(timerRef.current!);
            handleRevealBreakdown();
            return 0;
          }
          if (prev <= 4) {
            sounds.playTick();
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [phase, currentIndex]);

  const handleStartFromLobby = () => {
    if (players.length === 0) {
      alert(`The live lobby is currently empty. Ask students to join with PIN ${roomPin} or click '+ Add Demo Student' to test.`);
      return;
    }
    sounds.playPop();

    // Broadcast state to room so joined phones launch quiz synchronously
    if (cleanPin) {
      fetch(`/api/quiz/room/${cleanPin}/state`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'question', currentQuestion: 0 })
      }).catch(() => {});
    }
    try {
      localStorage.setItem('cmrtc_room_state_sync', JSON.stringify({ status: 'question', currentQuestion: 0, timestamp: Date.now() }));
      window.dispatchEvent(new Event('storage'));
    } catch {}

    setLeaderboardScores(
      players.map((p) => ({
        name: p.name,
        branch: p.branch,
        score: 0,
        streak: 0,
        avatar: p.avatar
      }))
    );
    setLiveDistribution([0, 0, 0, 0]);
    setCurrentIndex(0);
    setPhase('question');
  };

  const handleRevealBreakdown = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    sounds.playCorrect();

    if (cleanPin) {
      fetch(`/api/quiz/room/${cleanPin}/state`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'breakdown', currentQuestion: currentIndex })
      }).catch(() => {});

      // Fetch genuine contestant scores and live option distribution from server: ZERO random numbers!
      fetch(`/api/quiz/room/${cleanPin}`)
        .then((res) => res.json())
        .then((data) => {
          if (data) {
            if (data.optionDistribution && Array.isArray(data.optionDistribution[currentIndex])) {
              setLiveDistribution(data.optionDistribution[currentIndex]);
            }
            if (Array.isArray(data.players) && data.players.length > 0) {
              const genuineScores = [...data.players].sort((a: any, b: any) => (b.score || 0) - (a.score || 0));
              setLeaderboardScores(genuineScores);
              try {
                localStorage.setItem('cmrtc_live_tournament_scores', JSON.stringify(genuineScores));
                window.dispatchEvent(new Event('storage'));
              } catch {}
            }
          }
        })
        .catch(() => {});
    }
    try {
      localStorage.setItem('cmrtc_room_state_sync', JSON.stringify({ status: 'breakdown', currentQuestion: currentIndex, timestamp: Date.now() }));
      window.dispatchEvent(new Event('storage'));
    } catch {}

    setPhase('breakdown');
  };

  const handleShowLeaderboard = () => {
    sounds.playPop();
    if (cleanPin) {
      fetch(`/api/quiz/room/${cleanPin}/state`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'leaderboard', currentQuestion: currentIndex })
      }).catch(() => {});

      // Fetch genuine scores: ZERO random points!
      fetch(`/api/quiz/room/${cleanPin}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && Array.isArray(data.players) && data.players.length > 0) {
            const genuineScores = [...data.players].sort((a: any, b: any) => (b.score || 0) - (a.score || 0));
            setLeaderboardScores(genuineScores);
          }
        })
        .catch(() => {});
    }
    try {
      localStorage.setItem('cmrtc_room_state_sync', JSON.stringify({ status: 'leaderboard', currentQuestion: currentIndex, timestamp: Date.now() }));
      window.dispatchEvent(new Event('storage'));
    } catch {}

    setPhase('leaderboard');
  };

  const handleNextOrFinish = () => {
    sounds.playPop();
    if (currentIndex + 1 < activeQuestions.length) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      setLiveDistribution([0, 0, 0, 0]);
      if (cleanPin) {
        fetch(`/api/quiz/room/${cleanPin}/state`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'question', currentQuestion: nextIdx })
        }).catch(() => {});
      }
      try {
        localStorage.setItem('cmrtc_room_state_sync', JSON.stringify({ status: 'question', currentQuestion: nextIdx, timestamp: Date.now() }));
        window.dispatchEvent(new Event('storage'));
      } catch {}
      setPhase('question');
    } else {
      if (cleanPin) {
        fetch(`/api/quiz/room/${cleanPin}/state`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'ended' })
        }).catch(() => {});
      }
      try {
        localStorage.setItem('cmrtc_room_state_sync', JSON.stringify({ status: 'ended', timestamp: Date.now() }));
        window.dispatchEvent(new Event('storage'));
      } catch {}
      sounds.playVictory();
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.4 }
      });
      setPhase('podium');
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // ================= 0. ADMIN ACCESS RESTRICTION =================
  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md card p-8 sm:p-10 text-center space-y-6 bg-white border border-blue-100 shadow-xl rounded-3xl">
          <div className="w-20 h-20 mx-auto rounded-full bg-blue-50 border-2 border-blue-200 flex items-center justify-center text-blue-600 shadow-sm">
            <Lock className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              Master Admin Access Required
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900">
              Auditorium Projector Locked
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-xs mx-auto">
              The Projector Screen is reserved exclusively for AI CLUB CMRTC Admins and Event Hosts.
            </p>
          </div>
          <div className="pt-2 space-y-3">
            <Link
              href="/admin/login"
              className="btn-primary w-full py-3.5 text-sm sm:text-base flex items-center justify-center gap-2 shadow-md"
            >
              <ShieldCheck className="w-4 h-4" />
              Login as Master Admin
            </Link>
            <Link
              href="/"
              className="btn-secondary w-full py-2.5 text-xs text-slate-600 hover:text-blue-600"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[88vh] flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* ================= 1. LOBBY SCREEN (AUDITORIUM PROJECTOR) ================= */}
      {phase === 'lobby' && (
        <div className="max-w-6xl mx-auto w-full space-y-8">
          {/* Top Host Bar (White & Light Blue) */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-white/95 border border-blue-100 rounded-2xl p-4 sm:p-5 shadow-sm backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden p-0.5 bg-white border border-blue-200 shadow-sm ring-2 ring-blue-500/10 shrink-0">
                <img src={clubLogo} alt="AI CLUB CMRTC" className="w-full h-full object-cover rounded-full" />
              </div>
              <div>
                <div className="font-display font-extrabold text-lg text-slate-900">
                  Auditorium Projector Mode
                </div>
                <div className="text-xs text-slate-500">
                  {eventName} • AI CLUB CMRTC • <span className="text-blue-600 font-semibold">{venue}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Multi-Round Batch Switcher */}
              <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 rounded-xl px-2.5 py-1.5 shadow-sm">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Round:</span>
                <select
                  value={selectedBatchId}
                  onChange={(e) => {
                    sounds.playPop();
                    setSelectedBatchId(e.target.value);
                    setActiveBatchId(e.target.value);
                    setCurrentIndex(0);
                  }}
                  className="bg-transparent text-xs font-extrabold text-blue-700 focus:outline-none cursor-pointer"
                >
                  {batches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({getQuestionsForBatch(b.id).length} Qs) {b.isPublished ? '● Published' : '🔒 Confidential'}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => {
                  sounds.playPop();
                  generateNewRoomPin();
                }}
                className="btn-secondary px-3 py-2 text-xs flex items-center gap-1.5"
                title="Generate New Unique Join Code"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                New Unique PIN
              </button>

              <button
                onClick={clearLobby}
                disabled={players.length === 0}
                className="px-3 py-2 text-xs rounded-xl border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 font-bold transition-all"
                title="Clear all students from live lobby"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear Lobby ({players.length})
              </button>

              <button
                onClick={addDemoStudent}
                className="btn-secondary px-3 py-2 text-xs flex items-center gap-1.5 text-blue-700 font-semibold"
                title="Add simulated participant for testing"
              >
                <UserPlus className="w-3.5 h-3.5" />
                + Demo Student
              </button>

              <button
                onClick={toggleFullscreen}
                className="btn-secondary px-3 py-2 text-xs flex items-center gap-1.5"
                title="Fullscreen"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                Fullscreen
              </button>

              <button
                onClick={handleStartFromLobby}
                className="btn-primary px-5 py-2 text-xs sm:text-sm flex items-center gap-2 shadow-md font-bold"
              >
                <Play className="w-4 h-4 fill-current" />
                Start {currentBatch.name.split(':')[0] || 'Round'} ({players.length} Joined)
              </button>
            </div>
          </div>

          {/* Round Header Announcement Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50/90 via-sky-50 to-indigo-50 border border-blue-200 flex flex-wrap items-center justify-between gap-3 text-xs shadow-sm">
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-1 rounded-lg bg-blue-600 text-white font-extrabold text-[10px] uppercase tracking-wide">
                ROUND {currentBatch.roundNumber} OF {batches.length}
              </span>
              <div>
                <span className="font-extrabold text-slate-900 text-sm block sm:inline">{currentBatch.name}</span>
                <span className="text-slate-400 hidden sm:inline mx-2">•</span>
                <span className="text-slate-600 font-medium">{currentBatch.description}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-blue-700 bg-white border border-blue-200 px-2.5 py-1 rounded-xl">
                {activeQuestions.length} Questions Configured
              </span>
              {currentBatch.isPublished ? (
                <span className="px-2.5 py-1 rounded-xl bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                  ✓ Ready to Launch
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-xl bg-amber-100 text-amber-800 font-bold border border-amber-200">
                  🔒 Confidential (Auto-Revealed on Start)
                </span>
              )}
            </div>
          </div>

          {/* Big Center Join Invitation (PIN Code ONLY, No QR) */}
          <div className="card p-8 sm:p-12 bg-gradient-to-br from-blue-50/90 via-white to-sky-50/80 border-2 border-blue-200 text-center space-y-6 shadow-xl rounded-3xl max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100 text-blue-700 text-xs sm:text-sm font-bold">
              <Sparkles className="w-4 h-4" />
              JOIN USING AUDITORIUM ROOM CODE
            </div>

            <div>
              <div className="text-xs sm:text-sm uppercase tracking-widest text-slate-500 font-bold mb-1">
                Auditorium Room Joining PIN
              </div>
              <div className="font-mono text-6xl sm:text-8xl font-black tracking-widest text-blue-900 drop-shadow-sm select-all">
                {roomPin}
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-white/95 border border-blue-200/90 shadow-sm max-w-xl mx-auto space-y-2 text-left">
              <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                How Participants Join from Mobile Phone:
              </div>
              <ol className="text-xs sm:text-sm text-slate-600 space-y-1.5 list-decimal list-inside">
                <li>
                  Open smartphone browser & go to:{' '}
                  <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.hostname}:5173/play` : '/play'}
                  </span>
                </li>
                <li>
                  Enter Joining Code: <strong className="font-mono text-blue-900 font-extrabold">{roomPin}</strong>
                </li>
                <li>Enter your Nickname and Branch, then tap <strong>Enter Game Room</strong>.</li>
              </ol>
            </div>

            <div className="text-xs text-slate-500 flex items-center justify-center gap-4 flex-wrap">
              <span>📍 Venue: <strong className="text-slate-800">{venue}</strong></span>
              <span>•</span>
              <span className="text-emerald-700 font-medium">🔒 Quiz starts automatically when Admin launches</span>
            </div>
          </div>

          {/* Joined Players Lobby Grid */}
          <div className="card p-6 bg-white border border-blue-100 space-y-4 shadow-md">
            <div className="flex items-center justify-between text-xs flex-wrap gap-2">
              <span className="font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-600" />
                Live Lobby ({players.length} Students Connected)
              </span>
              {players.length > 0 ? (
                <span className="text-emerald-600 font-mono text-[11px] font-bold animate-pulse">● Ready for admin to launch</span>
              ) : (
                <span className="text-amber-600 font-mono text-[11px] font-bold">● Waiting for participants</span>
              )}
            </div>

            {players.length === 0 ? (
              <div className="py-12 text-center space-y-3 bg-blue-50/30 rounded-2xl border border-dashed border-blue-200">
                <div className="w-12 h-12 mx-auto rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg animate-pulse">
                  📡
                </div>
                <div className="font-bold text-slate-800 text-sm">
                  Lobby is Clear & Ready (0 Students Connected)
                </div>
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                  Ask students to visit <span className="font-mono font-bold text-blue-700">/play</span> on their smartphones and enter PIN <strong className="font-mono text-blue-800 font-bold">{roomPin}</strong>.
                </p>
                <div className="pt-2 flex items-center justify-center gap-2">
                  <button
                    onClick={addDemoStudent}
                    className="btn-secondary px-3.5 py-1.5 text-xs text-blue-700 font-semibold flex items-center gap-1.5"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    + Add Demo Student (Quick Test)
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 max-h-48 overflow-y-auto pr-1">
                {players.map((p) => (
                  <div
                    key={p.id}
                    className="group relative flex items-center gap-2 p-2 rounded-xl bg-blue-50/50 border border-blue-100 text-xs text-slate-800 shadow-sm hover:border-rose-200 transition-all"
                  >
                    <span className="text-base">{p.avatar}</span>
                    <div className="truncate flex-1">
                      <div className="font-bold truncate text-slate-900">{p.name}</div>
                      <div className="text-[10px] text-slate-500 truncate">{p.branch}</div>
                    </div>
                    <button
                      onClick={() => removePlayer(p.id)}
                      title="Kick student"
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 rounded transition-all text-xs"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= 2. LIVE QUESTION DISPLAY ================= */}
      {phase === 'question' && (
        <div className="max-w-5xl mx-auto w-full space-y-6">
          {/* Top Status */}
          <div className="flex items-center justify-between text-sm font-semibold px-2 flex-wrap gap-3">
            <div className="flex items-center gap-2 text-slate-600">
              <span className="font-display font-extrabold text-slate-900 text-base">
                Question {currentIndex + 1} of {activeQuestions.length}
              </span>
              <span>•</span>
              <span className="text-blue-600 font-bold">{currentQ.category}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-xs font-mono font-bold px-3 py-1 rounded-full ${
                answeredCount >= players.length ? 'bg-emerald-100 text-emerald-700 animate-pulse' : 'bg-blue-100 text-blue-700'
              }`}>
                {answeredCount} / {players.length} Answered
              </span>
              <button
                onClick={handleRevealBreakdown}
                className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                title="End Question immediately and reveal answers (Case 2)"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                End Question Now
              </button>
            </div>
          </div>

          {/* Big Screen Question Box (White & Light Blue) */}
          <div className="card p-8 sm:p-12 bg-white border border-blue-100 text-center space-y-6 shadow-xl">
            {/* Circular Countdown Ring */}
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center font-display text-3xl font-extrabold text-white shadow-[0_0_0_8px_rgba(37,99,235,0.15)]">
                {timeLeft}
              </div>
            </div>

            <h1 className="font-display text-2xl sm:text-4xl font-extrabold text-slate-900 leading-snug max-w-3xl mx-auto">
              {currentQ.question}
            </h1>

            {/* Display Diagram / Image Question if present */}
            {currentQ.imageUrl && (
              <div className="max-w-2xl mx-auto rounded-2xl overflow-hidden border border-blue-200 bg-white p-3 shadow-md">
                <img src={currentQ.imageUrl} alt="Question Diagram" className="max-h-64 mx-auto object-contain rounded-xl" />
              </div>
            )}

            {currentQ.codeSnippet && (
              <pre className="max-w-xl mx-auto p-4 rounded-xl bg-slate-900 font-mono text-sm text-cyan-300 border border-slate-800 text-left overflow-x-auto shadow-inner">
                {currentQ.codeSnippet}
              </pre>
            )}

            {/* Live Progress Banner: Waiting for all to answer or time ends */}
            <div className="pt-2">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-800">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                {answeredCount >= players.length 
                  ? 'All participants answered! Revealing breakdown...' 
                  : `Waiting for all ${players.length} participants to mark their answer (or timer ends)...`}
              </div>
            </div>
          </div>

          {/* 4 Choices Grid (Full Width & Responsive) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {currentQ.options.map((opt, idx) => (
              <div
                key={idx}
                className={`
                  ${CHOICE_COLORS[idx]}
                  flex items-center gap-4 p-5 rounded-2xl font-display font-bold text-lg sm:text-xl text-white shadow-lg
                `}
              >
                <span className="w-10 h-10 rounded-xl bg-black/20 flex items-center justify-center text-lg font-bold shrink-0">
                  {CHOICE_ICONS[idx]}
                </span>
                <span className="leading-snug">{opt}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= 3. ANSWER BREAKDOWN WITH RIGHT-SIDE LEADERBOARD ================= */}
      {phase === 'breakdown' && (
        <div className="max-w-7xl mx-auto w-full space-y-5">
          {/* Top Actions Bar */}
          <div className="flex items-center justify-between text-sm font-semibold px-2 flex-wrap gap-3">
            <div className="flex items-center gap-2.5 text-slate-600">
              <span className="font-display font-extrabold text-slate-900 text-base">
                Question {currentIndex + 1} of {activeQuestions.length} Results
              </span>
              <span>•</span>
              <span className="text-blue-600 font-bold">{currentQ.category}</span>
              <span className="hidden sm:inline text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                Answer Revealed
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <button
                onClick={handleShowLeaderboard}
                className="btn-secondary px-3.5 py-2 text-xs flex items-center gap-1.5"
                title="Expand to Full Stage View"
              >
                <Trophy className="w-3.5 h-3.5 text-amber-500" />
                Full Stage View
              </button>
              <button
                onClick={handleNextOrFinish}
                className="btn-primary px-5 py-2 text-sm flex items-center gap-2 shadow-md bg-blue-600 hover:bg-blue-700 text-white font-bold"
              >
                {currentIndex + 1 < activeQuestions.length ? (
                  <>
                    <span>Next Question</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <span>Grand Podium</span>
                    <Trophy className="w-4 h-4 text-amber-300" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 2-Column Responsive Layout: Left is Breakdown, Right is Small Width Leaderboard */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] xl:grid-cols-[1fr_340px] gap-6 items-start">
            {/* Left Column: Question Details, Correct Answer & Histogram */}
            <div className="space-y-4">
              {/* Question Statement Card */}
              <div className="card p-6 bg-white border border-blue-100 rounded-3xl shadow-sm text-center sm:text-left">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Question Prompt
                </div>
                <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
                  {currentQ.question}
                </h2>
                {currentQ.imageUrl && (
                  <div className="mt-4 max-w-xl mx-auto rounded-2xl overflow-hidden border border-blue-200 bg-white p-2">
                    <img src={currentQ.imageUrl} alt="Diagram" className="max-h-52 mx-auto object-contain rounded-xl" />
                  </div>
                )}
                {currentQ.codeSnippet && (
                  <pre className="mt-3 p-3.5 rounded-xl bg-slate-900 font-mono text-xs text-cyan-300 border border-slate-800 text-left overflow-x-auto shadow-inner">
                    {currentQ.codeSnippet}
                  </pre>
                )}
              </div>

              {/* Correct Answer & Breakdown Card */}
              <div className="card p-6 sm:p-8 bg-white border border-blue-100 rounded-3xl space-y-6 shadow-xl">
                <div className="text-center space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Correct Answer
                  </div>
                  <div className="font-display text-2xl sm:text-3xl font-extrabold text-emerald-600 flex items-center justify-center gap-2">
                    {currentQ.options[currentQ.correctIndex]}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto pt-1 leading-relaxed">
                    {currentQ.explanation}
                  </p>
                </div>

                {/* Answer Histogram Bars */}
                {showDistribution ? (
                  <div className="pt-4 border-t border-blue-100">
                    <div className="flex items-center justify-between mb-3 px-1">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                          Live Auditorium Response Distribution
                        </span>
                        <span className="text-[11px] font-semibold text-slate-400">
                          ({liveDistribution.reduce((a, b) => a + b, 0)} {liveDistribution.reduce((a, b) => a + b, 0) === 1 ? 'vote' : 'votes'})
                        </span>
                      </div>
                      <button
                        onClick={() => setShowDistribution(false)}
                        className="text-[11px] font-semibold text-slate-400 hover:text-slate-600 px-2.5 py-0.5 rounded-md hover:bg-slate-100 transition-colors"
                        title="Hide response distribution"
                      >
                        Hide
                      </button>
                    </div>

                    <div className="grid grid-cols-4 gap-3 items-end h-44 pb-1">
                      {currentQ.options.map((opt, idx) => {
                        const isCorrect = idx === currentQ.correctIndex;
                        const actualCount = liveDistribution[idx] || 0;
                        const totalAudienceVotes = liveDistribution.reduce((a, b) => a + b, 0);
                        const pct = totalAudienceVotes > 0 ? Math.round((actualCount / totalAudienceVotes) * 100) : 0;
                        const heightPct = actualCount > 0 ? Math.max(16, pct) : 6;
                        return (
                          <div key={idx} className="flex flex-col items-center gap-1.5 h-full justify-end">
                            <div className="text-center">
                              <span className="font-mono text-xs font-bold text-slate-800 block">{actualCount}</span>
                              <span className="text-[10px] font-medium text-slate-400 block">{pct}%</span>
                            </div>
                            <div className="w-full max-w-[4.2rem] bg-slate-100 border border-slate-200/80 rounded-t-xl overflow-hidden flex items-end h-28">
                              <div
                                className={`w-full rounded-t-xl transition-all duration-700 ${
                                  isCorrect
                                    ? 'bg-gradient-to-t from-emerald-600 to-emerald-400 shadow-md shadow-emerald-500/25'
                                    : actualCount > 0
                                    ? 'bg-gradient-to-t from-blue-500 to-blue-400 shadow-sm'
                                    : 'bg-slate-200/60'
                                }`}
                                style={{ height: `${heightPct}%` }}
                              />
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="font-bold text-xs text-slate-700">
                                {CHOICE_ICONS[idx]}
                              </span>
                              {isCorrect && (
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="pt-3 border-t border-blue-100 flex justify-center">
                    <button
                      onClick={() => setShowDistribution(true)}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-800 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors flex items-center gap-1.5"
                    >
                      <span>Show Live Response Distribution</span>
                    </button>
                  </div>
                )}

                {/* 4 Choices Grid with correct mark */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                  {currentQ.options.map((opt, idx) => {
                    const isCorrect = idx === currentQ.correctIndex;
                    return (
                      <div
                        key={idx}
                        className={`p-3 rounded-2xl border text-xs sm:text-sm font-semibold flex items-center justify-between ${
                          isCorrect
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold ring-2 ring-emerald-500/20 shadow-sm'
                            : 'bg-slate-50/70 border-slate-200 text-slate-600 opacity-70'
                        }`}
                      >
                        <span className="flex items-center gap-2.5 truncate">
                          <span className="w-6 h-6 rounded-lg bg-black/10 flex items-center justify-center font-bold text-xs shrink-0">
                            {CHOICE_ICONS[idx]}
                          </span>
                          <span className="truncate">{opt}</span>
                        </span>
                        {isCorrect && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 ml-2" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Column: Small Width Live Leaderboard Panel */}
            <div className="w-full lg:w-80 xl:w-84 sticky top-24 space-y-4">
              <div className="card p-5 bg-white border border-blue-100 rounded-3xl shadow-xl space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-blue-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold shadow-sm">
                      <Trophy className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-display font-extrabold text-slate-900 text-sm">
                        Live Standings
                      </h3>
                      <div className="text-[11px] text-slate-500">
                        After Question {currentIndex + 1}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                    {leaderboardScores.length} Players
                  </span>
                </div>

                {/* Small Width Leaderboard Item List */}
                <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                  {leaderboardScores.length === 0 ? (
                    <div className="text-center py-8 text-xs text-slate-400">
                      No participants registered
                    </div>
                  ) : (
                    leaderboardScores.slice(0, 8).map((player, idx) => {
                      const medalBadge =
                        idx === 0
                          ? 'bg-amber-100 text-amber-800 border-amber-300'
                          : idx === 1
                          ? 'bg-slate-100 text-slate-700 border-slate-300'
                          : idx === 2
                          ? 'bg-orange-100 text-orange-800 border-orange-300'
                          : 'bg-blue-50/60 text-slate-500 border-blue-100';

                      return (
                        <div
                          key={idx}
                          className={`flex items-center gap-2.5 p-2.5 rounded-2xl border text-xs transition-all ${
                            idx === 0
                              ? 'bg-gradient-to-r from-amber-50/70 to-white border-amber-200 shadow-sm'
                              : 'bg-white border-slate-100 hover:border-blue-200'
                          }`}
                        >
                          {/* Rank badge */}
                          <div
                            className={`w-6 h-6 rounded-lg font-mono font-extrabold flex items-center justify-center text-xs shrink-0 border ${medalBadge}`}
                          >
                            {idx + 1}
                          </div>

                          {/* Avatar */}
                          <div className="text-base shrink-0">{player.avatar}</div>

                          {/* Name & Branch */}
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-slate-900 truncate flex items-center gap-1">
                              <span className="truncate">{player.name}</span>
                              {player.streak > 1 && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-700 font-mono font-bold flex items-center shrink-0" title={`Streak: ${player.streak}`}>
                                  <Flame className="w-2.5 h-2.5 fill-amber-500" />
                                  {player.streak}
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400 truncate">
                              {player.branch}
                            </div>
                          </div>

                          {/* Score */}
                          <div className="text-right shrink-0">
                            <div className="font-mono font-extrabold text-blue-700 text-xs">
                              {player.score.toLocaleString()}
                            </div>
                            <div className="text-[9px] text-emerald-600 font-bold">
                              pts
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Bottom Quick Action */}
                <div className="pt-2 border-t border-blue-100">
                  <button
                    onClick={handleNextOrFinish}
                    className="btn-primary w-full py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 shadow-md bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {currentIndex + 1 < activeQuestions.length ? (
                      <>
                        <span>Next Question →</span>
                      </>
                    ) : (
                      <>
                        <span>Finish Round 🏆</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= 4. LIVE LEADERBOARD ================= */}
      {phase === 'leaderboard' && (
        <div className="max-w-4xl mx-auto w-full space-y-6">
          <div className="flex items-center justify-between text-sm font-semibold px-2">
            <span className="text-slate-800 font-display font-bold text-lg flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              Live Stage Leaderboard
            </span>
            <button
              onClick={handleNextOrFinish}
              className="btn-primary px-5 py-2 text-sm flex items-center gap-1.5 shadow-md"
            >
              {currentIndex + 1 < activeQuestions.length ? 'Next Question →' : 'Grand Finale Podium 🏆'}
            </button>
          </div>

          <div className="card p-6 sm:p-8 bg-white border border-blue-100 space-y-3 shadow-xl">
            {leaderboardScores.map((player, idx) => (
              <div
                key={idx}
                className="flex items-center gap-4 p-3.5 rounded-2xl bg-blue-50/50 border border-blue-100 text-sm shadow-sm hover:border-blue-300 transition-colors"
              >
                <div className={`font-display text-lg font-extrabold w-6 text-center ${
                  idx === 0 ? 'text-amber-500' : idx === 1 ? 'text-slate-500' : idx === 2 ? 'text-amber-700' : 'text-slate-400'
                }`}>
                  {idx + 1}
                </div>
                <div className="text-xl">{player.avatar}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-slate-900 truncate flex items-center gap-2">
                    {player.name}
                    {player.streak > 2 && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-mono font-bold flex items-center gap-0.5">
                        <Flame className="w-3 h-3 fill-amber-500" />
                        {player.streak}x
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500">{player.branch}</div>
                </div>
                <div className="font-mono font-extrabold text-base text-blue-600">
                  {player.score} pts
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= 5. GRAND PODIUM FINALE ================= */}
      {phase === 'podium' && (
        <div className="max-w-4xl mx-auto w-full space-y-8 text-center">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold shadow-sm">
              👑 Tournament Champions
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-slate-900">
              Grand Stage Podium
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              AI CLUB CMRTC • Battle of Bits '26 Championship
            </p>
          </div>

          {/* 3D Podium Bars (Dynamic based on real participants who joined) */}
          <div className="flex items-end justify-center gap-4 sm:gap-8 pt-8 pb-4">
            {/* 2nd Place */}
            {leaderboardScores[1] ? (
              <div className="flex flex-col items-center gap-2">
                <div className="text-2xl">{leaderboardScores[1].avatar || '🥈'}</div>
                <div className="font-display font-bold text-sm text-slate-800">{leaderboardScores[1].name}</div>
                <div className="text-xs text-slate-500">{leaderboardScores[1].branch}</div>
                <div className="font-mono font-bold text-xs text-slate-600">{leaderboardScores[1].score.toLocaleString()} pts</div>
                <div className="w-24 sm:w-32 h-28 sm:h-36 rounded-t-2xl bg-gradient-to-t from-slate-200 to-slate-100 border-t-4 border-slate-400 flex items-center justify-center font-display text-2xl font-extrabold text-slate-700 shadow-lg">
                  2
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 opacity-50">
                <div className="text-2xl">🥈</div>
                <div className="font-display font-bold text-sm text-slate-400">Rank #2</div>
                <div className="text-xs text-slate-400">Awaiting Contestant</div>
                <div className="font-mono font-bold text-xs text-slate-400">-</div>
                <div className="w-24 sm:w-32 h-20 rounded-t-2xl bg-slate-100 border-t-4 border-slate-300 flex items-center justify-center font-display text-xl font-bold text-slate-400">
                  2
                </div>
              </div>
            )}

            {/* 1st Place Champion */}
            {leaderboardScores[0] ? (
              <div className="flex flex-col items-center gap-2">
                <div className="text-4xl animate-bounce">👑</div>
                <div className="font-display font-extrabold text-base sm:text-lg text-blue-700">{leaderboardScores[0].name}</div>
                <div className="text-xs text-slate-500">{leaderboardScores[0].branch}</div>
                <div className="font-mono font-extrabold text-sm text-emerald-600">{leaderboardScores[0].score.toLocaleString()} pts</div>
                <div className="w-28 sm:w-40 h-36 sm:h-48 rounded-t-2xl bg-gradient-to-t from-blue-600 to-blue-500 border-t-4 border-amber-400 flex items-center justify-center font-display text-4xl font-extrabold text-white shadow-2xl">
                  1
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className="text-3xl">🏆</div>
                <div className="font-display font-bold text-base text-slate-500">No participants entered</div>
              </div>
            )}

            {/* 3rd Place */}
            {leaderboardScores[2] ? (
              <div className="flex flex-col items-center gap-2">
                <div className="text-2xl">{leaderboardScores[2].avatar || '🥉'}</div>
                <div className="font-display font-bold text-sm text-slate-800">{leaderboardScores[2].name}</div>
                <div className="text-xs text-slate-500">{leaderboardScores[2].branch}</div>
                <div className="font-mono font-bold text-xs text-slate-600">{leaderboardScores[2].score.toLocaleString()} pts</div>
                <div className="w-24 sm:w-32 h-20 sm:h-28 rounded-t-2xl bg-gradient-to-t from-amber-100 to-amber-50 border-t-4 border-amber-500 flex items-center justify-center font-display text-2xl font-extrabold text-amber-800 shadow-md">
                  3
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 opacity-50">
                <div className="text-2xl">🥉</div>
                <div className="font-display font-bold text-sm text-slate-400">Rank #3</div>
                <div className="text-xs text-slate-400">Awaiting Contestant</div>
                <div className="font-mono font-bold text-xs text-slate-400">-</div>
                <div className="w-24 sm:w-32 h-16 rounded-t-2xl bg-slate-100 border-t-4 border-slate-300 flex items-center justify-center font-display text-xl font-bold text-slate-400">
                  3
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-wrap justify-center gap-4 pt-4">
            {/* Advance to Next Round if another round batch exists */}
            {(() => {
              const nextBatch = batches.find((b) => b.roundNumber === currentBatch.roundNumber + 1);
              if (nextBatch) {
                return (
                  <button
                    onClick={() => {
                      sounds.playPop();
                      setSelectedBatchId(nextBatch.id);
                      setActiveBatchId(nextBatch.id);
                      setCurrentIndex(0);
                      setPhase('lobby');
                    }}
                    className="btn-primary px-7 py-3 text-sm flex items-center gap-2 shadow-lg bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 font-extrabold hover:scale-105 transition-transform"
                  >
                    <span>Launch {nextBatch.name}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                );
              }
              return null;
            })()}

            <button
              onClick={() => {
                sounds.playVictory();
                confetti({ particleCount: 100, spread: 70 });
              }}
              className="btn-secondary px-6 py-2.5 text-sm flex items-center gap-2"
            >
              <Award className="w-4 h-4 text-amber-600" />
              Celebrate Champions
            </button>
            <button
              onClick={() => {
                sounds.playPop();
                setPhase('lobby');
              }}
              className="btn-secondary px-6 py-2.5 text-sm flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Return to Lobby
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
