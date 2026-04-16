import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  IconDashboard, IconFlame, IconBriefcase,
  IconTimer, IconGithub, IconLogout,
} from './Icons';

const NAV_ITEMS = [
  { path: '/dashboard',   Icon: IconDashboard,  label: 'Dashboard' },
  { path: '/habits',      Icon: IconFlame,       label: 'Habits' },
  { path: '/internships', Icon: IconBriefcase,   label: 'Internships' },
  { path: '/focus',       Icon: IconTimer,       label: 'Focus Mode' },
  { path: '/github',      Icon: IconGithub,      label: 'GitHub Sync' },
];

// DevTrack wordmark SVG logo
function DevTrackLogo() {
  return (
    <svg width="130" height="28" viewBox="0 0 130 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="6" width="16" height="16" rx="3" fill="url(#logoGrad)" />
      <path d="M4 14 L8 10 L12 14 L8 18 Z" fill="white" opacity="0.9" />
      <defs>
        <linearGradient id="logoGrad" x1="0" y1="0" x2="16" y2="16" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6c63ff" />
          <stop offset="1" stopColor="#8b85ff" />
        </linearGradient>
      </defs>
      <text x="22" y="20" fontFamily="Inter, sans-serif" fontWeight="800" fontSize="15" fill="url(#textGrad)">DevTrack</text>
      <defs>
        <linearGradient id="textGrad" x1="22" y1="0" x2="130" y2="0" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8b85ff" />
          <stop offset="1" stopColor="#6c63ff" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <DevTrackLogo />
        <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginTop: 4 }}>
          Career OS
        </span>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map(({ path, Icon, label }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">
              <Icon size={18} />
            </span>
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
