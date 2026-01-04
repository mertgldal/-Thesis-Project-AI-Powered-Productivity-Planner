import React, { useState } from 'react';
import { getAISuggestions } from '../../api/axios';
import AIPlanModal from './AIPlanModal';
import CommentsModal from './CommentsModal';
import { Sparkles, Clock, MessageCircle, Loader2 } from 'lucide-react';

const TaskItem = ({ task, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [suggestions, setSuggestions] = useState(null);

  const handlePlanClick = async () => {
    setLoading(true);
    try {
      const response = await getAISuggestions(task.id);
      setSuggestions(response.data.suggestions); 
      setShowModal(true);
    } catch (error) {
      alert("Error getting suggestions. Ensure calendar is connected.");
    } finally {
      setLoading(false);
    }
  };

  // Priority color mapping
  const priorityColor = {
    'High': 'var(--accent-primary)',
    'Medium': '#F59E0B', 
    'Low': 'var(--text-tertiary)'
  }[task.priority] || 'var(--text-tertiary)';

  return (
    <>
      <div 
        style={{ 
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 16px', background: 'white', borderRadius: '8px',
          border: '1px solid var(--border-color)', marginBottom: '8px',
          transition: 'all 0.1s'
        }}
        className="hover:bg-gray-50 group"
      >
        {/* Left: Task Details */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, overflow: 'hidden' }}>
          {/* Priority Dot */}
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: priorityColor, flexShrink: 0 }}></div>
          
          <div style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
             <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
               {task.description}
             </h4>
             <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                <Clock size={12} /> 
                <span>{task.estimated_duration}m</span>
             </div>
          </div>
        </div>
        
        {/* Right: Actions */}
        <div 
            className="opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ display: 'flex', gap: '10px' }} // Increased gap for cleaner look
        >
          {/* Plan Button with Magical Effect */}
            <button 
              onClick={handlePlanClick} 
              disabled={loading}
              className={`task-action-btn ${loading ? 'btn-ai-thinking' : ''}`}
            >
              {loading ? (
                // White spinner when gold/thinking
                <Loader2 size={16} className="animate-spin" color="white"/> 
              ) : (
                // Purple sparkle when normal
                <Sparkles size={16} style={{ color: '#8B5CF6' }} />
              )}
              
              {loading ? 'Thinking' : 'Plan'}
            </button>

            {/* Comments Button */}
            <button
              onClick={() => setShowComments(true)}
              className="task-action-btn"
            >
              <MessageCircle size={14} /> 
              Comments
            </button>
        </div>
      </div>

      {showModal && (
        <AIPlanModal task={task} suggestions={suggestions} onClose={() => setShowModal(false)} onSuccess={onUpdate}/>
      )}
      {showComments && (
        <CommentsModal task={task} onClose={() => setShowComments(false)} />
      )}
    </>
  );
};

export default TaskItem;