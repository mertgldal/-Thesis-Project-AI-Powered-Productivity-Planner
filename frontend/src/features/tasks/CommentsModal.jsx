import React, { useEffect, useState } from 'react';
import { X, Send } from 'lucide-react';
import { getTaskComments, addTaskComment } from '../../api/axios';

const CommentsModal = ({ task, onClose }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [text, setText] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await getTaskComments(task.id);
        setComments(res.data || []);
      } catch (err) {
        // Graceful fallback if backend not ready
        setComments([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [task.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitting(true);
    try {
      await addTaskComment(task.id, text.trim());
      setComments((prev) => [...prev, { comment: text.trim(), created_at: new Date().toISOString(), author: 'You' }]);
      setText('');
    } catch (err) {
      alert('Comment service not ready yet.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <div className="modal-header">
          <h3>Comments · {task.description}</h3>
          <button className="btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-body">
          {loading ? (
            <div className="loading-state"><div className="spinner" /></div>
          ) : comments.length === 0 ? (
            <p className="text-muted">No comments yet. Start the discussion.</p>
          ) : (
            <div className="comments-list">
              {comments.map((c, idx) => (
                <div key={idx} className="comment-item">
                  <div className="comment-meta">
                    <span className="comment-author">{c.author || 'User'}</span>
                    {c.created_at && (
                      <span className="comment-time">{new Date(c.created_at).toLocaleString()}</span>
                    )}
                  </div>
                  <div className="comment-text">{c.comment}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        <form className="modal-footer" onSubmit={handleSubmit}>
          <input
            className="notion-input"
            placeholder="Add a comment... use @name to mention"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button type="submit" className="btn btn-primary btn-sm" disabled={submitting || !text.trim()}>
            {submitting ? 'Sending...' : <Send size={16} />}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CommentsModal;
