import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../locales/translations';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('janseva_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('janseva_token') || null);
  const [role, setRole] = useState(() => {
    try {
      const saved = localStorage.getItem('janseva_user');
      return saved ? JSON.parse(saved).role : null;
    } catch {
      return null;
    }
  });

  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('janseva_lang') || 'en';
  });

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Current translation dictionary
  const t = translations[language] || translations.en;

  const changeLanguage = (newLang) => {
    if (['en', 'te', 'hi'].includes(newLang)) {
      setLanguage(newLang);
      localStorage.setItem('janseva_lang', newLang);
      if (user && role === 'citizen') {
        // Sync language to citizen profile in background
        api.updateCitizenProfile({ language: newLang }).catch(() => {});
      }
    }
  };

  const loginCitizen = (authToken, citizenData) => {
    setToken(authToken);
    setUser(citizenData);
    setRole('citizen');
    localStorage.setItem('janseva_token', authToken);
    localStorage.setItem('janseva_user', JSON.stringify(citizenData));
    if (citizenData.language) {
      changeLanguage(citizenData.language);
    }
  };

  const loginOfficer = (authToken, officerData) => {
    setToken(authToken);
    setUser(officerData);
    setRole('officer');
    localStorage.setItem('janseva_token', authToken);
    localStorage.setItem('janseva_user', JSON.stringify(officerData));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setRole(null);
    setNotifications([]);
    setUnreadCount(0);
    localStorage.removeItem('janseva_token');
    localStorage.removeItem('janseva_user');
  };

  const updateUser = (updatedFields) => {
    setUser((prev) => {
      const next = { ...prev, ...updatedFields };
      localStorage.setItem('janseva_user', JSON.stringify(next));
      return next;
    });
  };

  const loadNotifications = async () => {
    if (!token) return;
    try {
      const res = await api.getNotifications();
      if (res.success) {
        setNotifications(res.notifications || []);
        setUnreadCount(res.unreadCount || 0);
      }
    } catch (e) {
      // silently ignore background polling errors
    }
  };

  useEffect(() => {
    if (token) {
      loadNotifications();
      const interval = setInterval(loadNotifications, 15000); // 15 seconds refresh
      return () => clearInterval(interval);
    }
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role,
        language,
        changeLanguage,
        t,
        loginCitizen,
        loginOfficer,
        logout,
        updateUser,
        notifications,
        unreadCount,
        loadNotifications
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
