import { useEffect, useState } from 'react';
import { githubAPI } from '../api/services';
import { useAuth } from '../context/AuthContext';

export default function GitHubPage() {
  const { user, updateUser } = useAuth();
  const [username, setUsername] = useState(user?.githubUsername || '');
  const [token, setToken] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [syncResult, setSyncResult] = useState(null);
  const [heatmap, setHeatmap] = useState([]);
  const [toast, setToast] = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3500); };

  useEffect(() => {
    if (user?.githubUsername) {
      githubAPI.getHeatmap().then((r) => setHeatmap(r.data.heatmap)).catch(console.error);
    }
  }, [user]);

  const handleConnect = async (e) => {
    e.preventDefault();
    setConnecting(true);
    try {
      const res = await githubAPI.connect({ githubUsername: username, token: token || undefined });
      updateUser({ githubUsername: res.data.githubUsername, avatarUrl: res.data.avatarUrl });
      showToast('✅ GitHub connected!');
    } catch (err) {
      showToast('❌ ' + (err.response?.data?.message || 'Connection failed'));
    } finally {
      setConnecting(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await githubAPI.sync();
      setSyncResult(res.data);
      showToast(`✅ Synced ${res.data.totalCommits} commits`);
      const heatRes = await githubAPI.getHeatmap();
      setHeatmap(heatRes.data.heatmap);
    } catch (err) {
      showToast('❌ ' + (err.response?.data?.message || 'Sync failed'));
    } finally {
      setSyncing(false);
    }
  };

  // Build 13-week heatmap
  const days = 91;
  const today = new Date();
  const countMap = {};
  heatmap.forEach((d) => { countMap[d._id] = d.count; });
  const cells = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    const count = countMap[key] || 0;
    const level = count === 0 ? 0 : count === 1 ? 1 : count <= 3 ? 2 : count <= 5 ? 3 : 4;
    cells.push({ key, count, level });
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">GitHub Sync</h1>
          <p className="page-subtitle">Link your GitHub and auto-import commit activity</p>
        </div>
      </div>

      <div className="grid-2" style={{ alignItems: 'start' }}>
        {/* Connect Card */}
        <div className="card">
          <div style={{ fontSize: 36, marginBottom: 12 }}>🐙</div>
          <h2 style={{ fontWeight: 700, fontSize: 18, marginBottom: 4 }}>
            {user?.githubUsername ? `Connected: @${user.githubUsername}` : 'Connect GitHub'}
          </h2>
          <p className="text-sm text-muted" style={{ marginBottom: 20 }}>
            {user?.githubUsername
              ? 'Your GitHub is connected. Sync anytime to import commits.'
              : 'Enter your GitHub username to start tracking commits automatically.'}
          </p>

          <form onSubmit={handleConnect} className="flex-col gap-12">
            <div className="form-group">
              <label className="form-label">GitHub Username</label>
              <input id="gh-username" className="form-input" placeholder="octocat" value={username}
                onChange={(e) => setUsername(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Personal Access Token (optional – for private repos)</label>
              <input id="gh-token" type="password" className="form-input" placeholder="ghp_..." value={token}
                onChange={(e) => setToken(e.target.value)} />
            </div>
            <button id="connect-github-btn" type="submit" className="btn btn-primary" disabled={connecting}>
              {connecting ? 'Connecting...' : '🔗 Connect GitHub'}
            </button>
          </form>

          {user?.githubUsername && (
            <div className="divider" />
          )}

          {user?.githubUsername && (
            <button id="sync-github-btn" className="btn btn-ghost w-full" onClick={handleSync} disabled={syncing}>
              {syncing ? '⏳ Syncing...' : '🔄 Sync Commits Now'}
            </button>
          )}

          {syncResult && (
            <div style={{
              marginTop: 16, padding: '12px 16px', borderRadius: 8,
              background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)',
            }}>
              <div className="text-sm">
                <div>✅ <strong>{syncResult.totalCommits}</strong> commits synced</div>
                <div className="text-muted mt-4">Active days: {syncResult.daysWithCommits} · Logs saved: {syncResult.saved}</div>
              </div>
            </div>
          )}
        </div>

        {/* Heatmap */}
        <div className="card">
          <div className="card-title mb-16">Contribution Heatmap (90 days)</div>
          {heatmap.length === 0 ? (
            <div className="empty-state" style={{ padding: '40px 0' }}>
              <div className="empty-state-icon">📊</div>
              <div className="empty-state-text">Sync GitHub to see your heatmap</div>
            </div>
          ) : (
            <div className="heatmap-grid">
              {cells.map((c) => (
                <div key={c.key} className={`heatmap-cell level-${c.level}`} title={`${c.key}: ${c.count}`} />
              ))}
            </div>
          )}

          <div className="flex gap-8 mt-16" style={{ alignItems: 'center', fontSize: 12, color: 'var(--text-muted)' }}>
            <span>Less</span>
            {[0, 1, 2, 3, 4].map((l) => (
              <div key={l} className={`heatmap-cell level-${l}`} style={{ width: 14, height: 14, borderRadius: 2, flexShrink: 0 }} />
            ))}
            <span>More</span>
          </div>
        </div>
      </div>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
