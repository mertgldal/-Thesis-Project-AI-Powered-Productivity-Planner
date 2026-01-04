import React, { useState } from 'react';
import { createTask } from '../../api/axios';
import { Plus, Loader2 } from 'lucide-react';

const TaskForm = ({ onTaskAdded }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('30');
  const [priority, setPriority] = useState('Medium');
  const [recurrence, setRecurrence] = useState('None');
  const [reminder, setReminder] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) return;
    setLoading(true);
    try {
      await createTask({ 
        description, 
        priority, 
        estimated_duration: parseInt(duration),
        recurrence: recurrence === 'None' ? null : recurrence,
        reminder_minutes: reminder ? parseInt(reminder) : null,
      });
      setDescription(''); setDuration('30'); setIsExpanded(false);
      setRecurrence('None'); setReminder('');
      if (onTaskAdded) onTaskAdded();
    } catch (error) {
      alert("Error creating task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginBottom: '20px' }}>
      {!isExpanded ? (
        <div 
          onClick={() => setIsExpanded(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', padding: '8px 4px', cursor: 'text', borderRadius: '4px' }}
          className="hover:bg-[var(--bg-hover)]"
        >
          <Plus size={18} />
          <span style={{ fontSize: '0.95rem' }}>Add a task to Inbox...</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ background: 'white', padding: '12px', borderRadius: '6px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', border: '1px solid var(--border-subtle)' }}>
          <input 
            autoFocus
            type="text" 
            placeholder="Task description like 'Read research paper'..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="notion-input"
            style={{ marginBottom: '12px', fontSize: '1rem', fontWeight: '500', border: 'none', padding: '4px 0', borderRadius: 0, borderBottom: '1px solid var(--border-subtle)' }}
          />
          
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            <select value={duration} onChange={(e) => setDuration(e.target.value)} className="notion-input" style={{ flex: 1, fontSize: '0.85rem' }}>
              <option value="15">15 mins</option>
              <option value="30">30 mins</option>
              <option value="60">1 Hour</option>
              <option value="120">2 Hours</option>
            </select>
            <select value={priority} onChange={(e) => setPriority(e.target.value)} className="notion-input" style={{ flex: 1, fontSize: '0.85rem' }}>
              <option value="High">🔥 High Pri.</option>
              <option value="Medium">🔹 Medium Pri.</option>
              <option value="Low">⚪ Low Pri.</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            <select value={recurrence} onChange={(e) => setRecurrence(e.target.value)} className="notion-input" style={{ flex: 1, fontSize: '0.85rem' }}>
              <option value="None">One-time</option>
              <option value="Daily">Daily</option>
              <option value="Weekly">Weekly</option>
              <option value="Monthly">Monthly</option>
            </select>
            <input
              type="number"
              min="0"
              placeholder="Reminder (min before)"
              value={reminder}
              onChange={(e) => setReminder(e.target.value)}
              className="notion-input"
              style={{ flex: 1, fontSize: '0.85rem' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button type="button" onClick={() => setIsExpanded(false)} className="btn-icon" style={{ fontSize: '0.9rem', padding: '6px 12px' }}>Cancel</button>
            <button type="submit" disabled={loading || !description} className="btn-primary-solid" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {loading && <Loader2 size={16} className="animate-spin"/>}
              Add to Inbox
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default TaskForm;