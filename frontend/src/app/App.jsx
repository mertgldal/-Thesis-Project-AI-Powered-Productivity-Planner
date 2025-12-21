import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import Dashboard from '../pages/Dashboard';
import GoogleCallback from '../features/calendar/GoogleCallback.jsx';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem('token')
  );

  return (
    <Router>
      <div className="min-h-screen bg-gray-100 text-gray-900 font-sans">
        <header className="p-4 bg-blue-600 text-white shadow-md flex justify-between">
          <h1 className="text-xl font-bold">Thesis Productivity Planner</h1>
        </header>

        <main className="p-4">
          <Routes>
            <Route 
                path="/login"
                element={
                    isAuthenticated 
                    ? <Navigate to="/dashboard" /> 
                    : <LoginPage onLoginSuccess={() => setIsAuthenticated(true)} />
                }
            />
            
            <Route 
                path="/dashboard"
                element={
                    isAuthenticated
                    ? <Dashboard onLogout={() => setIsAuthenticated(false)} />
                    : <Navigate to="/login" />
                }
            />

            {/* Google OAuth Callback Route */}
            <Route path="/google-callback" element={<GoogleCallback />} />
            
            {/* Default redirect */}
            <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;