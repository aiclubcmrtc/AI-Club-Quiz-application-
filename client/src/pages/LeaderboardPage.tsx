import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Flame,
  Search,
  Users
} from 'lucide-react';
import { sounds } from '../utils/soundEngine';
import { useAdminAuth } from '../context/AdminAuthContext';
import { isRealParticipant } from '../data/adminAccounts';

export const LeaderboardPage: React.FC = () => {
  const { eventName } = useAdminAuth();
  const [filterBranch, setFilterBranch] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLiveActive, setIsLiveActive] = useState(false);

  const parseContestants = () => {
    try {
      const liveStored = localStorage.getItem('cmrtc_live_tournament_scores');
      if (liveStored) {
        const parsed = JSON.parse(liveStored);
        if (Array.isArray(parsed)) {
          const real = parsed.filter(isRealParticipant);
          if (real.length > 0) {
            setIsLiveActive(true);
            return real.map((item: any, idx: number) => ({
              rank: idx + 1,
              name: item.name,
              branch: item.branch || 'CSE (AI&ML)',
              year: item.year || '3rd Year',
              score: item.score || 0,
              streak: item.streak || 0,
              accuracy: item.score > 0 ? `${Math.min(100, Math.round(75 + (item.streak * 5)))}%` : '0%',
              avatar: item.avatar || '⚡',
              lastDelta: item.lastDelta || 0
            }));
          }
        }
      }
    } catch {}

    try {
      const partStored = localStorage.getItem('cmrtc_stored_participants_v2');
      if (partStored) {
        const parsed = JSON.parse(partStored);
        if (Array.isArray(parsed)) {
          const real = parsed.filter(isRealParticipant);
          if (real.length > 0) {
            const sorted = [...real].sort((a, b) => (b.score || 0) - (a.score || 0));
            return sorted.map((item: any, idx: number) => ({
              rank: idx + 1,
              name: item.name,
              branch: item.branch || 'CSE (AI&ML)',
              year: item.year || '3rd Year',
              score: item.score || 0,
              streak: item.streak || 0,
              accuracy: item.accuracy || (item.score > 0 ? '80%' : '0%'),
              avatar: item.avatar || '⚡',
              lastDelta: 0
            }));
          }
        }
      }
    } catch {}

    return [];
  };

  // Load real-time scores from participants answering the quiz
  const [contestants, setContestants] = useState<any[]>(parseContestants);

  // Automatically update in real time as participants submit answers to each question
  useEffect(() => {
    const syncScores = () => {
      const updated = parseContestants();
      setContestants(updated);
    };

    syncScores();
    window.addEventListener('storage', syncScores);
    const interval = setInterval(syncScores, 1200);

    return () => {
      window.removeEventListener('storage', syncScores);
      clearInterval(interval);
    };
  }, []);

  const branches = ['All', 'CSE (AI&ML)', 'CSE Core', 'CSE (Data Science)', 'CSE (Cyber Security)', 'ECE', 'Information Technology'];

  const filtered = contestants.filter((item) => {
    const matchBranch = filterBranch === 'All' || item.branch.includes(filterBranch);
    const matchSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        item.branch.toLowerCase().includes(searchTerm.toLowerCase());
    return matchBranch && matchSearch;
  });

  const top1 = filtered[0];
  const top2 = filtered[1];
  const top3 = filtered[2];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 sm:py-12 space-y-10">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold shadow-sm">
            <Trophy className="w-3.5 h-3.5 text-amber-600" />
            Official Standings • {eventName}
          </div>
          {isLiveActive && contestants.length > 0 && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold animate-pulse">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Live Tournament Active ({contestants.length} Contestants)
            </div>
          )}
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900">
          Leaderboard & Hall of Fame
        </h1>
        <p className="text-slate-600 text-sm max-w-xl">
          Live rankings and real-time scores of student competitors answering the tournament in Room 119. Updates automatically after every question.
        </p>
      </div>

      {contestants.length === 0 ? (
        /* Clean Empty State when no participants have joined */
        <div className="card p-12 bg-white border border-blue-100 rounded-3xl text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-3xl">
            🏆
          </div>
          <div className="space-y-1.5">
            <h3 className="font-display text-xl font-bold text-slate-900">
              Waiting for Participants to Join
            </h3>
            <p className="text-slate-500 text-xs max-w-md mx-auto">
              No participants have joined the quiz yet. Once students enter the Room PIN at <span className="font-mono font-bold text-blue-600">/play</span> and begin answering questions, live standings and real-time scores will automatically appear here!
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Top Podium Highlights - Dynamically Driven by Real-Time Scores */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {/* 2nd Place */}
            {top2 ? (
              <div className="card p-6 bg-white border border-blue-100 text-center space-y-3 order-2 md:order-1 relative overflow-hidden shadow-md rounded-3xl">
                <div className="text-3xl">{top2.avatar || '🚀'}</div>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  Rank #2 • Silver
                </span>
                <h3 className="font-display text-xl font-bold text-slate-900 truncate px-2">{top2.name}</h3>
                <div className="text-xs text-slate-500 truncate">{top2.branch} • {top2.year}</div>
                <div className="font-mono text-2xl font-extrabold text-slate-800">{(top2.score || 0).toLocaleString()} pts</div>
              </div>
            ) : (
              <div className="card p-6 bg-slate-50/50 border border-dashed border-slate-200 text-center space-y-2 order-2 md:order-1 rounded-3xl flex flex-col items-center justify-center min-h-[200px]">
                <div className="text-2xl text-slate-300">🥈</div>
                <span className="text-xs font-semibold text-slate-400">Rank #2 • Silver</span>
                <div className="text-xs text-slate-400">Awaiting 2nd Contestant</div>
              </div>
            )}

            {/* 1st Place */}
            {top1 ? (
              <div className="card p-6 bg-gradient-to-b from-amber-50/60 to-white border-2 border-amber-300 text-center space-y-3 order-1 md:order-2 shadow-xl rounded-3xl relative overflow-hidden scale-105">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-amber-400" />
                <div className="text-4xl animate-bounce">👑</div>
                <span className="text-xs font-bold px-3 py-0.5 rounded-full bg-amber-100 text-amber-800">
                  Rank #1 • Champion
                </span>
                <h3 className="font-display text-2xl font-extrabold text-amber-700 truncate px-2">{top1.name}</h3>
                <div className="text-xs text-slate-500 truncate">{top1.branch} • {top1.year}</div>
                <div className="font-mono text-2xl font-extrabold text-emerald-600">{(top1.score || 0).toLocaleString()} pts</div>
              </div>
            ) : null}

            {/* 3rd Place */}
            {top3 ? (
              <div className="card p-6 bg-white border border-blue-100 text-center space-y-3 order-3 md:order-3 relative overflow-hidden shadow-md rounded-3xl">
                <div className="text-3xl">{top3.avatar || '🧠'}</div>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                  Rank #3 • Bronze
                </span>
                <h3 className="font-display text-xl font-bold text-slate-900 truncate px-2">{top3.name}</h3>
                <div className="text-xs text-slate-500 truncate">{top3.branch} • {top3.year}</div>
                <div className="font-mono text-2xl font-extrabold text-slate-800">{(top3.score || 0).toLocaleString()} pts</div>
              </div>
            ) : (
              <div className="card p-6 bg-slate-50/50 border border-dashed border-slate-200 text-center space-y-2 order-3 md:order-3 rounded-3xl flex flex-col items-center justify-center min-h-[200px]">
                <div className="text-2xl text-slate-300">🥉</div>
                <span className="text-xs font-semibold text-slate-400">Rank #3 • Bronze</span>
                <div className="text-xs text-slate-400">Awaiting 3rd Contestant</div>
              </div>
            )}
          </div>

          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-blue-100 shadow-sm">
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
              {branches.map((b) => (
                <button
                  key={b}
                  onClick={() => {
                    sounds.playPop();
                    setFilterBranch(b);
                  }}
                  className={`
                    px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0
                    ${filterBranch === b
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-blue-50/70 text-slate-600 hover:text-blue-600 border border-blue-100'}
                  `}
                >
                  {b}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search student or branch..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-blue-50/50 border border-blue-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Leaderboard Table */}
          <div className="card overflow-hidden bg-white border border-blue-100 shadow-md rounded-3xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-blue-50/70 text-slate-600 font-bold border-b border-blue-100">
                  <tr>
                    <th className="py-3 px-4">Rank</th>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Branch & Year</th>
                    <th className="py-3 px-4 text-center">Score</th>
                    <th className="py-3 px-4 text-center">Accuracy</th>
                    <th className="py-3 px-4 text-right">Streak</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-50 text-slate-700">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        No participants match the selected filter.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((student) => (
                      <tr key={student.rank} className="hover:bg-blue-50/40 transition-colors">
                        <td className="py-3.5 px-4 font-display font-extrabold text-sm">
                          {student.rank === 1 ? '🥇 1' : student.rank === 2 ? '🥈 2' : student.rank === 3 ? '🥉 3' : `#${student.rank}`}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2">
                          <span className="text-base">{student.avatar}</span>
                          <span>{student.name}</span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-500">
                          {student.branch} • {student.year}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-blue-600 text-sm text-center">
                          {student.score.toLocaleString()} pts
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-emerald-600 text-center">
                          {student.accuracy}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <span className="inline-flex items-center gap-1 font-mono text-amber-600 font-bold">
                            <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                            {student.streak}x
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
