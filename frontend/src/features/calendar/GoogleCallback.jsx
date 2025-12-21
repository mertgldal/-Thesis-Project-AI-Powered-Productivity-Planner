import React, { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../api/axios'; 

const GoogleCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const called = useRef(false); // Prevent double-calling in Strict Mode

  useEffect(() => {
    const code = searchParams.get('code');
    
    if (code && !called.current) {
      called.current = true;
      
      // Send the code to our new Backend POST endpoint
      api.post('/calendar/auth/exchange', { code })
        .then(() => {
          // Success! Go back to dashboard
          navigate('/dashboard');
        })
        .catch((err) => {
          console.error('Google Connect Failed', err);
          alert('Failed to connect Google Calendar.');
          navigate('/dashboard');
        });
    } else if (!code) {
        navigate('/dashboard');
    }
  }, [searchParams, navigate]);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h2 className="text-xl font-bold mb-4">Connecting to Google...</h2>
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
};

export default GoogleCallback;