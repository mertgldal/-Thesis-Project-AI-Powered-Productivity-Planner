import React, { useEffect, useState } from 'react';
import { createTask, updateTask, deleteTask } from '../../api/axios';
import { X, Trash2 } from 'lucide-react';

const defaultState = {
  description: '',
  priority: 'Medium',
  status: 'Scheduled',
  scheduled_start: '',
  scheduled_end: '',
  due_date: '',
  estimated_duration: '',
};

const QuickTaskModal = ({ isOpen, onClose, onSaved, initialData }) => {
  const [form, setForm] = useState(defaultState);
  const [loading, setLoading] = useState(false);
  const isEdit = Boolean(initialData?.id);

  const toDateTimeLocal = (value) => {
    if (!value) return '';
    const date = new Date(value);
    // Slice to "YYYY-MM-DDTHH:mm" for datetime-local compatibility
    return date.toISOString().slice(0, 16);
  };

  const toDateOnly = (value) => {
    if (!value) return '';
    const date = new Date(value);
    return date.toISOString().slice(0, 10);
  };

  useEffect(() => {
    if (!isOpen) {
      setForm(defaultState);
      setLoading(false);
      return;
    }

    if (initialData) {
      setForm({
        description: initialData.description || '',
        priority: initialData.priority || 'Medium',
        status: initialData.status || 'Scheduled',
        scheduled_start: initialData.scheduled_start || initialData.start || '',
        scheduled_end: initialData.scheduled_end || initialData.end || '',
        due_date: initialData.due_date || '',
        estimated_duration: initialData.estimated_duration || '',
      });
    } else {
      setForm(defaultState);
    }
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        description: form.description,
        priority: form.priority,
        status: form.status || 'Scheduled',
        scheduled_start: form.scheduled_start,
        scheduled_end: form.scheduled_end,
        due_date: form.due_date,
        estimated_duration: form.estimated_duration,
      };

      if (isEdit) {
        await updateTask(initialData.id, payload);
      } else {
        await createTask(payload);
      }
      onSaved?.();
      onClose();
    } catch (error) {
      console.error('Error saving task', error);
      alert('Could not save task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!isEdit) return;
    const confirmed = window.confirm('Delete this task?');
    if (!confirmed) return;
    setLoading(true);
    try {
      await deleteTask(initialData.id);
      onSaved?.();
      onClose();
    } catch (error) {
      console.error('Error deleting task', error);
      alert('Could not delete task.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
          <h3>{isEdit ? 'Edit Task' : 'Create Task'}</h3>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <label className="form-label">Description</label>
          <input
            type="text"
            name="description"
            value={form.description}
            onChange={handleChange}
            className="form-control"
            placeholder="What needs to get done?"
            required
          />

          <div className="form-grid">
            <div>
              <label className="form-label">Priority</label>
              <select name="priority" value={form.priority} onChange={handleChange} className="form-control">
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </div>
            <div>
              <label className="form-label">Status</label>
              <select name="status" value={form.status} onChange={handleChange} className="form-control">
                <option>Scheduled</option>
                <option>In Progress</option>
                <option>Completed</option>
                <option>Inbox</option>
              </select>
            </div>
          </div>

          <div className="form-grid">
            <div>
              <label className="form-label">Start</label>
              <input
                type="datetime-local"
                name="scheduled_start"
                value={toDateTimeLocal(form.scheduled_start)}
                onChange={handleChange}
                className="form-control"
              />
            </div>
            <div>
              <label className="form-label">End</label>
              <input
                type="datetime-local"
                name="scheduled_end"
                value={toDateTimeLocal(form.scheduled_end)}
                onChange={handleChange}
                className="form-control"
              />
            </div>
          </div>

          <div className="form-grid">
            <div>
              <label className="form-label">Due Date</label>
              <input
                type="date"
                name="due_date"
                value={toDateOnly(form.due_date)}
                onChange={handleChange}
                className="form-control"
              />
            </div>
            <div>
              <label className="form-label">Est. Duration (min)</label>
              <input
                type="number"
                name="estimated_duration"
                value={form.estimated_duration}
                onChange={handleChange}
                className="form-control"
                min="0"
              />
            </div>
          </div>

          <div className="modal-actions">
            {isEdit && (
              <button type="button" className="btn btn-danger" onClick={handleDelete} disabled={loading}>
                <Trash2 size={16} /> Delete
              </button>
            )}
            <div className="spacer" />
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuickTaskModal;
