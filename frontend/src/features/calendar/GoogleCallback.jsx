import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../api/axios'; 
import { Loader2, Calendar, CheckCircle2, ArrowRightLeft } from 'lucide-react';
import '../../styles/auth.css'; // Login sayfasındaki stilleri yeniden kullanıyoruz

const GoogleCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const called = useRef(false);
  const [status, setStatus] = useState('connecting'); // 'connecting' | 'success' | 'error'

  useEffect(() => {
    const code = searchParams.get('code');
    
    if (code && !called.current) {
      called.current = true;
      
      // Kodu Backend'e gönder
      api.post('/calendar/auth/exchange', { code })
        .then(() => {
          setStatus('success');
          // Başarılı olduktan kısa bir süre sonra yönlendir (kullanıcı yeşil tiki görsün)
          setTimeout(() => navigate('/dashboard'), 1500);
        })
        .catch((err) => {
          console.error('Google Connect Failed', err);
          setStatus('error');
          setTimeout(() => navigate('/dashboard'), 2000);
        });
    } else if (!code) {
        navigate('/dashboard');
    }
  }, [searchParams, navigate]);

  return (
    <div className="auth-container">
      {/* Arka Plan Animasyonu (Login sayfasıyla aynı) */}
      <div className="auth-background">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
      </div>

      <div className="auth-card fade-in" style={{ maxWidth: '400px', textAlign: 'center' }}>
        
        {/* Duruma Göre Değişen İkon */}
        <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            gap: '20px', 
            marginBottom: '30px',
            position: 'relative'
        }}>
            {/* Sol İkon (Bizim App) */}
            <div className="auth-logo" style={{ margin: 0, width: '56px', height: '56px', fontSize: '1.2rem' }}>
                T
            </div>

            {/* Ortadaki Bağlantı Animasyonu */}
            <div style={{ color: 'var(--text-tertiary)' }}>
                {status === 'connecting' && (
                    <Loader2 className="animate-spin" size={24} style={{ color: 'var(--primary)' }} />
                )}
                {status === 'success' && (
                    <CheckCircle2 size={24} style={{ color: 'var(--success)' }} />
                )}
                {status === 'error' && (
                    <div style={{ color: 'var(--error)', fontWeight: 'bold' }}>!</div>
                )}
            </div>

            {/* Sağ İkon (Google Calendar) */}
            <div style={{ 
                width: '56px', height: '56px', 
                background: 'white', 
                borderRadius: '16px', 
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                border: '1px solid var(--border-color)',
                color: '#4285F4'
            }}>
                <Calendar size={28} />
            </div>
        </div>

        {/* Durum Metinleri */}
        <h2 className="auth-title" style={{ fontSize: '1.5rem', marginBottom: '10px' }}>
            {status === 'connecting' && 'Connecting...'}
            {status === 'success' && 'Linked Successfully!'}
            {status === 'error' && 'Connection Failed'}
        </h2>

        <p className="auth-subtitle">
            {status === 'connecting' && 'Syncing with Google Calendar securely.'}
            {status === 'success' && 'Redirecting you to the dashboard...'}
            {status === 'error' && 'Please try again from the dashboard.'}
        </p>

        {/* Yükleme Çubuğu (Opsiyonel Görsel Detay) */}
        {status === 'connecting' && (
            <div style={{ 
                width: '100%', height: '4px', 
                background: '#E5E7EB', borderRadius: '2px', 
                marginTop: '30px', overflow: 'hidden' 
            }}>
                <div style={{ 
                    width: '50%', height: '100%', 
                    background: 'var(--primary)', 
                    borderRadius: '2px',
                    animation: 'loadingBar 1.5s infinite ease-in-out'
                }}></div>
            </div>
        )}
      </div>

      {/* Inline Animation Style for the Loading Bar */}
      <style>{`
        @keyframes loadingBar {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );
};

export default GoogleCallback;