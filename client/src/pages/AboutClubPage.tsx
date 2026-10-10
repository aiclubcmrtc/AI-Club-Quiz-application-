import React from 'react';
import {
  Brain,
  Users,
  Award,
  Sparkles,
  MapPin,
  Mail,
  Globe,
  ExternalLink,
  Code2,
  Terminal,
  Cpu,
  GraduationCap
} from 'lucide-react';
import { sounds } from '../utils/soundEngine';
import { useAdminAuth } from '../context/AdminAuthContext';

export const AboutClubPage: React.FC = () => {
  const { clubLogo, venue } = useAdminAuth();

  const clubTeam = [
    {
      role: 'Faculty Coordinator',
      name: 'Dr. K. Srinivas Rao',
      dept: 'Department of CSE (AI & ML)',
      avatar: '👨‍🏫'
    },
    {
      role: 'Faculty Advisor',
      name: 'Prof. P. Sunitha',
      dept: 'Department of Computer Science',
      avatar: '👩‍🏫'
    },
    {
      role: 'Club President',
      name: 'Husail Abul Aziz',
      dept: 'CSE (AI & ML) • Final Year',
      avatar: '⚡'
    },
    {
      role: 'Technical Lead',
      name: 'Aditya Teja',
      dept: 'CSE Core • 3rd Year',
      avatar: '🚀'
    },
    {
      role: 'Event & Quiz Master',
      name: 'Sneha Reddy',
      dept: 'CSE (Data Science) • 3rd Year',
      avatar: '🎯'
    },
    {
      role: 'Platform & Cloud Lead',
      name: 'Rahul Varma',
      dept: 'CSE (Cyber Security) • 3rd Year',
      avatar: '🛡️'
    }
  ];

  const initiatives = [
    {
      icon: Brain,
      title: 'GenAI & Deep Learning Labs',
      desc: 'Hands-on training sessions with PyTorch, Hugging Face Transformers, LangChain, and fine-tuning open-source LLMs.'
    },
    {
      icon: Terminal,
      title: 'Battle of Bits Quiz Tournaments',
      desc: 'Interactive live multiplayer game shows on auditorium projectors testing speed, syntax, and deep algorithm concepts.'
    },
    {
      icon: Code2,
      title: 'Hackathons & Project Mentorship',
      desc: 'Organizing 24-hour campus hackathons and guiding juniors into Google Summer of Code, Smart India Hackathon, and internships.'
    },
    {
      icon: Cpu,
      title: 'Research & Paper Reading Circles',
      desc: 'Weekly discussions dissecting seminal papers from NeurIPS, ICML, CVPR, and ArXiv on emerging AI frontiers.'
    }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 sm:py-12 space-y-12">
      {/* Hero Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center mb-1">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden p-1 bg-white border-2 border-blue-200 shadow-xl ring-4 ring-blue-500/10 hover:scale-105 transition-transform">
            <img src={clubLogo} alt="AI CLUB CMRTC Official Logo" className="w-full h-full object-cover rounded-full" />
          </div>
        </div>
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
          <Brain className="w-3.5 h-3.5" />
          Student Chapter • CMR Technical Campus
        </div>
        <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-slate-900">
          About AI CLUB CMRTC
        </h1>
        <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          The premier artificial intelligence and emerging tech community at <strong>CMR Technical Campus (CMRTC)</strong>, Hyderabad. Fostering future researchers, engineers, and competitive technologists.
        </p>
      </div>

      {/* College Info Card */}
      <div className="card p-6 sm:p-8 bg-white border border-blue-100 space-y-4 shadow-md rounded-3xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-blue-600 text-white font-bold shadow-md">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-slate-900">
              CMR Technical Campus (UGC Autonomous)
            </h2>
            <div className="text-xs text-slate-500">
              Accredited with NAAC 'A+' Grade • NBA Accredited • Approved by AICTE, New Delhi
            </div>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          CMR Technical Campus is a premier engineering institution located in Kandlakoya, Medchal, Hyderabad. Established under the aegis of CMR Group of Institutions, CMRTC provides world-class infrastructure for computing, innovation hubs, incubation, and specialized engineering centers.
        </p>
        <div className="text-xs font-semibold text-blue-700 pt-1">
          📍 Event Headquarters: {venue}
        </div>
      </div>

      {/* What We Do */}
      <div className="space-y-6">
        <div className="space-y-1">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
            Club Pillars & Activities
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm">
            Empowering students from day one with practical engineering know-how.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {initiatives.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="card p-5 bg-white border border-blue-100 space-y-2 hover:border-blue-300 transition-colors shadow-sm rounded-2xl"
              >
                <div className="flex items-center gap-2.5 text-blue-600">
                  <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-100">
                    <Icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="font-display text-base font-bold text-slate-900">{item.title}</h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed pt-1">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Team & Coordinators Grid */}
      <div className="space-y-6">
        <div className="space-y-1">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
            Organizing Committee & Leads
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm">
            Faculty mentors and student leaders driving the Battle of Bits event.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {clubTeam.map((member, i) => (
            <div
              key={i}
              className="card p-5 bg-white border border-blue-100 space-y-2 text-center shadow-sm rounded-2xl hover:border-blue-300 transition-colors"
            >
              <div className="text-3xl mb-1">{member.avatar}</div>
              <div className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                {member.role}
              </div>
              <div className="font-display text-base font-bold text-slate-900">
                {member.name}
              </div>
              <div className="text-[11px] text-slate-500">{member.dept}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Contact & Connect Bar */}
      <div className="rounded-3xl bg-gradient-to-r from-blue-50 via-sky-50 to-indigo-50 border-2 border-blue-200 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
        <div className="space-y-1 text-center sm:text-left">
          <div className="font-display text-xl font-bold text-slate-900">
            Connect with AI CLUB CMRTC
          </div>
          <p className="text-xs text-slate-600">
            Kandlakoya Village, Medchal Road, Hyderabad, Telangana 501401
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <a
            href="mailto:aiclub@cmrtc.ac.in"
            className="btn-secondary px-4 py-2 text-xs flex items-center gap-1.5 shadow-sm"
            onClick={() => sounds.playPop()}
          >
            <Mail className="w-3.5 h-3.5" />
            aiclub@cmrtc.ac.in
          </a>
          <a
            href="https://cmrtc.ac.in"
            target="_blank"
            rel="noreferrer"
            className="btn-primary px-4 py-2 text-xs flex items-center gap-1.5 shadow-sm"
            onClick={() => sounds.playPop()}
          >
            <Globe className="w-3.5 h-3.5" />
            cmrtc.ac.in <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
