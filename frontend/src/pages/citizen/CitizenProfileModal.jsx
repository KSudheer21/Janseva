import React, { useState } from 'react';
import { X, User, Phone, Globe, MapPin, Save, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

export default function CitizenProfileModal({ isOpen, onClose }) {
  const { user, updateUser, language, changeLanguage, t } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [selectedLang, setSelectedLang] = useState(user?.language || language || 'en');
  const [address, setAddress] = useState(user?.address || '');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const res = await api.updateCitizenProfile({
        name,
        language: selectedLang,
        address
      });
      if (res.success) {
        updateUser({ name, language: selectedLang, address });
        changeLanguage(selectedLang);
        setMessage('Profile updated successfully!');
        setTimeout(() => {
          onClose();
        }, 800);
      }
    } catch (err) {
      setMessage('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(3px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px 16px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            padding: '16px 20px',
            backgroundColor: '#0b2545',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={18} color="#f97316" />
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '700' }}>
              {t.profile || 'Citizen Profile'}
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#ffffff', cursor: 'pointer' }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSave} style={{ padding: '24px' }}>
          {message && (
            <div
              style={{
                padding: '10px 14px',
                backgroundColor: '#ecfdf5',
                color: '#065f46',
                borderRadius: '8px',
                marginBottom: '16px',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <CheckCircle size={16} />
              <span>{message}</span>
            </div>
          )}

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ramesh Kumar"
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1.5px solid #cbd5e1',
                fontSize: '0.9rem',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
              Registered Mobile Number
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                disabled
                value={`+91 ${user?.mobile || ''}`}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1.5px solid #e2e8f0',
                  backgroundColor: '#f8fafc',
                  color: '#64748b',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />
            </div>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginTop: '3px' }}>
              Primary ID verified via mobile OTP.
            </span>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
              Preferred Language
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[
                { code: 'en', label: 'English' },
                { code: 'te', label: 'తెలుగు' },
                { code: 'hi', label: 'हिंदी' }
              ].map((l) => (
                <button
                  type="button"
                  key={l.code}
                  onClick={() => setSelectedLang(l.code)}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: '8px',
                    border: selectedLang === l.code ? '2px solid #0b2545' : '1px solid #cbd5e1',
                    backgroundColor: selectedLang === l.code ? '#0b2545' : '#f8fafc',
                    color: selectedLang === l.code ? '#ffffff' : '#334155',
                    fontSize: '0.825rem',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '22px' }}>
            <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
              Residential Address (Optional)
            </label>
            <textarea
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. H.No 4-22, Market Street, Uppal"
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1.5px solid #cbd5e1',
                fontSize: '0.9rem',
                outline: 'none',
                resize: 'none'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#0b2545',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              fontSize: '0.95rem',
              fontWeight: '700',
              cursor: saving ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <Save size={16} />
            <span>{saving ? 'Saving...' : 'Save Profile'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
