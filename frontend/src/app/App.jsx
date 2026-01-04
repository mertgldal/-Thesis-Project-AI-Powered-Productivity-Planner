import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import Dashboard from '../pages/Dashboard';
import ProfilePage from '../pages/ProfilePage';
import GoogleCallback from '../features/calendar/GoogleCallback.jsx';
import Register from '../auth/Register';
import '../styles/modern.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem('token')
  );

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('token');
  };

  return (
    <Router>
      <Routes>
        {/* Auth Routes */}
        <Route 
          path="/login"
          element={
            isAuthenticated 
              ? <Navigate to="/dashboard" /> 
              : <LoginPage onLoginSuccess={() => setIsAuthenticated(true)} />
          }
        />
        
        <Route 
          path="/register"
          element={
            isAuthenticated 
              ? <Navigate to="/dashboard" /> 
              : <Register onRegisterSuccess={() => setIsAuthenticated(true)} />
          }
        />

        {/* Protected Routes */}
        <Route 
          path="/dashboard"
          element={
            isAuthenticated
              ? <Dashboard onLogout={handleLogout} />
              : <Navigate to="/login" />
          }
        />

        <Route 
          path="/profile"
          element={
            isAuthenticated
              ? <ProfilePage onLogout={handleLogout} />
              : <Navigate to="/login" />
          }
        />

        {/* Google OAuth Callback Route */}
        <Route path="/google-callback" element={<GoogleCallback />} />
        
        {/* Default redirect */}
        <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
      </Routes>
    </Router>
  );
}

export default App;