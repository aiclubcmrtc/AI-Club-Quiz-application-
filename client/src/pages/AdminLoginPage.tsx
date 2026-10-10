import React, { useState } from 'react';
import { useLocation, Link } from 'wouter';
import {
  ShieldCheck,
  Lock,
  User,
  KeyRound,
  AlertCircle
} from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { MASTER_ADMIN } from '../data/adminAccounts';
import { sounds } from '../utils/soundEngine';

export const AdminLoginPage: React.FC = () => {
  const [, setLocation] = useLocation();
  const { login, isAuthenticated, clubLogo } = useAdminAuth();

  const [credential, setCredential] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // If already authenticated, redirect to /admin
  React.useEffect(() => {
    if (isAuthenticated) {
      setLocation('/admin');
    }
  }, [isAuthenticated, setLocation]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const success = login(credential, password);
    if (success) {
      sounds.playMasterLogin();
      setTimeout(() => {
        setLocation('/admin');
      }, 450);
    } else {
      sounds.playIncorrect();
      setError('Invalid admin credentials. Access restricted to authorized faculty and event coordinators.');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md space-y-6">
        
        {/* Main Login Card (White & Light Blue) */}
        <div className="card p-6 sm:p-8 bg-white border border-blue-100 shadow-xl rounded-3xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-400" />

          {/* Logo & Header */}
          <div className="text-center space-y-3 mb-6">
            <div className="w-16 h-16 mx-auto rounded-full overflow-hidden p-0.5 bg-white border-2 border-blue-200 shadow-md ring-2 ring-blue-500/10 flex items-center justify-center">
              <img src={clubLogo} alt="AI Club Logo" className="w-full h-full object-cover rounded-full" />
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                AI CLUB CMRTC
              </div>
              <h1 className="font-display text-2xl font-extrabold text-slate-900 mt-1">
                Master Admin Portal
              </h1>
              <p className="text-xs text-slate-500">
                Single master account with full authority over questions, timers, participants, and event logo.
              </p>
            </div>
          </div>

          {error && (
            <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Admin Username or Email
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="admin or admin@cmrtc.ac.in"
                  value={credential}
                  onChange={(e) => setCredential(e.target.value)}
                  className="w-full bg-blue-50/50 border border-blue-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Master Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-blue-50/50 border border-blue-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary w-full py-3 text-sm mt-2 flex items-center justify-center gap-2 shadow-md"
            >
              <KeyRound className="w-4 h-4" />
              Sign In to Master Control
            </button>
          </form>

          {/* Secure Admin Notice & Navigation */}
          <div className="mt-6 pt-4 border-t border-blue-100 flex items-center justify-between text-xs text-slate-500">
            <Link
              href="/"
              className="hover:text-blue-600 transition-colors font-medium flex items-center gap-1"
            >
              ← Back to Arena Home
            </Link>
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <Lock className="w-3 h-3 text-slate-400" />
              Restricted Area
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
