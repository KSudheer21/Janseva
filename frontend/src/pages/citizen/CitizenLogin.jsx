import React, { useState } from 'react';
import { Smartphone, KeyRound, ArrowRight, ShieldCheck, Globe, UserCheck, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function CitizenLogin({ onSwitchToOfficer }) {
  const { loginCitizen, language, changeLanguage, t } = useAuth();
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('mobile'); // 'mobile' | 'otp'
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [demoOtpValue, setDemoOtpValue] = useState('123456');

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError('');
    setInfoMessage('');

    if (!mobile || !/^\d{10}$/.test(mobile.trim())) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.requestCitizenOtp(mobile.trim());
      if (res.success) {
        setStep('otp');
        if (res.demoOtp) {
          setDemoOtpValue(res.demoOtp);
          setInfoMessage(`Development Mode: Demo OTP is ${res.demoOtp}`);
        } else {
          setInfoMessage('Verification code sent to your mobile.');
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');

    if (!otp || otp.trim().length !== 6) {
      setError('Please enter the 6-digit OTP.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.verifyCitizenOtp(mobile.trim(), otp.trim(), name, language);
      if (res.success) {
        loginCitizen(res.token, res.user);
      }
    } catch (err) {
      setError(err.message || 'Invalid verification code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 68px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        background: 'linear-gradient(135deg, #0b2545 0%, #134074 50%, #0b2545 100%)'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          overflow: 'hidden',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        {/* Portal Header Banner */}
        <div
          style={{
            backgroundColor: '#0b2545',
            padding: '28px 24px',
            textAlign: 'center',
            color: '#ffffff',
            borderBottom: '3px solid #f97316'
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '14px',
              backgroundColor: '#ffffff',
              margin: '0 auto 12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
            }}
          >
            <ShieldCheck size={34} color="#0b2545" />
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
            {t.appName || 'JanSeva'}
          </h2>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#93c5fd', fontWeight: '500' }}>
            {t.citizenLogin || 'Citizen Grievance Redressal Portal'}
          </p>

          {/* Language Switcher Bar */}
          <div
            style={{
              marginTop: '16px',
              display: 'inline-flex',
              backgroundColor: 'rgba(255,255,255,0.1)',
              borderRadius: '30px',
              padding: '3px'
            }}
          >
            {[
              { code: 'en', label: 'English' },
              { code: 'te', label: 'తెలుగు' },
              { code: 'hi', label: 'हिंदी' }
            ].map((l) => (
              <button
                key={l.code}
                onClick={() => changeLanguage(l.code)}
                style={{
                  border: 'none',
                  background: language === l.code ? '#f97316' : 'transparent',
                  color: '#ffffff',
                  padding: '5px 12px',
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  fontWeight: language === l.code ? '700' : '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        {/* Form Body */}
        <div style={{ padding: '32px 28px' }}>
          {/* Demo OTP Banner */}
          <div
            style={{
              padding: '10px 14px',
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: '800', color: '#b45309' }}>DEMO OTP:</span>
              <code style={{ fontWeight: '700', backgroundColor: '#fef3c7', padding: '2px 6px', borderRadius: '4px' }}>
                {demoOtpValue}
              </code>
            </div>
            {step === 'otp' && (
              <button
                onClick={() => setOtp(demoOtpValue)}
                style={{
                  border: 'none',
                  backgroundColor: '#f59e0b',
                  color: '#ffffff',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  fontSize: '0.72rem',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                Auto Fill
              </button>
            )}
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

          {infoMessage && (
            <div
              style={{
                padding: '10px 14px',
                backgroundColor: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: '8px',
                marginBottom: '18px',
                color: '#1d4ed8',
                fontSize: '0.85rem'
              }}
            >
              {infoMessage}
            </div>
          )}

          {step === 'mobile' ? (
            <form onSubmit={handleRequestOtp}>
              <div style={{ marginBottom: '20px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.85rem',
                    fontWeight: '700',
                    color: '#334155',
                    marginBottom: '8px'
                  }}
                >
                  {t.enterMobile || 'Mobile Number'}
                </label>
                <div style={{ position: 'relative' }}>
                  <div
                    style={{
                      position: 'absolute',
                      left: '14px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#64748b',
                      fontSize: '0.9rem',
                      fontWeight: '700',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Smartphone size={18} />
                    <span>+91</span>
                  </div>
                  <input
                    type="tel"
                    maxLength={10}
                    placeholder="98765 43210"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '13px 14px 13px 78px',
                      fontSize: '1rem',
                      fontWeight: '600',
                      borderRadius: '10px',
                      border: '1.5px solid #cbd5e1',
                      outline: 'none',
                      letterSpacing: '0.05em'
                    }}
                    autoFocus
                  />
                </div>
                <span style={{ display: 'block', marginTop: '6px', fontSize: '0.75rem', color: '#94a3b8' }}>
                  A 6-digit verification OTP will be generated.
                </span>
              </div>

              <button
                type="submit"
                disabled={loading || mobile.length !== 10}
                style={{
                  width: '100%',
                  padding: '14px',
                  backgroundColor: mobile.length === 10 ? '#f97316' : '#cbd5e1',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '1rem',
                  fontWeight: '700',
                  cursor: mobile.length === 10 ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: mobile.length === 10 ? '0 4px 14px rgba(249, 115, 22, 0.4)' : 'none',
                  transition: 'all 0.2s'
                }}
              >
                <span>{loading ? 'Sending OTP...' : t.sendOtp || 'Send OTP'}</span>
                <ArrowRight size={18} />
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp}>
              <div style={{ marginBottom: '16px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.85rem',
                    fontWeight: '700',
                    color: '#334155',
                    marginBottom: '8px'
                  }}
                >
                  Citizen Full Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '12px 14px',
                    fontSize: '0.95rem',
                    borderRadius: '10px',
                    border: '1.5px solid #cbd5e1',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ marginBottom: '22px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#334155' }}>
                    {t.enterOtp || 'Enter 6-digit OTP'}
                  </label>
                  <button
                    type="button"
                    onClick={() => setStep('mobile')}
                    style={{ border: 'none', background: 'transparent', color: '#0284c7', fontSize: '0.78rem', cursor: 'pointer', fontWeight: '600' }}
                  >
                    Change Number
                  </button>
                </div>
                <div style={{ position: 'relative' }}>
                  <KeyRound
                    size={18}
                    color="#64748b"
                    style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}
                  />
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '13px 14px 13px 44px',
                      fontSize: '1.15rem',
                      fontWeight: '700',
                      borderRadius: '10px',
                      border: '1.5px solid #cbd5e1',
                      outline: 'none',
                      letterSpacing: '0.3em',
                      textAlign: 'center'
                    }}
                    autoFocus
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                style={{
                  width: '100%',
                  padding: '14px',
                  backgroundColor: otp.length === 6 ? '#10b981' : '#cbd5e1',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '1rem',
                  fontWeight: '700',
                  cursor: otp.length === 6 ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: otp.length === 6 ? '0 4px 14px rgba(16, 185, 129, 0.4)' : 'none',
                  transition: 'all 0.2s'
                }}
              >
                <span>{loading ? 'Verifying...' : t.verifyOtp || 'Verify & Enter Portal'}</span>
                <UserCheck size={18} />
              </button>
            </form>
          )}

          {/* Quick Demo Pre-fill Citizen button */}
          <div style={{ marginTop: '24px', paddingTop: '18px', borderTop: '1px solid #f1f5f9', textAlign: 'center' }}>
            <p style={{ margin: '0 0 10px', fontSize: '0.75rem', color: '#64748b' }}>
              Quick Demo Testing:
            </p>
            <button
              type="button"
              onClick={() => {
                setMobile('9876543210');
                setStep('otp');
                setOtp('123456');
                setName('K. Venkateswara Rao');
              }}
              style={{
                backgroundColor: '#f1f5f9',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '6px 14px',
                fontSize: '0.78rem',
                color: '#334155',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              Demo Citizen (9876543210 / 123456)
            </button>
          </div>

          {/* Switch to Officer portal */}
          <div style={{ marginTop: '16px', textAlign: 'center' }}>
            <button
              type="button"
              onClick={onSwitchToOfficer}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#0b2545',
                fontSize: '0.85rem',
                fontWeight: '700',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              {t.loginAsOfficer || 'Are you a Municipal Officer? Click here to Login'} &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
