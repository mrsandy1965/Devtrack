import { useEffect, useState } from 'react';
import { habitsAPI } from '../api/services';
import { HabitTypeIcon, IconPlus, IconCheck, IconTrash } from '../components/Icons';

function HabitModal({ onClose, onSave }) {
  const [form, setForm] = useState({ title: '', type: 'dsa', recurrence: 'daily', targetPerDay: 1, githubLinked: false });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(form);
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create habit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <h2 className="modal-title">New Habit</h2>
        <form onSubmit={handleSubmit} className="flex-col gap-16">
          <div className="form-group">
            <label className="form-label">Title</label>
            <input className="form-input" placeholder="Solve 2 DSA problems daily" value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Type</label>
              <select className="form-select" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                <option value="dsa">DSA</option>
                <option value="project">Project</option>
                <option value="learning">Learning</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Recurrence</label>
              <select className="form-select" value={form.recurrence} onChange={(e) => setForm({ ...form, recurrence: e.target.value })}>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', gap: 8, alignItems: 'center', cursor: 'pointer' }}>
              <input type="checkbox" checked={form.githubLinked} onChange={(e) => setForm({ ...form, githubLinked: e.target.checked })} />
              Link to GitHub commits
            </label>
          </div>
          <div className="flex gap-12">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>
              {loading ? 'Creating...' : 'Create Habit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function HabitsPage() {
  const [habits, setHabits] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  useEffect(() => {
    habitsAPI.getAll().then((r) => setHabits(r.data.habits)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleCreate = async (data) => {
    const res = await habitsAPI.create(data);
    setHabits((prev) => [res.data.habit, ...prev]);
    showToast('Habit created successfully');
  };

  const handleLog = async (habitId) => {
    try {
      const res = await habitsAPI.log(habitId, { source: 'manual', notes: '' });
      setHabits((prev) => prev.map((h) => h._id === habitId ? { ...h, streak: res.data.streak } : h));
      showToast(`Logged! Streak: ${res.data.streak} days`);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to log');
    }
  };

  const handleDelete = async (id) => {
    await habitsAPI.remove(id);
    setHabits((prev) => prev.filter((h) => h._id !== id));
  };

  if (loading) return <div className="loading-screen"><div className="loader" /></div>;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Habits</h1>
          <p className="page-subtitle">Build consistency, one day at a time</p>
        </div>
        <button id="create-habit-btn" className="btn btn-primary" onClick={() => setShowModal(true)}>
          <IconPlus size={16} /> New Habit
        </button>
      </div>

      {habits.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><IconFlameEmpty /></div>
          <div className="empty-state-text">No habits yet. Create your first one!</div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <IconPlus size={16} /> Create Habit
          </button>
        </div>
      ) : (
        <div className="flex-col gap-12">
          {habits.map((habit) => (
            <div key={habit._id} className="habit-card">
              <div className="flex gap-16" style={{ alignItems: 'center', flex: 1 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 10,
                  background: 'var(--accent-glow)',
                  border: '1px solid var(--border-accent)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <HabitTypeIcon type={habit.type} size={22} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{habit.title}</div>
                  <div className="text-xs text-muted mt-4">
                    {habit.recurrence} · {habit.type}
                    {habit.githubLinked && (
                      <span style={{ marginLeft: 6, color: 'var(--accent-light)' }}>· GitHub linked</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-12" style={{ alignItems: 'center' }}>
                <div className="habit-streak">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="var(--warning)" style={{ flexShrink: 0 }}>
                    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
                  </svg>
                  <span>{habit.streak}</span>
                </div>
                <button id={`log-habit-${habit._id}`} className="btn btn-success btn-sm" onClick={() => handleLog(habit._id)}>
                  <IconCheck size={14} /> Log
                </button>
                <button className="btn btn-danger btn-icon btn-sm" onClick={() => handleDelete(habit._id)} title="Remove habit">
                  <IconTrash size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && <HabitModal onClose={() => setShowModal(false)} onSave={handleCreate} />}
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

function IconFlameEmpty() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </svg>
  );
}
