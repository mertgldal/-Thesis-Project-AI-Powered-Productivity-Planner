import React from 'react';
import Login from '../auth/Login';

const LoginPage = ({ onLoginSuccess }) => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <Login onLoginSuccess={onLoginSuccess} />
    </div>
  );
};

export default LoginPage;