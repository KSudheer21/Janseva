import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';

// Citizen Pages
import CitizenLogin from './pages/citizen/CitizenLogin';
import CitizenHome from './pages/citizen/CitizenHome';
import ReportProblem from './pages/citizen/ReportProblem';
import MyComplaints from './pages/citizen/MyComplaints';
import ComplaintDetailModal from './pages/citizen/ComplaintDetailModal';
import CitizenProfileModal from './pages/citizen/CitizenProfileModal';

// Officer Pages
import OfficerLogin from './pages/officer/OfficerLogin';
import OfficerDashboard from './pages/officer/OfficerDashboard';
import OfficerComplaintDetailModal from './pages/officer/OfficerComplaintDetailModal';
import ReportsModal from './pages/officer/ReportsModal';

function AppContent() {
  const { user, role } = useAuth();

  // Navigation tab: 'home' | 'report' | 'my-complaints' | 'dashboard'
  const [activeTab, setActiveTab] = useState('home');

  // Auth screen toggle if not logged in: 'citizen' | 'officer'
  const [authView, setAuthView] = useState('citizen');

  // Selected complaint for modal detail view
  const [selectedComplaintId, setSelectedComplaintId] = useState(null);

  // Officer Reports Modal state
  const [reportModalConfig, setReportModalConfig] = useState({ isOpen: false, tab: 'weekly' });

  // Citizen Profile Modal state
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  // If user is not authenticated, show role-specific login
  if (!user || !role) {
    if (authView === 'officer') {
      return <OfficerLogin onSwitchToCitizen={() => setAuthView('citizen')} />;
    }
    return <CitizenLogin onSwitchToOfficer={() => setAuthView('officer')} />;
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f8fafc' }}>
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenReportModal={(tab) => setReportModalConfig({ isOpen: true, tab })}
        onOpenProfileModal={() => setProfileModalOpen(true)}
        onSelectComplaint={(id) => setSelectedComplaintId(id)}
      />

      {/* Main Content Area */}
      <main style={{ flex: 1, paddingBottom: '40px' }}>
        {role === 'citizen' && (
          <>
            {activeTab === 'home' && (
              <CitizenHome
                onOpenReport={() => setActiveTab('report')}
                onOpenMyComplaints={() => setActiveTab('my-complaints')}
                onSelectComplaint={(id) => setSelectedComplaintId(id)}
              />
            )}

            {activeTab === 'report' && (
              <ReportProblem
                onSuccess={(newId) => {
                  setSelectedComplaintId(newId);
                  setActiveTab('my-complaints');
                }}
                onCancel={() => setActiveTab('home')}
              />
            )}

            {activeTab === 'my-complaints' && (
              <MyComplaints
                onSelectComplaint={(id) => setSelectedComplaintId(id)}
                onOpenReport={() => setActiveTab('report')}
              />
            )}
          </>
        )}

        {role === 'officer' && (
          <OfficerDashboard
            onSelectComplaint={(id) => setSelectedComplaintId(id)}
            onOpenReports={(tab) => setReportModalConfig({ isOpen: true, tab })}
            onOpenProfile={() => setProfileModalOpen(true)}
          />
        )}
      </main>

      {/* Modals */}

      {/* Citizen Complaint Detail Modal */}
      {role === 'citizen' && selectedComplaintId && (
        <ComplaintDetailModal
          complaintId={selectedComplaintId}
          onClose={() => setSelectedComplaintId(null)}
        />
      )}

      {/* Officer Complaint Detail & Action Modal */}
      {role === 'officer' && selectedComplaintId && (
        <OfficerComplaintDetailModal
          complaintId={selectedComplaintId}
          onClose={() => setSelectedComplaintId(null)}
          onRefreshList={() => {
            // refresh officer dashboard
          }}
        />
      )}

      {/* Officer Reports Modal */}
      {role === 'officer' && reportModalConfig.isOpen && (
        <ReportsModal
          isOpen={reportModalConfig.isOpen}
          initialTab={reportModalConfig.tab}
          onClose={() => setReportModalConfig({ isOpen: false, tab: 'weekly' })}
        />
      )}

      {/* Citizen Profile Modal */}
      {profileModalOpen && (
        <CitizenProfileModal
          isOpen={profileModalOpen}
          onClose={() => setProfileModalOpen(false)}
        />
      )}

      {/* Footer */}
      <footer
        style={{
          backgroundColor: '#ffffff',
          borderTop: '1px solid #e2e8f0',
          padding: '16px 20px',
          textAlign: 'center',
          fontSize: '0.8rem',
          color: '#64748b'
        }}
      >
        <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <span>&copy; 2026 JanSeva &bull; Smart Citizen Complaint Management System</span>
          <span style={{ color: '#0b2545', fontWeight: '700' }}>Government of India Civic Redressal Portal</span>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
