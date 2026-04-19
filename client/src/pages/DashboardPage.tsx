import React, { useEffect, useState } from 'react';
import { dashboardAPI } from '../api/services';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
} from 'recharts';
import { IconFlame, IconBriefcase, IconTimer, IconStar, IconCheck, IconCode } from '../components/Icons';

interface ScoreRingProps {
  score: number;
}

function ScoreRing({ score }: ScoreRingProps) {
  const r = 70;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;

  return (
    <div className="score-ring-container flex-col gap-16" style={{ width: '100%' }}>
      <div className="score-ring">
        <svg width="160" height="160" viewBox="0 0 160 160">
          <circle cx="80" cy="80" r={r} stroke="var(--bg-card)" strokeWidth="12" fill="none" />
          <circle
            cx="80" cy="80" r={r}
            stroke="url(#scoreGrad)"
            strokeWidth="12"
            fill="none"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s ease' }}
          />
          <defs>
            <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#6c63ff" />
              <stop offset="100%" stopColor="#8b85ff" />
            </linearGradient>
          </defs>
        </svg>
        <div className="score-ring-text">
          <span className="score-number">{score}</span>
          <span className="score-label">Career Score</span>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  Icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
}

function StatCard({ Icon, label, value, sub, color = 'var(--accent-light)' }: StatCardProps) {
  return (
    <div className="card flex-col gap-8">
      <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--accent-glow)', border: '1px solid var(--border-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={18} color={color} />
      </div>
      <div className="card-title">{label}</div>
      <div className="card-value" style={{ color }}>{value}</div>
      {sub && <div className="text-xs text-muted">{sub}</div>}
    </div>
  );
}

interface HeatmapCell {
  key: string;
  count: number;
  level: number;
}

function HeatmapGrid({ data }: { data: any[] }) {
  const days = 91; // 13 weeks
  const today = new Date();
  const cells: HeatmapCell[] = [];

  const countMap: Record<string, number> = {};
  (data || []).forEach((d) => { countMap[d._id] = d.count; });

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    const count = countMap[key] || 0;
    const level = count === 0 ? 0 : count === 1 ? 1 : count <= 3 ? 2 : count <= 5 ? 3 : 4;
    cells.push({ key, count, level });
  }

  return (
    <div className="card mt-16">
      <div className="card-title">Coding Activity (Last 13 Weeks)</div>
      <div className="heatmap-grid mt-16">
        {cells.map((c) => (
          <div
            key={c.key}
            className={`heatmap-cell level-${c.level}`}
            title={`${c.key}: ${c.count} log(s)`}
          />
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardAPI.get()
      .then((res) => setData(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="flex-col flex-center gap-16">
          <div className="loader" />
          <span className="text-muted">Loading your career data...</span>
        </div>
      </div>
    );
  }

  const funnelData = data?.internships
    ? [
        { name: 'Applied', value: data.internships.Applied || 0, fill: '#3b82f6' },
        { name: 'OA', value: data.internships.OA || 0, fill: '#f59e0b' },
        { name: 'Interview', value: data.internships.Interview || 0, fill: '#8b5cf6' },
        { name: 'Offer', value: data.internships.Offer || 0, fill: '#10b981' },
      ]
    : [];

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Your career execution at a glance</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 24, alignItems: 'start' }}>
        <ScoreRing score={data?.careerScore || 0} />

        <div className="grid-3">
          <StatCard Icon={IconFlame}     label="Top Streak"   value={`${data?.habits?.topStreak || 0}d`}        sub="Current best"                                         color="var(--warning)" />
          <StatCard Icon={IconCode}      label="Habits Active" value={data?.habits?.total || 0}                  sub="Tracked habits" />
          <StatCard Icon={IconBriefcase} label="Applications"  value={data?.internships?.total || 0}             sub={`Offer rate: ${data?.internships?.offerRate || 0}%`}  color="var(--success)" />
          <StatCard Icon={IconTimer}     label="Focus (7d)"    value={`${data?.focus?.totalMinutes || 0}m`}      sub={`${data?.focus?.sessionCount || 0} sessions`}          color="var(--info)" />
          <StatCard Icon={IconStar}      label="Interviews"    value={data?.internships?.Interview || 0}         sub="Cleared OA"                                           color="var(--accent-light)" />
          <StatCard Icon={IconCheck}     label="Offers"        value={data?.internships?.Offer || 0}             sub="Accepted offers"                                      color="var(--success)" />
        </div>
      </div>

      <HeatmapGrid data={data?.heatmap || []} />

      {funnelData.length > 0 && (
        <div className="card mt-16">
          <div className="card-title mb-16">Internship Funnel</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={funnelData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} />
              <Tooltip
                contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13 }}
                cursor={{ fill: 'rgba(255,255,255,0.03)' }}
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="var(--accent)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {(data?.recentActivity?.length || 0) > 0 && (
        <div className="card mt-16">
          <div className="card-title mb-16">Recent Activity</div>
          <div className="flex-col gap-8">
            {data.recentActivity.map((log: any) => (
              <div key={log._id} className="flex-between text-sm" style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                <span>{log.habitId?.title || 'Habit log'}</span>
                <span className="text-muted">{new Date(log.logDate).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
