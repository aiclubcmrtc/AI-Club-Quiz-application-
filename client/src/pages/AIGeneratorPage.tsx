import React, { useState } from 'react';
import { Link } from 'wouter';
import {
  Sparkles,
  Bot,
  Zap,
  Play,
  Tv,
  CheckCircle,
  Copy,
  Download,
  RotateCcw,
  Sliders,
  Code
} from 'lucide-react';
import { Question } from '../data/quizData';
import { sounds } from '../utils/soundEngine';

export const AIGeneratorPage: React.FC = () => {
  const [topic, setTopic] = useState('Deep Learning & Large Language Models');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [questionCount, setQuestionCount] = useState(4);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[] | null>(null);
  const [copied, setCopied] = useState(false);

  const samplePrompts = [
    'Deep Learning & LLMs',
    'Python Quirks & Data Structures',
    'Cyber Security & Zero Trust',
    'Computer Vision & Object Detection',
    'CMRTC Campus Tech Trivia'
  ];

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playPop();
    setIsGenerating(true);

    setTimeout(() => {
      setIsGenerating(false);
      sounds.playCorrect();

      // Realistic generated questions according to topic
      const newQuestions: Question[] = [
        {
          id: 'gen-1',
          question: `In ${topic}, what is the primary role of the Self-Attention mechanism compared to recurrent architectures?`,
          options: [
            'Enables direct parallel connections across all sequence positions',
            'Compresses input vectors into a fixed-size latent integer',
            'Eliminates the requirement for positional embeddings',
            'Computes gradients strictly through backpropagation in time'
          ],
          correctIndex: 0,
          timeLimit: 15,
          explanation: 'Self-attention processes all sequence tokens simultaneously via Q, K, and V matrices without sequential temporal unrolling.',
          category: 'AI & ML',
          points: 1000
        },
        {
          id: 'gen-2',
          question: `Which mathematical function is commonly applied to convert raw logits into valid probability distributions?`,
          options: ['Softmax function', 'ReLU activation', 'Sigmoid step gate', 'GeLU approximation'],
          correctIndex: 0,
          timeLimit: 12,
          explanation: 'The Softmax function normalizes a K-dimensional vector of arbitrary real values into a probability distribution summing to 1.',
          category: 'AI & ML',
          points: 1000
        },
        {
          id: 'gen-3',
          question: `What is the key purpose of "RLHF" (Reinforcement Learning from Human Feedback) in training modern AI models?`,
          options: [
            'Align model outputs with human intent and safety standards',
            'Pre-train model parameters on raw unlabelled internet text',
            'Compress the model file size for mobile deployment',
            'Calculate token embeddings with higher precision'
          ],
          correctIndex: 0,
          timeLimit: 15,
          explanation: 'RLHF uses human preference rankings to train a reward model which guides proximal policy optimization for safe, helpful outputs.',
          category: 'AI & ML',
          points: 1000
        },
        {
          id: 'gen-4',
          question: `In vector databases used for RAG (Retrieval-Augmented Generation), what distance metric is standard for semantic similarity?`,
          options: ['Cosine Similarity', 'Manhattan Distance', 'Hamming Distance', 'Chebyshev Distance'],
          correctIndex: 0,
          timeLimit: 15,
          explanation: 'Cosine similarity measures the angle between two embedding vectors regardless of their magnitude, ideal for semantic text similarity.',
          category: 'AI & ML',
          points: 1000
        }
      ];

      setGeneratedQuestions(newQuestions.slice(0, questionCount));
    }, 1200);
  };

  const copyToClipboard = () => {
    if (!generatedQuestions) return;
    navigator.clipboard.writeText(JSON.stringify(generatedQuestions, null, 2));
    setCopied(true);
    sounds.playPop();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 sm:py-12 space-y-10">
      {/* Header */}
      <div className="space-y-2 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          AI CLUB CMRTC Intelligence Core
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-white">
          AI Quiz Generator
        </h1>
        <p className="text-slate-400 text-sm max-w-xl">
          Instantly draft professional, high-impact quiz questions for college rounds. Give it any topic or curriculum unit and get ready-to-host MCQs in seconds.
        </p>
      </div>

      {/* Generation Form */}
      <form onSubmit={handleGenerate} className="card p-6 sm:p-8 bg-slate-900 border border-slate-800 space-y-6 shadow-2xl">
        <div className="space-y-3">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Quiz Topic or Prompt
          </label>
          <input
            type="text"
            required
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. Deep Learning, Cyber Security, Python OOP, Cloud Computing"
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
          />

          {/* Quick Prompts */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] text-slate-500">Quick ideas:</span>
            {samplePrompts.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setTopic(p)}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Configurations Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Difficulty Level
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Easy', 'Medium', 'Hard'] as const).map((diff) => (
                <button
                  key={diff}
                  type="button"
                  onClick={() => setDifficulty(diff)}
                  className={`py-2 rounded-xl text-xs font-bold transition-all ${
                    difficulty === diff
                      ? 'bg-brand-600 text-white shadow-md'
                      : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Questions Count
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[4, 6, 8].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setQuestionCount(num)}
                  className={`py-2 rounded-xl text-xs font-bold transition-all ${
                    questionCount === num
                      ? 'bg-brand-600 text-white shadow-md'
                      : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {num} Questions
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isGenerating}
          className="btn-primary w-full py-3.5 text-base flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <>
              <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              Synthesizing Questions with AI...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Generate Quiz with AI Core
            </>
          )}
        </button>
      </form>

      {/* Generated Questions Preview */}
      {generatedQuestions && (
        <div className="space-y-6 pt-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl font-bold text-white flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              Generated {generatedQuestions.length} Questions
            </h2>

            <div className="flex items-center gap-2">
              <button
                onClick={copyToClipboard}
                className="btn-secondary px-3 py-1.5 text-xs flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                {copied ? 'Copied JSON!' : 'Copy JSON'}
              </button>
              <Link
                href="/host"
                className="btn-primary px-4 py-1.5 text-xs flex items-center gap-1.5"
                onClick={() => sounds.playPop()}
              >
                <Tv className="w-3.5 h-3.5" />
                Host Immediately
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            {generatedQuestions.map((q, idx) => (
              <div
                key={idx}
                className="card p-5 bg-slate-900 border border-slate-800 space-y-3 shadow-lg"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-brand-400">Question {idx + 1}</span>
                  <span className="text-slate-500 font-mono">{q.timeLimit}s • {q.points} pts</span>
                </div>
                <div className="font-bold text-base text-white">{q.question}</div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                  {q.options.map((opt, optIdx) => (
                    <div
                      key={optIdx}
                      className={`p-2.5 rounded-xl ${
                        optIdx === q.correctIndex
                          ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40'
                          : 'bg-slate-950 text-slate-300 border border-slate-800'
                      }`}
                    >
                      {opt}
                    </div>
                  ))}
                </div>

                <div className="text-xs text-slate-400 pt-2 border-t border-slate-800/80">
                  <strong className="text-slate-300">Explanation: </strong> {q.explanation}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
