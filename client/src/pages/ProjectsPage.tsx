import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectsAPI } from '../api/services';
import { IconPlus, IconBriefcase } from '../components/Icons';

const PROJECT_COLORS = [
  '#6c63ff', '#3b82f6', '#10b981', '#f59e0b',
  '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4',
];

const PROJECT_ICONS = ['folder', 'code', 'star', 'rocket', 'bolt', 'brain', 'target', 'chart'];

const ICON_SVG: Record<string, React.ReactNode> = {
  folder: <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />,
  code:   <><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></>,
  star:   <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />,
  rocket: <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09zM12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />,
  bolt:   <><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" /></>,
  brain:  <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.17Z M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.17Z" />,
  target: <><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></>,
  chart:  <><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></>,
};

function ProjectIcon({ icon = 'folder', color = '#6c63ff', size = 20 }: { icon?: string; color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {ICON_SVG[icon] || ICON_SVG.folder}
    </svg>
  );
}

function NewProjectModal({ onClose, onCreate }: { onClose: () => void; onCreate: (data: any) => Promise<void> }) {
  const [form, setForm] = useState({ name: '', description: '', color: '#6c63ff', icon: 'folder' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onCreate(form);
      onClose();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 480 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: form.color + '22', border: `2px solid ${form.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ProjectIcon icon={form.icon} color={form.color} size={22} />
          </div>
          <h2 className="modal-title" style={{ margin: 0 }}>New Project</h2>
        </div>

        <form onSubmit={handleSubmit} className="flex-col gap-16">
          <div className="form-group">
            <label className="form-label">Project Name</label>
            <input className="form-input" placeholder="My Awesome Project" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })} required autoFocus />
          </div>

          <div className="form-group">
            <label className="form-label">Description (optional)</label>
            <textarea className="form-textarea" rows={2} placeholder="What's this project about?"
              value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>

          <div className="form-group">
            <label className="form-label">Color</label>
            <div className="flex gap-8" style={{ flexWrap: 'wrap' }}>
              {PROJECT_COLORS.map((c) => (
                <button key={c} type="button" onClick={() => setForm({ ...form, color: c })}
                  style={{ width: 28, height: 28, borderRadius: 6, background: c, border: form.color === c ? '3px solid white' : '2px solid transparent', cursor: 'pointer', flexShrink: 0 }} />
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Icon</label>
            <div className="flex gap-8" style={{ flexWrap: 'wrap' }}>
              {PROJECT_ICONS.map((icon) => (
                <button key={icon} type="button" onClick={() => setForm({ ...form, icon })}
                  style={{ width: 36, height: 36, borderRadius: 8, background: form.icon === icon ? form.color + '33' : 'var(--bg-secondary)', border: form.icon === icon ? `2px solid ${form.color}` : '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <ProjectIcon icon={icon} color={form.icon === icon ? form.color : 'var(--text-muted)'} size={16} />
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-12 mt-8">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>
              {loading ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export { ProjectIcon };

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    projectsAPI.getAll()
      .then((r) => setProjects(r.data.projects))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async (data: any) => {
    const res = await projectsAPI.create(data);
    setProjects((prev) => [res.data.project, ...prev]);
  };

  if (loading) return <div className="loading-screen"><div className="loader" /></div>;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="page-subtitle">{projects.length} active project{projects.length !== 1 ? 's' : ''}</p>
        </div>
        <button id="create-project-btn" className="btn btn-primary" onClick={() => setShowModal(true)}>
          <IconPlus size={16} /> New Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="empty-state" style={{ marginTop: 80 }}>
          <div style={{ opacity: 0.4, marginBottom: 16 }}><IconBriefcase size={56} color="var(--text-muted)" /></div>
          <div className="empty-state-text">No projects yet. Create your first one!</div>
          <button className="btn btn-primary mt-16" onClick={() => setShowModal(true)}>
            <IconPlus size={16} /> Create Project
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {projects.map((project) => {
            const total  = project.stats?.total  || 0;
            const done   = project.stats?.done   || 0;
            const progress = total > 0 ? Math.round((done / total) * 100) : 0;

            return (
              <div key={project._id} className="project-card"
                onClick={() => navigate(`/projects/${project._id}/board`)}
                style={{ cursor: 'pointer' }}>
                {/* Header */}
                <div className="flex gap-12" style={{ alignItems: 'center', marginBottom: 16 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 10, background: project.color + '22', border: `1.5px solid ${project.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <ProjectIcon icon={project.icon} color={project.color} size={20} />
                  </div>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ fontWeight: 700, fontSize: 15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {project.name}
                    </div>
                    <div className="text-xs text-muted" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {project.description || 'No description'}
                    </div>
                  </div>
                </div>

                {/* Status chips */}
                <div className="flex gap-6" style={{ flexWrap: 'wrap', marginBottom: 16 }}>
                  {['todo', 'in_progress', 'done'].map((s) => (
                    (project.stats?.[s] || 0) > 0 && (
                      <span key={s} className={`badge badge-status-${s}`}>
                        {project.stats[s]} {s.replace('_', ' ')}
                      </span>
                    )
                  ))}
                  {total === 0 && <span className="text-xs text-muted">No tasks yet</span>}
                </div>

                {/* Progress bar */}
                {total > 0 && (
                  <div>
                    <div className="flex-between text-xs text-muted" style={{ marginBottom: 4 }}>
                      <span>{done}/{total} done</span>
                      <span>{progress}%</span>
                    </div>
                    <div style={{ height: 4, background: 'var(--border)', borderRadius: 999, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${progress}%`, background: project.color, borderRadius: 999, transition: 'width 0.5s ease' }} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showModal && <NewProjectModal onClose={() => setShowModal(false)} onCreate={handleCreate} />}
    </div>
  );
}
