import React, { useState } from 'react';
import { Link } from 'wouter';
import {
  Compass,
  Search,
  Filter,
  Play,
  Tv,
  Clock,
  Sparkles,
  BookOpen,
  CheckCircle,
  HelpCircle,
  Flame
} from 'lucide-react';
import { SAMPLE_QUIZZES, QuizSet } from '../data/quizData';
import { sounds } from '../utils/soundEngine';

export const QuizSetsPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeQuizModal, setActiveQuizModal] = useState<QuizSet | null>(null);

  const categories = ['All', 'AI & ML', 'Python & DSA', 'Cyber Security', 'CMRTC Special'];

  const filteredQuizzes = SAMPLE_QUIZZES.filter((quiz) => {
    const matchesCat = selectedCategory === 'All' || quiz.category === selectedCategory;
    const matchesSearch = quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          quiz.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 sm:py-12 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-semibold">
            <Compass className="w-3.5 h-3.5" />
            CMRTC Question Repository
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-white">
            Discover & Quiz Sets
          </h1>
          <p className="text-slate-400 text-sm max-w-xl">
            Pre-curated question sets tailored for college tech symposiums, hackathon rounds, and AI club battles.
          </p>
        </div>

        <Link
          href="/generator"
          className="btn-primary px-5 py-2.5 text-sm self-start sm:self-auto flex items-center gap-1.5"
          onClick={() => sounds.playPop()}
        >
          <Sparkles className="w-4 h-4" />
          Create with AI
        </Link>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                sounds.playPop();
                setSelectedCategory(cat);
              }}
              className={`
                px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0
                ${selectedCategory === cat 
                  ? 'bg-brand-600 text-white shadow-md' 
                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'}
              `}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search topics or rounds..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
          />
        </div>
      </div>

      {/* Quiz Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        {filteredQuizzes.map((quiz) => (
          <div
            key={quiz.id}
            className="card p-6 bg-slate-900/80 border border-slate-800 flex flex-col justify-between gap-6 hover:border-brand-500/50 transition-all shadow-xl group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-brand-500/20 text-brand-300">
                  {quiz.badge}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {quiz.timeEstimate} • {quiz.questionCount} Questions
                </span>
              </div>

              <h3 className="font-display text-xl font-bold text-white group-hover:text-brand-300 transition-colors">
                {quiz.title}
              </h3>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {quiz.description}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
              <button
                onClick={() => {
                  sounds.playPop();
                  setActiveQuizModal(quiz);
                }}
                className="text-xs font-semibold text-slate-400 hover:text-white transition-colors"
              >
                Preview Questions →
              </button>

              <div className="flex items-center gap-2">
                <Link
                  href="/host"
                  className="btn-secondary px-3.5 py-1.5 text-xs flex items-center gap-1.5"
                  onClick={() => sounds.playPop()}
                >
                  <Tv className="w-3.5 h-3.5" />
                  Host
                </Link>
                <Link
                  href="/play"
                  className="btn-primary px-3.5 py-1.5 text-xs flex items-center gap-1.5"
                  onClick={() => sounds.playPop()}
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Play
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Question Preview Modal */}
      {activeQuizModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 max-h-[85vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs text-brand-400 font-bold">{activeQuizModal.category}</span>
                <h2 className="font-display text-2xl font-extrabold text-white">
                  {activeQuizModal.title}
                </h2>
              </div>
              <button
                onClick={() => setActiveQuizModal(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg text-sm"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-4">
              {activeQuizModal.questions.map((q, idx) => (
                <div key={q.id} className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                    <span>Question {idx + 1}</span>
                    <span>{q.timeLimit}s</span>
                  </div>
                  <div className="font-bold text-sm text-white">{q.question}</div>
                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    {q.options.map((opt, oIdx) => (
                      <div
                        key={oIdx}
                        className={`p-2 rounded-lg ${
                          oIdx === q.correctIndex
                            ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40'
                            : 'bg-slate-900 text-slate-400'
                        }`}
                      >
                        {opt}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Link
                href="/host"
                className="btn-primary px-5 py-2 text-xs"
                onClick={() => sounds.playPop()}
              >
                Launch this Quiz as Host
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
