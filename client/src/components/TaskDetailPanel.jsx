import { useEffect, useState, useRef } from 'react';
import { tasksAPI } from '../api/services';
import { useAuth } from '../context/AuthContext';
import { IconTrash, IconCheck } from '../components/Icons';

const STATUS_OPTIONS   = ['backlog', 'todo', 'in_progress', 'in_review', 'done', 'cancelled'];
const PRIORITY_OPTIONS = ['urgent', 'high', 'medium', 'low', 'no_priority'];

const PRIORITY_COLORS = {
  urgent: '#ef4444', high: '#f97316', medium: '#f59e0b',
  low: '#6b7280', no_priority: 'var(--text-muted)',
};

const STATUS_COLORS = {
  backlog: 'var(--status-backlog)', todo: 'var(--status-todo)',
  in_progress: 'var(--status-in-progress)', in_review: 'var(--status-in-review)',
  done: 'var(--status-done)', cancelled: 'var(--text-muted)',
};

function formatAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days  = Math.floor(hours / 24);
  if (days > 0)  return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (mins > 0)  return `${mins}m ago`;
  return 'just now';
}

export default function TaskDetailPanel({ taskId, onClose, onUpdate }) {
  const { user } = useAuth();
  const [data, setData]       = useState(null);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const panelRef = useRef(null);

  useEffect(() => {
    tasksAPI.get(taskId).then((r) => setData(r.data)).catch(console.error).finally(() => setLoading(false));
  }, [taskId]);

  const update = async (patch) => {
    setSaving(true);
    try {
      const res = await tasksAPI.update(taskId, patch);
      setData((prev) => ({ ...prev, task: res.data.task }));
      onUpdate?.(res.data.task);
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const submitComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    const res = await tasksAPI.addComment(taskId, comment.trim());
    setData((prev) => ({ ...prev, comments: [...prev.comments, res.data.comment] }));
    setComment('');
  };

  const deleteComment = async (commentId) => {
    await tasksAPI.deleteComment(taskId, commentId);
    setData((prev) => ({ ...prev, comments: prev.comments.filter((c) => c._id !== commentId) }));
  };

  // Close on backdrop click
  useEffect(() => {
    const handler = (e) => { if (panelRef.current && !panelRef.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  if (loading) return (
    <div className="task-panel-overlay">
      <div className="task-panel" ref={panelRef}>
        <div className="flex-center" style={{ height: 200 }}><div className="loader" /></div>
      </div>
    </div>
  );

  const { task, comments = [], activity = [] } = data || {};
  if (!task) return null;

  return (
    <div className="task-panel-overlay">
      <div className="task-panel slide-in" ref={panelRef}>
        {/* Header */}
        <div className="task-panel-header">
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕ Close</button>
          {saving && <span className="text-xs text-muted">Saving…</span>}
        </div>

        <div className="task-panel-body">
          {/* Title */}
          <input
            className="task-title-input"
            defaultValue={task.title}
            onBlur={(e) => { if (e.target.value !== task.title) update({ title: e.target.value }); }}
          />

          {/* Description */}
          <textarea
            className="task-desc-input"
            placeholder="Add a description…"
            defaultValue={task.description}
            rows={4}
            onBlur={(e) => { if (e.target.value !== task.description) update({ description: e.target.value }); }}
          />

          {/* Metadata row */}
          <div className="task-meta-grid">
            <div className="task-meta-item">
              <span className="task-meta-label">Status</span>
              <select className="form-select task-meta-select"
                value={task.status} onChange={(e) => update({ status: e.target.value })}>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s.replace('_', ' ')}</option>
                ))}
              </select>
            </div>

            <div className="task-meta-item">
              <span className="task-meta-label">Priority</span>
              <select className="form-select task-meta-select"
                value={task.priority} onChange={(e) => update({ priority: e.target.value })}
                style={{ color: PRIORITY_COLORS[task.priority] }}>
                {PRIORITY_OPTIONS.map((p) => (
                  <option key={p} value={p}>{p.replace('_', ' ')}</option>
                ))}
              </select>
            </div>

            <div className="task-meta-item">
              <span className="task-meta-label">Due Date</span>
              <input type="date" className="form-input task-meta-date"
                value={task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''}
                onChange={(e) => update({ dueDate: e.target.value || null })} />
            </div>

            <div className="task-meta-item">
              <span className="task-meta-label">Estimate</span>
              <select className="form-select task-meta-select"
                value={task.estimate} onChange={(e) => update({ estimate: Number(e.target.value) })}>
                {[0, 1, 2, 3, 5, 8, 13, 21].map((n) => (
                  <option key={n} value={n}>{n === 0 ? 'None' : `${n} pts`}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Activity + Comments */}
          <div className="task-section-title">Activity</div>

          <div className="task-activity">
            {activity.map((a) => (
              <div key={a._id} className="activity-item">
                <div className="activity-dot" />
                <div className="activity-content">
                  <span className="text-sm">{a.message}</span>
                  <span className="text-xs text-muted"> · {formatAgo(a.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="task-section-title">Comments</div>

          <div className="flex-col gap-12" style={{ marginBottom: 16 }}>
            {comments.map((c) => (
              <div key={c._id} className="comment-item">
                <div className="comment-avatar">{c.authorId?.name?.[0]?.toUpperCase() || 'U'}</div>
                <div className="comment-body">
                  <div className="flex-between">
                    <span className="text-sm fw-600">{c.authorId?.name || 'User'}</span>
                    <div className="flex gap-8" style={{ alignItems: 'center' }}>
                      <span className="text-xs text-muted">{formatAgo(c.createdAt)}</span>
                      {c.authorId?._id === user?.id && (
                        <button className="btn btn-danger btn-icon" style={{ padding: '2px 4px' }}
                          onClick={() => deleteComment(c._id)}>
                          <IconTrash size={11} />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="text-sm" style={{ marginTop: 4, whiteSpace: 'pre-wrap' }}>{c.content}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Add comment */}
          <form onSubmit={submitComment} className="flex gap-8">
            <input className="form-input" style={{ flex: 1 }} placeholder="Write a comment…"
              value={comment} onChange={(e) => setComment(e.target.value)} />
            <button type="submit" className="btn btn-primary btn-sm">
              <IconCheck size={14} />
            </button>
          </form>

          {/* Delete task */}
          <div style={{ marginTop: 32, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
            <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)', width: '100%' }}
              onClick={async () => { if (confirm('Delete this task?')) { await tasksAPI.delete(taskId); onClose(); } }}>
              <IconTrash size={14} /> Delete task
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
