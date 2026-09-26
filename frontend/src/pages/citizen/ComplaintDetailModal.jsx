import React, { useState, useEffect } from 'react';
import {
  X,
  MapPin,
  Calendar,
  Clock,
  User,
  Shield,
  Phone,
  CheckCircle,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import PriorityBadge from '../../components/PriorityBadge';
import StatusTimeline from '../../components/StatusTimeline';
import BeforeAfterViewer from '../../components/BeforeAfterViewer';
import ComplaintMap from '../../components/ComplaintMap';

export default function ComplaintDetailModal({ complaintId, onClose }) {
  const { t } = useAuth();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.getMyComplaintById(complaintId);
      if (res.success) {
        setComplaint(res.complaint);
      }
    } catch (err) {
      setError(err.message || 'Failed to load complaint details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (complaintId) {
      loadDetails();
    }
  }, [complaintId]);

  if (!complaintId) return null;

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
          maxWidth: '820px',
          maxHeight: '90vh',
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '18px 24px',
            backgroundColor: '#0b2545',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '3px solid #f97316'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span
              style={{
                fontFamily: 'monospace',
                fontSize: '1.25rem',
                fontWeight: '900',
                letterSpacing: '0.05em',
                color: '#ffffff'
              }}
            >
              {complaint ? complaint.complaintId : complaintId}
            </span>
            {complaint && <StatusBadge status={complaint.status} size="sm" />}
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#ffffff',
              cursor: 'pointer',
              padding: '6px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ overflowY: 'auto', padding: '24px', flex: 1 }}>
          {loading ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
              <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 12px', display: 'block' }} />
              <span>Loading complete grievance details...</span>
            </div>
          ) : error ? (
            <div style={{ padding: '30px', textAlign: 'center', color: '#b91c1c' }}>
              <AlertTriangle size={32} style={{ margin: '0 auto 10px', display: 'block' }} />
              <p>{error}</p>
            </div>
          ) : complaint ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
              {/* Category, Priority & Date Badges */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '10px',
                  padding: '12px 16px',
                  backgroundColor: '#f8fafc',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#0b2545', backgroundColor: '#e0f2fe', padding: '4px 10px', borderRadius: '6px' }}>
                    {complaint.category}
                  </span>
                  <PriorityBadge priority={complaint.priority} size="md" />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#64748b' }}>
                  <Calendar size={14} />
                  <span>{formatTimestamp(complaint.createdAt)}</span>
                </div>
              </div>

              {/* Problem Description */}
              <div>
                <h4 style={{ margin: '0 0 6px', fontSize: '0.9rem', fontWeight: '800', color: '#1e293b' }}>
                  Problem Description
                </h4>
                <div
                  style={{
                    padding: '14px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '10px',
                    fontSize: '0.925rem',
                    lineHeight: 1.55,
                    color: '#334155'
                  }}
                >
                  {complaint.description}
                </div>
              </div>

              {/* BEFORE & AFTER PHOTO EVIDENCE */}
              <BeforeAfterViewer
                beforePhotoUrl={complaint.photoUrl}
                afterPhotoUrl={complaint.completionPhotoUrl}
                resolutionNote={complaint.resolutionNote}
                category={complaint.category}
              />

              {/* Status Timeline */}
              <div
                style={{
                  backgroundColor: '#ffffff',
                  padding: '18px 20px',
                  borderRadius: '14px',
                  border: '1px solid #e2e8f0'
                }}
              >
                <h4 style={{ margin: '0 0 14px', fontSize: '0.95rem', fontWeight: '800', color: '#0f172a' }}>
                  {t.statusTimeline || 'Resolution Timeline'}
                </h4>
                <StatusTimeline
                  timeline={complaint.timeline || []}
                  currentStatus={complaint.status}
                />
              </div>

              {/* Assigned Officer Information */}
              {complaint.assignedOfficerName && (
                <div
                  style={{
                    padding: '14px 18px',
                    backgroundColor: '#f0f9ff',
                    border: '1px solid #bae6fd',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px'
                  }}
                >
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      backgroundColor: '#0284c7',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <User size={22} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#0369a1', textTransform: 'uppercase' }}>
                      {t.assignedOfficer || 'Assigned Officer'}
                    </span>
                    <h5 style={{ margin: '1px 0 0', fontSize: '0.95rem', fontWeight: '800', color: '#0c4a6e' }}>
                      {complaint.assignedOfficerName} ({complaint.assignedOfficerCode || 'Nodal'})
                    </h5>
                    {complaint.assignedAt && (
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        Assigned on {formatTimestamp(complaint.assignedAt)}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Rejection notice if rejected */}
              {complaint.status === 'REJECTED' && (
                <div
                  style={{
                    padding: '14px 18px',
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '12px',
                    color: '#b91c1c'
                  }}
                >
                  <h5 style={{ margin: '0 0 4px', fontSize: '0.9rem', fontWeight: '800' }}>
                    Complaint Rejected
                  </h5>
                  <p style={{ margin: 0, fontSize: '0.85rem' }}>
                    Reason: {complaint.rejectionReason || 'Does not fall within municipal jurisdiction.'}
                  </p>
                </div>
              )}

              {/* Geotagged Location & Map */}
              {complaint.location?.latitude && (
                <div>
                  <h4 style={{ margin: '0 0 8px', fontSize: '0.9rem', fontWeight: '800', color: '#1e293b' }}>
                    Geotagged Incident Location
                  </h4>
                  <ComplaintMap
                    latitude={complaint.location.latitude}
                    longitude={complaint.location.longitude}
                    address={complaint.location.exactAddress}
                    village={complaint.location.village}
                    mandal={complaint.location.mandal}
                    district={complaint.location.district}
                    height="200px"
                  />
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
