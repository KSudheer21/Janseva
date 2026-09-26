import React, { useState, useEffect } from 'react';
import {
  PlusCircle,
  FileText,
  AlertCircle,
  Clock,
  CheckCircle,
  ArrowRight,
  MapPin,
  RefreshCw,
  Eye,
  PhoneCall
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import PriorityBadge from '../../components/PriorityBadge';

export default function CitizenHome({ onOpenReport, onOpenMyComplaints, onSelectComplaint }) {
  const { user, t } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadRecentComplaints = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.getMyComplaints();
      if (res.success) {
        setComplaints(res.complaints || []);
      }
    } catch (err) {
      setError('Unable to load your grievances right now.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecentComplaints();
  }, []);

  // Compute ONLY this citizen's statistics (strictly no department wide stats!)
  const activeCount = complaints.filter(
    (c) => c.status === 'SUBMITTED' || c.status === 'ASSIGNED' || c.status === 'IN PROGRESS'
  ).length;
  const resolvedCount = complaints.filter((c) => c.status === 'COMPLETED').length;
  const recentThree = complaints.slice(0, 3);

  const formatTimestamp = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px 16px' }}>
      {/* Hero Welcome Card */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0b2545 0%, #134074 100%)',
          borderRadius: '20px',
          color: '#ffffff',
          padding: '32px 24px',
          boxShadow: '0 12px 28px rgba(11, 37, 69, 0.25)',
          marginBottom: '28px',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            position: 'absolute',
            right: '-30px',
            bottom: '-40px',
            opacity: 0.1,
            pointerEvents: 'none'
          }}
        >
          <svg width="260" height="260" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="46" fill="white" />
          </svg>
        </div>

        <div style={{ position: 'relative', zIndex: 2, maxWidth: '680px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'rgba(255,255,255,0.12)',
              borderRadius: '20px',
              padding: '4px 12px',
              fontSize: '0.8rem',
              fontWeight: '600',
              marginBottom: '12px'
            }}
          >
            <span>{t.welcomeCitizen || 'Welcome'},</span>
            <span style={{ color: '#fed7aa', fontWeight: '700' }}>{user?.name || 'Citizen'}</span>
          </div>

          <h1
            style={{
              margin: '0 0 12px',
              fontFamily: "'Outfit', sans-serif",
              fontSize: '1.9rem',
              fontWeight: '800',
              letterSpacing: '-0.02em',
              lineHeight: 1.25
            }}
          >
            {t.homeHeroTitle || 'Empowering Citizens, Resolving Grievances Fast'}
          </h1>

          <p style={{ margin: '0 0 24px', fontSize: '0.95rem', color: '#cbd5e1', lineHeight: 1.55 }}>
            {t.homeHeroDesc ||
              'Voice your civic issues directly to municipal authorities. Get real-time tracking, geotagged resolution, and verified before/after proof.'}
          </p>

          {/* LARGE "REPORT A PROBLEM" CTA BUTTON */}
          <button
            onClick={onOpenReport}
            style={{
              backgroundColor: '#f97316',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              padding: '16px 28px',
              fontSize: '1.1rem',
              fontWeight: '800',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: '0 6px 20px rgba(249, 115, 22, 0.45)',
              transition: 'transform 0.2s, background 0.2s'
            }}
            onMouseOver={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseOut={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            <PlusCircle size={22} />
            <span>{t.ctaReportProblem || 'Report a Problem Now'}</span>
          </button>
        </div>
      </div>

      {/* Citizen Personal Summary Cards (Strictly personal to the citizen) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '32px'
        }}
      >
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: '#fffbeb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#b45309'
            }}
          >
            <Clock size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>
              {t.activeGrievances || 'Active Grievances'}
            </span>
            <h3 style={{ margin: '2px 0 0', fontSize: '1.6rem', fontWeight: '800', color: '#1e293b' }}>
              {activeCount}
            </h3>
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: '#ecfdf5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#059669'
            }}
          >
            <CheckCircle size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>
              {t.resolvedGrievances || 'Resolved Problems'}
            </span>
            <h3 style={{ margin: '2px 0 0', fontSize: '1.6rem', fontWeight: '800', color: '#1e293b' }}>
              {resolvedCount}
            </h3>
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            cursor: 'pointer'
          }}
          onClick={onOpenMyComplaints}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: '#eff6ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#1d4ed8'
            }}
          >
            <FileText size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>
              {t.myComplaints || 'Total Filed'}
            </span>
            <h3 style={{ margin: '2px 0 0', fontSize: '1.6rem', fontWeight: '800', color: '#1e293b' }}>
              {complaints.length}
            </h3>
          </div>
        </div>
      </div>

      {/* Recent Complaints Section */}
      <div style={{ marginBottom: '28px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2
              style={{
                margin: 0,
                fontSize: '1.25rem',
                fontWeight: '800',
                color: '#0f172a',
                fontFamily: "'Outfit', sans-serif"
              }}
            >
              {t.recentComplaints || 'Recent Complaints'}
            </h2>
            <button
              onClick={loadRecentComplaints}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#64748b',
                cursor: 'pointer',
                padding: '4px'
              }}
              title="Refresh"
            >
              <RefreshCw size={15} />
            </button>
          </div>

          {complaints.length > 0 && (
            <button
              onClick={onOpenMyComplaints}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#0284c7',
                fontSize: '0.875rem',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <span>{t.viewAllComplaints || 'View All My Complaints'}</span>
              <ArrowRight size={16} />
            </button>
          )}
        </div>

        {loading ? (
          <div style={{ padding: '36px', textAlign: 'center', color: '#64748b' }}>
            <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 8px', display: 'block' }} />
            <span>Loading your complaints...</span>
          </div>
        ) : complaints.length === 0 ? (
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '40px 20px',
              textAlign: 'center',
              border: '2px dashed #cbd5e1'
            }}
          >
            <AlertCircle size={40} color="#94a3b8" style={{ margin: '0 auto 12px', display: 'block' }} />
            <h3 style={{ margin: '0 0 6px', fontSize: '1.1rem', color: '#334155' }}>
              {t.noComplaintsYet || 'You have not submitted any complaints yet.'}
            </h3>
            <p style={{ margin: '0 0 18px', fontSize: '0.875rem', color: '#64748b' }}>
              Notice a pothole, street light outage, or drainage problem? Report it in seconds!
            </p>
            <button
              onClick={onOpenReport}
              style={{
                backgroundColor: '#f97316',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 20px',
                fontSize: '0.9rem',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              {t.ctaReportProblem || 'Report a Problem Now'}
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recentThree.map((item) => (
              <div
                key={item.complaintId || item._id}
                onClick={() => onSelectComplaint(item.complaintId || item._id)}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '14px',
                  padding: '18px 20px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => (e.currentTarget.style.borderColor = '#93c5fd')}
                onMouseOut={(e) => (e.currentTarget.style.borderColor = '#e2e8f0')}
              >
                <div style={{ flex: 1, minWidth: '260px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <span style={{ fontFamily: 'monospace', fontWeight: '800', color: '#0b2545', fontSize: '0.9rem' }}>
                      {item.complaintId}
                    </span>
                    <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#475569', backgroundColor: '#f1f5f9', padding: '2px 8px', borderRadius: '4px' }}>
                      {item.category}
                    </span>
                    <PriorityBadge priority={item.priority} size="sm" />
                  </div>

                  <p
                    style={{
                      margin: '0 0 6px',
                      fontSize: '0.875rem',
                      color: '#334155',
                      lineHeight: 1.4,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                  >
                    {item.description}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.75rem', color: '#64748b' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={12} color="#dc2626" />
                      {item.location?.village || 'Ward'}, {item.location?.mandal || 'Mandal'}
                    </span>
                    <span>Submitted: {formatTimestamp(item.createdAt)}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <StatusBadge status={item.status} />
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      backgroundColor: '#f8fafc',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#0284c7'
                    }}
                  >
                    <Eye size={16} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Emergency Helpline Banner */}
      <div
        style={{
          backgroundColor: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: '14px',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: '#1d4ed8',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <PhoneCall size={20} />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#1e3a8a', fontWeight: '700' }}>
              Civic Emergency Helpline: 1912 / 100
            </h4>
            <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#3b82f6' }}>
              For live power line breaks, gas leaks, or life-threatening hazards, alert municipal response immediately.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
