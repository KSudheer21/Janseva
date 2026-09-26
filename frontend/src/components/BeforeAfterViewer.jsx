import React, { useState } from 'react';
import { CheckCircle, AlertCircle, Eye, X } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function BeforeAfterViewer({
  beforePhotoUrl,
  afterPhotoUrl,
  resolutionNote,
  category
}) {
  const { t } = useAuth();
  const [activeModalImage, setActiveModalImage] = useState(null);

  const fullBeforeUrl = api.getFileUrl(beforePhotoUrl);
  const fullAfterUrl = api.getFileUrl(afterPhotoUrl);

  return (
    <div style={{ margin: '16px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle size={18} color="#10b981" />
          {t.beforeAfterProof || 'Before / After Proof'}
        </h4>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: afterPhotoUrl ? 'repeat(auto-fit, minmax(240px, 1fr))' : '1fr',
          gap: '16px'
        }}
      >
        {/* BEFORE CARD */}
        <div
          style={{
            border: '1px solid #fed7aa',
            borderRadius: '12px',
            overflow: 'hidden',
            backgroundColor: '#fffaf5',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}
        >
          <div
            style={{
              padding: '8px 12px',
              backgroundColor: '#ea580c',
              color: '#ffffff',
              fontSize: '0.75rem',
              fontWeight: '800',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <span>BEFORE (Citizen Evidence)</span>
            <span style={{ opacity: 0.85, fontSize: '0.7rem' }}>Initial Problem</span>
          </div>

          <div
            style={{
              height: '190px',
              backgroundColor: '#f1f5f9',
              position: 'relative',
              overflow: 'hidden',
              cursor: fullBeforeUrl ? 'pointer' : 'default'
            }}
            onClick={() => fullBeforeUrl && setActiveModalImage({ url: fullBeforeUrl, title: 'Citizen Reported Photo (BEFORE)' })}
          >
            {fullBeforeUrl ? (
              <img
                src={fullBeforeUrl}
                alt="Citizen Reported Evidence"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <div
                style={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#94a3b8',
                  padding: '16px',
                  textAlign: 'center'
                }}
              >
                <AlertCircle size={28} style={{ marginBottom: '6px' }} />
                <span style={{ fontSize: '0.8rem' }}>No photo was submitted by citizen</span>
              </div>
            )}

            {fullBeforeUrl && (
              <div
                style={{
                  position: 'absolute',
                  bottom: '8px',
                  right: '8px',
                  backgroundColor: 'rgba(0,0,0,0.65)',
                  color: '#ffffff',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  fontSize: '0.7rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Eye size={12} /> Click to View
              </div>
            )}
          </div>
        </div>

        {/* AFTER CARD */}
        {afterPhotoUrl && (
          <div
            style={{
              border: '1px solid #bbf7d0',
              borderRadius: '12px',
              overflow: 'hidden',
              backgroundColor: '#f0fdf4',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
            }}
          >
            <div
              style={{
                padding: '8px 12px',
                backgroundColor: '#16a34a',
                color: '#ffffff',
                fontSize: '0.75rem',
                fontWeight: '800',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <span>AFTER (Officer Resolution)</span>
              <span style={{ opacity: 0.85, fontSize: '0.7rem' }}>Verified Fix</span>
            </div>

            <div
              style={{
                height: '190px',
                backgroundColor: '#f1f5f9',
                position: 'relative',
                overflow: 'hidden',
                cursor: 'pointer'
              }}
              onClick={() => setActiveModalImage({ url: fullAfterUrl, title: 'Officer Completion Photo (AFTER)' })}
            >
              <img
                src={fullAfterUrl}
                alt="Officer Completion Proof"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />

              <div
                style={{
                  position: 'absolute',
                  bottom: '8px',
                  right: '8px',
                  backgroundColor: 'rgba(0,0,0,0.65)',
                  color: '#ffffff',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  fontSize: '0.7rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Eye size={12} /> Click to View
              </div>
            </div>
          </div>
        )}
      </div>

      {resolutionNote && (
        <div
          style={{
            marginTop: '12px',
            padding: '12px 14px',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            fontSize: '0.85rem'
          }}
        >
          <span style={{ fontWeight: '700', color: '#166534', display: 'block', marginBottom: '2px' }}>
            Resolution Note:
          </span>
          <p style={{ margin: 0, color: '#334155', lineHeight: 1.45 }}>{resolutionNote}</p>
        </div>
      )}

      {/* Modal Image Zoom */}
      {activeModalImage && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px'
          }}
          onClick={() => setActiveModalImage(null)}
        >
          <div
            style={{
              position: 'relative',
              maxWidth: '800px',
              width: '100%',
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.35)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                padding: '14px 18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid #e2e8f0',
                backgroundColor: '#f8fafc'
              }}
            >
              <h5 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '700', color: '#1e293b' }}>
                {activeModalImage.title}
              </h5>
              <button
                onClick={() => setActiveModalImage(null)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  color: '#64748b',
                  padding: '4px'
                }}
              >
                <X size={20} />
              </button>
            </div>
            <div style={{ maxHeight: '70vh', overflow: 'auto', display: 'flex', justifyContent: 'center', backgroundColor: '#0f172a' }}>
              <img
                src={activeModalImage.url}
                alt={activeModalImage.title}
                style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain' }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
