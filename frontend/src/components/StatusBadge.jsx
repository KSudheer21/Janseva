import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function StatusBadge({ status, size = 'md' }) {
  const { t } = useAuth();
  const normalized = (status || 'SUBMITTED').toUpperCase();

  const configs = {
    SUBMITTED: {
      label: t.statusSubmitted || 'SUBMITTED',
      bg: '#eff6ff',
      color: '#1d4ed8',
      border: '#bfdbfe'
    },
    ASSIGNED: {
      label: t.statusAssigned || 'ASSIGNED',
      bg: '#faf5ff',
      color: '#7e22ce',
      border: '#e9d5ff'
    },
    'IN PROGRESS': {
      label: t.statusInProgress || 'IN PROGRESS',
      bg: '#fffbeb',
      color: '#b45309',
      border: '#fde68a'
    },
    COMPLETED: {
      label: t.statusCompleted || 'COMPLETED',
      bg: '#ecfdf5',
      color: '#047857',
      border: '#a7f3d0'
    },
    REJECTED: {
      label: t.statusRejected || 'REJECTED',
      bg: '#fef2f2',
      color: '#b91c1c',
      border: '#fecaca'
    }
  };

  const config = configs[normalized] || configs.SUBMITTED;

  const fontSizes = {
    sm: '0.75rem',
    md: '0.8rem',
    lg: '0.875rem'
  };

  const paddings = {
    sm: '2px 8px',
    md: '4px 10px',
    lg: '6px 14px'
  };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        backgroundColor: config.bg,
        color: config.color,
        border: `1px solid ${config.border}`,
        borderRadius: '9999px',
        padding: paddings[size] || paddings.md,
        fontSize: fontSizes[size] || fontSizes.md,
        fontWeight: '700',
        letterSpacing: '0.025em',
        textTransform: 'uppercase'
      }}
    >
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: config.color
        }}
      />
      {config.label}
    </span>
  );
}
