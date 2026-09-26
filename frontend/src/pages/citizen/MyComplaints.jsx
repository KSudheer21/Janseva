import React, { useState, useEffect } from 'react';
import {
  FileText,
  Search,
  Filter,
  MapPin,
  Clock,
  Eye,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  PlusCircle,
  Calendar
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import PriorityBadge from '../../components/PriorityBadge';

export default function MyComplaints({ onSelectComplaint, onOpenReport }) {
  const { t } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  const fetchComplaints = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.getMyComplaints({
        status: statusFilter,
        search
      });
      if (res.success) {
        setComplaints(res.complaints || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load your complaints.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchComplaints();
  };

  const formatTimestamp = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return dateStr;
    }
  };

  const statuses = [
    { id: 'ALL', label: t.allStatuses || 'All Statuses' },
    { id: 'SUBMITTED', label: t.statusSubmitted || 'SUBMITTED' },
    { id: 'ASSIGNED', label: t.statusAssigned || 'ASSIGNED' },
    { id: 'IN PROGRESS', label: t.statusInProgress || 'IN PROGRESS' },
    { id: 'COMPLETED', label: t.statusCompleted || 'COMPLETED' },
    { id: 'REJECTED', label: t.statusRejected || 'REJECTED' }
  ];

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '24px 16px' }}>
      {/* Page Title & CTA */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '24px'
        }}
      >
        <div>
          <h1
            style={{
              margin: '0 0 4px',
              fontFamily: "'Outfit', sans-serif",
              fontSize: '1.65rem',
              fontWeight: '800',
              color: '#0b2545'
            }}
          >
            {t.myComplaints || 'My Complaints'}
          </h1>
          <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>
            Track the live progress of all grievances filed from your registered mobile number.
          </p>
        </div>

        <button
          onClick={onOpenReport}
          style={{
            backgroundColor: '#f97316',
            color: '#ffffff',
            border: 'none',
            borderRadius: '10px',
            padding: '10px 18px',
            fontSize: '0.9rem',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 12px rgba(249, 115, 22, 0.35)'
          }}
        >
          <PlusCircle size={18} />
          <span>{t.reportProblem || 'Report a Problem'}</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '16px 20px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          marginBottom: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px'
        }}
      >
        {/* Status Filter Chips */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          {statuses.map((s) => (
            <button
              key={s.id}
              onClick={() => setStatusFilter(s.id)}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                border: statusFilter === s.id ? '2px solid #0b2545' : '1px solid #cbd5e1',
                backgroundColor: statusFilter === s.id ? '#0b2545' : '#f8fafc',
                color: statusFilter === s.id ? '#ffffff' : '#475569',
                fontSize: '0.8rem',
                fontWeight: statusFilter === s.id ? '700' : '600',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s'
              }}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Search Input Form */}
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '10px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search
              size={18}
              color="#64748b"
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              placeholder={t.searchComplaints || 'Search by ID, keyword, or village...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '10px 14px 10px 38px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.9rem',
                outline: 'none'
              }}
            />
          </div>
          <button
            type="submit"
            style={{
              backgroundColor: '#0b2545',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '0 16px',
              fontSize: '0.85rem',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            Search
          </button>
        </form>
      </div>

      {/* Complaints List */}
      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
          <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 12px', display: 'block' }} />
          <span>Fetching your complaints...</span>
        </div>
      ) : complaints.length === 0 ? (
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '48px 24px',
            textAlign: 'center',
            border: '2px dashed #cbd5e1'
          }}
        >
          <FileText size={42} color="#94a3b8" style={{ margin: '0 auto 12px', display: 'block' }} />
          <h3 style={{ margin: '0 0 6px', fontSize: '1.15rem', color: '#1e293b' }}>
            No complaints found under this filter.
          </h3>
          <p style={{ margin: '0 0 16px', fontSize: '0.85rem', color: '#64748b' }}>
            Try resetting your filters or report a new civic issue.
          </p>
          <button
            onClick={() => {
              setStatusFilter('ALL');
              setSearch('');
            }}
            style={{
              backgroundColor: '#f1f5f9',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              padding: '8px 16px',
              fontSize: '0.85rem',
              fontWeight: '700',
              color: '#334155',
              cursor: 'pointer'
            }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {complaints.map((item) => (
            <div
              key={item.complaintId || item._id}
              onClick={() => onSelectComplaint(item.complaintId || item._id)}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                padding: '20px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
                cursor: 'pointer',
                transition: 'transform 0.15s, box-shadow 0.15s, border-color 0.15s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = '#93c5fd';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.07)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = '#e2e8f0';
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.03)';
              }}
            >
              {/* Card Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '8px',
                  marginBottom: '10px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span
                    style={{
                      fontFamily: 'monospace',
                      fontWeight: '800',
                      color: '#0b2545',
                      fontSize: '0.95rem'
                    }}
                  >
                    {item.complaintId}
                  </span>
                  <span
                    style={{
                      fontSize: '0.8rem',
                      fontWeight: '700',
                      color: '#0b2545',
                      backgroundColor: '#eff6ff',
                      padding: '3px 9px',
                      borderRadius: '6px'
                    }}
                  >
                    {item.category}
                  </span>
                  <PriorityBadge priority={item.priority} size="sm" />
                </div>
                <StatusBadge status={item.status} />
              </div>

              {/* Description Body */}
              <p
                style={{
                  margin: '0 0 12px',
                  fontSize: '0.925rem',
                  color: '#334155',
                  lineHeight: 1.5,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}
              >
                {item.description}
              </p>

              {/* Card Footer: Location, Date & Officer Info */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px',
                  paddingTop: '12px',
                  borderTop: '1px solid #f1f5f9',
                  fontSize: '0.78rem',
                  color: '#64748b'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={13} color="#dc2626" />
                    <span>
                      {item.location?.village || 'Ward'}, {item.location?.mandal || 'Mandal'}
                    </span>
                  </span>

                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={13} color="#64748b" />
                    <span>{formatTimestamp(item.createdAt)}</span>
                  </span>

                  {item.assignedOfficerName && (
                    <span style={{ color: '#0369a1', fontWeight: '600' }}>
                      Assigned: {item.assignedOfficerName}
                    </span>
                  )}
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    color: '#0284c7',
                    fontWeight: '700'
                  }}
                >
                  <Eye size={15} />
                  <span>View Details & Timeline &rarr;</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
