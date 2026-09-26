import React from 'react';
import { AlertTriangle, Clock, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function PriorityBadge({ priority, size = 'md' }) {
  const { t } = useAuth();
  const normalized = (priority || 'Moderate').toLowerCase();

  const configs = {
    high: {
      label: t.priorityHigh || 'High',
      className: 'bg-red-50 text-red-700 border-red-200 shadow-sm',
      dotColor: 'bg-red-500',
      icon: AlertTriangle,
      colorHex: '#dc2626'
    },
    moderate: {
      label: t.priorityModerate || 'Moderate',
      className: 'bg-amber-50 text-amber-800 border-amber-200 shadow-sm',
      dotColor: 'bg-amber-500',
      icon: Clock,
      colorHex: '#d97706'
    },
    low: {
      label: t.priorityLow || 'Low',
      className: 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm',
      dotColor: 'bg-emerald-500',
      icon: CheckCircle,
      colorHex: '#059669'
    }
  };

  const config = configs[normalized] || configs.moderate;
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs font-semibold px-2.5 py-1 gap-1.5',
    lg: 'text-sm font-semibold px-3 py-1.5 gap-2'
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border ${config.className} ${sizeClasses[size] || sizeClasses.md}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        borderRadius: '9999px',
        borderWidth: '1px',
        fontWeight: '600',
        lineHeight: 1
      }}
    >
      <span
        style={{
          width: '7px',
          height: '7px',
          borderRadius: '50%',
          backgroundColor: config.colorHex,
          display: 'inline-block'
        }}
      />
      <span>{config.label}</span>
    </span>
  );
}
