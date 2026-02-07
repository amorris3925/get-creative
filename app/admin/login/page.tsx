'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.push('/admin');
        router.refresh();
      } else {
        setError('Invalid password');
      }
    } catch {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0A0A0A 0%, #1A1410 100%)',
      padding: 20,
    }}>
      <div style={{
        width: '100%',
        maxWidth: 400,
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: 24,
        padding: 48,
      }}>
        <div style={{
          fontSize: 11,
          letterSpacing: '0.2em',
          color: '#ED7F35',
          marginBottom: 16,
          textAlign: 'center',
        }}>
          INTENTIONALLY CREATIVE
        </div>
        <h1 style={{
          fontSize: 28,
          fontWeight: 300,
          color: '#FFFFFF',
          textAlign: 'center',
          marginBottom: 32,
        }}>
          Admin Login
        </h1>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 24 }}>
            <label style={{
              display: 'block',
              fontSize: 12,
              letterSpacing: '0.1em',
              color: 'rgba(255,255,255,0.6)',
              marginBottom: 8,
            }}>
              PASSWORD
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '16px 20px',
                fontSize: 16,
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 12,
                color: '#FFFFFF',
                outline: 'none',
              }}
              placeholder="Enter admin password"
              required
            />
          </div>

          {error && (
            <div style={{
              padding: '12px 16px',
              background: 'rgba(249, 56, 48, 0.1)',
              border: '1px solid rgba(249, 56, 48, 0.3)',
              borderRadius: 8,
              color: '#F93830',
              fontSize: 14,
              marginBottom: 24,
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '16px 24px',
              fontSize: 14,
              fontWeight: 600,
              letterSpacing: '0.05em',
              background: loading ? 'rgba(237, 127, 53, 0.5)' : '#ED7F35',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 12,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{
          marginTop: 32,
          paddingTop: 24,
          borderTop: '1px solid rgba(255,255,255,0.08)',
          textAlign: 'center',
          fontSize: 13,
          color: 'rgba(255,255,255,0.4)',
        }}>
          <a href="/" style={{ color: '#ED7F35', textDecoration: 'none' }}>
            ← Back to website
          </a>
        </div>
      </div>
    </div>
  );
}
