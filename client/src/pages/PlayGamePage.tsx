import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import {
  Play,
  ArrowRight,
  Flame,
  Trophy,
  CheckCircle,
  XCircle,
  RotateCcw,
  Sparkles,
  ChevronRight,
  Clock,
  Users
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SAMPLE_QUIZZES, Question, CHOICE_ICONS, CHOICE_COLORS } from '../data/quizData';
import { Participant, isRealParticipant } from '../data/adminAccounts';
import { sounds } from '../utils/soundEngine';
import { useAdminAuth } from '../context/AdminAuthContext';

export const PlayGamePage: React.FC = () => {
  const [, setLocation] = useLocation();
  const {
    batches,
    activeBatchId,
    getQuestionsForBatch,
    questions: adminQuestions,
    clubLogo,
    venue,
    eventName,
    roomPin
  } = useAdminAuth();

  // URL search params check for ?pin=
  const urlParams = new URLSearchParams(window.location.search);
  const initialPin = urlParams.get('pin') || '';

  // Game Phases: 'join' | 'lobby' | 'playing' | 'waiting_others' | 'answered' | 'finished'
  const [phase, setPhase] = useState<'join' | 'lobby' | 'playing' | 'waiting_others' | 'answered' | 'finished'>('join');

  // Player Details
  const [pin, setPin] = useState(initialPin || roomPin || '107 287');
  const [nickname, setNickname] = useState('');
  const [branch, setBranch] = useState('CSE (AI & ML)');
  const [year, setYear] = useState('3rd Year');
  const [avatar, setAvatar] = useState('🤖');
  const [joinError, setJoinError] = useState<string>('');

  // Fetch current active room PIN from server on mount so phone pre-fills correct code
  useEffect(() => {
    fetch('/api/quiz/active-pin')
      .then((r) => r.json())
      .then((data) => {
        if (data && data.formattedPin && !initialPin) {
          setPin(data.formattedPin);
        }
      })
      .catch(() => {});
  }, [initialPin]);

  // Active round batch questions
  const currentBatch = batches.find((b) => b.id === activeBatchId) || batches[0];
  const batchQuestions = currentBatch ? getQuestionsForBatch(currentBatch.id) : [];
  const activeQuestions: Question[] = batchQuestions.length > 0 
    ? (batchQuestions as unknown as Question[]) 
    : (adminQuestions.length > 0 ? (adminQuestions as unknown as Question[]) : SAMPLE_QUIZZES[0].questions);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [pointsGained, setPointsGained] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [totalCorrect, setTotalCorrect] = useState(0);

  // Tournament strict progression: Case 1 (Question time) & Case 2 (Everyone marks)
  const [markedCount, setMarkedCount] = useState(0);
  const [userHasMarked, setUserHasMarked] = useState(false);
  const [concludeReason, setConcludeReason] = useState<'timer' | 'all_marked' | null>(null);
  const [playerId, setPlayerId] = useState<string>('');

  // Synchronous selection tracking to completely eliminate stale closure on mobile phones
  const userSelectionRef = useRef<{
    hasMarked: boolean;
    selectedOption: number | null;
    isCorrect: boolean;
    points: number;
    timeTaken: number;
  }>({
    hasMarked: false,
    selectedOption: null,
    isCorrect: false,
    points: 0,
    timeTaken: 0
  });

  interface PlayLeaderboardEntry {
    id: string;
    name: string;
    branch: string;
    score: number;
    streak: number;
    avatar: string;
    isMe?: boolean;
    lastDelta?: number;
    previousRank?: number;
    rankChange?: number;
  }

  const [leaderboard, setLeaderboard] = useState<PlayLeaderboardEntry[]>([]);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const avatars = ['🤖', '⚡', '🧠', '🚀', '🛡️', '🔥', '✨', '💻'];
  const branches = [
    'CSE (AI & ML)',
    'CSE Core',
    'CSE (Data Science)',
    'CSE (Cyber Security)',
    'Information Technology (IT)',
    'Electronics & Comm (ECE)',
    'Mechanical / Civil'
  ];

  const currentQ: Question = activeQuestions[currentIndex] || activeQuestions[0];
  const totalContestants = leaderboard.length > 0 ? leaderboard.length : 1;

  // Question Countdown on Participant Phone
  // Timer runs down; if participant never marks before time expires, they receive 0 points and move to waiting_others
  useEffect(() => {
    if (phase === 'playing' || phase === 'waiting_others') {
      const qDuration = currentQ.timeLimit || 15;
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Time expired on participant device before marking
            if (phase === 'playing' && !userSelectionRef.current.hasMarked) {
              userSelectionRef.current = {
                hasMarked: true,
                selectedOption: -1,
                isCorrect: false,
                points: 0,
                timeTaken: qDuration
              };
              setSelectedOption(-1);
              setIsCorrect(false);
              setPointsGained(0);
              setUserHasMarked(true);

              // Post 0-point time-expired answer to server
              const cleanPin = (pin || '').replace(/[\s-_]/g, '').toLowerCase();
              if (cleanPin) {
                fetch(`/api/quiz/room/${cleanPin}/answer`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    playerId: playerId || nickname,
                    points: 0,
                    isCorrect: false,
                    questionIndex: currentIndex
                  })
                })
                .then((res) => res.json())
                .then((data) => {
                  if (data && data.status === 'breakdown') {
                    triggerQuestionConclude('all_marked');
                  }
                })
                .catch(() => {});
              }
              setPhase('waiting_others');
            }
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

  // Strict Host Pacing & Live Leaderboard in phase === 'answered'
  // Participants remain on the leaderboard screen ONLY until the Host explicitly clicks "Next Question"
  useEffect(() => {
    if (phase === 'answered') {
      // 1. Play the distinct sound for correct or incorrect answer upon answer & leaderboard reveal
      if (isCorrect) {
        sounds.playCorrect();
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 }
        });
      } else {
        sounds.playIncorrect();
      }

      const cleanPin = (pin || '').replace(/[\s-_]/g, '').toLowerCase();

      // 2. Poll room state to sync contestant scores and wait for Host to click "Next Question"
      const syncWithHost = () => {
        if (!cleanPin) return;
        fetch(`/api/quiz/room/${cleanPin}`)
          .then((res) => res.json())
          .then((data) => {
            if (!data) return;

            // Update leaderboard with real contestants' scores from room in real time
            if (Array.isArray(data.players) && data.players.length > 0) {
              setLeaderboard((prev) => {
                const updated = prev.map((item) => {
                  if (item.isMe) return item;
                  const match = data.players.find(
                    (p: any) => p.name.toLowerCase() === item.name.toLowerCase()
                  );
                  if (match) {
                    return {
                      ...item,
                      score: match.score || item.score,
                      streak: match.streak || item.streak
                    };
                  }
                  return item;
                });
                updated.sort((a, b) => b.score - a.score);
                return updated;
              });
            }

            // ONLY WHEN HOST CLICKS "NEXT QUESTION":
            // Server status is 'question' AND currentQuestion is greater than participant's currentIndex
            if (
              data.status === 'question' &&
              typeof data.currentQuestion === 'number' &&
              data.currentQuestion > currentIndex
            ) {
              sounds.playPop();
              const nextIdx = data.currentQuestion;
              setCurrentIndex(nextIdx);
              resetForNewQuestion(activeQuestions[nextIdx]?.timeLimit || 15);
              setPhase('playing');
            }

            // WHEN HOST FINISHES TOURNAMENT (Grand Podium):
            if (data.status === 'ended') {
              sounds.playVictory();
              confetti({
                particleCount: 120,
                spread: 90,
                origin: { y: 0.5 }
              });
              setPhase('finished');
            }
          })
          .catch(() => {});
      };

      // Also listen to storage events for instantaneous same-browser tab sync
      const handleStorageUpdate = (e: StorageEvent) => {
        if (e.key === 'cmrtc_room_state_sync' && e.newValue) {
          try {
            const syncData = JSON.parse(e.newValue);
            if (
              syncData.status === 'question' &&
              typeof syncData.currentQuestion === 'number' &&
              syncData.currentQuestion > currentIndex
            ) {
              sounds.playPop();
              const nextIdx = syncData.currentQuestion;
              setCurrentIndex(nextIdx);
              resetForNewQuestion(activeQuestions[nextIdx]?.timeLimit || 15);
              setPhase('playing');
            } else if (syncData.status === 'ended') {
              sounds.playVictory();
              confetti({ particleCount: 120, spread: 90, origin: { y: 0.5 } });
              setPhase('finished');
            }
          } catch {}
        }
      };

      window.addEventListener('storage', handleStorageUpdate);
      syncWithHost();
      const pollInterval = setInterval(syncWithHost, 800);

      return () => {
        window.removeEventListener('storage', handleStorageUpdate);
        clearInterval(pollInterval);
      };
    }
  }, [phase, currentIndex, isCorrect, pin]);

  // While question is active (playing or waiting_others), synchronize with Host stage state
  // Concludes question ONLY on Case 1 (everyone answered) or Case 2 (admin ended question)
  useEffect(() => {
    if (phase === 'playing' || phase === 'waiting_others') {
      const cleanPin = (pin || '').replace(/[\s-_]/g, '').toLowerCase();
      if (!cleanPin) return;

      const checkStageSync = () => {
        fetch(`/api/quiz/room/${cleanPin}`)
          .then((res) => res.json())
          .then((data) => {
            if (!data) return;

            // Update live real-time answered count from server
            if (typeof data.answeredCount === 'number') {
              setMarkedCount(data.answeredCount);
            }

            // CASE 1 (Everyone entered answer) OR CASE 2 (Admin ended question):
            if (data.status === 'breakdown' || data.status === 'leaderboard') {
              triggerQuestionConclude(data.answeredCount >= (data.players?.length || 1) ? 'all_marked' : 'timer');
            } else if (
              data.status === 'question' &&
              typeof data.currentQuestion === 'number' &&
              data.currentQuestion > currentIndex
            ) {
              sounds.playPop();
              const nextIdx = data.currentQuestion;
              setCurrentIndex(nextIdx);
              resetForNewQuestion(activeQuestions[nextIdx]?.timeLimit || 15);
              setPhase('playing');
            } else if (data.status === 'ended') {
              sounds.playVictory();
              setPhase('finished');
            }
          })
          .catch(() => {});
      };

      // Also listen to storage events for same-browser testing
      const handleStorageUpdate = (e: StorageEvent) => {
        if (e.key === 'cmrtc_room_state_sync' && e.newValue) {
          try {
            const syncData = JSON.parse(e.newValue);
            if (syncData.status === 'breakdown' || syncData.status === 'leaderboard') {
              triggerQuestionConclude('timer');
            } else if (
              syncData.status === 'question' &&
              typeof syncData.currentQuestion === 'number' &&
              syncData.currentQuestion > currentIndex
            ) {
              sounds.playPop();
              const nextIdx = syncData.currentQuestion;
              setCurrentIndex(nextIdx);
              resetForNewQuestion(activeQuestions[nextIdx]?.timeLimit || 15);
              setPhase('playing');
            } else if (syncData.status === 'ended') {
              sounds.playVictory();
              setPhase('finished');
            }
          } catch {}
        }
      };

      window.addEventListener('storage', handleStorageUpdate);
      checkStageSync();
      const poll = setInterval(checkStageSync, 600);
      return () => {
        window.removeEventListener('storage', handleStorageUpdate);
        clearInterval(poll);
      };
    }
  }, [phase, currentIndex, pin]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNick = nickname.trim();
    if (!cleanNick) return;
    sounds.playPop();

    const cleanPin = (pin || '').replace(/[\s-_]/g, '').toLowerCase();

    // 1. Join room on backend over network (so phones join host session live)
    try {
      const res = await fetch(`/api/quiz/room/${cleanPin}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: cleanNick,
          branch: branch,
          avatar: avatar
        })
      });

      let data: any = null;
      try {
        data = await res.json();
      } catch (parseErr) {
        console.warn('Non-JSON response:', parseErr);
      }

      if (!res.ok) {
        if (data && data.error) {
          setJoinError(data.error);
        } else {
          setJoinError(`Room code "${pin}" is not currently active on the host projector screen.`);
        }
        return;
      }

      if (data && data.player) {
        setPlayerId(data.player.id);
      }
      setJoinError('');
    } catch (err) {
      console.warn('Network join note: proceeding with local session fallback', err);
      // Do not block student from playing if local Wi-Fi router blocks peer connections
      setJoinError('');
    }

    // 2. Register student in live lobby storage so they appear on Auditorium Host Projector
    try {
      const stored = JSON.parse(localStorage.getItem('cmrtc_live_lobby_players') || '[]');
      const newPlayer = {
        id: Date.now().toString(),
        name: cleanNick,
        branch: branch,
        avatar: avatar
      };
      const cleaned = (Array.isArray(stored) ? stored : []).filter(
        (p: any) => isRealParticipant(p) && p.name.toLowerCase() !== cleanNick.toLowerCase()
      );
      localStorage.setItem('cmrtc_live_lobby_players', JSON.stringify([...cleaned, newPlayer]));
    } catch (err) {
      console.error(err);
    }

    // 3. Register student in the Admin Participants Database (cmrtc_stored_participants_v2)
    try {
      const storedParts = JSON.parse(localStorage.getItem('cmrtc_stored_participants_v2') || '[]');
      const cleanedParts = (Array.isArray(storedParts) ? storedParts : []).filter(
        (p: any) => isRealParticipant(p) && p.name.toLowerCase() !== cleanNick.toLowerCase()
      );
      const newParticipant: Participant = {
        id: `p-${Date.now()}`,
        name: cleanNick,
        branch: branch,
        year: year || '3rd Year',
        score: 0,
        streak: 0,
        accuracy: '0%',
        avatar: avatar,
        joinedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      localStorage.setItem('cmrtc_stored_participants_v2', JSON.stringify([newParticipant, ...cleanedParts]));
    } catch (err) {
      console.error(err);
    }

    window.dispatchEvent(new Event('storage'));
    setPhase('lobby');
  };

  // While waiting in the lobby, listen for the Host starting the quiz over the network
  useEffect(() => {
    if (phase === 'lobby') {
      const cleanPin = (pin || '').replace(/[\s-_]/g, '').toLowerCase();
      const checkHostStart = () => {
        fetch(`/api/quiz/room/${cleanPin}`)
          .then((res) => res.json())
          .then((data) => {
            if (data && data.status === 'question') {
              // Host started the quiz!
              initLeaderboard(data.players);
              const qIdx = typeof data.currentQuestion === 'number' ? data.currentQuestion : 0;
              setCurrentIndex(qIdx);
              resetForNewQuestion(activeQuestions[qIdx]?.timeLimit || 15);
              setPhase('playing');
            }
          })
          .catch(() => {});
      };

      const interval = setInterval(checkHostStart, 1000);
      return () => clearInterval(interval);
    }
  }, [phase, pin]);

  const initLeaderboard = (networkPlayers?: any[]) => {
    let roomPlayers: any[] = [];
    if (Array.isArray(networkPlayers) && networkPlayers.length > 0) {
      roomPlayers = networkPlayers.filter(
        (p: any) => isRealParticipant(p) && p.name.toLowerCase() !== (nickname || '').trim().toLowerCase()
      );
    } else {
      try {
        const stored = JSON.parse(localStorage.getItem('cmrtc_live_lobby_players') || '[]');
        roomPlayers = (Array.isArray(stored) ? stored : []).filter(
          (p: any) => isRealParticipant(p) && p.name.toLowerCase() !== (nickname || '').trim().toLowerCase()
        );
      } catch {}
    }

    // Peers pool strictly contains other REAL participants who joined the room
    const peersPool = roomPlayers.map((p, idx) => ({
      id: p.id || `peer-${idx}`,
      name: p.name,
      branch: p.branch,
      score: p.score || 0,
      streak: p.streak || 0,
      avatar: p.avatar || '⚡',
      lastDelta: 0,
      previousRank: idx + 2,
      rankChange: 0
    }));

    const roster: PlayLeaderboardEntry[] = [
      {
        id: 'me',
        name: nickname || 'You',
        branch: branch,
        score: 0,
        streak: 0,
        avatar: avatar,
        isMe: true,
        lastDelta: 0,
        previousRank: 1,
        rankChange: 0
      },
      ...peersPool
    ];

    setLeaderboard(roster);
    try {
      localStorage.setItem('cmrtc_live_tournament_scores', JSON.stringify(roster));
      window.dispatchEvent(new Event('storage'));
    } catch {}
  };

  // Updates the leaderboard after EVERY question with the real-time scores of all participants
  const commitLeaderboardRound = (myEarnedPoints: number, myCorrect: boolean) => {
    setLeaderboard((prev) => {
      let currentList = prev;
      if (currentList.length === 0) {
        let roomPlayers: any[] = [];
        try {
          const stored = JSON.parse(localStorage.getItem('cmrtc_live_lobby_players') || '[]');
          roomPlayers = (Array.isArray(stored) ? stored : []).filter(
            (p: any) => isRealParticipant(p) && p.name.toLowerCase() !== (nickname || '').trim().toLowerCase()
          );
        } catch {}

        currentList = [
          { id: 'me', name: nickname || 'You', branch, score: 0, streak: 0, avatar, isMe: true, lastDelta: 0, previousRank: 1, rankChange: 0 },
          ...roomPlayers.map((p, idx) => ({
            id: p.id || `peer-${idx}`,
            name: p.name,
            branch: p.branch,
            score: 0,
            streak: 0,
            avatar: p.avatar || '⚡',
            lastDelta: 0,
            previousRank: idx + 2,
            rankChange: 0
          }))
        ];
      }

      // Track previous ranks before applying this question's points
      const listWithPrevRank = currentList.map((p, idx) => ({
        ...p,
        previousRank: idx + 1
      }));

      // Calculate new score and delta for each active contestant
      const updated = listWithPrevRank.map((p) => {
        if (p.isMe) {
          const newTotal = p.score + myEarnedPoints;
          const newStreak = myCorrect ? p.streak + 1 : 0;
          return {
            ...p,
            score: newTotal,
            streak: newStreak,
            lastDelta: myEarnedPoints
          };
        }

        // For other participants: ZERO FAKE SCORING!
        // Their genuine scores are tracked on the server and synced over the network
        return {
          ...p,
          lastDelta: 0
        };
      });

      // Sort in real-time by total accumulated score
      updated.sort((a, b) => b.score - a.score);

      // Compute rank movements
      const finalRoster = updated.map((p, newIdx) => {
        const newRank = newIdx + 1;
        const oldRank = p.previousRank || newRank;
        return {
          ...p,
          rankChange: oldRank - newRank
        };
      });

      // Save real-time leaderboard scores
      try {
        localStorage.setItem('cmrtc_live_tournament_scores', JSON.stringify(finalRoster));
      } catch {}

      // Synchronize student's updated score and stats to Admin Participants Database (cmrtc_stored_participants_v2)
      try {
        const myEntry = finalRoster.find((r) => r.isMe);
        if (myEntry) {
          const storedParts = JSON.parse(localStorage.getItem('cmrtc_stored_participants_v2') || '[]');
          if (Array.isArray(storedParts)) {
            const updatedParts = storedParts.map((p: any) => {
              if (p.name.toLowerCase() === myEntry.name.toLowerCase()) {
                const totalAnswered = currentIndex + 1;
                const accuracyPct = totalAnswered > 0 
                  ? `${Math.round(((myEarnedPoints > 0 ? 1 : 0) / totalAnswered) * 100)}%`
                  : '100%';
                return {
                  ...p,
                  score: myEntry.score,
                  streak: myEntry.streak,
                  accuracy: accuracyPct
                };
              }
              return p;
            });
            localStorage.setItem('cmrtc_stored_participants_v2', JSON.stringify(updatedParts));
          }
        }
      } catch {}

      try {
        window.dispatchEvent(new Event('storage'));
      } catch {}

      return finalRoster;
    });
  };

  const resetForNewQuestion = (duration: number = 15) => {
    userSelectionRef.current = {
      hasMarked: false,
      selectedOption: null,
      isCorrect: false,
      points: 0,
      timeTaken: 0
    };
    setSelectedOption(null);
    setUserHasMarked(false);
    setIsCorrect(false);
    setPointsGained(0);
    setMarkedCount(0);
    setConcludeReason(null);
    setTimeLeft(duration);
  };

  const triggerQuestionConclude = (reason: 'timer' | 'all_marked') => {
    if (timerRef.current) clearInterval(timerRef.current);
    setConcludeReason(reason);

    // Read synchronously from userSelectionRef to guarantee mobile taps are NEVER missed
    const sel = userSelectionRef.current;
    const didUserMark = (sel.hasMarked && sel.selectedOption !== null && sel.selectedOption !== -1) ||
                        (userHasMarked && selectedOption !== null && selectedOption !== -1);

    let earnedPts = 0;
    let earnedCorrect = false;

    // RULE: Exactly 0 points for participants who answered wrong or whose time ran out!
    if (!didUserMark) {
      // Time expired / Did not answer in time: 0 points!
      setSelectedOption(-1);
      setIsCorrect(false);
      setPointsGained(0);
      setStreak(0);
      earnedPts = 0;
      earnedCorrect = false;
    } else {
      // Participant marked an answer in time:
      const opt = sel.hasMarked ? sel.selectedOption : selectedOption;
      const correct = sel.hasMarked ? sel.isCorrect : isCorrect;
      // If wrong answer: 0 points! If correct: genuine speed-based points
      const pts = correct ? (sel.hasMarked ? sel.points : pointsGained) : 0;

      setSelectedOption(opt);
      setIsCorrect(correct);
      setPointsGained(pts);
      earnedPts = pts;
      earnedCorrect = correct;

      setTotalScore((prev) => prev + pts);
      setStreak((prev) => (correct ? prev + 1 : 0));
      if (correct) {
        setTotalCorrect((prev) => prev + 1);
      }
    }

    // UPDATE LEADERBOARD AFTER EVERY QUESTION WITH REAL-TIME SCORES
    commitLeaderboardRound(earnedPts, earnedCorrect);

    setPhase('answered');
  };

  const advanceToNextQuestion = () => {
    sounds.playPop();
    if (currentIndex + 1 < activeQuestions.length) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      resetForNewQuestion(activeQuestions[nextIdx]?.timeLimit || 15);
      setPhase('playing');
    } else {
      sounds.playVictory();
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.5 }
      });
      setPhase('finished');
    }
  };

  const handleStartGame = () => {
    sounds.playPop();
    initLeaderboard();
    setCurrentIndex(0);
    setTotalScore(0);
    setStreak(0);
    setTotalCorrect(0);
    resetForNewQuestion(currentQ.timeLimit || 15);
    setPhase('playing');
  };

  // Student selects an option: question concludes ONLY on Case 1 (everyone answers) or Case 2 (admin ends question)
  const handleSelectOption = (index: number) => {
    if (phase !== 'playing' || selectedOption !== null) return;

    sounds.playPop(); // Instant tap confirmation

    const timeLimit = currentQ.timeLimit || 15;
    const timeTaken = timeLimit - timeLeft;
    const correct = index === currentQ.correctIndex;

    // STRICT SCORING:
    // - Wrong answer: EXACTLY 0 points!
    // - Correct answer: As fast as the participant enters the answer, they get more score!
    let points = 0;
    if (correct) {
      const speedRatio = Math.max(0, Math.min(1, timeLeft / timeLimit));
      const basePoints = 500 + Math.round(500 * speedRatio);
      const streakBonus = streak * 50;
      points = basePoints + streakBonus;
    } else {
      points = 0; // Exactly 0 points for wrong answer
    }

    // 1. Immediately store selection synchronously in ref to prevent stale closures
    userSelectionRef.current = {
      hasMarked: true,
      selectedOption: index,
      isCorrect: correct,
      points,
      timeTaken
    };

    // 2. Set React states
    setSelectedOption(index);
    setUserHasMarked(true);
    setIsCorrect(correct);
    setPointsGained(points);

    // 3. Post genuine answer to backend room over network
    const cleanPin = (pin || '').replace(/[\s-_]/g, '').toLowerCase();
    if (cleanPin) {
      fetch(`/api/quiz/room/${cleanPin}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId: playerId || nickname,
          points,
          isCorrect: correct,
          questionIndex: currentIndex,
          optionIndex: index
        })
      })
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          if (typeof data.answeredCount === 'number') {
            setMarkedCount(data.answeredCount);
          }
          // CASE 1: If this answer completed the room for ALL participants, conclude!
          if (data.status === 'breakdown') {
            triggerQuestionConclude('all_marked');
          }
        }
      })
      .catch((err) => console.warn('Answer sync notice:', err));
    }

    // Move THIS student to waiting_others screen
    // They wait for other participants to enter answers (Case 1) or admin to end question (Case 2)
    setPhase('waiting_others');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-6 sm:py-10">
      {/* ================= 1. JOIN SCREEN ================= */}
      {phase === 'join' && (
        <div className="w-full max-w-md card p-6 sm:p-8 bg-white border border-blue-100 shadow-xl rounded-3xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-400" />

          <div className="text-center space-y-2 mb-6">
            <div className="flex justify-center mb-2">
              <div className="w-16 h-16 rounded-full overflow-hidden p-0.5 bg-white border-2 border-blue-200 shadow-md ring-2 ring-blue-500/10">
                <img src={clubLogo} alt="AI CLUB CMRTC" className="w-full h-full object-cover rounded-full" />
              </div>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              CMRTC Live Arena
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900">
              Join Live Battle
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Enter the auditorium room PIN & your nickname to play on the big screen.
            </p>
          </div>

          <form onSubmit={handleJoin} className="space-y-4">
            {joinError && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2 animate-shake">
                <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{joinError}</span>
              </div>
            )}

            {/* Room PIN */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Room PIN
              </label>
              <input
                type="text"
                required
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="e.g. 742 918"
                className="w-full bg-blue-50/50 border border-blue-200 rounded-2xl px-4 py-3 text-xl font-mono font-bold tracking-widest text-center text-blue-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 shadow-inner"
              />
            </div>

            {/* Nickname */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Your Nickname
              </label>
              <input
                type="text"
                required
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="e.g. Enter your name or handle"
                maxLength={20}
                className="w-full bg-white border border-blue-200 rounded-2xl px-4 py-2.5 text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {/* Branch Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                CMRTC Department / Branch
              </label>
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full bg-white border border-blue-200 rounded-2xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500"
              >
                {branches.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            {/* Year & Avatar */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Academic Year
                </label>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full bg-white border border-blue-200 rounded-2xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500"
                >
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                </select>
              </div>

              {/* Avatar Picker */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Avatar
                </label>
                <div className="flex items-center gap-1 overflow-x-auto py-1 scrollbar-none">
                  {avatars.map((a) => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => setAvatar(a)}
                      className={`text-lg p-1.5 rounded-xl transition-transform ${
                        avatar === a ? 'bg-blue-100 ring-2 ring-blue-500 scale-110' : 'hover:bg-slate-100'
                      }`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary w-full py-3.5 text-base mt-2 shadow-md"
            >
              Enter Game Room
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </form>

          <div className="mt-4 pt-4 border-t border-blue-100 text-center">
            <span className="text-xs text-slate-500">
              Auditorium Venue: <strong className="text-slate-800">{venue}</strong>
            </span>
          </div>
        </div>
      )}

      {/* ================= 2. LOBBY SCREEN (WAITING / READY) ================= */}
      {phase === 'lobby' && (
        <div className="w-full max-w-md card p-6 sm:p-8 bg-white border border-blue-100 shadow-xl rounded-3xl text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            Connected to Auditorium Host
          </div>

          <div className="space-y-3">
            <div className="text-5xl animate-bounce">{avatar}</div>
            <h2 className="font-display text-2xl font-extrabold text-slate-900">
              {nickname}
            </h2>
            <div className="text-xs font-mono text-blue-700 font-bold">
              {branch} • {year}
            </div>
            <div className="text-xs text-slate-500">
              Room PIN: <span className="font-mono font-bold text-slate-800 tracking-wider">{pin}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 text-xs text-slate-700 space-y-1">
            <div className="font-bold text-blue-900 flex items-center justify-center gap-1.5">
              <span>🎯</span> {currentBatch ? currentBatch.name : eventName}
            </div>
            <p className="text-slate-600">
              Watch the auditorium projector screen in <strong>{venue}</strong>. Questions are strictly confidential and will be revealed here in real time as the host starts the round!
            </p>
          </div>

          {/* Waiting for Host to Start (Participants cannot start the quiz manually) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/90 border border-amber-200 text-amber-950 space-y-2 text-center shadow-inner">
            <div className="inline-flex items-center justify-center gap-2 font-extrabold text-sm text-amber-900">
              <span className="w-3 h-3 rounded-full bg-amber-500 animate-ping" />
              Waiting for Host to Launch Quiz...
            </div>
            <p className="text-xs text-amber-800 leading-relaxed max-w-xs mx-auto">
              You are connected! Keep this screen open. The quiz questions will automatically appear on your phone as soon as the Admin clicks <strong>Start Quiz</strong> on the auditorium projector.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              sounds.playPop();
              try {
                const stored = JSON.parse(localStorage.getItem('cmrtc_live_lobby_players') || '[]');
                const filtered = stored.filter((p: any) => p.name.toLowerCase() !== nickname.trim().toLowerCase());
                localStorage.setItem('cmrtc_live_lobby_players', JSON.stringify(filtered));
                window.dispatchEvent(new Event('storage'));
              } catch {}
              setPhase('join');
            }}
            className="text-xs text-slate-400 hover:text-rose-600 transition-colors block mx-auto underline pt-1"
          >
            Leave Lobby / Change Nickname
          </button>
        </div>
      )}

      {/* ================= 3. PLAYING QUESTION SCREEN ================= */}
      {phase === 'playing' && (
        <div className="w-full max-w-2xl space-y-4">
          {/* Top Status Bar */}
          <div className="flex items-center justify-between text-xs font-semibold px-2">
            <span className="text-slate-600">
              Question {currentIndex + 1} of {activeQuestions.length} • <span className="text-blue-600 font-bold">{currentQ.category}</span>
            </span>
            <div className="flex items-center gap-3">
              {streak > 1 && (
                <span className="text-amber-600 flex items-center gap-1 font-mono font-bold">
                  <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  Streak {streak}x
                </span>
              )}
              <span className="font-mono text-blue-700 font-extrabold">
                {totalScore} pts
              </span>
            </div>
          </div>

          {/* Question Card */}
          <div className="card p-6 sm:p-8 bg-white border border-blue-100 space-y-4 shadow-xl rounded-3xl">
            {/* Countdown Bar & Timer Display */}
            <div className="flex items-center justify-between gap-4">
              <div className="h-2.5 flex-1 bg-slate-100 rounded-full overflow-hidden border border-blue-100">
                <div 
                  className={`h-full transition-all duration-1000 ${timeLeft <= 4 ? 'bg-rose-500' : 'bg-blue-600'}`}
                  style={{ width: `${(timeLeft / (currentQ.timeLimit || 15)) * 100}%` }}
                />
              </div>
              <div className={`font-display text-lg font-extrabold w-8 text-right font-mono ${timeLeft <= 4 ? 'text-rose-500 animate-pulse' : 'text-blue-600'}`}>
                {timeLeft}s
              </div>
            </div>

            {/* Question Text */}
            <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900 text-center sm:text-left leading-snug">
              {currentQ.question}
            </h2>

            {/* Diagram Image if present */}
            {currentQ.imageUrl && (
              <div className="rounded-2xl overflow-hidden border border-blue-100 bg-blue-50/30 p-2 max-h-56 flex items-center justify-center">
                <img src={currentQ.imageUrl} alt="Diagram" className="max-h-52 w-auto object-contain rounded-xl" />
              </div>
            )}

            {/* Code Snippet if applicable */}
            {currentQ.codeSnippet && (
              <pre className="p-3.5 rounded-2xl bg-slate-900 font-mono text-xs text-cyan-300 border border-slate-800 overflow-x-auto shadow-inner">
                {currentQ.codeSnippet}
              </pre>
            )}
          </div>

          {/* 4 Large Touch-Friendly Choice Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {currentQ.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectOption(idx)}
                className={`
                  ${CHOICE_COLORS[idx]}
                  flex items-center gap-3.5 p-4 sm:p-5 rounded-2xl font-display font-bold text-base sm:text-lg text-white shadow-lg transition-transform active:scale-95 text-left min-h-[56px]
                `}
              >
                <span className="w-8 h-8 rounded-xl bg-black/20 flex items-center justify-center text-sm font-bold shrink-0">
                  {CHOICE_ICONS[idx]}
                </span>
                <span className="leading-snug">{opt}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ================= 3B. WAITING FOR OTHER PARTICIPANTS (CASE 1 & CASE 2 ENFORCED) ================= */}
      {phase === 'waiting_others' && (
        <div className="w-full max-w-lg card p-6 sm:p-8 bg-white border border-blue-100 shadow-xl rounded-3xl text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-full bg-blue-50 border-2 border-blue-200 flex items-center justify-center text-blue-600 shadow-sm animate-pulse">
            <Clock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold shadow-sm">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              Answer Locked In!
            </div>
            <h2 className="font-display text-2xl font-extrabold text-slate-900">
              Waiting for Question to Conclude
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
              Questions advance strictly based on only two conditions:
            </p>
          </div>

          {/* 2 Tournament Conditions Status Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
            {/* Case 1: Everyone Enters Answer */}
            <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 flex items-center gap-1">
                <span>👥</span> Case 1: Everyone Answers
              </div>
              <div className="font-display text-xl font-extrabold text-indigo-900 font-mono">
                {markedCount} Answered
              </div>
              <div className="text-[11px] text-slate-500">
                Advances when all participants enter answers
              </div>
            </div>

            {/* Case 2: Admin Ends Question */}
            <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-blue-600 flex items-center gap-1">
                <span>🛡️</span> Case 2: Admin Ends Question
              </div>
              <div className="font-display text-xl font-extrabold text-blue-900 font-mono">
                {timeLeft}s remaining
              </div>
              <div className="text-[11px] text-slate-500">
                Advances when Host ends question or time ends
              </div>
            </div>
          </div>

          {/* Progress Bar of Marked Participants */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
              <span>Auditorium Marked Progress</span>
              <span className="font-mono text-blue-700 font-bold">
                {markedCount} submitted
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-blue-100">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(15, Math.round((markedCount / Math.max(1, totalContestants)) * 100)))}%` }}
              />
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 text-[11px] text-slate-500">
            🔒 <strong>Synchronized Arena</strong>: Answers locked in. Question ends once everyone enters their answer or Host concludes.
          </div>
        </div>
      )}

      {/* ================= 4. ANSWER FEEDBACK & LIVE LEADERBOARD (HOST PACED) ================= */}
      {phase === 'answered' && (() => {
        const myRank = leaderboard.findIndex((p) => p.isMe) + 1;
        return (
          <div className="w-full max-w-2xl space-y-4">
            {/* Top Compact Result Banner */}
            <div className="card p-5 bg-white border border-blue-100 shadow-xl rounded-3xl text-center space-y-4">
              {/* Result Pill */}
              <div className="flex items-center justify-center gap-2 flex-wrap">
                {isCorrect ? (
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs sm:text-sm font-extrabold border border-emerald-200 shadow-sm">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>✓ Correct Answer! +{pointsGained} pts</span>
                  </div>
                ) : selectedOption === -1 ? (
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 text-amber-900 text-xs sm:text-sm font-extrabold border border-amber-200 shadow-sm">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span>⏰ Time Expired (+0 pts)</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-100 text-rose-800 text-xs sm:text-sm font-extrabold border border-rose-200 shadow-sm">
                    <XCircle className="w-4 h-4 text-rose-600" />
                    <span>✗ Incorrect (+0 pts)</span>
                  </div>
                )}
              </div>

              {/* Quick Score Strip */}
              <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-blue-50/60 border border-blue-100 text-center">
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Total Score</div>
                  <div className="font-display text-lg sm:text-xl font-extrabold text-slate-900 font-mono mt-0.5">
                    {totalScore}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Streak</div>
                  <div className="font-display text-lg sm:text-xl font-extrabold text-amber-600 font-mono mt-0.5">
                    🔥 {streak}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Your Rank</div>
                  <div className="font-display text-lg sm:text-xl font-extrabold text-blue-600 font-mono mt-0.5">
                    #{myRank || 1}
                  </div>
                </div>
              </div>
            </div>

            {/* Host Pacing Status Banner (Strict Host Control - NO timer skip) */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50/90 via-sky-50 to-indigo-50 border-2 border-blue-200 text-left space-y-1.5 shadow-sm">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="flex items-center gap-2 text-blue-950 font-extrabold text-xs sm:text-sm">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-ping" />
                  ⏳ Waiting for Host to start next question...
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-mono text-[11px] font-bold border border-blue-200">
                  Q{currentIndex + 1} Done
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed">
                Review your live tournament rank below. The next question will appear here automatically when the Host clicks <strong>&quot;Next Question&quot;</strong> on the auditorium screen.
              </p>
            </div>

            {/* LIVE STANDINGS LEADERBOARD (Full Width & Hero Focus) */}
            <div className="card p-5 sm:p-6 bg-white border border-blue-100 rounded-3xl shadow-xl space-y-3.5 text-left">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-blue-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold shadow-sm text-lg">
                    🏆
                  </div>
                  <div>
                    <h3 className="font-display font-extrabold text-slate-900 text-sm sm:text-base">
                      Live Tournament Standings
                    </h3>
                    <div className="text-[11px] text-slate-500">
                      Real-time scores after Question {currentIndex + 1}
                    </div>
                  </div>
                </div>
                <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                  Rank #{myRank || 1} of {totalContestants}
                </span>
              </div>

              {/* Leaderboard Entries List */}
              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {leaderboard.map((player, idx) => {
                  const isMe = player.isMe;
                  const medalBadge =
                    idx === 0
                      ? 'bg-amber-100 text-amber-800 border-amber-300 ring-2 ring-amber-300/40'
                      : idx === 1
                      ? 'bg-slate-100 text-slate-700 border-slate-300'
                      : idx === 2
                      ? 'bg-orange-100 text-orange-800 border-orange-300'
                      : 'bg-blue-50/60 text-slate-500 border-blue-100';

                  return (
                    <div
                      key={player.id || idx}
                      className={`flex items-center gap-2.5 p-2.5 rounded-2xl border text-xs transition-all ${
                        isMe
                          ? 'bg-blue-50/95 border-blue-400 ring-2 ring-blue-500/30 font-bold shadow-md'
                          : idx === 0
                          ? 'bg-amber-50/40 border-amber-200 shadow-sm'
                          : 'bg-white border-slate-100 hover:border-blue-200'
                      }`}
                    >
                      {/* Rank & Movement Indicator */}
                      <div className="flex flex-col items-center justify-center shrink-0 w-7">
                        <div
                          className={`w-6 h-6 rounded-lg font-mono font-extrabold flex items-center justify-center text-xs border ${medalBadge}`}
                        >
                          {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
                        </div>
                        {typeof player.rankChange === 'number' && (
                          <div className="text-[9px] font-mono font-bold mt-0.5 leading-none">
                            {player.rankChange > 0 ? (
                              <span className="text-emerald-600 flex items-center">▲{player.rankChange}</span>
                            ) : player.rankChange < 0 ? (
                              <span className="text-rose-500 flex items-center">▼{Math.abs(player.rankChange)}</span>
                            ) : (
                              <span className="text-slate-300">–</span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Avatar */}
                      <div className="text-xl shrink-0">{player.avatar}</div>

                      {/* Name & Branch */}
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-slate-900 truncate flex items-center gap-1.5">
                          <span className="truncate">{player.name}</span>
                          {isMe && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-blue-600 text-white font-extrabold shrink-0 shadow-sm">
                              YOU
                            </span>
                          )}
                          {player.streak > 1 && (
                            <span className="text-[9px] px-1 py-0.2 rounded-full bg-amber-100 text-amber-700 font-mono font-bold flex items-center shrink-0">
                              <Flame className="w-2.5 h-2.5 fill-amber-500" />
                              {player.streak}x
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {player.branch}
                        </div>
                      </div>

                      {/* Real-Time Score & Delta */}
                      <div className="text-right shrink-0">
                        <div className="font-mono font-extrabold text-blue-700 text-xs sm:text-sm">
                          {player.score.toLocaleString()} <span className="text-[9px] font-normal text-slate-500">pts</span>
                        </div>
                        <div className="text-[10px] font-mono font-bold">
                          {typeof player.lastDelta === 'number' && player.lastDelta > 0 ? (
                            <span className="text-emerald-600">+{player.lastDelta}</span>
                          ) : (
                            <span className="text-slate-400">+0</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Summary Bar */}
              <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-100 text-[11px] text-slate-600 flex items-center justify-between">
                <span className="font-bold text-slate-800">
                  Your Standing: #{myRank} of {totalContestants}
                </span>
                {myRank === 1 ? (
                  <span className="text-amber-700 font-bold flex items-center gap-1">
                    👑 1st Place!
                  </span>
                ) : (
                  <span className="text-slate-500 font-mono">
                    Gap to #1: {Math.max(0, (leaderboard[0]?.score || 0) - totalScore)} pts
                  </span>
                )}
              </div>
            </div>

            {/* Question & Explanation Box (At bottom for easy reference) */}
            <div className="card p-4 bg-white border border-blue-100 rounded-2xl text-left space-y-1.5 text-xs shadow-sm">
              <div className="font-bold text-slate-800 flex items-center justify-between">
                <span>💡 Question {currentIndex + 1} Review</span>
                <span className="text-emerald-700 font-extrabold bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                  Answer: {currentQ.options[currentQ.correctIndex]}
                </span>
              </div>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                {currentQ.explanation}
              </p>
            </div>
          </div>
        );
      })()}

      {/* ================= 5. FINISHED PODIUM SCREEN ================= */}
      {phase === 'finished' && (
        <div className="w-full max-w-lg card p-6 sm:p-8 bg-white border border-blue-100 shadow-xl rounded-3xl text-center space-y-6">
          <div className="space-y-2">
            <div className="text-5xl">🏆</div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">
              Round Complete • AI CLUB CMRTC
            </div>
            <h1 className="font-display text-3xl font-extrabold text-slate-900">
              Outstanding Performance!
            </h1>
            <p className="text-xs text-slate-500">
              {nickname} ({branch})
            </p>
          </div>

          {/* Score Stats Grid */}
          <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-blue-50/50 border border-blue-100 text-center">
            <div>
              <div className="text-[10px] text-slate-500 uppercase font-bold">Total Score</div>
              <div className="font-display text-2xl font-extrabold text-slate-900 font-mono mt-1">
                {totalScore}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 uppercase font-bold">Correct</div>
              <div className="font-display text-2xl font-extrabold text-emerald-600 font-mono mt-1">
                {totalCorrect}/{activeQuestions.length}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 uppercase font-bold">Accuracy</div>
              <div className="font-display text-2xl font-extrabold text-blue-600 font-mono mt-1">
                {Math.round((totalCorrect / activeQuestions.length) * 100)}%
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5">
            <button
              onClick={() => {
                sounds.playPop();
                setPhase('join');
              }}
              className="btn-primary w-full py-3.5 text-sm flex items-center justify-center gap-2 shadow-md"
            >
              <RotateCcw className="w-4 h-4" />
              Play Another Quiz
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
