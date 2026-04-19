import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectsAPI, cyclesAPI } from '../api/services';
import { IconPlus, IconTrash } from '../components/Icons';

const STATUS_COLOR: Record<string, string> = { upcoming: '#6b7280', active: '#10b981', completed: '#3b82f6' };

function BurndownBar({ percent, color }: { percent: number; color: string }) {
  return (
    <div style={{ height: 6, background: 'var(--border)', borderRadius: 999, overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${percent}%`, background: color, borderRadius: 999, transition: 'width 0.6s ease' }} />
    </div>
  );
}

function NewCycleModal({ onClose, onSave }: { onClose: () => void; onSave: (data: any) => Promise<void> }) {
  const today = new Date().toISOString().split('T')[0];
  const twoWeeks = new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0];
  const [form, setForm] = useState({ name: '', startDate: today, endDate: twoWeeks, description: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try { await onSave(form); onClose(); }
    catch (err: any) { alert(err.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <h2 className="modal-title">New Cycle (Sprint)</h2>
        <form onSubmit={handleSubmit} className="flex-col gap-16">
          <div className="form-group">
            <label className="form-label">Cycle Name</label>
            <input className="form-input" placeholder="Sprint 1 — Auth & Core" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })} required autoFocus />
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Start Date</label>
              <input type="date" className="form-input" value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">End Date</label>
              <input type="date" className="form-input" value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })} required />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Description (optional)</label>
            <textarea className="form-textarea" rows={2} value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="flex gap-12">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>
              {loading ? 'Creating...' : 'Create Cycle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CyclesPage() {
  const { id: projectId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [project, setProject]   = useState<any>(null);
  const [cycles, setCycles]     = useState<any[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);  // cycle._id
  const [detail, setDetail]     = useState<Record<string, any>>({});    // { [cycleId]: { burndown, tasks } }
  const [loading, setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [unassigned, setUnassigned] = useState<any[]>([]);   // tasks not in any cycle
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const load = useCallback(async () => {
    if (!projectId) return;
    const [projRes, cycleRes, taskRes] = await Promise.all([
      projectsAPI.get(projectId),
      cyclesAPI.getAll(projectId),
      projectsAPI.getTasks(projectId),
    ]);
    setProject(projRes.data.project);
    setCycles(cycleRes.data.cycles);
    setUnassigned(taskRes.data.tasks.filter((t: any) => !t.cycleId && t.status !== 'done'));
  }, [projectId]);

  useEffect(() => { load().finally(() => setLoading(false)); }, [load]);

  const expandCycle = async (cycleId: string) => {
    if (expanded === cycleId) { setExpanded(null); return; }
    setExpanded(cycleId);
    if (!detail[cycleId] && projectId) {
      const res = await cyclesAPI.get(projectId, cycleId);
      setDetail((prev) => ({ ...prev, [cycleId]: res.data }));
    }
  };

  const createCycle = async (data: any) => {
    if (!projectId) return;
    const res = await cyclesAPI.create(projectId, data);
    setCycles((prev) => [res.data.cycle, ...prev]);
    showToast('Cycle created');
  };

  const deleteCycle = async (cycleId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!projectId) return;
    if (!confirm('Delete this cycle? Tasks will be unassigned.')) return;
    await cyclesAPI.delete(projectId, cycleId);
    setCycles((prev) => prev.filter((c) => c._id !== cycleId));
    if (expanded === cycleId) setExpanded(null);
    showToast('Cycle deleted');
  };

  const addTaskToCycle = async (cycleId: string, taskId: string) => {
    if (!projectId) return;
    await cyclesAPI.addTask(projectId, cycleId, taskId);
    showToast('Task added to cycle');
    setUnassigned((prev) => prev.filter((t) => t._id !== taskId));
    // Refresh detail
    const res = await cyclesAPI.get(projectId, cycleId);
    setDetail((prev) => ({ ...prev, [cycleId]: res.data }));
  };

  const removeTaskFromCycle = async (cycleId: string, taskId: string) => {
    if (!projectId) return;
    await cyclesAPI.removeTask(projectId, cycleId, taskId);
    showToast('Task removed from cycle');
    const res = await cyclesAPI.get(projectId, cycleId);
    setDetail((prev) => ({ ...prev, [cycleId]: res.data }));
    load();
  };

  if (loading) return <div className="loading-screen"><div className="loader" /></div>;

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="flex gap-12" style={{ alignItems: 'center' }}>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/projects')}>← Projects</button>
          <span style={{ color: 'var(--border)', fontSize: 18 }}>|</span>
          <h1 className="page-title" style={{ margin: 0, fontSize: 18 }}>{project?.name}</h1>
          <span className="text-muted">/ Cycles</span>
        </div>
        <div className="flex gap-8">
          <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/projects/${projectId}/board`)}>Board</button>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/projects/${projectId}/issues`)}>Issues</button>
          <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
            <IconPlus size={15} /> New Cycle
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, alignItems: 'start' }}>
        {/* Cycles list */}
        <div className="flex-col gap-12">
          {cycles.length === 0 ? (
            <div className="empty-state" style={{ paddingTop: 60 }}>
              <div style={{ fontSize: 48, opacity: 0.3 }}>◷</div>
              <div className="empty-state-text">No cycles yet. Plan your first sprint!</div>
              <button className="btn btn-primary mt-16" onClick={() => setShowModal(true)}>
                <IconPlus size={15} /> New Cycle
              </button>
            </div>
          ) : cycles.map((cycle) => {
            const d = detail[cycle._id];
            const burndown = d?.burndown || { total: 0, done: 0, remaining: 0, percent: 0 };
            const tasks = d?.tasks || [];
            const isExpanded = expanded === cycle._id;

            return (
              <div key={cycle._id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {/* Cycle header */}
                <div className="flex-between" style={{ padding: '16px 20px', cursor: 'pointer' }}
                  onClick={() => expandCycle(cycle._id)}>
                  <div className="flex gap-12" style={{ alignItems: 'center' }}>
                    <span style={{ fontSize: 20 }}>{isExpanded ? '▾' : '▸'}</span>
                    <div>
                      <div className="flex gap-8" style={{ alignItems: 'center', marginBottom: 2 }}>
                        <span style={{ fontWeight: 700, fontSize: 15 }}>{cycle.name}</span>
                        <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 999, fontWeight: 700,
                          background: STATUS_COLOR[cycle.status] + '22', color: STATUS_COLOR[cycle.status] }}>
                          {cycle.status}
                        </span>
                      </div>
                      <span className="text-xs text-muted">
                        {formatDate(cycle.startDate)} → {formatDate(cycle.endDate)}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-12" style={{ alignItems: 'center' }}>
                    {d && (
                      <div style={{ textAlign: 'right' }}>
                        <div className="text-xs text-muted mb-4">{burndown.done}/{burndown.total} done</div>
                        <div style={{ width: 120 }}>
                          <BurndownBar percent={burndown.percent} color={STATUS_COLOR[cycle.status]} />
                        </div>
                      </div>
                    )}
                    <button className="btn btn-danger btn-icon btn-sm" onClick={(e) => deleteCycle(cycle._id, e)}>
                      <IconTrash size={13} />
                    </button>
                  </div>
                </div>

                {/* Expanded task list */}
                {isExpanded && (
                  <div style={{ borderTop: '1px solid var(--border)', padding: '12px 20px' }}>
                    {tasks.length === 0 ? (
                      <div className="text-sm text-muted" style={{ textAlign: 'center', padding: '16px 0' }}>
                        No tasks in this cycle yet. Add from the backlog →
                      </div>
                    ) : tasks.map((t: any) => (
                      <div key={t._id} className="flex-between" style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                        <div className="flex gap-8" style={{ alignItems: 'center', flex: 1 }}>
                          <span style={{ width: 8, height: 8, borderRadius: '50%', background: STATUS_COLOR[t.status] || '#6b7280', flexShrink: 0 }} />
                          <span style={{ fontSize: 13, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                            textDecoration: t.status === 'done' ? 'line-through' : 'none', color: t.status === 'done' ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                            {t.title}
                          </span>
                        </div>
                        <button className="btn btn-ghost btn-sm" style={{ fontSize: 11, padding: '2px 8px' }}
                          onClick={() => removeTaskFromCycle(cycle._id, t._id)}>
                          Remove
                        </button>
                      </div>
                    ))}

                    {/* Stats */}
                    {d && (
                      <div className="grid-2" style={{ marginTop: 16, gap: 10 }}>
                        {[['Total', burndown.total], ['Done', burndown.done], ['Remaining', burndown.remaining], ['Progress', `${burndown.percent}%`]].map(([label, val]) => (
                          <div key={label} style={{ background: 'var(--bg-secondary)', borderRadius: 8, padding: '10px 14px' }}>
                            <div className="text-xs text-muted">{label}</div>
                            <div style={{ fontWeight: 800, fontSize: 22 }}>{val}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Unassigned backlog panel */}
        <div className="card" style={{ position: 'sticky', top: 0 }}>
          <div className="card-title mb-16">Unassigned Backlog ({unassigned.length})</div>
          {unassigned.length === 0 ? (
            <div className="text-sm text-muted text-center" style={{ padding: '20px 0' }}>All tasks assigned ✓</div>
          ) : (
            <div className="flex-col gap-6" style={{ maxHeight: 'calc(100vh - 240px)', overflowY: 'auto' }}>
              {unassigned.map((t) => (
                <div key={t._id} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px' }}>
                  <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 6,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {t.title}
                  </div>
                  {expanded && (
                    <button className="btn btn-ghost btn-sm w-full" style={{ fontSize: 11, padding: '3px 0' }}
                      onClick={() => addTaskToCycle(expanded, t._id)}>
                      + Add to cycle
                    </button>
                  )}
                  {!expanded && <span className="text-xs text-muted">Expand a cycle to assign</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showModal && <NewCycleModal onClose={() => setShowModal(false)} onSave={createCycle} />}
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
