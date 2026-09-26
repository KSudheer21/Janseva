import React, { useState } from 'react';
import { Shield, KeyRound, ArrowRight, AlertCircle, Building2, User } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function OfficerLogin({ onSwitchToCitizen }) {
  const { loginOfficer, t } = useAuth();
  const [officerId, setOfficerId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!officerId.trim() || !password) {
      setError('Please provide both Officer ID and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.officerLogin(officerId.trim(), password);
      if (res.success) {
        loginOfficer(res.token, res.user);
      }
    } catch (err) {
      setError(err.message || 'Invalid Officer ID or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoFill = () => {
    setOfficerId('OFF001');
    setPassword('1234');
    setError('');
  };

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 68px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        background: 'linear-gradient(135deg, #091e3a 0%, #102a43 50%, #06182c 100%)'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
          overflow: 'hidden',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        {/* Officer Header Banner */}
        <div
          style={{
            backgroundColor: '#07172c',
            padding: '28px 24px',
            textAlign: 'center',
            color: '#ffffff',
            borderBottom: '3px solid #f59e0b'
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '14px',
              backgroundColor: '#f59e0b',
              margin: '0 auto 12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
            }}
          >
            <Shield size={32} color="#07172c" />
          </div>
          <h2
            style={{
              margin: '0 0 6px',
              fontFamily: "'Outfit', sans-serif",
              fontSize: '1.65rem',
              fontWeight: '800',
              letterSpacing: '-0.02em'
            }}
          >
            Officer Operations
          </h2>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8', fontWeight: '500' }}>
            Municipal Grievance Redressal & Field Operations
          </p>
        </div>

        {/* Form Body */}
        <div style={{ padding: '32px 28px' }}>
          {/* Demo Officer Credentials Banner */}
          <div
            style={{
              padding: '12px 14px',
              backgroundColor: '#fffbeb',
              border: '1px solid #fde68a',
              borderRadius: '10px',
              marginBottom: '20px',
              fontSize: '0.8rem',
              color: '#92400e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <span style={{ fontWeight: '800', color: '#b45309', display: 'block' }}>
                DEMO OFFICER CREDENTIALS:
              </span>
              <span style={{ fontFamily: 'monospace', fontWeight: '700' }}>
                ID: OFF001 &bull; Pass: 1234
              </span>
            </div>
            <button
              type="button"
              onClick={handleQuickDemoFill}
              style={{
                border: 'none',
                backgroundColor: '#f59e0b',
                color: '#ffffff',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.72rem',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              Fill Demo
            </button>
          </div>

          {error && (
            <div
              style={{
                padding: '12px 14px',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                marginBottom: '18px',
                color: '#b91c1c',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '18px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  color: '#334155',
                  marginBottom: '8px'
                }}
              >
                {t.officerId || 'Officer ID'}
              </label>
              <div style={{ position: 'relative' }}>
                <User
                  size={18}
                  color="#64748b"
                  style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                  type="text"
                  placeholder="e.g. OFF001"
                  value={officerId}
                  onChange={(e) => setOfficerId(e.target.value.toUpperCase())}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '12px 14px 12px 42px',
                    fontSize: '0.95rem',
                    fontWeight: '600',
                    borderRadius: '10px',
                    border: '1.5px solid #cbd5e1',
                    outline: 'none',
                    letterSpacing: '0.05em'
                  }}
                  autoFocus
                />
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  color: '#334155',
                  marginBottom: '8px'
                }}
              >
                {t.password || 'Password'}
              </label>
              <div style={{ position: 'relative' }}>
                <KeyRound
                  size={18}
                  color="#64748b"
                  style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '12px 14px 12px 42px',
                    fontSize: '0.95rem',
                    borderRadius: '10px',
                    border: '1.5px solid #cbd5e1',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !officerId || !password}
              style={{
                width: '100%',
                padding: '14px',
                backgroundColor: officerId && password ? '#0b2545' : '#cbd5e1',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                fontSize: '1rem',
                fontWeight: '700',
                cursor: officerId && password ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: officerId && password ? '0 4px 14px rgba(11, 37, 69, 0.4)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              <span>{loading ? 'Authenticating...' : t.loginAsOfficer || 'Login as Municipal Officer'}</span>
              <ArrowRight size={18} />
            </button>
          </form>

          {/* Switch to Citizen Portal */}
          <div style={{ marginTop: '24px', paddingTop: '18px', borderTop: '1px solid #f1f5f9', textAlign: 'center' }}>
            <button
              type="button"
              onClick={onSwitchToCitizen}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#f97316',
                fontSize: '0.85rem',
                fontWeight: '700',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              &larr; {t.loginAsCitizen || 'Citizen Portal (Mobile + OTP Login)'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
