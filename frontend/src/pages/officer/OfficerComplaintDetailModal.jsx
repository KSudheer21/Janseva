import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  User,
  Phone,
  MapPin,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Play,
  Upload,
  RefreshCw,
  Camera,
  Image,
  FileCheck,
  Ban
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import PriorityBadge from '../../components/PriorityBadge';
import StatusTimeline from '../../components/StatusTimeline';
import BeforeAfterViewer from '../../components/BeforeAfterViewer';
import ComplaintMap from '../../components/ComplaintMap';

export default function OfficerComplaintDetailModal({ complaintId, onClose, onRefreshList }) {
  const { user, t } = useAuth();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Complete Modal State
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [completionFile, setCompletionFile] = useState(null);
  const [completionPreview, setCompletionPreview] = useState(null);
  const [resolutionNote, setResolutionNote] = useState('');
  const completionInputRef = useRef(null);

  // Reject Modal State
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const loadDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.getOfficerComplaintById(complaintId);
      if (res.success) {
        setComplaint(res.complaint);
      }
    } catch (err) {
      setError(err.message || 'Failed to load complaint.');
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

  // 1. Assign to self
  const handleAssign = async () => {
    setActionLoading(true);
    try {
      const res = await api.assignComplaint(complaintId);
      if (res.success) {
        setComplaint(res.complaint);
        if (onRefreshList) onRefreshList();
      }
    } catch (err) {
      alert(err.message || 'Failed to assign complaint.');
    } finally {
      setActionLoading(false);
    }
  };

  // 2. Start Work (Status IN PROGRESS)
  const handleStartWork = async () => {
    setActionLoading(true);
    try {
      const res = await api.updateComplaintStatus(complaintId, {
        status: 'IN PROGRESS',
        note: `Field team inspected site. Repair work commenced under officer supervision.`
      });
      if (res.success) {
        setComplaint(res.complaint);
        if (onRefreshList) onRefreshList();
      }
    } catch (err) {
      alert(err.message || 'Failed to start work.');
    } finally {
      setActionLoading(false);
    }
  };

  // 3. Complete (with completion photo & resolution note)
  const handleCompleteSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);

    try {
      const formData = new FormData();
      formData.append('resolutionNote', resolutionNote || 'Problem solved and verified on site.');
      if (completionFile) {
        formData.append('completionPhoto', completionFile);
      }

      const res = await api.completeComplaint(complaintId, formData);
      if (res.success) {
        setComplaint(res.complaint);
        setShowCompleteModal(false);
        if (onRefreshList) onRefreshList();
      }
    } catch (err) {
      alert(err.message || 'Failed to mark as completed.');
    } finally {
      setActionLoading(false);
    }
  };

  // 4. Reject
  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) {
      alert('Please provide a reason for rejection.');
      return;
    }

    setActionLoading(true);
    try {
      const res = await api.updateComplaintStatus(complaintId, {
        status: 'REJECTED',
        rejectionReason: rejectionReason.trim()
      });
      if (res.success) {
        setComplaint(res.complaint);
        setShowRejectModal(false);
        if (onRefreshList) onRefreshList();
      }
    } catch (err) {
      alert(err.message || 'Failed to reject complaint.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompletionPhotoSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCompletionFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setCompletionPreview(event.target.result);
      };
      reader.readAsDataURL(file);
    }
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
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
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
          maxWidth: '880px',
          maxHeight: '92vh',
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '18px 24px',
            backgroundColor: '#07172c',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '3px solid #f59e0b'
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
            {complaint && <PriorityBadge priority={complaint.priority} size="sm" />}
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

        {/* Body */}
        <div style={{ overflowY: 'auto', padding: '24px', flex: 1 }}>
          {loading ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
              <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 12px', display: 'block' }} />
              <span>Loading grievance details...</span>
            </div>
          ) : error ? (
            <div style={{ padding: '30px', textAlign: 'center', color: '#b91c1c' }}>
              <AlertTriangle size={32} style={{ margin: '0 auto 10px', display: 'block' }} />
              <p>{error}</p>
            </div>
          ) : complaint ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
              {/* ACTION WORKFLOW BUTTONS BAR (ASSIGN, START WORK, MARK COMPLETED, REJECT) */}
              <div
                style={{
                  padding: '16px 20px',
                  backgroundColor: '#f8fafc',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}
              >
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>
                    Officer Workflow Actions
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: '700', color: '#0b2545' }}>
                      Current Status:
                    </span>
                    <StatusBadge status={complaint.status} size="sm" />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {/* ASSIGN button */}
                  {complaint.status === 'SUBMITTED' && (
                    <button
                      onClick={handleAssign}
                      disabled={actionLoading}
                      style={{
                        backgroundColor: '#2563eb',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '10px 16px',
                        fontSize: '0.85rem',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: '0 2px 6px rgba(37,99,235,0.3)'
                      }}
                    >
                      <User size={15} />
                      <span>{t.assignToMe || 'Assign to Me'}</span>
                    </button>
                  )}

                  {/* START WORK button */}
                  {complaint.status === 'ASSIGNED' && (
                    <button
                      onClick={handleStartWork}
                      disabled={actionLoading}
                      style={{
                        backgroundColor: '#d97706',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '10px 16px',
                        fontSize: '0.85rem',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: '0 2px 6px rgba(217,119,6,0.3)'
                      }}
                    >
                      <Play size={15} />
                      <span>{t.startWork || 'Start Work'}</span>
                    </button>
                  )}

                  {/* MARK COMPLETED button */}
                  {(complaint.status === 'ASSIGNED' || complaint.status === 'IN PROGRESS') && (
                    <button
                      onClick={() => setShowCompleteModal(true)}
                      disabled={actionLoading}
                      style={{
                        backgroundColor: '#16a34a',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '10px 18px',
                        fontSize: '0.85rem',
                        fontWeight: '800',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: '0 2px 6px rgba(22,163,74,0.3)'
                      }}
                    >
                      <CheckCircle size={15} />
                      <span>{t.markCompleted || 'Mark Completed (Upload Proof)'}</span>
                    </button>
                  )}

                  {/* REJECT button */}
                  {complaint.status !== 'COMPLETED' && complaint.status !== 'REJECTED' && (
                    <button
                      onClick={() => setShowRejectModal(true)}
                      disabled={actionLoading}
                      style={{
                        backgroundColor: '#f1f5f9',
                        color: '#b91c1c',
                        border: '1px solid #fecaca',
                        borderRadius: '8px',
                        padding: '10px 14px',
                        fontSize: '0.85rem',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Ban size={15} />
                      <span>{t.rejectGrievance || 'Reject'}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Citizen Details Box */}
              <div
                style={{
                  padding: '16px 20px',
                  backgroundColor: '#f0f9ff',
                  border: '1px solid #bae6fd',
                  borderRadius: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '14px'
                }}
              >
                <div>
                  <span style={{ fontSize: '0.72rem', fontWeight: '700', color: '#0369a1', textTransform: 'uppercase' }}>
                    Citizen Contact Details
                  </span>
                  <h4 style={{ margin: '2px 0 0', fontSize: '1rem', fontWeight: '800', color: '#0c4a6e' }}>
                    {complaint.citizenName || 'Citizen'}
                  </h4>
                  <span style={{ fontSize: '0.85rem', color: '#334155', fontWeight: '600' }}>
                    Mobile: +91 {complaint.mobile}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <a
                    href={`tel:${complaint.mobile}`}
                    style={{
                      backgroundColor: '#0284c7',
                      color: '#ffffff',
                      textDecoration: 'none',
                      borderRadius: '8px',
                      padding: '8px 14px',
                      fontSize: '0.8rem',
                      fontWeight: '700',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <Phone size={14} />
                    <span>Call Citizen</span>
                  </a>
                </div>
              </div>

              {/* Problem Description */}
              <div>
                <h4 style={{ margin: '0 0 6px', fontSize: '0.9rem', fontWeight: '800', color: '#1e293b' }}>
                  Reported Problem Description
                </h4>
                <div
                  style={{
                    padding: '14px',
                    backgroundColor: '#f8fafc',
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

              {/* BEFORE & AFTER PHOTO EVIDENCE COMPARISON */}
              <BeforeAfterViewer
                beforePhotoUrl={complaint.photoUrl}
                afterPhotoUrl={complaint.completionPhotoUrl}
                resolutionNote={complaint.resolutionNote}
                category={complaint.category}
              />

              {/* Interactive Map & Exact Geotag */}
              <div>
                <h4 style={{ margin: '0 0 8px', fontSize: '0.9rem', fontWeight: '800', color: '#1e293b' }}>
                  Geotagged Incident Location & Map
                </h4>
                <ComplaintMap
                  latitude={complaint.location.latitude}
                  longitude={complaint.location.longitude}
                  address={complaint.location.exactAddress}
                  village={complaint.location.village}
                  mandal={complaint.location.mandal}
                  district={complaint.location.district}
                  height="220px"
                />
              </div>

              {/* Resolution Timeline */}
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
            </div>
          ) : null}
        </div>

        {/* MODAL: MARK COMPLETED WITH PHOTO UPLOAD */}
        {showCompleteModal && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.7)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px'
            }}
            onClick={() => setShowCompleteModal(false)}
          >
            <div
              style={{
                maxWidth: '520px',
                width: '100%',
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                style={{
                  padding: '16px 20px',
                  backgroundColor: '#15803d',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '800' }}>
                  {t.completeModalTitle || 'Complete Complaint with Verification Photo'}
                </h3>
                <button
                  onClick={() => setShowCompleteModal(false)}
                  style={{ background: 'transparent', border: 'none', color: '#ffffff', cursor: 'pointer' }}
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCompleteSubmit} style={{ padding: '24px' }}>
                <input
                  type="file"
                  ref={completionInputRef}
                  onChange={handleCompletionPhotoSelect}
                  accept="image/jpeg,image/png,image/webp"
                  style={{ display: 'none' }}
                />

                <div style={{ marginBottom: '18px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#334155', marginBottom: '8px' }}>
                    {t.uploadCompletionPhoto || 'Upload Resolution Photo (Proof)'}
                  </label>

                  {completionPreview ? (
                    <div style={{ position: 'relative', borderRadius: '10px', overflow: 'hidden', border: '1px solid #bbf7d0' }}>
                      <img src={completionPreview} alt="Resolution Preview" style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
                      <button
                        type="button"
                        onClick={() => completionInputRef.current?.click()}
                        style={{
                          position: 'absolute',
                          bottom: '10px',
                          right: '10px',
                          backgroundColor: 'rgba(0,0,0,0.7)',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '6px 12px',
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          cursor: 'pointer'
                        }}
                      >
                        Change Photo
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => completionInputRef.current?.click()}
                      style={{
                        border: '2px dashed #cbd5e1',
                        borderRadius: '10px',
                        padding: '24px',
                        textAlign: 'center',
                        backgroundColor: '#f8fafc',
                        cursor: 'pointer'
                      }}
                    >
                      <Camera size={32} color="#16a34a" style={{ margin: '0 auto 8px', display: 'block' }} />
                      <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#166534' }}>
                        Click to take photo / upload resolved condition
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginTop: '4px' }}>
                        JPG, JPEG, PNG, WEBP (Max 5MB)
                      </span>
                    </div>
                  )}
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                    Official Resolution Note
                  </label>
                  <textarea
                    rows={3}
                    value={resolutionNote}
                    onChange={(e) => setResolutionNote(e.target.value)}
                    placeholder="Details of repair work, material used, on-site verification..."
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '0.875rem',
                      outline: 'none',
                      fontFamily: 'inherit'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setShowCompleteModal(false)}
                    style={{
                      flex: 1,
                      padding: '12px',
                      backgroundColor: '#f1f5f9',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: '700',
                      color: '#475569',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    style={{
                      flex: 2,
                      padding: '12px',
                      backgroundColor: '#16a34a',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: '800',
                      color: '#ffffff',
                      cursor: 'pointer'
                    }}
                  >
                    {actionLoading ? 'Completing...' : t.confirmComplete || 'Confirm & Complete'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: REJECT GRIEVANCE */}
        {showRejectModal && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.7)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px'
            }}
            onClick={() => setShowRejectModal(false)}
          >
            <div
              style={{
                maxWidth: '460px',
                width: '100%',
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                style={{
                  padding: '16px 20px',
                  backgroundColor: '#b91c1c',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '800' }}>
                  {t.rejectModalTitle || 'Reject Grievance'}
                </h3>
                <button
                  onClick={() => setShowRejectModal(false)}
                  style={{ background: 'transparent', border: 'none', color: '#ffffff', cursor: 'pointer' }}
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleRejectSubmit} style={{ padding: '24px' }}>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                    Reason for Rejection (Visible to Citizen)
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Provide a clear official explanation (e.g. falls under National Highways Authority jurisdiction, duplicate complaint)..."
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '0.875rem',
                      outline: 'none',
                      fontFamily: 'inherit'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setShowRejectModal(false)}
                    style={{
                      flex: 1,
                      padding: '12px',
                      backgroundColor: '#f1f5f9',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: '700',
                      color: '#475569',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading || !rejectionReason.trim()}
                    style={{
                      flex: 2,
                      padding: '12px',
                      backgroundColor: '#dc2626',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: '800',
                      color: '#ffffff',
                      cursor: 'pointer'
                    }}
                  >
                    {actionLoading ? 'Processing...' : t.confirmReject || 'Confirm Rejection'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
