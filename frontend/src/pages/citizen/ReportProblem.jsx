import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  Image,
  Mic,
  MicOff,
  MapPin,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Send,
  X,
  Upload,
  Clock,
  Sparkles,
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { categoriesList } from '../../locales/translations';
import PriorityBadge from '../../components/PriorityBadge';
import ComplaintMap from '../../components/ComplaintMap';

export default function ReportProblem({ onSuccess, onCancel }) {
  const { user, language, t } = useAuth();

  // Form State
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Roads');
  const [priority, setPriority] = useState('Moderate');
  const [priorityReason, setPriorityReason] = useState('');

  // Location State
  const [location, setLocation] = useState({
    latitude: null,
    longitude: null,
    village: '',
    mandal: '',
    district: '',
    exactAddress: ''
  });
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState('');

  // Voice Input State
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const recognitionRef = useRef(null);

  // Submission State
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [submittedComplaint, setSubmittedComplaint] = useState(null);

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  // 1. Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;

      // Set language according to chosen UI language
      if (language === 'te') {
        recognition.lang = 'te-IN';
      } else if (language === 'hi') {
        recognition.lang = 'hi-IN';
      } else {
        recognition.lang = 'en-IN';
      }

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript.trim()) {
          // Append speech to description text box so user can edit it
          setDescription((prev) => {
            const separator = prev && !prev.endsWith(' ') ? ' ' : '';
            return prev + separator + transcript;
          });
        }
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } else {
      setSpeechSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, [language]);

  const toggleSpeechRecognition = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Please type your description.');
      return;
    }

    if (isListening) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error('Failed to start speech recognition:', err);
      }
    }
  };

  // 2. Geolocation Request
  const requestCurrentLocation = () => {
    setLocationLoading(true);
    setLocationError('');

    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      setLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        try {
          // Reverse geocode via Nominatim
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&addressdetails=1`
          );
          if (res.ok) {
            const data = await res.json();
            const addr = data.address || {};
            const village =
              addr.village || addr.suburb || addr.neighbourhood || addr.residential || addr.town || addr.city || 'Ward / Village';
            const mandal = addr.county || addr.subdistrict || addr.municipality || addr.taluk || 'Mandal';
            const district = addr.state_district || addr.district || addr.state || 'District';
            const exactAddress = data.display_name || `${village}, ${mandal}, ${district}`;

            setLocation({
              latitude: lat,
              longitude: lng,
              village,
              mandal,
              district,
              exactAddress
            });
          } else {
            throw new Error('Nominatim geocode failed');
          }
        } catch (err) {
          setLocation({
            latitude: lat,
            longitude: lng,
            village: 'Locality',
            mandal: 'Zone / Mandal',
            district: 'District',
            exactAddress: `Coordinates: ${lat.toFixed(5)}, ${lng.toFixed(5)}`
          });
        } finally {
          setLocationLoading(false);
        }
      },
      (err) => {
        setLocationLoading(false);
        if (err.code === err.PERMISSION_DENIED) {
          setLocationError('Please allow location access to submit your complaint.');
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setLocationError('GPS signal unavailable. Please ensure device location is turned on.');
        } else {
          setLocationError('Location request timed out. Please click Retry.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  // Request location on initial mount
  useEffect(() => {
    requestCurrentLocation();
  }, []);

  // 3. Auto-Priority Suggestion based on Category + Description
  useEffect(() => {
    const timer = setTimeout(() => {
      if (category || description) {
        api
          .suggestPriority(category, description)
          .then((res) => {
            if (res.success && res.priority) {
              setPriority(res.priority);
              setPriorityReason(res.reason || '');
            }
          })
          .catch(() => {});
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [category, description]);

  // 4. Photo Handler
  const handlePhotoSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.match(/image\/(jpeg|jpg|png|webp)/)) {
        setFormError('Only JPG, JPEG, PNG, or WEBP images are allowed.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setFormError('Image size exceeds 5MB limit.');
        return;
      }

      setPhotoFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setPhotoPreview(event.target.result);
      };
      reader.readAsDataURL(file);
      setFormError('');
    }
  };

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  // 5. Submit Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    // Validations
    if (!description || !description.trim()) {
      setFormError('Please enter a problem description.');
      return;
    }
    if (!category) {
      setFormError('Please select a complaint category.');
      return;
    }
    if (!location.latitude || !location.longitude) {
      setFormError('Please allow location access to submit your complaint (GPS required).');
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('description', description.trim());
      formData.append('category', category);
      formData.append('priority', priority);
      formData.append('language', language);
      formData.append('latitude', location.latitude);
      formData.append('longitude', location.longitude);
      formData.append('village', location.village);
      formData.append('mandal', location.mandal);
      formData.append('district', location.district);
      formData.append('exactAddress', location.exactAddress);

      if (photoFile) {
        formData.append('photo', photoFile);
      }

      const res = await api.submitComplaint(formData);

      if (res.success) {
        setSubmittedComplaint(res.complaint);
        // Confetti effect
        try {
          confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.6 }
          });
        } catch (e) {}
      }
    } catch (err) {
      setFormError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // SUCCESS SCREEN MODAL
  if (submittedComplaint) {
    return (
      <div
        style={{
          maxWidth: '600px',
          margin: '30px auto',
          padding: '36px 24px',
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
          textAlign: 'center',
          border: '2px solid #bbf7d0'
        }}
      >
        <div
          style={{
            width: '68px',
            height: '68px',
            borderRadius: '50%',
            backgroundColor: '#ecfdf5',
            color: '#10b981',
            margin: '0 auto 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)'
          }}
        >
          <CheckCircle size={40} />
        </div>

        <h2 style={{ margin: '0 0 6px', fontSize: '1.5rem', fontWeight: '800', color: '#065f46' }}>
          {t.complaintSubmittedSuccess || 'Complaint Submitted Successfully!'}
        </h2>
        <p style={{ margin: '0 0 20px', color: '#475569', fontSize: '0.9rem' }}>
          Your grievance has been assigned a unique tracking ID and queued for nodal officer inspection.
        </p>

        {/* Unique Complaint ID Badge */}
        <div
          style={{
            padding: '16px 20px',
            backgroundColor: '#f8fafc',
            border: '2px dashed #93c5fd',
            borderRadius: '12px',
            marginBottom: '24px',
            display: 'inline-block'
          }}
        >
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
            Official Grievance ID
          </span>
          <span style={{ fontFamily: 'monospace', fontSize: '1.6rem', fontWeight: '900', color: '#0b2545', letterSpacing: '0.05em' }}>
            {submittedComplaint.complaintId}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button
            onClick={() => onSuccess && onSuccess(submittedComplaint.complaintId)}
            style={{
              backgroundColor: '#0b2545',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              padding: '12px 24px',
              fontSize: '0.95rem',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            {t.viewInMyComplaints || 'View in My Complaints'} &rarr;
          </button>
        </div>
      </div>
    );
  }

  const currentDateDisplay = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  return (
    <div style={{ maxWidth: '840px', margin: '0 auto', padding: '24px 16px' }}>
      {/* Form Header */}
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
            {t.reportHeader || 'Register a Civic Problem'}
          </h1>
          <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>
            {t.reportSubheader || 'Provide photo evidence, describe the issue via voice or text, and verify your location.'}
          </p>
        </div>
        {onCancel && (
          <button
            onClick={onCancel}
            style={{
              background: '#f1f5f9',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 12px',
              fontSize: '0.85rem',
              color: '#475569',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            {t.close || 'Back'}
          </button>
        )}
      </div>

      {formError && (
        <div
          style={{
            padding: '14px 18px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '12px',
            color: '#b91c1c',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.9rem',
            fontWeight: '600'
          }}
        >
          <AlertTriangle size={20} />
          <span>{formError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* SECTION 1: PHOTO */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}
        >
          <h3 style={{ margin: '0 0 14px', fontSize: '1.05rem', fontWeight: '800', color: '#1e293b' }}>
            {t.photoSectionTitle || '1. Photo Evidence'}
          </h3>

          {/* Hidden Inputs */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handlePhotoSelect}
            accept="image/jpeg,image/png,image/webp"
            style={{ display: 'none' }}
          />
          <input
            type="file"
            ref={cameraInputRef}
            onChange={handlePhotoSelect}
            accept="image/*"
            capture="environment"
            style={{ display: 'none' }}
          />

          {photoPreview ? (
            <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', border: '1px solid #cbd5e1' }}>
              <img
                src={photoPreview}
                alt="Selected evidence preview"
                style={{ width: '100%', maxHeight: '340px', objectFit: 'cover', display: 'block' }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  display: 'flex',
                  gap: '8px'
                }}
              >
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    backgroundColor: 'rgba(15, 23, 42, 0.8)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '6px 12px',
                    fontSize: '0.8rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <RefreshCw size={14} />
                  <span>{t.changePhoto || 'Change Photo'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.85)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '6px 10px',
                    cursor: 'pointer'
                  }}
                  title={t.removePhoto || 'Remove Photo'}
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          ) : (
            <div
              style={{
                border: '2px dashed #cbd5e1',
                borderRadius: '14px',
                padding: '28px 16px',
                textAlign: 'center',
                backgroundColor: '#f8fafc'
              }}
            >
              <Upload size={32} color="#94a3b8" style={{ margin: '0 auto 10px', display: 'block' }} />
              <p style={{ margin: '0 0 14px', fontSize: '0.875rem', color: '#475569' }}>
                Capture or attach a clear photograph of the defect for municipal crew verification.
              </p>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  style={{
                    backgroundColor: '#0b2545',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '10px 18px',
                    fontSize: '0.875rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <Camera size={18} />
                  <span>{t.takePhoto || 'Take Photo / Camera'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    backgroundColor: '#ffffff',
                    color: '#0b2545',
                    border: '1.5px solid #cbd5e1',
                    borderRadius: '10px',
                    padding: '10px 18px',
                    fontSize: '0.875rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <Image size={18} />
                  <span>{t.chooseFromGallery || 'Choose from Gallery'}</span>
                </button>
              </div>
              <span style={{ display: 'block', marginTop: '10px', fontSize: '0.75rem', color: '#94a3b8' }}>
                {t.photoOptionalNote || 'Supported formats: JPG, JPEG, PNG, WEBP (Max 5MB)'}
              </span>
            </div>
          )}
        </div>

        {/* SECTION 2: DESCRIPTION (VOICE + KEYBOARD) */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '800', color: '#1e293b' }}>
              {t.descSectionTitle || '2. Problem Description'}
            </h3>

            {/* Voice Input Button */}
            <button
              type="button"
              onClick={toggleSpeechRecognition}
              style={{
                backgroundColor: isListening ? '#ef4444' : '#f0fdf4',
                color: isListening ? '#ffffff' : '#15803d',
                border: isListening ? 'none' : '1px solid #bbf7d0',
                borderRadius: '24px',
                padding: '6px 14px',
                fontSize: '0.8rem',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: isListening ? '0 0 0 4px rgba(239, 68, 68, 0.25)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              {isListening ? <MicOff size={15} /> : <Mic size={15} />}
              <span>
                {isListening
                  ? t.stopVoice || 'Stop Recording'
                  : t.startVoice || 'Click Mic to Speak'}
              </span>
            </button>
          </div>

          {isListening && (
            <div
              style={{
                padding: '8px 12px',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                color: '#b91c1c',
                fontSize: '0.8rem',
                marginBottom: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#ef4444',
                  animation: 'pulse 1s infinite'
                }}
              />
              <span>
                {t.voiceListening || 'Listening... Speak in Telugu, Hindi, or English. Converted text will appear below.'}
              </span>
            </div>
          )}

          {/* Editable Textarea */}
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={
              t.descPlaceholder ||
              'Describe the civic problem in detail (e.g., location landmarks, hazard level, days unresolved)...'
            }
            style={{
              width: '100%',
              boxSizing: 'border-box',
              padding: '14px',
              borderRadius: '10px',
              border: '1.5px solid #cbd5e1',
              fontSize: '0.95rem',
              lineHeight: 1.5,
              outline: 'none',
              fontFamily: 'inherit',
              resize: 'vertical'
            }}
          />
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '6px',
              fontSize: '0.75rem',
              color: '#64748b'
            }}
          >
            <span>{t.voiceNote || 'Voice-to-text appears as editable text. You can edit before submitting.'}</span>
            <span>{description.length} chars</span>
          </div>
        </div>

        {/* SECTION 3: CATEGORY SELECTION */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}
        >
          <h3 style={{ margin: '0 0 12px', fontSize: '1.05rem', fontWeight: '800', color: '#1e293b' }}>
            {t.categorySectionTitle || '3. Complaint Category'}
          </h3>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
              gap: '10px'
            }}
          >
            {categoriesList.map((item) => {
              const isSelected = category === item.id;
              const label = t[item.labelKey] || item.id;

              return (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => setCategory(item.id)}
                  style={{
                    padding: '12px 10px',
                    borderRadius: '10px',
                    border: isSelected ? '2px solid #f97316' : '1.5px solid #e2e8f0',
                    backgroundColor: isSelected ? '#fff7ed' : '#ffffff',
                    color: isSelected ? '#ea580c' : '#334155',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                    fontWeight: isSelected ? '800' : '600',
                    fontSize: '0.825rem',
                    textAlign: 'center',
                    boxShadow: isSelected ? '0 2px 8px rgba(249, 115, 22, 0.2)' : 'none',
                    transition: 'all 0.15s'
                  }}
                >
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* SECTION 4: PRIORITY (AUTO-CALCULATED WITH OVERRIDE) */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div>
              <h3 style={{ margin: '0 0 4px', fontSize: '1.05rem', fontWeight: '800', color: '#1e293b' }}>
                {t.prioritySectionTitle || '4. Priority Level'}
              </h3>
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                {t.priorityCalculatedNote || 'Suggested based on your description & category keyword analysis.'}
              </span>
            </div>
            <PriorityBadge priority={priority} size="lg" />
          </div>

          {priorityReason && (
            <div
              style={{
                padding: '8px 12px',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '0.78rem',
                color: '#475569',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginBottom: '12px'
              }}
            >
              <Sparkles size={14} color="#f59e0b" />
              <span>Smart suggestion: {priorityReason}</span>
            </div>
          )}

          {/* Citizen priority picker options */}
          <div style={{ display: 'flex', gap: '10px' }}>
            {['High', 'Moderate', 'Low'].map((lvl) => {
              const isSelected = priority === lvl;
              const colorMap = {
                High: { bg: '#fef2f2', border: '#ef4444', text: '#b91c1c' },
                Moderate: { bg: '#fffbeb', border: '#f59e0b', text: '#b45309' },
                Low: { bg: '#f0fdf4', border: '#10b981', text: '#15803d' }
              };
              const c = colorMap[lvl];

              return (
                <button
                  type="button"
                  key={lvl}
                  onClick={() => {
                    setPriority(lvl);
                    setPriorityReason('Citizen selected preference.');
                  }}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '8px',
                    border: isSelected ? `2px solid ${c.border}` : '1px solid #cbd5e1',
                    backgroundColor: isSelected ? c.bg : '#ffffff',
                    color: isSelected ? c.text : '#475569',
                    fontSize: '0.85rem',
                    fontWeight: isSelected ? '800' : '600',
                    cursor: 'pointer'
                  }}
                >
                  {lvl === 'High' ? t.priorityHigh || 'High' : lvl === 'Moderate' ? t.priorityModerate || 'Moderate' : t.priorityLow || 'Low'}
                </button>
              );
            })}
          </div>
        </div>

        {/* SECTION 5: GPS LOCATION */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '800', color: '#1e293b' }}>
              {t.locationSectionTitle || '5. Automatic Geolocation (GPS)'}
            </h3>
            <button
              type="button"
              onClick={requestCurrentLocation}
              disabled={locationLoading}
              style={{
                backgroundColor: '#eff6ff',
                color: '#1d4ed8',
                border: '1px solid #bfdbfe',
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '0.78rem',
                fontWeight: '700',
                cursor: locationLoading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <RefreshCw size={14} className={locationLoading ? 'animate-spin' : ''} />
              <span>{t.retryLocation || 'Retry GPS'}</span>
            </button>
          </div>

          {locationLoading && (
            <div
              style={{
                padding: '12px 14px',
                backgroundColor: '#f0f9ff',
                border: '1px solid #bae6fd',
                borderRadius: '8px',
                color: '#0369a1',
                fontSize: '0.85rem',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <RefreshCw size={16} className="animate-spin" />
              <span>{t.gpsLocating || 'Acquiring GPS coordinates from browser...'}</span>
            </div>
          )}

          {locationError && (
            <div
              style={{
                padding: '14px',
                backgroundColor: '#fef2f2',
                border: '1.5px solid #fecaca',
                borderRadius: '8px',
                color: '#b91c1c',
                fontSize: '0.85rem',
                marginBottom: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700' }}>
                <AlertTriangle size={18} />
                <span>{locationError}</span>
              </div>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#7f1d1d' }}>
                JanSeva requires GPS verification to prevent fake reporting and route field crews. Please click 'Allow' in your browser location popup.
              </p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={requestCurrentLocation}
                  style={{
                    backgroundColor: '#dc2626',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '6px 12px',
                    fontSize: '0.78rem',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  {t.retryLocation || 'Retry GPS Location'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLocation({
                      latitude: 17.3850,
                      longitude: 78.4867,
                      village: 'Abids Ward',
                      mandal: 'Charminar Zone',
                      district: 'Hyderabad Municipal Corp',
                      exactAddress: 'Abids Main Road, Ward 12, Hyderabad Municipal Area'
                    });
                    setLocationError('');
                  }}
                  style={{
                    backgroundColor: '#0b2545',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '6px 12px',
                    fontSize: '0.78rem',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  📍 Use Demo Ward Coordinates
                </button>
              </div>
            </div>
          )}

          {location.latitude && location.longitude && (
            <div>
              {/* Interactive Leaflet Map */}
              <ComplaintMap
                latitude={location.latitude}
                longitude={location.longitude}
                address={location.exactAddress}
                village={location.village}
                mandal={location.mandal}
                district={location.district}
                height="220px"
              />

              {/* Location Details Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                  gap: '10px',
                  marginTop: '12px'
                }}
              >
                <div style={{ backgroundColor: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700' }}>{t.village || 'Village / Ward'}</span>
                  <p style={{ margin: '2px 0 0', fontSize: '0.85rem', fontWeight: '700', color: '#1e293b' }}>
                    {location.village || 'Locality'}
                  </p>
                </div>

                <div style={{ backgroundColor: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700' }}>{t.mandal || 'Mandal'}</span>
                  <p style={{ margin: '2px 0 0', fontSize: '0.85rem', fontWeight: '700', color: '#1e293b' }}>
                    {location.mandal || 'Mandal'}
                  </p>
                </div>

                <div style={{ backgroundColor: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700' }}>{t.district || 'District'}</span>
                  <p style={{ margin: '2px 0 0', fontSize: '0.85rem', fontWeight: '700', color: '#1e293b' }}>
                    {location.district || 'District'}
                  </p>
                </div>

                <div style={{ backgroundColor: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700' }}>GPS Coordinates</span>
                  <p style={{ margin: '2px 0 0', fontSize: '0.8rem', fontWeight: '700', color: '#0369a1', fontFamily: 'monospace' }}>
                    {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 6: SERVER TIMESTAMP BANNER */}
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: '#f1f5f9',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.8rem',
            color: '#475569'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={15} color="#0b2545" />
            <span style={{ fontWeight: '600' }}>{t.dateTime || 'Recorded Date & Time'}:</span>
            <span style={{ color: '#0b2545', fontWeight: '700' }}>{currentDateDisplay}</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Server Synchronized</span>
        </div>

        {/* SUBMIT BUTTON */}
        <button
          type="submit"
          disabled={submitting || locationLoading}
          style={{
            backgroundColor: submitting ? '#94a3b8' : '#f97316',
            color: '#ffffff',
            border: 'none',
            borderRadius: '12px',
            padding: '16px',
            fontSize: '1.05rem',
            fontWeight: '800',
            cursor: submitting ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            boxShadow: '0 6px 16px rgba(249, 115, 22, 0.4)',
            transition: 'all 0.2s'
          }}
        >
          <Send size={18} />
          <span>{submitting ? t.submittingComplaint || 'Submitting Grievance...' : t.submitComplaintBtn || 'Submit Complaint'}</span>
        </button>
      </form>
    </div>
  );
}
