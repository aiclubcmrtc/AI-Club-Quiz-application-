import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import {
  Sparkles,
  Play,
  Tv,
  CheckCircle2,
  Trophy,
  Zap,
  ArrowRight,
  QrCode,
  Users,
  Flame,
  Award,
  ShieldCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../utils/soundEngine';
import { useAdminAuth } from '../context/AdminAuthContext';

export const HomePage: React.FC = () => {
  const { clubLogo, roomPin, venue, eventName, isAuthenticated } = useAdminAuth();

  // Interactive Hero Game Demo State
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [heroTimer, setHeroTimer] = useState<number>(14);
  const [heroAnswerCount, setHeroAnswerCount] = useState<number>(412);
  const [score, setScore] = useState<number>(2840);

  // Timer simulation for the hero question preview
  useEffect(() => {
    if (selectedAnswer !== null) return;
    const interval = setInterval(() => {
      setHeroTimer((prev) => (prev > 1 ? prev - 1 : 15));
    }, 1000);
    return () => clearInterval(interval);
  }, [selectedAnswer]);

  const handleHeroChoiceClick = (index: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(index);
    setHeroAnswerCount((prev) => prev + 1);

    if (index === 0) {
      sounds.playCorrect();
      setScore((prev) => prev + 960);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 }
      });
    } else {
      sounds.playIncorrect();
    }
  };

  const resetHeroDemo = () => {
    setSelectedAnswer(null);
    setHeroTimer(14);
    sounds.playPop();
  };

  return (
    <div className="w-full">
      {/* Container matching Giga Quizzes Max Width */}
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8 space-y-20 sm:space-y-28">
        
        {/* ===================== HERO SECTION ===================== */}
        <header className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14 pt-2">
          {/* Hero Left Content */}
          <div className="flex flex-col items-center gap-6 text-center lg:items-start lg:text-left">
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 rounded-full bg-white pl-1.5 pr-4 py-1 text-xs font-semibold shadow-sm border border-blue-200">
              <div className="w-6 h-6 rounded-full overflow-hidden p-0.5 bg-white border border-blue-300 shrink-0">
                <img src={clubLogo} alt="AI CLUB CMRTC" className="w-full h-full object-cover rounded-full" />
              </div>
              <span className="font-display text-sm font-extrabold text-slate-900">
                <span className="text-blue-600">AI</span> CLUB CMRTC
              </span>
              <span className="text-slate-500">· {eventName}</span>
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            {/* Headline */}
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.08] tracking-tight text-slate-900">
              Live quizzes for classroom competitions & <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500">campus tournaments</span>.
            </h1>

            {/* Subtitle */}
            <p className="max-w-xl text-base sm:text-lg leading-relaxed text-slate-600">
              CMR Technical Campus's Kahoot-style live quiz platform. Put the quiz on the auditorium projector and everyone plays from their phone with a room code — no app to install, zero player signup.
            </p>

            {/* Action Buttons - Only Join Game for students */}
            <div className="flex flex-wrap justify-center gap-3.5 lg:justify-start w-full sm:w-auto">
              <Link 
                href="/play" 
                className="btn-primary px-8 py-4 text-base sm:text-lg shadow-md font-bold"
                onClick={() => sounds.playPop()}
              >
                <Play className="w-5 h-5 fill-current mr-2" />
                Join Game (Enter PIN)
              </Link>
            </div>

            {/* Informational Sublinks */}
            <div className="flex flex-col gap-2 pt-1 text-sm font-semibold">
              <Link href="/about" className="text-blue-600 hover:text-blue-700 flex items-center gap-1.5 group">
                Organized by AI CLUB CMRTC · Venue: {venue} <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
              {isAuthenticated && (
                <Link href="/admin" className="text-blue-600 hover:text-blue-700 flex items-center gap-1.5 text-xs font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Master Admin Portal · Active Session →
                </Link>
              )}
            </div>

            {/* Stats Counter Bar (Clean, no auditorium size or cash prizes) */}
            <dl className="grid w-full grid-cols-2 gap-x-6 gap-y-5 border-t border-blue-100 pt-6 text-left sm:grid-cols-4">
              <div className="flex flex-col-reverse justify-end gap-0.5">
                <dt className="text-xs leading-snug text-slate-500">tournament format</dt>
                <dd className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900">Multi-Round</dd>
              </div>
              <div className="flex flex-col-reverse justify-end gap-0.5">
                <dt className="text-xs leading-snug text-slate-500">custom timers</dt>
                <dd className="font-display text-2xl sm:text-3xl font-extrabold text-blue-600">Per Question</dd>
              </div>
              <div className="flex flex-col-reverse justify-end gap-0.5">
                <dt className="text-xs leading-snug text-slate-500">awards & honours</dt>
                <dd className="font-display text-2xl sm:text-3xl font-extrabold text-amber-600">Trophies & Medals</dd>
              </div>
              <div className="flex flex-col-reverse justify-end gap-0.5">
                <dt className="text-xs leading-snug text-slate-500">to host or play</dt>
                <dd className="font-display text-2xl sm:text-3xl font-extrabold text-emerald-600">FREE</dd>
              </div>
            </dl>
          </div>

          {/* Hero Right Visual: Confidential Tournament Stage Projector Mockup */}
          <div className="relative mx-auto w-full max-w-lg lg:max-w-none select-none pb-8 pt-4 sm:pr-8">
            {/* Projector Screen Outer Frame (White & Light Blue) */}
            <div className="rounded-[2rem] bg-white p-3 sm:p-4 shadow-2xl border-2 border-blue-100 backdrop-blur-xl">
              <div className="rounded-[1.4rem] bg-gradient-to-b from-blue-50/90 to-sky-100/70 p-5 sm:p-6 border border-blue-200 space-y-4">
                {/* Screen Header */}
                <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                  <span className="flex items-center gap-1.5 text-blue-700 font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    AI CLUB CMRTC • Tournament Stage
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-mono text-[11px] font-bold">
                    Auditorium Mode
                  </span>
                </div>

                {/* Confidential Protected Stage Box */}
                <div className="rounded-2xl bg-white p-5 text-center shadow-md border border-blue-100 space-y-3">
                  <div className="w-12 h-12 mx-auto rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 text-xl font-bold shadow-sm">
                    🔒
                  </div>
                  <div>
                    <h3 className="font-display text-base sm:text-lg font-extrabold text-slate-900">
                      Quiz Questions Strictly Confidential
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
                      Questions are stored securely in Master Admin batches and will be revealed on the projector only when the Admin launches each round!
                    </p>
                  </div>

                  {/* Multi-Round Batches List */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 text-left">
                    <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-100 text-[11px]">
                      <div className="font-bold text-blue-800 flex items-center gap-1">
                        <span>🎯</span> Round 1
                      </div>
                      <div className="text-slate-500 text-[10px]">Screening & Fundamentals</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-purple-50/70 border border-purple-100 text-[11px]">
                      <div className="font-bold text-purple-800 flex items-center gap-1">
                        <span>🧠</span> Round 2
                      </div>
                      <div className="text-slate-500 text-[10px]">Technical Deep Dive</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-100 text-[11px]">
                      <div className="font-bold text-amber-800 flex items-center gap-1">
                        <span>⚡</span> Round 3
                      </div>
                      <div className="text-slate-500 text-[10px]">Grand Finale Rapid Fire</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600 px-1 pt-1">
                  <span>📍 <strong className="text-slate-800">{venue}</strong></span>
                  <span className="text-emerald-700 font-bold font-mono">● Ready for Players</span>
                </div>
              </div>
            </div>

            {/* Floating Room PIN Card (Top-Left) */}
            <div className="absolute -top-3 -left-2 sm:-left-4 -rotate-3 rounded-2xl bg-white border-2 border-blue-200 px-4 py-2.5 shadow-xl backdrop-blur-md">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <QrCode className="w-3 h-3 text-blue-600" />
                Live PIN
              </div>
              <div className="font-mono text-xl sm:text-2xl font-extrabold tracking-widest text-blue-700">
                {roomPin}
              </div>
            </div>
          </div>
        </header>

        {/* ===================== HOW A GAME RUNS (3 CARDS) ===================== */}
        <section className="space-y-10">
          <div className="text-center sm:text-left space-y-2">
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              How the event runs
            </h2>
            <p className="text-slate-500 max-w-xl text-sm sm:text-base">
              Designed from scratch for the AI CLUB CMRTC campus quiz championship.
            </p>
          </div>

          <ol className="grid gap-6 md:grid-cols-3">
            {/* Step 1: Build It */}
            <li className="card flex flex-col gap-6 p-6 sm:p-7 border border-blue-100 bg-white shadow-md rounded-3xl">
              <div className="flex h-36 items-center justify-center rounded-2xl bg-blue-50/60 border border-blue-100 flex-col gap-2 px-6">
                <div className="flex w-full max-w-[14rem] items-center gap-2.5 rounded-xl bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm border border-blue-100">
                  <span className="bg-choice-red grid shrink-0 place-items-center rounded-md text-white h-5 w-5 text-[10px]">▲</span>
                  <span>Single Choice MCQ</span>
                </div>
                <div className="flex w-full max-w-[14rem] items-center gap-2.5 rounded-xl bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm border border-blue-100 ml-4">
                  <span className="bg-choice-blue grid shrink-0 place-items-center rounded-md text-white h-5 w-5 text-[10px]">◆</span>
                  <span>Diagram Architecture</span>
                </div>
                <div className="flex w-full max-w-[14rem] items-center gap-2.5 rounded-xl bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm border border-blue-100 ml-8">
                  <span className="bg-choice-yellow grid shrink-0 place-items-center rounded-md text-white h-5 w-5 text-[10px]">⬤</span>
                  <span>Custom Timer (5-300s)</span>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <span className="bg-choice-red grid shrink-0 place-items-center rounded-xl text-white h-8 w-8 text-sm font-bold shadow-sm">▲</span>
                  <h3 className="font-display text-xl font-bold text-slate-900">1. Admin Configures Questions</h3>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  Master Admin sets text & diagram questions with custom timers for each question, manages participants, and customizes the AI Club logo.
                </p>
              </div>
            </li>

            {/* Step 2: Put it on the Big Screen */}
            <li className="card flex flex-col gap-6 p-6 sm:p-7 border border-blue-100 bg-white shadow-md rounded-3xl">
              <div className="flex h-36 items-center justify-center rounded-2xl bg-blue-50/60 border border-blue-100 gap-5 px-6">
                <div className="grid grid-cols-6 gap-1 rounded-xl bg-white p-2 shadow-sm border border-blue-100">
                  <span className="h-2 w-2 rounded-[2px] bg-blue-900" />
                  <span className="h-2 w-2 rounded-[2px] bg-blue-900" />
                  <span className="h-2 w-2 rounded-[2px] bg-transparent" />
                  <span className="h-2 w-2 rounded-[2px] bg-blue-900" />
                  <span className="h-2 w-2 rounded-[2px] bg-blue-900" />
                  <span className="h-2 w-2 rounded-[2px] bg-blue-900" />
                  <span className="h-2 w-2 rounded-[2px] bg-blue-900" />
                  <span className="h-2 w-2 rounded-[2px] bg-transparent" />
                  <span className="h-2 w-2 rounded-[2px] bg-blue-900" />
                  <span className="h-2 w-2 rounded-[2px] bg-blue-900" />
                  <span className="h-2 w-2 rounded-[2px] bg-transparent" />
                  <span className="h-2 w-2 rounded-[2px] bg-blue-900" />
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Room PIN</div>
                  <div className="font-mono text-2xl font-extrabold tracking-widest text-blue-700">{roomPin}</div>
                  <div className="text-[10px] text-emerald-600 font-bold mt-0.5">Auditorium Screen</div>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <span className="bg-choice-blue grid shrink-0 place-items-center rounded-xl text-white h-8 w-8 text-sm font-bold shadow-sm">◆</span>
                  <h3 className="font-display text-xl font-bold text-slate-900">2. Big Screen Projector</h3>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  Admin launches Host Mode in {venue}. A fresh unique room PIN appears for all students to join in seconds from any phone.
                </p>
              </div>
            </li>

            {/* Step 3: Everyone Plays */}
            <li className="card flex flex-col gap-6 p-6 sm:p-7 border border-blue-100 bg-white shadow-md rounded-3xl">
              <div className="flex h-36 items-center justify-center rounded-2xl bg-blue-50/60 border border-blue-100 items-end gap-3 pb-3">
                <div className="flex w-14 flex-col items-center gap-1">
                  <span className="text-xs">🥈</span>
                  <div className="h-14 w-full rounded-t-xl bg-slate-200 border-t-2 border-slate-400 pt-1 text-center font-display text-sm font-extrabold text-slate-700">2</div>
                </div>
                <div className="flex w-16 flex-col items-center gap-1">
                  <span className="text-sm">👑</span>
                  <div className="h-20 w-full rounded-t-xl bg-blue-600 border-t-2 border-amber-400 pt-1 text-center font-display text-base font-extrabold text-white shadow-md">1</div>
                </div>
                <div className="flex w-14 flex-col items-center gap-1">
                  <span className="text-xs">🥉</span>
                  <div className="h-10 w-full rounded-t-xl bg-amber-100 border-t-2 border-amber-500 pt-1 text-center font-display text-sm font-extrabold text-amber-800">3</div>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <span className="bg-choice-yellow grid shrink-0 place-items-center rounded-xl text-white h-8 w-8 text-sm font-bold shadow-sm">⬤</span>
                  <h3 className="font-display text-xl font-bold text-slate-900">3. Live Battle & Podium</h3>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  Questions change once all participants submit their answers or the timer expires. Speed multipliers, live streaks, and trophies for champions!
                </p>
              </div>
            </li>
          </ol>
        </section>

        {/* ===================== MULTI-ROUND TOURNAMENT BANNER ===================== */}
        <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 px-6 py-10 text-white shadow-xl sm:px-10 sm:py-12">
          <div className="pointer-events-none absolute inset-0 opacity-15 [background-image:radial-gradient(circle,rgba(255,255,255,0.7)_1.5px,transparent_1.8px)] [background-size:16px_16px]" />
          
          <div className="relative grid gap-8 lg:grid-cols-2 lg:items-center">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-md">
                <Trophy className="w-3.5 h-3.5" />
                Tournament Structure
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold leading-tight text-white">
                Multi-Round Tournament Arena
              </h2>
              <p className="text-sm sm:text-base leading-relaxed text-blue-100">
                Organized into distinct rounds with batch-based question storage. Questions remain strictly confidential until the Admin launches the round on the auditorium projector.
              </p>
            </div>

            <dl className="grid gap-6 sm:grid-cols-3">
              <div className="border-l-2 border-white/30 pl-4">
                <dt className="text-xs text-blue-200">Tournament Format</dt>
                <dd className="font-display text-2xl sm:text-3xl font-extrabold text-white mt-1">Multi-Round</dd>
              </div>
              <div className="border-l-2 border-white/30 pl-4">
                <dt className="text-xs text-blue-200">Timer Flexibility</dt>
                <dd className="font-display text-2xl sm:text-3xl font-extrabold text-white mt-1">5s-300s</dd>
              </div>
              <div className="border-l-2 border-white/30 pl-4">
                <dt className="text-xs text-blue-200">Honours & Awards</dt>
                <dd className="font-display text-2xl sm:text-3xl font-extrabold text-amber-300 mt-1">Trophies & Medals</dd>
              </div>
            </dl>
          </div>
        </section>

        {/* ===================== VENUE CALLOUT ===================== */}
        <section className="rounded-3xl border border-blue-100 bg-white p-6 sm:p-10 shadow-md">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="border-t-4 border-blue-500 pt-4 space-y-2">
              <h3 className="font-display text-lg font-bold text-slate-900">Official Campus Venue</h3>
              <p className="text-xs sm:text-sm leading-relaxed text-slate-600">
                Confirmed at <strong>{venue}</strong>, CMR Technical Campus, Kandlakoya, Hyderabad.
              </p>
            </div>
            <div className="border-t-4 border-emerald-500 pt-4 space-y-2">
              <h3 className="font-display text-lg font-bold text-slate-900">Trophies & Merit Honours</h3>
              <p className="text-xs sm:text-sm leading-relaxed text-slate-600">
                Grand Champion Gold Trophy, Runner Up Silver & Bronze Medals, and Verified Digital Certificates of Merit.
              </p>
            </div>
            <div className="border-t-4 border-amber-500 pt-4 space-y-2">
              <h3 className="font-display text-lg font-bold text-slate-900">AI Club CMRTC Core</h3>
              <p className="text-xs sm:text-sm leading-relaxed text-slate-600">
                Top performers qualify for direct induction into AI CLUB CMRTC's core technical and GenAI project teams.
              </p>
            </div>
          </div>
        </section>

        {/* ===================== BOTTOM CTA BANNER ===================== */}
        <div className="rounded-3xl bg-gradient-to-r from-blue-50 via-sky-50 to-indigo-50 border-2 border-blue-200 p-8 sm:p-12 text-center space-y-6 shadow-md">
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900">
            Ready to battle in {eventName}?
          </h2>
          <p className="text-slate-600 max-w-xl mx-auto text-sm sm:text-base">
            Join a live session with your room PIN or open the Master Admin dashboard to manage your quiz questions.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link 
              href="/play" 
              className="btn-primary px-7 py-3 text-base shadow-md"
              onClick={() => sounds.playPop()}
            >
              Enter Game PIN
            </Link>
            <Link 
              href="/leaderboard" 
              className="btn-secondary px-7 py-3 text-base"
              onClick={() => sounds.playPop()}
            >
              View Leaderboard
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};
