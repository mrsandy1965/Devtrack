import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectsAPI, tasksAPI } from '../api/services';
import { IconPlus, IconTrash } from '../components/Icons';
import TaskDetailPanel from '../components/TaskDetailPanel';

const STATUSES   = ['backlog', 'todo', 'in_progress', 'in_review', 'done', 'cancelled'];
const PRIORITIES = ['urgent', 'high', 'medium', 'low', 'no_priority'];

const STATUS_COLOR: Record<string, string> = {
  backlog: '#64748b', todo: '#3b82f6', in_progress: '#8b5cf6',
  in_review: '#f59e0b', done: '#10b981', cancelled: '#6b7280',
};
const PRIORITY_COLOR: Record<string, string> = {
  urgent: '#ef4444', high: '#f97316', medium: '#f59e0b', low: '#6b7280', no_priority: '#3f3f46',
};

function PriorityDot({ p }: { p: string }) {
  return <span style={{ width: 8, height: 8, borderRadius: '50%', background: PRIORITY_COLOR[p] || '#3f3f46', display: 'inline-block', flexShrink: 0 }} />;
}

function StatusPill({ s }: { s: string }) {
  return (
    <span style={{
      fontSize: 11, padding: '2px 8px', borderRadius: 999, fontWeight: 600,
      background: STATUS_COLOR[s] + '22', color: STATUS_COLOR[s],
    }}>
      {s.replace('_', ' ')}
    </span>
  );
}

export default function IssuesPage() {
  const { id: projectId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [project, setProject]         = useState<any>(null);
  const [tasks, setTasks]             = useState<any[]>([]);
  const [loading, setLoading]         = useState(true);
  const [selected, setSelected]       = useState<Set<string>>(new Set());
  const [filterStatus, setFilterStatus]     = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [groupBy, setGroupBy]         = useState('status');  // 'status' | 'priority' | 'none'
  const [showCreate, setShowCreate]   = useState(false);
  const [newTitle, setNewTitle]       = useState('');
  const [detailTaskId, setDetailTaskId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!projectId) return;
    const [projRes, tasksRes] = await Promise.all([
      projectsAPI.get(projectId),
      projectsAPI.getTasks(projectId, {
        ...(filterStatus   ? { status: filterStatus }     : {}),
        ...(filterPriority ? { priority: filterPriority } : {}),
      }),
    ]);
    setProject(projRes.data.project);
    setTasks(tasksRes.data.tasks);
  }, [projectId, filterStatus, filterPriority]);

  useEffect(() => { load().finally(() => setLoading(false)); }, [load]);

  // ── Quick create ────────────────────────────────────────────────────────────
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !projectId) return;
    const res = await tasksAPI.create(projectId, { title: newTitle.trim() });
    setTasks((prev) => [res.data.task, ...prev]);
    setNewTitle('');
    setShowCreate(false);
  };

  // ── Bulk ops ────────────────────────────────────────────────────────────────
  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const bulkStatusChange = async (status: string) => {
    await Promise.all([...selected].map((id) => tasksAPI.update(id, { status })));
    await load();
    setSelected(new Set());
  };

  const bulkDelete = async () => {
    if (!confirm(`Delete ${selected.size} task(s)?`)) return;
    await Promise.all([...selected].map((id) => tasksAPI.delete(id)));
    setTasks((prev) => prev.filter((t) => !selected.has(t._id)));
    setSelected(new Set());
  };

  // ── Grouping ─────────────────────────────────────────────────────────────────
  const grouped = (() => {
    const filtered = tasks
      .filter((t) => !filterStatus   || t.status === filterStatus)
      .filter((t) => !filterPriority || t.priority === filterPriority);

    if (groupBy === 'none') return { All: filtered };

    const keys = groupBy === 'status' ? STATUSES : PRIORITIES;
    const result: Record<string, any[]> = {};
    keys.forEach((k) => {
      const group = filtered.filter((t) => t[groupBy] === k);
      if (group.length > 0) result[k] = group;
    });
    return result;
  })();

  if (loading) return <div className="loading-screen"><div className="loader" /></div>;

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="page-header">
        <div className="flex gap-12" style={{ alignItems: 'center' }}>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/projects')}>← Projects</button>
          <span style={{ color: 'var(--border)', fontSize: 18 }}>|</span>
          <h1 className="page-title" style={{ margin: 0, fontSize: 18 }}>{project?.name}</h1>
        </div>
        <div className="flex gap-8">
          <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/projects/${projectId}/board`)}>
            Board View
          </button>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/projects/${projectId}/cycles`)}>
            Cycles
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => setShowCreate(true)}>
            <IconPlus size={15} /> New Issue
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex gap-10" style={{ marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <select className="form-select" style={{ width: 'auto', padding: '6px 10px', fontSize: 13 }}
          value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">All Statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
        </select>
        <select className="form-select" style={{ width: 'auto', padding: '6px 10px', fontSize: 13 }}
          value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
          <option value="">All Priorities</option>
          {PRIORITIES.map((p) => <option key={p} value={p}>{p.replace('_', ' ')}</option>)}
        </select>
        <div className="flex gap-4" style={{ marginLeft: 'auto', alignItems: 'center' }}>
          <span className="text-xs text-muted">Group:</span>
          {['status', 'priority', 'none'].map((g) => (
            <button key={g} onClick={() => setGroupBy(g)}
              className={`btn btn-ghost btn-sm ${groupBy === g ? 'active' : ''}`}
              style={{ padding: '4px 10px', fontSize: 12, ...(groupBy === g ? { borderColor: 'var(--accent)', color: 'var(--accent-light)' } : {}) }}>
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div style={{
          position: 'sticky', top: 0, zIndex: 50, background: 'var(--accent-glow)',
          border: '1px solid var(--border-accent)', borderRadius: 10, padding: '10px 16px',
          marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <span className="text-sm fw-600">{selected.size} selected</span>
          <span className="text-muted">→ Move to:</span>
          {['todo', 'in_progress', 'done'].map((s) => (
            <button key={s} className="btn btn-ghost btn-sm" style={{ padding: '4px 10px', fontSize: 12 }}
              onClick={() => bulkStatusChange(s)}>
              {s.replace('_', ' ')}
            </button>
          ))}
          <button className="btn btn-danger btn-sm" style={{ marginLeft: 'auto', padding: '4px 10px' }} onClick={bulkDelete}>
            <IconTrash size={13} /> Delete
          </button>
          <button className="btn btn-ghost btn-sm" onClick={() => setSelected(new Set())}>Cancel</button>
        </div>
      )}

      {/* Quick create */}
      {showCreate && (
        <form onSubmit={handleCreate} className="flex gap-8" style={{ marginBottom: 12 }}>
          <input autoFocus className="form-input" placeholder="Issue title…" value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Escape') setShowCreate(false); }} />
          <button className="btn btn-primary btn-sm" type="submit">Add</button>
          <button className="btn btn-ghost btn-sm" type="button" onClick={() => setShowCreate(false)}>Cancel</button>
        </form>
      )}

      {/* Issue groups */}
      {Object.entries(grouped).map(([groupKey, groupTasks]) => (
        <div key={groupKey} style={{ marginBottom: 24 }}>
          <div className="flex gap-10" style={{ alignItems: 'center', marginBottom: 6, padding: '4px 0' }}>
            {groupBy === 'status'   && <StatusPill s={groupKey} />}
            {groupBy === 'priority' && (
              <div className="flex gap-6" style={{ alignItems: 'center' }}>
                <PriorityDot p={groupKey} />
                <span style={{ fontSize: 13, fontWeight: 600, color: PRIORITY_COLOR[groupKey] }}>
                  {groupKey.replace('_', ' ')}
                </span>
              </div>
            )}
            {groupBy === 'none' && <span className="text-sm fw-600">All Issues</span>}
            <span className="board-column-count">{groupTasks.length}</span>
          </div>

          <div className="issues-table">
            {groupTasks.map((task: any) => {
              const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';
              return (
                <div key={task._id} className={`issue-row ${selected.has(task._id) ? 'selected' : ''}`}>
                  <input type="checkbox" checked={selected.has(task._id)}
                    onChange={() => toggleSelect(task._id)}
                    onClick={(e) => e.stopPropagation()}
                    style={{ flexShrink: 0 }} />
                  <PriorityDot p={task.priority} />
                  <div style={{ flex: 1, overflow: 'hidden', cursor: 'pointer' }}
                    onClick={() => setDetailTaskId(task._id)}>
                    <span style={{ fontSize: 14, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block', textDecoration: task.status === 'done' ? 'line-through' : 'none', color: task.status === 'done' ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                      {task.title}
                    </span>
                  </div>
                  {task.labels?.length > 0 && (
                    <div className="flex gap-4">
                      {task.labels.map((l: any, i: number) => (
                        <span key={i} style={{ fontSize: 10, padding: '2px 7px', borderRadius: 999, background: l.color + '33', color: l.color, fontWeight: 600 }}>
                          {l.name}
                        </span>
                      ))}
                    </div>
                  )}
                  {groupBy !== 'status' && <StatusPill s={task.status} />}
                  {task.dueDate && (
                    <span style={{ fontSize: 11, color: isOverdue ? 'var(--danger)' : 'var(--text-muted)', flexShrink: 0 }}>
                      {new Date(task.dueDate).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                    </span>
                  )}
                  {task.estimate > 0 && (
                    <span style={{ fontSize: 11, padding: '1px 6px', borderRadius: 4, background: 'var(--bg-secondary)', color: 'var(--text-muted)', flexShrink: 0 }}>
                      {task.estimate}pt
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {tasks.length === 0 && (
        <div className="empty-state">
          <div style={{ opacity: 0.3, fontSize: 48 }}>◎</div>
          <div className="empty-state-text">No issues yet</div>
          <button className="btn btn-primary mt-16" onClick={() => setShowCreate(true)}>
            <IconPlus size={15} /> Create first issue
          </button>
        </div>
      )}

      {detailTaskId && (
        <TaskDetailPanel taskId={detailTaskId} onClose={() => setDetailTaskId(null)}
          onUpdate={() => { setDetailTaskId(null); load(); }} />
      )}
    </div>
  );
}
