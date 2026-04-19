import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card fade-in">
        <div className="auth-logo">DevTrack</div>
        <h2 className="auth-title">Start your career journey</h2>
        <p className="auth-subtitle">Create your Career OS account</p>

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
            <label className="form-label">Full Name</label>
            <input
              id="reg-name"
              type="text"
              className="form-input"
              placeholder="Sandesh Lendve"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              id="reg-email"
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
              id="reg-password"
              type="password"
              className="form-input"
              placeholder="Min 6 characters"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              minLength={6}
            />
          </div>

          <button id="reg-btn" type="submit" className="btn btn-primary w-full" disabled={loading}>
            {loading ? 'Creating account...' : 'Get Started →'}
          </button>
        </form>

        <p className="text-sm text-muted mt-24" style={{ textAlign: 'center' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent-light)', textDecoration: 'none', fontWeight: 600 }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
