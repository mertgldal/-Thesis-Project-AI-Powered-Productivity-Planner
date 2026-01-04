import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../api/axios';
import { Mail, Lock, User, ArrowRight, Sparkles } from 'lucide-react';
import '../styles/auth.css';

const Register = ({ onRegisterSuccess }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const res = await register(formData.email, formData.password);
      localStorage.setItem('token', res.data.access_token);
      if (onRegisterSuccess) onRegisterSuccess();
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-background">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
      </div>

      <div className="auth-content">
        <div className="auth-card fade-in">
          <div className="auth-header">
            <div className="auth-logo">
              <Sparkles size={32} />
            </div>
            <h1 className="auth-title">Create Account</h1>
            <p className="auth-subtitle">Start your productivity journey today</p>
          </div>

          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="auth-form">
            <div className="input-group">
              <label className="input-label">Email Address</label>
              <div className="input-with-icon">
                <Mail size={20} className="input-icon" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="input"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Password</label>
              <div className="input-with-icon">
                <Lock size={20} className="input-icon" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="input"
                  required
                  autoComplete="new-password"
                />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Confirm Password</label>
              <div className="input-with-icon">
                <Lock size={20} className="input-icon" />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="input"
                  required
                  autoComplete="new-password"
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-lg w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Creating account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          <div className="auth-footer">
            <p className="text-sm text-muted">
              Already have an account?{' '}
              <Link to="/login" className="auth-link">
                Sign in instead
              </Link>
            </p>
          </div>
        </div>

        <div className="auth-side-info fade-in">
          <h2 className="side-info-title">Join Thousands of Productive Users</h2>
          <p className="side-info-text">
            Experience the future of task management with AI-powered scheduling and seamless integrations.
          </p>
          <div className="side-info-features">
            <div className="feature-item">
              <div className="feature-icon">✓</div>
              <span>Free to get started</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon">✓</div>
              <span>No credit card required</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon">✓</div>
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
