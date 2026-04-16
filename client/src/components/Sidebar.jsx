import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { projectsAPI } from '../api/services';
import {
  IconDashboard, IconFlame, IconBriefcase,
  IconTimer, IconGithub, IconLogout, IconPlus,
} from './Icons';

const MAIN_NAV = [
  { path: '/dashboard',   Icon: IconDashboard,  label: 'Dashboard' },
  { path: '/habits',      Icon: IconFlame,       label: 'Habits' },
  { path: '/internships', Icon: IconBriefcase,   label: 'Internships' },
  { path: '/focus',       Icon: IconTimer,       label: 'Focus Mode' },
  { path: '/github',      Icon: IconGithub,      label: 'GitHub Sync' },
];

const PROJECT_COLORS_MAP = {};

function DevTrackLogo() {
  return (
    <svg width="130" height="28" viewBox="0 0 130 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="6" width="16" height="16" rx="3" fill="url(#logoGrad2)" />
      <path d="M4 14 L8 10 L12 14 L8 18 Z" fill="white" opacity="0.9" />
      <defs>
        <linearGradient id="logoGrad2" x1="0" y1="0" x2="16" y2="16" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6c63ff" />
          <stop offset="1" stopColor="#8b85ff" />
        </linearGradient>
      </defs>
      <text x="22" y="20" fontFamily="Inter, sans-serif" fontWeight="800" fontSize="15" fill="url(#textGrad2)">DevTrack</text>
      <defs>
        <linearGradient id="textGrad2" x1="22" y1="0" x2="130" y2="0" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8b85ff" />
          <stop offset="1" stopColor="#6c63ff" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function Sidebar({ onOpenPalette }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    if (user) {
      projectsAPI.getAll()
        .then((r) => setProjects(r.data.projects.slice(0, 8)))
        .catch(() => {});
    }
  }, [user]);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <DevTrackLogo />
        <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginTop: 4 }}>
          Career OS
        </span>
      </div>

      {/* Cmd+K Search */}
      <div style={{ padding: '8px 12px' }}>
        <button
          onClick={onOpenPalette}
          style={{
            display: 'flex', alignItems: 'center', gap: 8, width: '100%',
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 8, padding: '7px 12px', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 13,
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--border-accent)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
        >
          <span style={{ fontSize: 14 }}>⌕</span>
          <span style={{ flex: 1, textAlign: 'left' }}>Search…</span>
          <span style={{ fontSize: 10, background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 4, padding: '1px 5px' }}>
            ⌘K
          </span>
        </button>
      </div>

      <nav className="sidebar-nav" style={{ overflowY: 'auto' }}>
        {/* Projects section */}
        <div style={{ marginBottom: 4 }}>
          <div className="flex-between" style={{ padding: '4px 4px 4px 8px', marginBottom: 2 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Projects
            </span>
            <button onClick={() => navigate('/projects')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '2px 4px', borderRadius: 4 }}
              title="New project">
              <IconPlus size={13} />
            </button>
          </div>

          {/* All projects link */}
          <NavLink to="/projects" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <span style={{ fontSize: 16 }}>▤</span>
            All Projects
          </NavLink>

          {/* Individual project links */}
          {projects.map((p) => (
            <NavLink
              key={p._id}
              to={`/projects/${p._id}/board`}
              className={({ isActive }) => `nav-item ${location.pathname.startsWith(`/projects/${p._id}`) ? 'active' : ''}`}
              style={{ paddingLeft: 20, fontSize: 13 }}
            >
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: p.color, flexShrink: 0 }} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                {p.name}
              </span>
            </NavLink>
          ))}
        </div>

        <div style={{ height: 1, background: 'var(--border)', margin: '8px 0' }} />

        {/* Career OS section */}
        <div style={{ padding: '4px 4px 4px 8px', marginBottom: 2 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Career OS
          </span>
        </div>
        {MAIN_NAV.map(({ path, Icon, label }) => (
          <NavLink key={path} to={path} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-icon"><Icon size={17} /></span>
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        {user && (
          <div className="flex-col gap-12">
            <div className="flex gap-8" style={{ alignItems: 'center' }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--accent), var(--accent-light))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 700, color: 'white', flexShrink: 0,
              }}>
                {user.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="flex-col" style={{ overflow: 'hidden', flex: 1 }}>
                <span style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.name}
                </span>
                <span className="text-xs text-muted">Score: {user.careerScore || 0}</span>
              </div>
            </div>
            <button className="btn btn-ghost btn-sm w-full" onClick={handleLogout}
              style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <IconLogout size={15} />
              Logout
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
