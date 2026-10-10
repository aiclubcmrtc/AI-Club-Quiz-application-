import React from 'react';
import { Route, Switch } from 'wouter';
import { Agentation } from 'agentation';
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext';
import { GigaLayout } from './components/layout/GigaLayout';
import { HomePage } from './pages/HomePage';
import { PlayGamePage } from './pages/PlayGamePage';
import { HostGamePage } from './pages/HostGamePage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { AboutClubPage } from './pages/AboutClubPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

/**
 * Agentation Visual Feedback Tool (https://www.agentation.com)
 * Restricted strictly to authenticated Master Admins.
 * Regular students and unauthenticated visitors will never see or load this tool.
 */
const AdminOnlyAgentation: React.FC = () => {
  const { isAuthenticated } = useAdminAuth();
  if (!isAuthenticated) return null;
  return <Agentation />;
};

export const App: React.FC = () => {
  return (
    <AdminAuthProvider>
      <GigaLayout>
        <Switch>
          {/* Main Landing Page */}
          <Route path="/" component={HomePage} />
          <Route path="/home" component={HomePage} />

          {/* Live Game Arena: Play on Mobile with PIN */}
          <Route path="/play" component={PlayGamePage} />

          {/* Host Mode: Big Screen Auditorium Projector (Admin Only) */}
          <Route path="/host" component={HostGamePage} />

          {/* Live Leaderboard & Certificate Generator */}
          <Route path="/leaderboard" component={LeaderboardPage} />

          {/* About AI CLUB CMRTC */}
          <Route path="/about" component={AboutClubPage} />

          {/* Admin Authentication & Control Center */}
          <Route path="/admin/login" component={AdminLoginPage} />
          <Route path="/admin" component={AdminDashboardPage} />

          {/* 404 Fallback */}
          <Route>
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="font-display text-6xl font-extrabold text-blue-600">404</div>
              <h2 className="font-display text-2xl font-bold text-slate-800">Page Not Found</h2>
              <p className="text-sm text-slate-500 max-w-md">
                The requested page does not exist or has been removed.
              </p>
              <a href="/" className="btn-primary px-6 py-2.5 text-sm">
                Return to Arena Home
              </a>
            </div>
          </Route>
        </Switch>
      </GigaLayout>
      {/* Agentation Visual Feedback Tool (https://www.agentation.com) - Admin Only */}
      <AdminOnlyAgentation />
    </AdminAuthProvider>
  );
};

export default App;
