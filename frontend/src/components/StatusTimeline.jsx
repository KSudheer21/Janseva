import React from 'react';
import { CheckCircle2, Clock, PlayCircle, AlertCircle, XCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function StatusTimeline({ timeline = [], currentStatus = 'SUBMITTED' }) {
  const { t } = useAuth();

  const standardStages = ['SUBMITTED', 'ASSIGNED', 'IN PROGRESS', 'COMPLETED'];
  const isRejected = currentStatus === 'REJECTED';

  const stagesToDisplay = isRejected ? ['SUBMITTED', 'REJECTED'] : standardStages;

  const getStageIndex = (st) => stagesToDisplay.indexOf(st);
  const currentStageIndex = getStageIndex(currentStatus);

  const getStageIcon = (stageName, isPast, isCurrent) => {
    if (stageName === 'REJECTED') {
      return <XCircle size={18} color="#ef4444" />;
    }
    if (isPast || (isCurrent && stageName === 'COMPLETED')) {
      return <CheckCircle2 size={18} color="#10b981" />;
    }
    if (isCurrent) {
      return <PlayCircle size={18} color="#f59e0b" />;
    }
    return <Clock size={16} color="#94a3b8" />;
  };

  const getStageLabel = (st) => {
    switch (st) {
      case 'SUBMITTED':
        return t.statusSubmitted || 'SUBMITTED';
      case 'ASSIGNED':
        return t.statusAssigned || 'ASSIGNED';
      case 'IN PROGRESS':
        return t.statusInProgress || 'IN PROGRESS';
      case 'COMPLETED':
        return t.statusCompleted || 'COMPLETED';
      case 'REJECTED':
        return t.statusRejected || 'REJECTED';
      default:
        return st;
    }
  };

  // Find matching timeline log item
  const findLogItem = (stage) => {
    return [...timeline].reverse().find((item) => item.status === stage);
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
    <div className="status-timeline-container" style={{ padding: '12px 0' }}>
      {/* Horizontal Pipeline Steps */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative',
          marginBottom: '28px'
        }}
      >
        {/* Background track line */}
        <div
          style={{
            position: 'absolute',
            top: '16px',
            left: '20px',
            right: '20px',
            height: '4px',
            backgroundColor: '#e2e8f0',
            zIndex: 1
          }}
        />

        {/* Progress fill line */}
        <div
          style={{
            position: 'absolute',
            top: '16px',
            left: '20px',
            width: isRejected
              ? '100%'
              : `${Math.max(0, (currentStageIndex / (stagesToDisplay.length - 1)) * 100)}%`,
            height: '4px',
            backgroundColor: isRejected ? '#ef4444' : '#10b981',
            transition: 'width 0.4s ease',
            zIndex: 2
          }}
        />

        {stagesToDisplay.map((stage, idx) => {
          const isPast = idx < currentStageIndex;
          const isCurrent = idx === currentStageIndex;
          const isUpcoming = idx > currentStageIndex;

          return (
            <div
              key={stage}
              style={{
                position: 'relative',
                zIndex: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                flex: 1
              }}
            >
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  backgroundColor: isCurrent
                    ? '#ffffff'
                    : isPast || (isCurrent && stage === 'COMPLETED')
                    ? '#ecfdf5'
                    : stage === 'REJECTED'
                    ? '#fef2f2'
                    : '#f8fafc',
                  border: isCurrent
                    ? isRejected
                      ? '3px solid #ef4444'
                      : '3px solid #f59e0b'
                    : isPast
                    ? '2px solid #10b981'
                    : stage === 'REJECTED'
                    ? '2px solid #ef4444'
                    : '2px solid #cbd5e1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: isCurrent ? '0 0 0 4px rgba(245, 158, 11, 0.2)' : 'none',
                  transition: 'all 0.3s ease'
                }}
              >
                {getStageIcon(stage, isPast, isCurrent)}
              </div>
              <span
                style={{
                  marginTop: '8px',
                  fontSize: '0.75rem',
                  fontWeight: isCurrent ? '800' : '600',
                  color: isCurrent
                    ? isRejected
                      ? '#b91c1c'
                      : '#b45309'
                    : isPast
                    ? '#047857'
                    : '#64748b',
                  textAlign: 'center',
                  whiteSpace: 'nowrap'
                }}
              >
                {getStageLabel(stage)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Detailed Chronological History Log */}
      <div style={{ borderLeft: '2px solid #e2e8f0', marginLeft: '16px', paddingLeft: '18px' }}>
        {timeline.map((item, idx) => (
          <div
            key={idx}
            style={{
              position: 'relative',
              marginBottom: idx === timeline.length - 1 ? '4px' : '20px'
            }}
          >
            {/* Timeline node bullet */}
            <div
              style={{
                position: 'absolute',
                left: '-25px',
                top: '3px',
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor:
                  item.status === 'COMPLETED'
                    ? '#10b981'
                    : item.status === 'REJECTED'
                    ? '#ef4444'
                    : item.status === 'IN PROGRESS'
                    ? '#f59e0b'
                    : '#3b82f6',
                border: '2px solid #ffffff',
                boxShadow: '0 0 0 2px rgba(0,0,0,0.05)'
              }}
            />

            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4px' }}>
              <span style={{ fontWeight: '700', fontSize: '0.875rem', color: '#1e293b' }}>
                {item.title || item.status}
              </span>
              <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '500' }}>
                {formatTimestamp(item.timestamp)}
              </span>
            </div>

            {item.description && (
              <p style={{ margin: '4px 0 2px', fontSize: '0.8125rem', color: '#475569', lineHeight: 1.45 }}>
                {item.description}
              </p>
            )}

            {item.performedBy && (
              <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontStyle: 'italic' }}>
                Updated by: {item.performedBy}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
