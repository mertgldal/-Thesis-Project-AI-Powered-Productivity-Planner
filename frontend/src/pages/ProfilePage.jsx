import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { 
  User, 
  Mail, 
  Calendar,
  CheckCircle2,
  Clock,
  TrendingUp,
  Award
} from 'lucide-react';
import '../styles/profile.css';

const ProfilePage = ({ onLogout }) => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    email: localStorage.getItem('userEmail') || 'user@example.com',
    joinedDate: localStorage.getItem('joinedDate') || new Date().toLocaleDateString(),
  });

  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    scheduledTasks: 0,
    completionRate: 0
  });

  useEffect(() => {
    // In a real app, fetch user data and stats from API
    // For now, we'll use mock data
    setStats({
      totalTasks: 24,
      completedTasks: 18,
      scheduledTasks: 6,
      completionRate: 75
    });
  }, []);

  return (
    <div className="profile-page">
      <Navbar onLogout={onLogout} />
      
      <div className="container">
        <div className="profile-content">
          {/* Profile Header */}
          <div className="profile-header fade-in">
            <div className="profile-avatar">
              <User size={48} />
            </div>
            <div className="profile-info">
              <h1 className="profile-name">My Profile</h1>
              <p className="profile-email">
                <Mail size={16} />
                {userData.email}
              </p>
              <p className="profile-joined">
                <Calendar size={16} />
                Joined {userData.joinedDate}
              </p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="stats-grid">
            <div className="stat-card fade-in">
              <div className="stat-icon stat-icon-primary">
                <Clock size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-value">{stats.totalTasks}</div>
                <div className="stat-label">Total Tasks</div>
              </div>
            </div>

            <div className="stat-card fade-in">
              <div className="stat-icon stat-icon-success">
                <CheckCircle2 size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-value">{stats.completedTasks}</div>
                <div className="stat-label">Completed</div>
              </div>
            </div>

            <div className="stat-card fade-in">
              <div className="stat-icon stat-icon-info">
                <Calendar size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-value">{stats.scheduledTasks}</div>
                <div className="stat-label">Scheduled</div>
              </div>
            </div>

            <div className="stat-card fade-in">
              <div className="stat-icon stat-icon-warning">
                <TrendingUp size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-value">{stats.completionRate}%</div>
                <div className="stat-label">Completion Rate</div>
              </div>
            </div>
          </div>

          {/* Achievement Section */}
          <div className="achievements-section fade-in">
            <div className="card">
              <div className="card-header">
                <h2 className="section-title">
                  <Award size={24} />
                  Achievements
                </h2>
              </div>
              <div className="card-body">
                <div className="achievements-grid">
                  <div className="achievement-item">
                    <div className="achievement-badge achievement-badge-gold">
                      🏆
                    </div>
                    <div className="achievement-info">
                      <div className="achievement-title">Early Adopter</div>
                      <div className="achievement-desc">Joined ThesisPlanner</div>
                    </div>
                  </div>

                  <div className="achievement-item">
                    <div className="achievement-badge achievement-badge-silver">
                      ⭐
                    </div>
                    <div className="achievement-info">
                      <div className="achievement-title">Task Master</div>
                      <div className="achievement-desc">Completed 10+ tasks</div>
                    </div>
                  </div>

                  <div className="achievement-item">
                    <div className="achievement-badge achievement-badge-bronze">
                      📅
                    </div>
                    <div className="achievement-info">
                      <div className="achievement-title">Calendar Pro</div>
                      <div className="achievement-desc">Connected Google Calendar</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Account Settings */}
          <div className="settings-section fade-in">
            <div className="card">
              <div className="card-header">
                <h2 className="section-title">Account Settings</h2>
              </div>
              <div className="card-body">
                <div className="settings-list">
                  <div className="setting-item">
                    <div className="setting-info">
                      <div className="setting-label">Email Notifications</div>
                      <div className="setting-desc">Receive updates about your tasks</div>
                    </div>
                    <label className="toggle-switch">
                      <input type="checkbox" defaultChecked />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <div className="setting-label">AI Suggestions</div>
                      <div className="setting-desc">Get smart scheduling recommendations</div>
                    </div>
                    <label className="toggle-switch">
                      <input type="checkbox" defaultChecked />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <div className="setting-label">Dark Mode</div>
                      <div className="setting-desc">Switch to dark theme</div>
                    </div>
                    <label className="toggle-switch">
                      <input type="checkbox" />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
