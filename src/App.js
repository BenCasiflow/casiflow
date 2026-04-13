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
import ResponsibleGambling from './pages/ResponsibleGambling';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isNewUser, setIsNewUser] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch profile outside the auth callback so we never await a Supabase
  // call inside onAuthStateChange (which holds the navigator lock and causes
  // a deadlock in Supabase JS v2).
  const fetchAndStoreProfile = async (userId) => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (data) {
        if (data.full_name) sessionStorage.setItem('userFirstName', data.full_name.split(' ')[0]);
        if (data.country) sessionStorage.setItem('userCountry', data.country);
        if (data.currency) sessionStorage.setItem('userCurrency', data.currency);
        setProfile(data);
      }
    } catch (_) {
      // Profile fetch failed — app still renders, just without profile data.
    }
  };

  useEffect(() => {
    // Step 1: getSession() for the initial page load. This runs outside the
    // auth lock so it is safe to await a profile fetch here.
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        await fetchAndStoreProfile(session.user.id);
      }
      // Always clear the loading screen, regardless of outcome.
      setLoading(false);
    }).catch(() => {
      // getSession itself failed (network error etc.) — still clear loading.
      setLoading(false);
    });

    // Step 2: onAuthStateChange for subsequent events (login, logout, token
    // refresh). The callback is kept synchronous — no await, no Supabase
    // calls inside it — to avoid the deadlock described above.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        setUser(session.user);
        // Fire the profile fetch without awaiting it. State updates inside
        // fetchAndStoreProfile will trigger a re-render once complete.
        fetchAndStoreProfile(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
        sessionStorage.removeItem('userFirstName');
        sessionStorage.removeItem('userCountry');
        sessionStorage.removeItem('userCurrency');
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        setUser(session.user);
      }
      // INITIAL_SESSION is handled by getSession() above — ignore it here
      // to avoid a duplicate profile fetch on mount.
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
    sessionStorage.removeItem('userCountry');
    sessionStorage.removeItem('userCurrency');
  };

  const handleSignupComplete = () => {
    setIsNewUser(true);
  };

  const handleOnboardingComplete = () => {
    setIsNewUser(false);
    sessionStorage.removeItem('newUserName');
    // Re-fetch profile here because fetchAndStoreProfile (triggered by SIGNED_IN)
    // may have run before Signup.js finished inserting the profile row, leaving
    // profile as null. Re-fetching ensures Dashboard receives the correct limits.
    if (user) fetchAndStoreProfile(user.id);
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
        <Route path="/onboarding" element={isNewUser || sessionStorage.getItem('newUserName') ? <Onboarding user={user} profile={profile} onComplete={handleOnboardingComplete} /> : <Navigate to={user ? "/dashboard" : "/"} />} />
        <Route path="/dashboard" element={user ? <Dashboard user={user} profile={profile} onLogout={handleLogout} onUpdateProfile={handleUpdateProfile} /> : <Navigate to="/" />} />
        <Route path="/add-casino" element={user ? <AddCasino user={user} profile={profile} onLogout={handleLogout} /> : <Navigate to="/" />} />
        <Route path="/profile" element={user ? <Profile user={user} profile={profile} onLogout={handleLogout} onUpdateProfile={handleUpdateProfile} /> : <Navigate to="/" />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy user={user} profile={profile} onLogout={handleLogout} />} />
        <Route path="/terms-and-conditions" element={<TermsAndConditions user={user} profile={profile} onLogout={handleLogout} />} />
        <Route path="/responsible-gambling" element={<ResponsibleGambling user={user} profile={profile} onLogout={handleLogout} />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>
    </Router>
  );
}

export default App;
