import React, { useState } from 'react';
import {
  Calendar,
  MapPin,
  Clock,
  Award,
  ShieldCheck,
  CheckCircle2,
  ChevronDown,
  Sparkles,
  Users,
  AlertCircle
} from 'lucide-react';
import { sounds } from '../utils/soundEngine';

export const EventDetailsPage: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const rounds = [
    {
      num: 'Round 1',
      title: 'The AI Ignition (Prelims)',
      time: '10:30 AM - 11:15 AM',
      format: '30 Fast MCQs on Smartphones',
      description: 'Foundations of Computer Science, AI history, Python syntax, and Machine Learning basics. Top 30 teams advance.',
      color: 'border-l-blue-500'
    },
    {
      num: 'Round 2',
      title: 'Bug Hunter & Logic Gates',
      time: '11:45 AM - 12:30 PM',
      format: 'Code Debugging & Algorithm Tracing',
      description: 'Find elusive Python bugs, evaluate recursion depth, determine Big-O complexities, and predict outputs under time pressure.',
      color: 'border-l-amber-500'
    },
    {
      num: 'Round 3',
      title: 'The Neural Showdown',
      time: '01:30 PM - 02:15 PM',
      format: 'Deep Learning & Neural Network Hotspots',
      description: 'Complex Transformers, Backpropagation calculus, Computer Vision architectures, and LLM prompting scenarios.',
      color: 'border-l-purple-500'
    },
    {
      num: 'Round 4',
      title: 'Grand Stage Finale (Hacker_ Mode)',
      time: '02:45 PM - 03:30 PM',
      format: 'Stage Buzzer & Cyber Warfare Mode',
      description: 'Top 5 finalist teams battle on the auditorium big screen. Correct answers grant Neural Bits to hack opposing team scores!',
      color: 'border-l-emerald-500'
    }
  ];

  const faqs = [
    {
      q: 'Do students need to install any mobile application to participate?',
      a: 'No app is needed! Simply open your mobile browser (Chrome, Safari, Brave), go to the quiz link, enter the 6-digit auditorium room PIN shown on the screen, and you are in.'
    },
    {
      q: 'How does the scoring system work?',
      a: 'Each question has a base value of 1,000 points. Points decrease continuously as the timer ticks down, rewarding both accuracy and swift reflexes. Consecutive correct answers unlock streak multipliers (🔥 x2, x3)!'
    },
    {
      q: 'Who is eligible to participate in Battle of Bits 2026?',
      a: 'All registered students of CMR Technical Campus across all branches (CSE, AI&ML, Data Science, Cyber Security, ECE, IT, Mechanical, Civil) and all academic years (1st to 4th year).'
    },
    {
      q: 'Can students participate as teams or solo?',
      a: 'Prelims allow both solo and 2-member teams. From Round 3 onwards, teams will collaborate on a single device on the stage.'
    },
    {
      q: 'Will every participant receive a certificate?',
      a: 'Yes! All registered participants receive an official digital Certificate of Participation verified by AI CLUB CMRTC and CMR Technical Campus.'
    }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 sm:py-12 space-y-12">
      {/* Event Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-semibold">
          <Calendar className="w-3.5 h-3.5" />
          Annual Flagship Event • CMR Technical Campus
        </div>
        <h1 className="font-display text-3xl sm:text-5xl font-extrabold text-white">
          Battle of Bits '26: Event Rules & Rounds
        </h1>
        <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto">
          The ultimate technical quiz championship organized by <strong>AI CLUB CMRTC</strong>. Check round formats, stage guidelines, and awards & recognition.
        </p>
      </div>

      {/* Event Overview Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-5 bg-slate-900 border border-slate-800 flex items-center gap-3">
          <div className="p-3 rounded-xl bg-blue-500/20 text-blue-400">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 uppercase font-semibold">Venue</div>
            <div className="font-bold text-sm text-white">CMRTC B-Block room no. 119</div>
            <div className="text-[11px] text-slate-400">CMR Technical Campus, Kandlakoya</div>
          </div>
        </div>

        <div className="card p-5 bg-slate-900 border border-slate-800 flex items-center gap-3">
          <div className="p-3 rounded-xl bg-amber-500/20 text-amber-400">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 uppercase font-semibold">Awards & Honours</div>
            <div className="font-display text-base font-extrabold text-amber-400">Trophies & Medals</div>
            <div className="text-[11px] text-slate-400">+ Merit Certificates</div>
          </div>
        </div>

        <div className="card p-5 bg-slate-900 border border-slate-800 flex items-center gap-3">
          <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 uppercase font-semibold">Participation</div>
            <div className="font-bold text-sm text-white">500+ Expected</div>
            <div className="text-[11px] text-emerald-400">Free Registration</div>
          </div>
        </div>
      </div>

      {/* Prize & Accolades Breakdown Banner */}
      <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/30 p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2 text-amber-400 font-display font-extrabold text-xl">
          <Award className="w-5 h-5" />
          Trophies & Accolades
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
            <div className="text-2xl mb-1">🥈</div>
            <div className="text-xs text-slate-400 font-bold">1st Runner Up</div>
            <div className="font-display text-lg font-extrabold text-white mt-1">Silver Trophy</div>
            <div className="text-[10px] text-slate-400">Silver Medals + Certificate of Merit</div>
          </div>
          <div className="p-4 rounded-2xl bg-gradient-to-b from-amber-500/20 to-slate-950 border border-amber-500/40 scale-105">
            <div className="text-3xl mb-1">👑</div>
            <div className="text-xs text-amber-300 font-bold">Grand Champions</div>
            <div className="font-display text-xl font-extrabold text-amber-300 mt-1">Gold Champion Trophy</div>
            <div className="text-[10px] text-amber-200">Gold Medals + Excellence Certificate + Club Honors</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
            <div className="text-2xl mb-1">🥉</div>
            <div className="text-xs text-slate-400 font-bold">2nd Runner Up</div>
            <div className="font-display text-lg font-extrabold text-white mt-1">Bronze Trophy</div>
            <div className="text-[10px] text-slate-400">Bronze Medals + Certificate of Merit</div>
          </div>
        </div>
      </div>

      {/* Rounds Progression */}
      <div className="space-y-6">
        <div className="space-y-1">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
            Tournament Rounds
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm">
            Four rigorous rounds progressing from wide-scale prelims to intense on-stage cyber battles.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {rounds.map((r, i) => (
            <div
              key={i}
              className={`card p-5 bg-slate-900 border border-slate-800 border-l-4 ${r.color} space-y-2`}
            >
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-brand-400">{r.num}</span>
                <span className="text-slate-400 flex items-center gap-1 font-mono">
                  <Clock className="w-3 h-3" />
                  {r.time}
                </span>
              </div>
              <h3 className="font-display text-lg font-bold text-white">{r.title}</h3>
              <div className="text-xs text-emerald-400 font-mono font-medium">{r.format}</div>
              <p className="text-xs text-slate-300 leading-relaxed pt-1">
                {r.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ Accordion */}
      <div className="space-y-4 pt-4">
        <h2 className="font-display text-2xl font-bold text-white">
          Frequently Asked Questions
        </h2>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="card bg-slate-900 border border-slate-800 overflow-hidden"
            >
              <button
                onClick={() => {
                  sounds.playPop();
                  setOpenFaq(openFaq === idx ? null : idx);
                }}
                className="w-full p-4 text-left font-bold text-sm text-white flex items-center justify-between hover:text-brand-300 transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${openFaq === idx ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === idx && (
                <div className="px-4 pb-4 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/60 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
