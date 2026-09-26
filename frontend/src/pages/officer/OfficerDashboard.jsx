import React, { useState, useEffect } from 'react';
import {
  FileText,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Hourglass,
  UserCheck,
  Search,
  Filter,
  ArrowUpDown,
  MoreVertical,
  BarChart3,
  Layers,
  MapPin,
  RefreshCw,
  Eye,
  CheckCircle,
  Play,
  Calendar,
  XCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import PriorityBadge from '../../components/PriorityBadge';

export default function OfficerDashboard({
  onSelectComplaint,
  onOpenReports,
  onOpenProfile
}) {
  const { user, t, logout } = useAuth();

  // Metrics from DB
  const [stats, setStats] = useState({
    todayReports: 0,
    highPriority: 0,
    inProgress: 0,
    done: 0,
    pending: 0
  });

  const [officerStats, setOfficerStats] = useState({
    totalAssigned: 0,
    totalCompleted: 0,
    totalPending: 0,
    completionCount: 0
  });

  // Complaints Table State
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters & Sorting
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('all'); // 'today' | 'week' | 'month' | 'all'
  const [sortOption, setSortOption] = useState('priority-first'); // 'priority-first' | 'newest' | 'oldest'
  const [scopeFilter, setScopeFilter] = useState('all'); // 'all' | 'my-assigned' | 'my-completed' | 'unassigned'
  const [searchTerm, setSearchTerm] = useState('');

  // Three-dot menu state
  const [menuOpen, setMenuOpen] = useState(false);

  // Load Dashboard Data
  const loadDashboard = async () => {
    setLoading(true);
    setError('');
    try {
      const [dashRes, listRes] = await Promise.all([
        api.getOfficerDashboard(),
        api.getOfficerComplaintList({
          priority: priorityFilter,
          category: categoryFilter,
          status: statusFilter,
          dateFilter,
          sort: sortOption,
          scope: scopeFilter,
          search: searchTerm
        })
      ]);

      if (dashRes.success) {
        setStats(dashRes.stats || {});
        setOfficerStats(dashRes.officerStats || {});
      }

      if (listRes.success) {
        setComplaints(listRes.complaints || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load officer dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [priorityFilter, categoryFilter, statusFilter, dateFilter, sortOption, scopeFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadDashboard();
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

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '24px 16px' }}>
      {/* Officer Header with Three-Dot Menu */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1
              style={{
                margin: 0,
                fontFamily: "'Outfit', sans-serif",
                fontSize: '1.75rem',
                fontWeight: '800',
                color: '#07172c'
              }}
            >
              Municipal Grievance Operations
            </h1>
            <button
              onClick={loadDashboard}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#64748b',
                cursor: 'pointer',
                padding: '4px'
              }}
              title="Refresh Data"
            >
              <RefreshCw size={17} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
          <p style={{ margin: '4px 0 0', fontSize: '0.875rem', color: '#64748b' }}>
            Officer: <strong style={{ color: '#0b2545' }}>{user?.name}</strong> ({user?.officerId || 'OFF001'}) &bull;{' '}
            {user?.department || 'Municipal Corporation'}
          </p>
        </div>

        {/* Three-Dot Menu Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              backgroundColor: '#0b2545',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              padding: '10px 16px',
              fontSize: '0.875rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 2px 6px rgba(11,37,69,0.2)'
            }}
          >
            <span>{t.threeDotMenu || 'Officer Actions'}</span>
            <MoreVertical size={16} />
          </button>

          {menuOpen && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '8px',
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)',
                minWidth: '220px',
                overflow: 'hidden',
                zIndex: 100,
                border: '1px solid #e2e8f0'
              }}
            >
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onOpenReports('weekly');
                }}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '12px 16px',
                  border: 'none',
                  background: 'transparent',
                  color: '#334155',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                <BarChart3 size={16} color="#0284c7" />
                <span>{t.weeklyReport || 'Weekly Report'}</span>
              </button>

              <button
                onClick={() => {
                  setMenuOpen(false);
                  onOpenReports('monthly');
                }}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '12px 16px',
                  border: 'none',
                  background: 'transparent',
                  color: '#334155',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                <Layers size={16} color="#7c3aed" />
                <span>{t.monthlyReport || 'Monthly Report'}</span>
              </button>

              <button
                onClick={() => {
                  setMenuOpen(false);
                  setStatusFilter('PENDING');
                }}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '12px 16px',
                  border: 'none',
                  background: 'transparent',
                  color: '#334155',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                <Hourglass size={16} color="#f59e0b" />
                <span>{t.pendingComplaints || 'Pending Complaints'}</span>
              </button>

              <button
                onClick={() => {
                  setMenuOpen(false);
                  setScopeFilter('my-completed');
                }}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '12px 16px',
                  border: 'none',
                  background: 'transparent',
                  color: '#334155',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                <CheckCircle2 size={16} color="#10b981" />
                <span>{t.myCompletedComplaints || 'My Completed Complaints'}</span>
              </button>

              <div style={{ height: '1px', backgroundColor: '#e2e8f0', margin: '4px 0' }} />

              <button
                onClick={() => {
                  setMenuOpen(false);
                  logout();
                }}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '12px 16px',
                  border: 'none',
                  background: 'transparent',
                  color: '#dc2626',
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                <XCircle size={16} />
                <span>{t.logout || 'Logout'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 5 REAL DASHBOARD CARDS (Strictly from MongoDB) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
          gap: '14px',
          marginBottom: '28px'
        }}
      >
        {/* 1. TODAY'S REPORTS */}
        <div
          onClick={() => {
            setDateFilter('today');
            setStatusFilter('ALL');
          }}
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '18px',
            border: '1px solid #bfdbfe',
            borderLeft: '5px solid #2563eb',
            boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
            cursor: 'pointer'
          }}
        >
          <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#1e40af', letterSpacing: '0.05em' }}>
            {t.kpiTodayReports || "TODAY'S REPORTS"}
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '6px' }}>
            <h2 style={{ margin: 0, fontSize: '1.9rem', fontWeight: '900', color: '#1e293b' }}>
              {stats.todayReports}
            </h2>
            <Calendar size={20} color="#3b82f6" />
          </div>
        </div>

        {/* 2. HIGH PRIORITY */}
        <div
          onClick={() => {
            setPriorityFilter('High');
            setStatusFilter('ALL');
          }}
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '18px',
            border: '1px solid #fecaca',
            borderLeft: '5px solid #dc2626',
            boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
            cursor: 'pointer'
          }}
        >
          <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#991b1b', letterSpacing: '0.05em' }}>
            {t.kpiHighPriority || 'HIGH PRIORITY'}
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '6px' }}>
            <h2 style={{ margin: 0, fontSize: '1.9rem', fontWeight: '900', color: '#b91c1c' }}>
              {stats.highPriority}
            </h2>
            <AlertTriangle size={20} color="#dc2626" />
          </div>
        </div>

        {/* 3. IN PROGRESS */}
        <div
          onClick={() => {
            setStatusFilter('IN PROGRESS');
            setPriorityFilter('ALL');
          }}
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '18px',
            border: '1px solid #fde68a',
            borderLeft: '5px solid #d97706',
            boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
            cursor: 'pointer'
          }}
        >
          <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#92400e', letterSpacing: '0.05em' }}>
            {t.kpiInProgress || 'IN PROGRESS'}
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '6px' }}>
            <h2 style={{ margin: 0, fontSize: '1.9rem', fontWeight: '900', color: '#b45309' }}>
              {stats.inProgress}
            </h2>
            <Clock size={20} color="#d97706" />
          </div>
        </div>

        {/* 4. DONE */}
        <div
          onClick={() => {
            setStatusFilter('COMPLETED');
            setPriorityFilter('ALL');
          }}
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '18px',
            border: '1px solid #a7f3d0',
            borderLeft: '5px solid #10b981',
            boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
            cursor: 'pointer'
          }}
        >
          <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#065f46', letterSpacing: '0.05em' }}>
            {t.kpiDone || 'DONE'}
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '6px' }}>
            <h2 style={{ margin: 0, fontSize: '1.9rem', fontWeight: '900', color: '#047857' }}>
              {stats.done}
            </h2>
            <CheckCircle2 size={20} color="#10b981" />
          </div>
        </div>

        {/* 5. PENDING */}
        <div
          onClick={() => {
            setStatusFilter('PENDING');
            setPriorityFilter('ALL');
          }}
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '18px',
            border: '1px solid #e2e8f0',
            borderLeft: '5px solid #64748b',
            boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
            cursor: 'pointer'
          }}
        >
          <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#475569', letterSpacing: '0.05em' }}>
            {t.kpiPending || 'PENDING'}
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '6px' }}>
            <h2 style={{ margin: 0, fontSize: '1.9rem', fontWeight: '900', color: '#334155' }}>
              {stats.pending}
            </h2>
            <Hourglass size={20} color="#64748b" />
          </div>
        </div>
      </div>

      {/* OFFICER INDIVIDUAL STATISTICS BAR */}
      <div
        style={{
          backgroundColor: '#07172c',
          color: '#ffffff',
          borderRadius: '16px',
          padding: '16px 20px',
          marginBottom: '28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <UserCheck size={22} color="#f59e0b" />
          <div>
            <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '800' }}>
              {user?.name} &bull; Individual Officer Performance
            </h4>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              Computed live from database assignments
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <div>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase' }}>Assigned</span>
            <p style={{ margin: '1px 0 0', fontSize: '1.25rem', fontWeight: '800', color: '#f8fafc' }}>
              {officerStats.totalAssigned}
            </p>
          </div>
          <div>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase' }}>Completed</span>
            <p style={{ margin: '1px 0 0', fontSize: '1.25rem', fontWeight: '800', color: '#10b981' }}>
              {officerStats.totalCompleted}
            </p>
          </div>
          <div>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase' }}>Active/Pending</span>
            <p style={{ margin: '1px 0 0', fontSize: '1.25rem', fontWeight: '800', color: '#f59e0b' }}>
              {officerStats.totalPending}
            </p>
          </div>
        </div>
      </div>

      {/* SEARCH & FILTERS BAR */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '18px 20px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          marginBottom: '20px'
        }}
      >
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search
              size={18}
              color="#64748b"
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              placeholder="Search by Complaint ID, citizen mobile, village, or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
              padding: '0 18px',
              fontSize: '0.85rem',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            Search
          </button>
        </form>

        {/* Dropdowns Row: Priority, Category, Status, Date, Sort */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Priority */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '0.825rem',
              fontWeight: '600',
              color: '#334155',
              outline: 'none',
              backgroundColor: '#f8fafc'
            }}
          >
            <option value="ALL">All Priorities</option>
            <option value="High">🔴 High Priority</option>
            <option value="Moderate">🟡 Moderate Priority</option>
            <option value="Low">🟢 Low Priority</option>
          </select>

          {/* Category */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '0.825rem',
              fontWeight: '600',
              color: '#334155',
              outline: 'none',
              backgroundColor: '#f8fafc'
            }}
          >
            <option value="ALL">All Categories</option>
            <option value="Roads">Roads</option>
            <option value="Street Lights">Street Lights</option>
            <option value="Garbage">Garbage</option>
            <option value="Water">Water</option>
            <option value="Drainage">Drainage</option>
            <option value="Electricity">Electricity</option>
            <option value="Public Facilities">Public Facilities</option>
            <option value="Environment">Environment</option>
            <option value="Other">Other</option>
          </select>

          {/* Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '0.825rem',
              fontWeight: '600',
              color: '#334155',
              outline: 'none',
              backgroundColor: '#f8fafc'
            }}
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">All Pending (Submitted + Assigned + In Progress)</option>
            <option value="SUBMITTED">SUBMITTED</option>
            <option value="ASSIGNED">ASSIGNED</option>
            <option value="IN PROGRESS">IN PROGRESS</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="REJECTED">REJECTED</option>
          </select>

          {/* Date */}
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '0.825rem',
              fontWeight: '600',
              color: '#334155',
              outline: 'none',
              backgroundColor: '#f8fafc'
            }}
          >
            <option value="all">All Dates</option>
            <option value="today">Today's Reports</option>
            <option value="week">Past 7 Days</option>
            <option value="month">Past 30 Days</option>
          </select>

          {/* Scope */}
          <select
            value={scopeFilter}
            onChange={(e) => setScopeFilter(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '0.825rem',
              fontWeight: '600',
              color: '#334155',
              outline: 'none',
              backgroundColor: '#f8fafc'
            }}
          >
            <option value="all">All Assigned & Unassigned</option>
            <option value="unassigned">Unassigned (Queue)</option>
            <option value="my-assigned">Assigned to Me</option>
            <option value="my-completed">My Completed Proofs</option>
          </select>

          {/* Sort */}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ArrowUpDown size={15} color="#64748b" />
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.825rem',
                fontWeight: '700',
                color: '#0b2545',
                outline: 'none',
                backgroundColor: '#ffffff'
              }}
            >
              <option value="priority-first">Sort: High Priority First</option>
              <option value="newest">Sort: Newest First</option>
              <option value="oldest">Sort: Oldest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* COMPLAINTS LIST TABLE / CARDS */}
      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
          <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 12px', display: 'block' }} />
          <span>Loading complaints...</span>
        </div>
      ) : complaints.length === 0 ? (
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '50px 20px',
            textAlign: 'center',
            border: '2px dashed #cbd5e1'
          }}
        >
          <FileText size={42} color="#94a3b8" style={{ margin: '0 auto 12px', display: 'block' }} />
          <h3 style={{ margin: '0 0 6px', fontSize: '1.15rem', color: '#1e293b' }}>
            No complaints found matching the criteria.
          </h3>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
            Adjust your filters or clear the search query.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {complaints.map((item) => {
            const isHighPriority = item.priority === 'High';

            return (
              <div
                key={item.complaintId || item._id}
                onClick={() => onSelectComplaint(item.complaintId || item._id)}
                style={{
                  backgroundColor: isHighPriority ? '#fffafb' : '#ffffff',
                  borderRadius: '16px',
                  padding: '20px',
                  border: isHighPriority ? '2px solid #fecaca' : '1px solid #e2e8f0',
                  boxShadow: isHighPriority
                    ? '0 4px 14px rgba(220, 38, 38, 0.08)'
                    : '0 2px 4px rgba(0,0,0,0.03)',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  position: 'relative'
                }}
                onMouseOver={(e) => (e.currentTarget.style.borderColor = isHighPriority ? '#dc2626' : '#93c5fd')}
                onMouseOut={(e) => (e.currentTarget.style.borderColor = isHighPriority ? '#fecaca' : '#e2e8f0')}
              >
                {/* Priority ribbon banner if High Priority */}
                {isHighPriority && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '0',
                      left: '24px',
                      backgroundColor: '#dc2626',
                      color: '#ffffff',
                      fontSize: '0.65rem',
                      fontWeight: '900',
                      padding: '2px 8px',
                      borderRadius: '0 0 6px 6px',
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase'
                    }}
                  >
                    High Priority Action Required
                  </div>
                )}

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px',
                    marginBottom: '10px',
                    marginTop: isHighPriority ? '6px' : '0'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <span
                      style={{
                        fontFamily: 'monospace',
                        fontWeight: '900',
                        color: '#0b2545',
                        fontSize: '1rem'
                      }}
                    >
                      {item.complaintId}
                    </span>
                    <span
                      style={{
                        fontSize: '0.8rem',
                        fontWeight: '700',
                        color: '#0b2545',
                        backgroundColor: '#e0f2fe',
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

                {/* Description */}
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

                {/* Bottom Row */}
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
                      <strong>{item.location?.village || 'Locality'}</strong>, {item.location?.mandal || 'Mandal'}
                    </span>

                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={13} color="#64748b" />
                      <span>{formatTimestamp(item.createdAt)}</span>
                    </span>

                    <span>
                      Citizen: <strong>{item.citizenName || 'Citizen'}</strong> ({item.mobile})
                    </span>

                    {item.assignedOfficerName && (
                      <span style={{ color: '#0369a1', fontWeight: '700' }}>
                        Officer: {item.assignedOfficerName}
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
                    <span>Open Case & Actions &rarr;</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
