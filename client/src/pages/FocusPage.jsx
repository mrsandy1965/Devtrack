import { useEffect, useRef, useState } from 'react';
import { focusAPI, habitsAPI } from '../api/services';

function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default function FocusPage() {
  const [duration, setDuration] = useState(25);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [habits, setHabits] = useState([]);
  const [selectedHabit, setSelectedHabit] = useState('');
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [toast, setToast] = useState('');
  const intervalRef = useRef(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  useEffect(() => {
    habitsAPI.getAll().then((r) => setHabits(r.data.habits)).catch(console.error);
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const [histRes, statsRes] = await Promise.all([focusAPI.getHistory(), focusAPI.getStats()]);
      setHistory(histRes.data.sessions.slice(0, 10));
      setStats(statsRes.data.stats);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    if (running && timeLeft > 0) {
      intervalRef.current = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    } else if (timeLeft === 0 && running) {
      setRunning(false);
      clearInterval(intervalRef.current);
      handleEnd();
      showToast('🎉 Focus session complete!');
    }
    return () => clearInterval(intervalRef.current);
  }, [running, timeLeft]);

  const handleStart = async () => {
    try {
      const res = await focusAPI.start({ duration, habitId: selectedHabit || undefined });
      setSessionId(res.data.session._id);
      setTimeLeft(duration * 60);
      setRunning(true);
    } catch (err) {
      showToast('❌ Failed to start session');
    }
  };

  const handleEnd = async () => {
    if (!sessionId) return;
    try {
      await focusAPI.end(sessionId);
      setSessionId(null);
      setRunning(false);
      clearInterval(intervalRef.current);
      await loadHistory();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReset = () => {
    setRunning(false);
    clearInterval(intervalRef.current);
    setTimeLeft(duration * 60);
    setSessionId(null);
  };

  const progress = 1 - timeLeft / (duration * 60);
  const r = 90;
  const circ = 2 * Math.PI * r;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Focus Mode</h1>
          <p className="page-subtitle">Pomodoro timer · Deep work sessions</p>
        </div>
      </div>

      <div className="grid-2" style={{ alignItems: 'start' }}>
        {/* Timer */}
        <div className="card flex-col flex-center gap-24" style={{ padding: 40 }}>
          <div style={{ position: 'relative', width: 220, height: 220 }}>
            <svg width="220" height="220" viewBox="0 0 220 220" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="110" cy="110" r={r} stroke="var(--border)" strokeWidth="10" fill="none" />
              <circle
                cx="110" cy="110" r={r}
                stroke="url(#timerGrad)" strokeWidth="10" fill="none"
                strokeDasharray={circ}
                strokeDashoffset={circ - progress * circ}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 1s linear' }}
              />
              <defs>
                <linearGradient id="timerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#6c63ff" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="timer-display" style={{ fontSize: 52 }}>{formatTime(timeLeft)}</span>
            </div>
          </div>

          {!running && (
            <div className="flex-col gap-12 w-full">
              <div className="form-group">
                <label className="form-label">Duration (minutes)</label>
                <select className="form-select" value={duration}
                  onChange={(e) => { setDuration(Number(e.target.value)); setTimeLeft(Number(e.target.value) * 60); }}>
                  {[15, 25, 30, 45, 60].map((d) => <option key={d} value={d}>{d} min</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Linked Habit (optional)</label>
                <select className="form-select" value={selectedHabit} onChange={(e) => setSelectedHabit(e.target.value)}>
                  <option value="">None</option>
                  {habits.map((h) => <option key={h._id} value={h._id}>{h.title}</option>)}
                </select>
              </div>
            </div>
          )}

          <div className="flex gap-12">
            {!running ? (
              <button id="start-focus-btn" className="btn btn-primary" onClick={handleStart}>▶ Start</button>
            ) : (
              <>
                <button id="end-focus-btn" className="btn btn-success" onClick={handleEnd}>✓ End</button>
                <button className="btn btn-ghost" onClick={handleReset}>↺ Reset</button>
              </>
            )}
          </div>
        </div>

        {/* Stats + History */}
        <div className="flex-col gap-16">
          {stats && (
            <div className="grid-2">
              <div className="card">
                <div className="card-title">This Week</div>
                <div className="card-value">{stats.weekly?.totalMinutes || 0}<span style={{ fontSize: 16, color: 'var(--text-muted)' }}> min</span></div>
                <div className="text-xs text-muted">{stats.weekly?.sessionCount || 0} sessions</div>
              </div>
              <div className="card">
                <div className="card-title">This Month</div>
                <div className="card-value">{stats.monthly?.totalMinutes || 0}<span style={{ fontSize: 16, color: 'var(--text-muted)' }}> min</span></div>
                <div className="text-xs text-muted">{stats.monthly?.sessionCount || 0} sessions</div>
              </div>
            </div>
          )}

          <div className="card">
            <div className="card-title mb-16">Recent Sessions</div>
            {history.length === 0 ? (
              <div className="text-muted text-sm" style={{ textAlign: 'center', padding: 24 }}>No sessions yet</div>
            ) : (
              <div className="flex-col gap-8">
                {history.map((s) => (
                  <div key={s._id} className="flex-between text-sm" style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                    <div>
                      <span className="fw-700">{s.duration} min</span>
                      {s.habitId && <span className="text-muted"> · {s.habitId.title}</span>}
                    </div>
                    <div className="flex gap-8" style={{ alignItems: 'center' }}>
                      <span className={`badge ${s.completed ? 'badge-offer' : 'badge-rejected'}`}>
                        {s.completed ? '✓ Done' : 'Incomplete'}
                      </span>
                      <span className="text-muted">{new Date(s.sessionDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
