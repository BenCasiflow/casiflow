import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
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
  const [profile, setProfile] = useState(null);
  const [isNewUser, setIsNewUser] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (!error && data) {
      setProfile(data);
      if (data.full_name) {
        sessionStorage.setItem('userFirstName', data.full_name.split(' ')[0]);
      }
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else setProfile(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setIsNewUser(false);
    sessionStorage.removeItem('newUserName');
    sessionStorage.removeItem('userFirstName');
  };

  const handleSignupComplete = (name) => {
    setIsNewUser(true);
  };

  const handleOnboardingComplete = () => {
    setIsNewUser(false);
    sessionStorage.removeItem('newUserName');
  };

  const handleUpdateProfile = (updatedProfile) => {
    setProfile(updatedProfile);
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'Segoe UI, Arial, sans-serif', color: '#64748b' }}>
      Loading...
    </div>
  );

  return (
    <Router>
      <Routes>
        <Route path="/" element={user ? <Navigate to={isNewUser ? "/onboarding" : "/dashboard"} /> : <Login />} />
        <Route path="/signup" element={user ? <Navigate to={isNewUser ? "/onboarding" : "/dashboard"} /> : <Signup onSignupComplete={handleSignupComplete} />} />
        <Route path="/onboarding" element={user && isNewUser ? <Onboarding user={user} profile={profile} onComplete={handleOnboardingComplete} /> : <Navigate to={user ? "/dashboard" : "/"} />} />
        <Route path="/dashboard" element={user ? <Dashboard user={user} profile={profile} onLogout={handleLogout} onUpdateProfile={handleUpdateProfile} /> : <Navigate to="/" />} />
        <Route path="/add-casino" element={user ? <AddCasino user={user} profile={profile} onLogout={handleLogout} /> : <Navigate to="/" />} />
        <Route path="/profile" element={user ? <Profile user={user} profile={profile} onLogout={handleLogout} onUpdateProfile={handleUpdateProfile} /> : <Navigate to="/" />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy user={user} onLogout={handleLogout} />} />
        <Route path="/terms-and-conditions" element={<TermsAndConditions user={user} onLogout={handleLogout} />} />
      </Routes>
    </Router>
  );
}

export default App;