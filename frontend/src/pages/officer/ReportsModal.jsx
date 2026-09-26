import React, { useState, useEffect } from 'react';
import { X, BarChart3, Layers, Calendar, CheckCircle2, Clock, Hourglass, RefreshCw } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function ReportsModal({ isOpen, onClose, initialTab = 'weekly' }) {
  const { t } = useAuth();
  const [activeTab, setActiveTab] = useState(initialTab); // 'weekly' | 'monthly'
  const [reportsData, setReportsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const fetchReports = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.getOfficerReports();
      if (res.success) {
        setReportsData(res);
      }
    } catch (err) {
      setError(err.message || 'Failed to load report analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchReports();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentReport = activeTab === 'weekly' ? reportsData?.weekly : reportsData?.monthly;

  // Compute max count for category bar scaling
  const maxCategoryCount = currentReport?.categories?.reduce(
    (max, item) => (item.count > max ? item.count : max),
    1
  ) || 1;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.7)',
        backdropFilter: 'blur(4px)',
        zIndex: 9000,
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
          maxWidth: '740px',
          maxHeight: '88vh',
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            backgroundColor: '#07172c',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '3px solid #0284c7'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BarChart3 size={22} color="#38bdf8" />
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800' }}>
              Municipal Redressal Reports & Analytics
            </h3>
          </div>

          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#ffffff', cursor: 'pointer', padding: '4px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Toggle: Weekly vs Monthly */}
        <div
          style={{
            display: 'flex',
            backgroundColor: '#f1f5f9',
            padding: '4px 24px',
            borderBottom: '1px solid #e2e8f0'
          }}
        >
          <button
            onClick={() => setActiveTab('weekly')}
            style={{
              padding: '12px 20px',
              border: 'none',
              background: 'transparent',
              color: activeTab === 'weekly' ? '#0284c7' : '#64748b',
              fontWeight: activeTab === 'weekly' ? '800' : '600',
              fontSize: '0.9rem',
              borderBottom: activeTab === 'weekly' ? '3px solid #0284c7' : '3px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Calendar size={16} />
            <span>{t.weeklyReport || 'Weekly Report (Past 7 Days)'}</span>
          </button>

          <button
            onClick={() => setActiveTab('monthly')}
            style={{
              padding: '12px 20px',
              border: 'none',
              background: 'transparent',
              color: activeTab === 'monthly' ? '#0284c7' : '#64748b',
              fontWeight: activeTab === 'monthly' ? '800' : '600',
              fontSize: '0.9rem',
              borderBottom: activeTab === 'monthly' ? '3px solid #0284c7' : '3px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Layers size={16} />
            <span>{t.monthlyReport || 'Monthly Report (Past 30 Days)'}</span>
          </button>
        </div>

        {/* Body */}
        <div style={{ overflowY: 'auto', padding: '24px', flex: 1 }}>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
              <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 8px', display: 'block' }} />
              <span>Compiling live grievance analytics from database...</span>
            </div>
          ) : error ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#b91c1c' }}>{error}</div>
          ) : currentReport ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Top 3 Summary Cards: Received, Solved, Pending */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
                <div
                  style={{
                    backgroundColor: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    borderRadius: '12px',
                    padding: '16px',
                    textAlign: 'center'
                  }}
                >
                  <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#1e40af', textTransform: 'uppercase' }}>
                    {t.receivedCount || 'Received'}
                  </span>
                  <h3 style={{ margin: '4px 0 0', fontSize: '1.8rem', fontWeight: '900', color: '#1e3a8a' }}>
                    {currentReport.received}
                  </h3>
                </div>

                <div
                  style={{
                    backgroundColor: '#ecfdf5',
                    border: '1px solid #a7f3d0',
                    borderRadius: '12px',
                    padding: '16px',
                    textAlign: 'center'
                  }}
                >
                  <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#065f46', textTransform: 'uppercase' }}>
                    {t.solvedCount || 'Solved'}
                  </span>
                  <h3 style={{ margin: '4px 0 0', fontSize: '1.8rem', fontWeight: '900', color: '#047857' }}>
                    {currentReport.solved}
                  </h3>
                </div>

                <div
                  style={{
                    backgroundColor: '#fffbeb',
                    border: '1px solid #fde68a',
                    borderRadius: '12px',
                    padding: '16px',
                    textAlign: 'center'
                  }}
                >
                  <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#92400e', textTransform: 'uppercase' }}>
                    Pending
                  </span>
                  <h3 style={{ margin: '4px 0 0', fontSize: '1.8rem', fontWeight: '900', color: '#b45309' }}>
                    {currentReport.pending}
                  </h3>
                </div>
              </div>

              {/* Category Breakdown Progress Bars */}
              <div>
                <h4 style={{ margin: '0 0 14px', fontSize: '1rem', fontWeight: '800', color: '#1e293b' }}>
                  {t.categoryBreakdown || 'Category-wise Grievance Breakdown'}
                </h4>

                {currentReport.categories?.length === 0 ? (
                  <p style={{ fontSize: '0.85rem', color: '#64748b' }}>No category data logged in this period.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {currentReport.categories.map((item) => {
                      const percentage = Math.round((item.count / maxCategoryCount) * 100);

                      return (
                        <div key={item.category}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem', fontWeight: '700', marginBottom: '4px' }}>
                            <span style={{ color: '#334155' }}>{item.category}</span>
                            <span style={{ color: '#0284c7' }}>{item.count} complaints</span>
                          </div>
                          <div
                            style={{
                              width: '100%',
                              height: '8px',
                              backgroundColor: '#e2e8f0',
                              borderRadius: '4px',
                              overflow: 'hidden'
                            }}
                          >
                            <div
                              style={{
                                width: `${percentage}%`,
                                height: '100%',
                                backgroundColor: '#f97316',
                                borderRadius: '4px',
                                transition: 'width 0.4s ease'
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Monthly Extra Breakdown: Priorities & Statuses */}
              {activeTab === 'monthly' && reportsData?.monthly?.priorities && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginTop: '10px' }}>
                  <div style={{ backgroundColor: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <h5 style={{ margin: '0 0 10px', fontSize: '0.85rem', fontWeight: '800', color: '#0f172a' }}>
                      Priority Mix
                    </h5>
                    {reportsData.monthly.priorities.map((p) => (
                      <div key={p.priority} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', padding: '4px 0' }}>
                        <span style={{ fontWeight: '600' }}>{p.priority} Priority:</span>
                        <strong style={{ color: p.priority === 'High' ? '#dc2626' : p.priority === 'Moderate' ? '#d97706' : '#16a34a' }}>
                          {p.count}
                        </strong>
                      </div>
                    ))}
                  </div>

                  <div style={{ backgroundColor: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <h5 style={{ margin: '0 0 10px', fontSize: '0.85rem', fontWeight: '800', color: '#0f172a' }}>
                      Status Distribution
                    </h5>
                    {reportsData.monthly.statuses?.map((st) => (
                      <div key={st.status} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', padding: '4px 0' }}>
                        <span style={{ fontWeight: '600' }}>{st.status}:</span>
                        <strong style={{ color: '#0b2545' }}>{st.count}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
