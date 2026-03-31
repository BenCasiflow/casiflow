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

  useEffect(() => {
    // Single source of truth for auth state. onAuthStateChange fires INITIAL_SESSION
    // immediately on mount (equivalent to getSession), then fires for every subsequent
    // auth event. We deliberately avoid calling getSession separately to prevent
    // duplicate profile fetches.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!session?.user) {
        // Signed out or no session at all
        setUser(null);
        setProfile(null);
        sessionStorage.removeItem('userFirstName');
        if (event === 'INITIAL_SESSION') setLoading(false);
        return;
      }

      if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        // Fetch the full profile before setting user state. This guarantees that every
        // component (including Footer's jurisdiction-specific content) has the correct
        // profile on its very first render — no refresh required.
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        const profileData = data || null;
        if (profileData?.full_name) {
          sessionStorage.setItem('userFirstName', profileData.full_name.split(' ')[0]);
        }

        // Set profile BEFORE user. In React 18 these are batched into one render.
        // In React 17 the brief intermediate render (profile set, user still null)
        // is invisible — the login/signup page is still showing at that point.
        setProfile(profileData);
        setUser(session.user);
      } else {
        // TOKEN_REFRESHED, PASSWORD_RECOVERY etc. — update the session token without
        // re-fetching the profile (it hasn't changed).
        setUser(session.user);
      }

      if (event === 'INITIAL_SESSION') setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    // onAuthStateChange will also clear state via SIGNED_OUT, but we set it here
    // too so the UI updates immediately without waiting for the event.
    setUser(null);
    setProfile(null);
    setIsNewUser(false);
    sessionStorage.removeItem('newUserName');
    sessionStorage.removeItem('userFirstName');
  };

  const handleSignupComplete = () => {
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
