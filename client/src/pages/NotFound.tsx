import React from 'react';
import { Link } from 'wouter';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 mb-4">
        <ShieldAlert className="h-8 w-8" />
      </div>
      <h1 className="font-display text-3xl font-bold text-white">404 — Route Not Found</h1>
      <p className="mt-2 text-sm text-slate-400 max-w-sm">
        The requested command console sector does not exist or has been decommissioned.
      </p>
      <Link
        href="/command-center"
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-cyan-500/20 hover:brightness-110"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Return to Command Center</span>
      </Link>
    </div>
  );
};
