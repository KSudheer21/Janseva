import React from 'react';
import { Bell, CheckCheck, X, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function NotificationsModal({ isOpen, onClose, onSelectComplaint }) {
  const { notifications, unreadCount, loadNotifications, t } = useAuth();

  if (!isOpen) return null;

  const handleMarkAsRead = async (id) => {
    try {
      await api.markNotificationRead(id);
      loadNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  const handleNotificationClick = (item) => {
    handleMarkAsRead(item._id);
    if (item.complaintId && onSelectComplaint) {
      onSelectComplaint(item.complaintId);
      onClose();
    }
  };

  const formatTimestamp = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) +
        ', ' + d.toLocaleDateString([], { day: 'numeric', month: 'short' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.5)',
        backdropFilter: 'blur(3px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'flex-end',
        padding: '60px 16px 20px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '400px',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2), 0 8px 10px -6px rgba(0,0,0,0.1)',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '80vh'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
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
            <Bell size={18} color="#f97316" />
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '700' }}>
              {t.notifications || 'Notifications'}
            </h3>
            {unreadCount > 0 && (
              <span
                style={{
                  backgroundColor: '#ef4444',
                  color: '#ffffff',
                  fontSize: '0.7rem',
                  fontWeight: '800',
                  padding: '2px 7px',
                  borderRadius: '9999px'
                }}
              >
                {unreadCount}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Notification list */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '12px' }}>
          {notifications.length === 0 ? (
            <div style={{ padding: '36px 16px', textAlign: 'center', color: '#94a3b8' }}>
              <Info size={32} style={{ margin: '0 auto 8px', display: 'block', opacity: 0.6 }} />
              <p style={{ margin: 0, fontSize: '0.875rem' }}>
                {t.noNotifications || 'No notifications at this time.'}
              </p>
            </div>
          ) : (
            notifications.map((item) => (
              <div
                key={item._id}
                onClick={() => handleNotificationClick(item)}
                style={{
                  padding: '12px 14px',
                  borderRadius: '10px',
                  backgroundColor: item.isRead ? '#ffffff' : '#f0fdf4',
                  border: item.isRead ? '1px solid #f1f5f9' : '1px solid #bbf7d0',
                  marginBottom: '8px',
                  cursor: 'pointer',
                  transition: 'background 0.2s ease',
                  position: 'relative'
                }}
              >
                {!item.isRead && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: '#10b981'
                    }}
                  />
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  {item.status === 'COMPLETED' ? (
                    <CheckCircle size={15} color="#16a34a" />
                  ) : (
                    <Info size={15} color="#0284c7" />
                  )}
                  <h4 style={{ margin: 0, fontSize: '0.875rem', fontWeight: '700', color: '#1e293b' }}>
                    {item.title}
                  </h4>
                </div>
                <p style={{ margin: '0 0 6px', fontSize: '0.8rem', color: '#475569', lineHeight: 1.4 }}>
                  {item.message}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.72rem', color: '#94a3b8' }}>
                  <span>{item.complaintId}</span>
                  <span>{formatTimestamp(item.createdAt)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
