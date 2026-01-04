import React from 'react';
import Login from '../auth/Login';

const LoginPage = ({ onLoginSuccess }) => {
  return <Login onLoginSuccess={onLoginSuccess} />;
};

export default LoginPage;