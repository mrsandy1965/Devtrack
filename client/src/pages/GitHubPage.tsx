import React, { useEffect, useState } from 'react';
import { githubAPI } from '../api/services';
import { useAuth } from '../context/AuthContext';
import { IconGithub, IconLink, IconRefresh } from '../components/Icons';

export default function GitHubPage() {
  const { user, updateUser } = useAuth();
  const [username, setUsername] = useState(user?.githubUsername || '');
  const [token, setToken] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [syncResult, setSyncResult] = useState<any>(null);
  const [heatmap, setHeatmap] = useState<any[]>([]);
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3500); };

  useEffect(() => {
    if (user?.githubUsername) {
      githubAPI.getHeatmap().then((r) => setHeatmap(r.data.heatmap)).catch(console.error);
    }
  }, [user]);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setConnecting(true);
    try {
      const res = await githubAPI.connect({ githubUsername: username, token: token || undefined });
      updateUser({ githubUsername: res.data.githubUsername, avatarUrl: res.data.avatarUrl });
      showToast('GitHub connected successfully');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Connection failed');
    } finally {
      setConnecting(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await githubAPI.sync();
      setSyncResult(res.data);
      showToast(`Synced ${res.data.totalCommits} commits from GitHub`);
      const heatRes = await githubAPI.getHeatmap();
      setHeatmap(heatRes.data.heatmap);
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Sync failed');
    } finally {
      setSyncing(false);
    }
  };

  // Build 13-week heatmap
  const days = 91;
  const today = new Date();
  const countMap: Record<string, number> = {};
  heatmap.forEach((d) => { countMap[d._id] = d.commits || d.count; });
  const cells = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    const count = countMap[key] || 0;
    const level = count === 0 ? 0 : count <= 2 ? 1 : count <= 5 ? 2 : count <= 10 ? 3 : 4;
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
          <div style={{
            width: 52, height: 52, borderRadius: 12, marginBottom: 16,
            background: 'var(--accent-glow)', border: '1px solid var(--border-accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <IconGithub size={28} color="var(--accent-light)" />
          </div>

          <h2 style={{ fontWeight: 700, fontSize: 18, marginBottom: 4 }}>
            {user?.githubUsername ? `Connected: @${user.githubUsername}` : 'Connect GitHub'}
          </h2>
          <p className="text-sm text-muted" style={{ marginBottom: 20 }}>
            {user?.githubUsername
              ? 'Your GitHub is linked. Sync to import your latest commits and update your heatmap.'
              : 'Enter your GitHub username to start tracking commits automatically.'}
          </p>

          <form onSubmit={handleConnect} className="flex-col gap-12">
            <div className="form-group">
              <label className="form-label">GitHub Username</label>
              <input id="gh-username" className="form-input" placeholder="octocat" value={username}
                onChange={(e) => setUsername(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Personal Access Token (optional)</label>
              <input id="gh-token" type="password" className="form-input" placeholder="ghp_xxxxxxxxxxxx" value={token}
                onChange={(e) => setToken(e.target.value)} />
              <span className="text-xs text-muted" style={{ marginTop: 4 }}>
                Required only for private repos. Generate at GitHub → Settings → Developer Settings → Tokens
              </span>
            </div>
            <button id="connect-github-btn" type="submit" className="btn btn-primary" disabled={connecting}>
              <IconLink size={16} />
              {connecting ? 'Verifying...' : 'Connect GitHub'}
            </button>
          </form>

          {user?.githubUsername && (
            <>
              <div className="divider" />
              <button id="sync-github-btn" className="btn btn-ghost w-full" onClick={handleSync} disabled={syncing}>
                <IconRefresh size={16} />
                {syncing ? 'Syncing commits...' : 'Sync Commits Now'}
              </button>
            </>
          )}

          {syncResult && (
            <div style={{
              marginTop: 16, padding: '12px 16px', borderRadius: 8,
              background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)',
            }}>
              <div className="text-sm flex-col gap-4">
                <div style={{ fontWeight: 600, color: 'var(--success)' }}>
                  Sync complete
                </div>
                <div className="text-muted">
                  {syncResult.totalCommits} commits · {syncResult.daysWithCommits} active days · {syncResult.saved} new logs saved
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Heatmap */}
        <div className="card">
          <div className="flex-between mb-16">
            <div className="card-title">Contribution Heatmap (90 days)</div>
            {heatmap.length > 0 && (
              <span className="text-xs text-muted">{heatmap.reduce((a, d) => a + d.commits, 0)} total commits</span>
            )}
          </div>

          {heatmap.length === 0 ? (
            <div className="empty-state" style={{ padding: '40px 0' }}>
              <div style={{ opacity: 0.4 }}><IconGithub size={48} color="var(--text-muted)" /></div>
              <div className="empty-state-text">Connect GitHub and sync to see your heatmap</div>
            </div>
          ) : (
            <div className="heatmap-grid">
              {cells.map((c) => (
                <div key={c.key} className={`heatmap-cell level-${c.level}`} title={`${c.key}: ${c.count} commit(s)`} />
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
