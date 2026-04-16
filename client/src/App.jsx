import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import CommandPalette from './components/CommandPalette';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import HabitsPage from './pages/HabitsPage';
import InternshipsPage from './pages/InternshipsPage';
import FocusPage from './pages/FocusPage';
import GitHubPage from './pages/GitHubPage';
import ProjectsPage from './pages/ProjectsPage';
import BoardPage from './pages/BoardPage';
import IssuesPage from './pages/IssuesPage';
import CyclesPage from './pages/CyclesPage';
import './index.css';

function AppShell({ children }) {
  const [showPalette, setShowPalette] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowPalette((prev) => !prev);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className="app-layout">
      <Sidebar onOpenPalette={() => setShowPalette(true)} />
      <main className="main-content">{children}</main>
      {showPalette && <CommandPalette onClose={() => setShowPalette(false)} />}
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="loader" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  return <AppShell>{children}</AppShell>;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="loader" /></div>;
  if (user) return <Navigate to="/projects" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login"    element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

          {/* App pages */}
          <Route path="/dashboard"    element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/habits"       element={<ProtectedRoute><HabitsPage /></ProtectedRoute>} />
          <Route path="/internships"  element={<ProtectedRoute><InternshipsPage /></ProtectedRoute>} />
          <Route path="/focus"        element={<ProtectedRoute><FocusPage /></ProtectedRoute>} />
          <Route path="/github"       element={<ProtectedRoute><GitHubPage /></ProtectedRoute>} />

          {/* Project management */}
          <Route path="/projects"                  element={<ProtectedRoute><ProjectsPage /></ProtectedRoute>} />
          <Route path="/projects/:id/board"        element={<ProtectedRoute><BoardPage /></ProtectedRoute>} />
          <Route path="/projects/:id/issues"       element={<ProtectedRoute><IssuesPage /></ProtectedRoute>} />
          <Route path="/projects/:id/cycles"       element={<ProtectedRoute><CyclesPage /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/projects" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
