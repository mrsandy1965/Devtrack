import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { path: '/dashboard', icon: '📊', label: 'Dashboard' },
  { path: '/habits', icon: '🔥', label: 'Habits' },
  { path: '/internships', icon: '💼', label: 'Internships' },
  { path: '/focus', icon: '⏱️', label: 'Focus Mode' },
  { path: '/github', icon: '🐙', label: 'GitHub Sync' },
];

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
        <h1>DevTrack</h1>
        <span>Career OS</span>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
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
              <div className="flex-col" style={{ overflow: 'hidden' }}>
                <span style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.name}
                </span>
                <span className="text-xs text-muted">Score: {user.careerScore || 0}</span>
              </div>
            </div>
            <button className="btn btn-ghost btn-sm w-full" onClick={handleLogout}>
              🚪 Logout
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
