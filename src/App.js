import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import AddCasino from './pages/AddCasino';
import Profile from './pages/Profile';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsAndConditions from './pages/TermsAndConditions';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [isNewUser, setIsNewUser] = useState(false);
  const [userSettings, setUserSettings] = useState({
    monthlyDepositLimit: 1000,
    monthlyNetLossLimit: 500,
  });

  const handleLogin = (userData) => {
    setUser(userData);
    setIsNewUser(false);
  };

  const handleSignup = (userData) => {
    setUser(userData);
    setIsNewUser(true);
  };

  const handleOnboardingComplete = () => {
    setIsNewUser(false);
  };

  const handleLogout = () => {
    setUser(null);
    setIsNewUser(false);
  };

  const handleUpdateSettings = (settings) => {
    setUserSettings(settings);
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={user ? <Navigate to={isNewUser ? "/onboarding" : "/dashboard"} /> : <Login onLogin={handleLogin} />} />
        <Route path="/signup" element={user ? <Navigate to={isNewUser ? "/onboarding" : "/dashboard"} /> : <Signup onSignup={handleSignup} />} />
        <Route path="/onboarding" element={user && isNewUser ? <Onboarding user={user} onComplete={handleOnboardingComplete} /> : <Navigate to={user ? "/dashboard" : "/"} />} />
        <Route path="/dashboard" element={user ? <Dashboard user={user} onLogout={handleLogout} userSettings={userSettings} onUpdateSettings={handleUpdateSettings} /> : <Navigate to="/" />} />
        <Route path="/add-casino" element={user ? <AddCasino user={user} onLogout={handleLogout} /> : <Navigate to="/" />} />
        <Route path="/profile" element={user ? <Profile user={user} onLogout={handleLogout} userSettings={userSettings} onUpdateSettings={handleUpdateSettings} /> : <Navigate to="/" />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy user={user} onLogout={handleLogout} />} />
        <Route path="/terms-and-conditions" element={<TermsAndConditions user={user} onLogout={handleLogout} />} />
      </Routes>
    </Router>
  );
}

export default App;