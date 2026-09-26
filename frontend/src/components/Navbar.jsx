import React, { useState } from 'react';
import {
  Globe,
  Bell,
  User,
  LogOut,
  FileText,
  PlusCircle,
  BarChart3,
  Shield,
  Menu,
  X,
  ChevronDown,
  Layers,
  ArrowRightLeft
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import NotificationsModal from './NotificationsModal';

export default function Navbar({
  activeTab,
  setActiveTab,
  onOpenReportModal,
  onOpenProfileModal,
  onSelectComplaint
}) {
  const { user, role, language, changeLanguage, t, logout, unreadCount } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [officerMenuOpen, setOfficerMenuOpen] = useState(false);

  const languages = [
    { code: 'en', label: 'English', native: 'English' },
    { code: 'te', label: 'Telugu', native: 'తెలుగు' },
    { code: 'hi', label: 'Hindi', native: 'हिंदी' }
  ];

  const currentLangObj = languages.find((l) => l.code === language) || languages[0];

  return (
    <>
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          backgroundColor: '#0b2545',
          color: '#ffffff',
          boxShadow: '0 4px 12px rgba(11, 37, 69, 0.25)',
          borderBottom: '2px solid #f97316'
        }}
      >
        <div
          style={{
            maxWidth: '1240px',
            margin: '0 auto',
            padding: '0 16px',
            height: '68px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          {/* Brand Logo & Name */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              cursor: 'pointer'
            }}
            onClick={() => setActiveTab('home')}
          >
            {/* Emblem Circle */}
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                backgroundColor: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                border: '2px solid #f97316',
                flexShrink: 0
              }}
            >
              <svg width="28" height="28" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="46" fill="#0B2545" />
                <path d="M50 16 L80 32 L80 68 L50 84 L20 68 L20 32 Z" fill="none" stroke="#F97316" strokeWidth="5" />
                <circle cx="50" cy="50" r="16" fill="#10B981" />
                <text x="50" y="55" fontSize="15" fontFamily="sans-serif" fontWeight="900" fill="white" textAnchor="middle">
                  JS
                </text>
              </svg>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: '1.45rem',
                    fontWeight: '800',
                    letterSpacing: '-0.02em',
                    color: '#ffffff',
                    lineHeight: 1
                  }}
                >
                  {t.appName || 'JanSeva'}
                </span>
                <span
                  style={{
                    backgroundColor: role === 'officer' ? '#f59e0b' : '#10b981',
                    color: '#0b2545',
                    fontSize: '0.68rem',
                    fontWeight: '800',
                    padding: '2px 7px',
                    borderRadius: '4px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}
                >
                  {role === 'officer' ? 'Officer Portal' : 'Citizen'}
                </span>
              </div>
              <span
                style={{
                  fontSize: '0.72rem',
                  color: '#93c5fd',
                  fontWeight: '500',
                  display: 'block',
                  marginTop: '2px'
                }}
              >
                {t.govtSubtitle || 'Government Grievance Redressal Portal'}
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            className="desktop-nav"
          >
            {role === 'citizen' && (
              <>
                <button
                  onClick={() => setActiveTab('home')}
                  style={{
                    background: activeTab === 'home' ? 'rgba(255,255,255,0.12)' : 'transparent',
                    border: 'none',
                    color: '#ffffff',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {t.home || 'Home'}
                </button>

                <button
                  onClick={() => setActiveTab('report')}
                  style={{
                    backgroundColor: '#f97316',
                    border: 'none',
                    color: '#ffffff',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 2px 6px rgba(249, 115, 22, 0.4)',
                    transition: 'all 0.2s'
                  }}
                >
                  <PlusCircle size={16} />
                  <span>{t.reportProblem || 'Report a Problem'}</span>
                </button>

                <button
                  onClick={() => setActiveTab('my-complaints')}
                  style={{
                    background: activeTab === 'my-complaints' ? 'rgba(255,255,255,0.12)' : 'transparent',
                    border: 'none',
                    color: '#ffffff',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <FileText size={16} />
                  <span>{t.myComplaints || 'My Complaints'}</span>
                </button>
              </>
            )}

            {role === 'officer' && (
              <>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  style={{
                    background: activeTab === 'dashboard' ? 'rgba(255,255,255,0.12)' : 'transparent',
                    border: 'none',
                    color: '#ffffff',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  {t.officerDashboard || 'Dashboard'}
                </button>

                <button
                  onClick={() => onOpenReportModal && onOpenReportModal('weekly')}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#ffffff',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <BarChart3 size={16} />
                  <span>{t.weeklyReport || 'Weekly Report'}</span>
                </button>

                <button
                  onClick={() => onOpenReportModal && onOpenReportModal('monthly')}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#ffffff',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Layers size={16} />
                  <span>{t.monthlyReport || 'Monthly Report'}</span>
                </button>
              </>
            )}

            {/* Language Selector Dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: '#ffffff',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '0.825rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Globe size={15} color="#38bdf8" />
                <span>{currentLangObj.native}</span>
                <ChevronDown size={14} />
              </button>

              {langDropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '8px',
                    backgroundColor: '#ffffff',
                    color: '#1e293b',
                    borderRadius: '10px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                    minWidth: '150px',
                    overflow: 'hidden',
                    zIndex: 2000,
                    border: '1px solid #e2e8f0'
                  }}
                >
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        changeLanguage(l.code);
                        setLangDropdownOpen(false);
                      }}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '10px 14px',
                        border: 'none',
                        background: language === l.code ? '#eff6ff' : 'transparent',
                        color: language === l.code ? '#1d4ed8' : '#334155',
                        fontWeight: language === l.code ? '700' : '500',
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <span>{l.native}</span>
                      <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{l.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* In-app Notification Bell */}
            {user && (
              <button
                onClick={() => setShowNotifications(true)}
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: 'none',
                  color: '#ffffff',
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title={t.notifications || 'Notifications'}
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '2px',
                      right: '2px',
                      backgroundColor: '#ef4444',
                      color: '#ffffff',
                      fontSize: '0.65rem',
                      fontWeight: '800',
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px solid #0b2545'
                    }}
                  >
                    {unreadCount}
                  </span>
                )}
              </button>
            )}

            {/* User Profile / Menu */}
            {user && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '6px' }}>
                <button
                  onClick={() => onOpenProfileModal && onOpenProfileModal()}
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    color: '#ffffff',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '0.825rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                  title={user.name}
                >
                  <User size={15} color="#38bdf8" />
                  <span style={{ maxWidth: '110px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user.name ? user.name.split(' ')[0] : 'User'}
                  </span>
                </button>

                <button
                  onClick={logout}
                  style={{
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#fca5a5',
                    padding: '6px 10px',
                    borderRadius: '8px',
                    fontSize: '0.825rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                  title={t.logout || 'Logout'}
                >
                  <LogOut size={15} />
                  <span>{t.logout || 'Logout'}</span>
                </button>
              </div>
            )}
          </nav>

          {/* Mobile hamburger menu toggle */}
          <div style={{ display: 'none' }} className="mobile-toggle">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#ffffff',
                padding: '6px',
                cursor: 'pointer'
              }}
            >
              {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div
            style={{
              backgroundColor: '#07182d',
              padding: '16px',
              borderTop: '1px solid rgba(255,255,255,0.1)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            {role === 'citizen' && (
              <>
                <button
                  onClick={() => {
                    setActiveTab('home');
                    setMobileMenuOpen(false);
                  }}
                  style={{
                    textAlign: 'left',
                    padding: '10px 14px',
                    backgroundColor: activeTab === 'home' ? 'rgba(255,255,255,0.1)' : 'transparent',
                    border: 'none',
                    color: '#ffffff',
                    borderRadius: '8px',
                    fontWeight: '600'
                  }}
                >
                  {t.home || 'Home'}
                </button>
                <button
                  onClick={() => {
                    setActiveTab('report');
                    setMobileMenuOpen(false);
                  }}
                  style={{
                    textAlign: 'left',
                    padding: '10px 14px',
                    backgroundColor: '#f97316',
                    border: 'none',
                    color: '#ffffff',
                    borderRadius: '8px',
                    fontWeight: '700'
                  }}
                >
                  {t.reportProblem || 'Report a Problem'}
                </button>
                <button
                  onClick={() => {
                    setActiveTab('my-complaints');
                    setMobileMenuOpen(false);
                  }}
                  style={{
                    textAlign: 'left',
                    padding: '10px 14px',
                    backgroundColor: activeTab === 'my-complaints' ? 'rgba(255,255,255,0.1)' : 'transparent',
                    border: 'none',
                    color: '#ffffff',
                    borderRadius: '8px',
                    fontWeight: '600'
                  }}
                >
                  {t.myComplaints || 'My Complaints'}
                </button>
              </>
            )}

            {role === 'officer' && (
              <>
                <button
                  onClick={() => {
                    setActiveTab('dashboard');
                    setMobileMenuOpen(false);
                  }}
                  style={{
                    textAlign: 'left',
                    padding: '10px 14px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: '#ffffff',
                    borderRadius: '8px',
                    fontWeight: '600'
                  }}
                >
                  {t.officerDashboard || 'Dashboard'}
                </button>
                <button
                  onClick={() => {
                    onOpenReportModal && onOpenReportModal('weekly');
                    setMobileMenuOpen(false);
                  }}
                  style={{
                    textAlign: 'left',
                    padding: '10px 14px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: '#ffffff',
                    borderRadius: '8px',
                    fontWeight: '600'
                  }}
                >
                  {t.weeklyReport || 'Weekly Report'}
                </button>
                <button
                  onClick={() => {
                    onOpenReportModal && onOpenReportModal('monthly');
                    setMobileMenuOpen(false);
                  }}
                  style={{
                    textAlign: 'left',
                    padding: '10px 14px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: '#ffffff',
                    borderRadius: '8px',
                    fontWeight: '600'
                  }}
                >
                  {t.monthlyReport || 'Monthly Report'}
                </button>
              </>
            )}

            <div style={{ display: 'flex', gap: '8px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              {languages.map((l) => (
                <button
                  key={l.code}
                  onClick={() => {
                    changeLanguage(l.code);
                    setMobileMenuOpen(false);
                  }}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: '6px',
                    border: '1px solid rgba(255,255,255,0.2)',
                    backgroundColor: language === l.code ? '#f97316' : 'transparent',
                    color: '#ffffff',
                    fontSize: '0.8rem',
                    fontWeight: '600'
                  }}
                >
                  {l.native}
                </button>
              ))}
            </div>

            {user && (
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                style={{
                  marginTop: '8px',
                  padding: '10px',
                  backgroundColor: '#ef4444',
                  border: 'none',
                  color: '#ffffff',
                  borderRadius: '8px',
                  fontWeight: '700'
                }}
              >
                {t.logout || 'Logout'}
              </button>
            )}
          </div>
        )}
      </header>

      {/* In-app Notifications Dropdown */}
      <NotificationsModal
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        onSelectComplaint={onSelectComplaint}
      />
    </>
  );
}
