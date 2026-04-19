import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { tasksAPI } from '../api/services';

interface CommandPaletteProps {
  onClose: () => void;
}

export default function CommandPalette({ onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    if (query.trim().length < 2) { setResults([]); return; }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await tasksAPI.search(query.trim());
        setResults(res.data.results || []);
        setSelected(0);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape')    { onClose(); return; }
    if (e.key === 'ArrowDown') { setSelected((s) => Math.min(s + 1, results.length - 1)); e.preventDefault(); }
    if (e.key === 'ArrowUp')   { setSelected((s) => Math.max(s - 1, 0)); e.preventDefault(); }
    if (e.key === 'Enter' && results[selected]) {
      navigate(`/projects/${results[selected].projectId?._id || results[selected].projectId}/board`);
      onClose();
    }
  };

  const QUICK_ACTIONS = [
    { label: 'Go to Dashboard',    path: '/dashboard',   icon: '⬡' },
    { label: 'All Projects',       path: '/projects',    icon: '▤' },
    { label: 'Habits',             path: '/habits',      icon: '◎' },
    { label: 'Focus Mode',         path: '/focus',       icon: '◷' },
    { label: 'Internship Tracker', path: '/internships', icon: '◆' },
    { label: 'GitHub Sync',        path: '/github',      icon: '◉' },
  ];

  return (
    <div className="palette-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="palette">
        <div className="palette-search">
          <span className="palette-icon">⌕</span>
          <input
            ref={inputRef}
            className="palette-input"
            placeholder="Search tasks, navigate…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          {loading && <div className="loader" style={{ width: 16, height: 16 }} />}
          <span className="palette-esc" onClick={onClose}>ESC</span>
        </div>

        <div className="palette-body">
          {query.trim().length >= 2 ? (
            results.length > 0 ? (
              <>
                <div className="palette-section-label">Tasks</div>
                {results.map((task, i) => (
                  <div key={task._id}
                    className={`palette-item ${i === selected ? 'selected' : ''}`}
                    onClick={() => {
                      navigate(`/projects/${task.projectId?._id || task.projectId}/board`);
                      onClose();
                    }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 11, padding: '1px 6px', borderRadius: 4, background: 'var(--accent-glow)', color: 'var(--accent-light)', fontFamily: 'monospace' }}>
                        {task.status?.replace('_', ' ')}
                      </span>
                      <span style={{ flex: 1, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {task.title}
                      </span>
                    </div>
                    {task.projectId?.name && (
                      <span className="text-xs text-muted">{task.projectId.name}</span>
                    )}
                  </div>
                ))}
              </>
            ) : (
              <div className="palette-empty">No tasks found for "{query}"</div>
            )
          ) : (
            <>
              <div className="palette-section-label">Quick Navigation</div>
              {QUICK_ACTIONS.map((a, i) => (
                <div key={a.path} className={`palette-item ${i === selected ? 'selected' : ''}`}
                  onClick={() => { navigate(a.path); onClose(); }}>
                  <span style={{ fontSize: 16, width: 20, textAlign: 'center' }}>{a.icon}</span>
                  <span style={{ fontSize: 14 }}>{a.label}</span>
                  <span className="text-xs text-muted" style={{ marginLeft: 'auto' }}>{a.path}</span>
                </div>
              ))}
            </>
          )}
        </div>

        <div className="palette-footer">
          <span>↑↓ navigate</span>
          <span>↵ open</span>
          <span>ESC close</span>
        </div>
      </div>
    </div>
  );
}
