import React, { useState } from 'react';
import { scheduleTask } from '../../api/axios'; 
import { Calendar, CheckCircle2, X } from 'lucide-react';
// We don't need a separate CSS file because we reuse 'dashboard.css' classes

const AIPlanModal = ({ task, suggestions, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  // Parse the JSON string from Gemini if it's a string
  let parsedSuggestions = [];
  try {
    const rawData = typeof suggestions === 'string' ? JSON.parse(suggestions) : suggestions;
    parsedSuggestions = rawData.suggestions || [];
  } catch (e) {
    console.error("Failed to parse AI response", e);
  }

  const handleConfirm = async (slot) => {
    setLoading(true);
    try {
      const startTime = new Date(slot.start);
      // Calculate end time simply using the task duration
      const endTime = new Date(startTime.getTime() + task.estimated_duration * 60000);

      await scheduleTask(
        task.id, 
        startTime.toISOString().slice(0, 19), 
        endTime.toISOString().slice(0, 19)
      );
      
      onSuccess(); // Refresh dashboard
      onClose();   // Close modal
      alert(`Success! "${task.description}" scheduled.`);
    } catch (error) {
      alert("Failed to schedule. Is Google Calendar connected?");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="stat-icon-mini stat-primary" style={{ width: '32px', height: '32px' }}>
               <Calendar size={18} />
            </div>
            <h3>AI Suggestions</h3>
          </div>
          <button className="icon-btn" onClick={onClose}><X size={18} /></button>
        </div>

        {/* Body */}
        <div className="modal-body">
          <p className="text-muted" style={{ marginBottom: '16px' }}>
            Gemini found these best times for <strong>"{task.description}"</strong>:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {parsedSuggestions.length === 0 ? (
              <div className="alert alert-warning">
                No suggestions found. Your calendar might be too full!
              </div>
            ) : (
              parsedSuggestions.map((slot, index) => {
                const dateObj = new Date(slot.start);
                return (
                  <div 
                    key={index} 
                    className="card" 
                    style={{ 
                      padding: '16px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      border: '1px solid var(--border-color)',
                      cursor: 'default'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: '600', color: 'var(--primary)', fontSize: '1.05rem' }}>
                        {dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        {' • '}
                        {dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                        {slot.reason}
                      </div>
                    </div>

                    <button 
                      onClick={() => handleConfirm(slot)}
                      disabled={loading}
                      className="btn btn-primary btn-sm"
                    >
                      {loading ? '...' : 'Select'}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="modal-actions">
           <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default AIPlanModal;