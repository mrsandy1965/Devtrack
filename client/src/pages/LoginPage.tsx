import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card fade-in">
        <div className="auth-logo">DevTrack</div>
        <h2 className="auth-title">Welcome back</h2>
        <p className="auth-subtitle">Sign in to your Career OS</p>

        {error && (
          <div style={{
            padding: '10px 14px', borderRadius: 8,
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
            color: 'var(--danger)', fontSize: 13, marginBottom: 16,
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex-col gap-16">
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              id="login-email"
              type="email"
              className="form-input"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              id="login-password"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          <button id="login-btn" type="submit" className="btn btn-primary w-full" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In →'}
          </button>
        </form>

        <p className="text-sm text-muted mt-24" style={{ textAlign: 'center' }}>
          No account?{' '}
          <Link to="/register" style={{ color: 'var(--accent-light)', textDecoration: 'none', fontWeight: 600 }}>
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
