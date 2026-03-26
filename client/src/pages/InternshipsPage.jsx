import { useEffect, useState } from 'react';
import { internshipsAPI } from '../api/services';

const STATUSES = ['Applied', 'OA', 'Interview', 'Rejected', 'Offer'];
const STATUS_COLORS = {
  Applied: 'badge-applied', OA: 'badge-oa', Interview: 'badge-interview',
  Rejected: 'badge-rejected', Offer: 'badge-offer',
};

function AppModal({ onClose, onSave }) {
  const [form, setForm] = useState({ companyName: '', role: '', status: 'Applied', jobLink: '', notes: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(form);
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <h2 className="modal-title">Add Application</h2>
        <form onSubmit={handleSubmit} className="flex-col gap-16">
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Company</label>
              <input className="form-input" placeholder="Google" value={form.companyName}
                onChange={(e) => setForm({ ...form, companyName: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Role</label>
              <input className="form-input" placeholder="SWE Intern" value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })} required />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="form-select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              {STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Job Link</label>
            <input className="form-input" placeholder="https://careers.google.com/..." value={form.jobLink}
              onChange={(e) => setForm({ ...form, jobLink: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea className="form-textarea" placeholder="Any notes..." value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
          <div className="flex gap-12">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>
              {loading ? 'Saving...' : 'Add Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function InternshipsPage() {
  const [apps, setApps] = useState([]);
  const [stats, setStats] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const [appsRes, statsRes] = await Promise.all([internshipsAPI.getAll(), internshipsAPI.getStats()]);
    setApps(appsRes.data.applications);
    setStats(statsRes.data.stats);
  };

  useEffect(() => { load().finally(() => setLoading(false)); }, []);

  const handleCreate = async (data) => {
    await internshipsAPI.create(data);
    await load();
  };

  const handleStatusChange = async (id, status) => {
    await internshipsAPI.updateStatus(id, status);
    await load();
  };

  const handleDelete = async (id) => {
    await internshipsAPI.remove(id);
    setApps((p) => p.filter((a) => a._id !== id));
  };

  if (loading) return <div className="loading-screen"><div className="loader" /></div>;

  // Group by status for Kanban view
  const grouped = STATUSES.reduce((acc, s) => ({ ...acc, [s]: apps.filter((a) => a.status === s) }), {});

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Internship Tracker</h1>
          <p className="page-subtitle">
            {stats.total || 0} applications · Offer rate: {stats.offerRate || 0}% · Interview rate: {stats.interviewRate || 0}%
          </p>
        </div>
        <button id="add-app-btn" className="btn btn-primary" onClick={() => setShowModal(true)}>
          + Add Application
        </button>
      </div>

      {/* Funnel Overview */}
      <div className="grid-5" style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 12, marginBottom: 24 }}>
        {STATUSES.map((s) => (
          <div key={s} className="card" style={{ textAlign: 'center' }}>
            <div className="card-title">{s}</div>
            <div className="card-value" style={{ fontSize: 28 }}>{stats[s] || 0}</div>
          </div>
        ))}
      </div>

      {/* Kanban Board */}
      <div className="funnel-stages">
        {STATUSES.map((status) => (
          <div key={status} className="funnel-stage">
            <div className={`funnel-stage-title ${STATUS_COLORS[status]}`} style={{ padding: '2px 8px', borderRadius: 100, display: 'inline-block', marginBottom: 12 }}>
              {status} ({grouped[status].length})
            </div>
            <div className="flex-col gap-8">
              {grouped[status].map((app) => (
                <div key={app._id} style={{
                  background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                  borderRadius: 8, padding: '10px 12px',
                }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{app.companyName}</div>
                  <div className="text-xs text-muted">{app.role}</div>
                  <div className="flex gap-4 mt-8" style={{ flexWrap: 'wrap' }}>
                    {STATUSES.filter((s) => s !== status).map((s) => (
                      <button key={s} className="btn btn-ghost" style={{ fontSize: 10, padding: '2px 8px', borderRadius: 4 }}
                        onClick={() => handleStatusChange(app._id, s)}>
                        → {s}
                      </button>
                    ))}
                    <button className="btn btn-danger" style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4 }}
                      onClick={() => handleDelete(app._id)}>🗑</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {showModal && <AppModal onClose={() => setShowModal(false)} onSave={handleCreate} />}
    </div>
  );
}
