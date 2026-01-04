import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTasks, getGoogleAuthUrl, getCalendarStatus, getCalendarEvents, updateTaskStatus } from '../api/axios';
import TaskForm from '../features/tasks/TaskForm';
import TaskItem from '../features/tasks/TaskItem';
import CalendarView from '../features/calendar/CalendarView';
import QuickTaskModal from '../features/tasks/QuickTaskModal';
import Navbar from '../components/Navbar';
import { Calendar as CalendarIcon, CheckCircle2, Link2, TrendingUp, SlidersHorizontal, Plus } from 'lucide-react';
import '../styles/dashboard.css';

const Dashboard = ({ onLogout }) => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [calendarConnected, setCalendarConnected] = useState(false);
  const [viewMode, setViewMode] = useState('board'); // 'board' | 'list'
  const [quickModalOpen, setQuickModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const fetchData = async () => {
    try {
      const [taskRes, calRes] = await Promise.all([
        getTasks(), 
        getCalendarStatus()
      ]);
      setTasks(taskRes.data);
      setCalendarConnected(calRes.data.connected);

      // Fetch Google Calendar events if connected
      if (calRes.data.connected) {
        try {
          const calEventsRes = await getCalendarEvents();
          const googleEvents = (calEventsRes.data || []).map(event => ({
            ...event,
            isGoogleEvent: true,
            status: 'Scheduled'
          }));
          // Merge Google events with app tasks
          setTasks(prev => [...prev, ...googleEvents]);
        } catch (err) {
          console.warn('Could not fetch Google Calendar events:', err);
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      // Eğer yetkisiz giriş (401) varsa:
      if (error.response && error.response.status === 401) {
        // App.jsx'teki state'i güncellemek için onLogout'u çağırıyoruz
        if (onLogout) onLogout(); 
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleConnectCalendar = async () => {
    try {
      const response = await getGoogleAuthUrl();
      window.location.href = response.data.auth_url;
    } catch (error) {
      alert("Error initiating Google Login");
    }
  };

  const handleSlotCreate = (slotInfo) => {
    setSelectedTask({
      start: slotInfo.start,
      end: slotInfo.end,
      status: 'Scheduled',
    });
    setQuickModalOpen(true);
  };

  const handleEventEdit = (task) => {
    setSelectedTask(task);
    setQuickModalOpen(true);
  };

  const handleQuickCreateButton = () => {
    const now = new Date();
    const inAnHour = new Date(now.getTime() + 60 * 60 * 1000);
    setSelectedTask({ start: now, end: inAnHour, status: 'Scheduled' });
    setQuickModalOpen(true);
  };

  const handleDragStart = (e, task) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('taskId', task.id);
    e.dataTransfer.setData('taskData', JSON.stringify(task));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDropOnColumn = async (e, newStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    const taskData = JSON.parse(e.dataTransfer.getData('taskData'));
    
    if (!taskId || taskData.isGoogleEvent) return; // Don't update Google events

    try {
      await updateTaskStatus(taskId, newStatus);
      // Update local state
      setTasks(prev =>
        prev.map(t =>
          t.id === taskId ? { ...t, status: newStatus } : t
        )
      );
    } catch (error) {
      console.error('Error updating task status:', error);
      alert('Failed to update task status');
    }
  };

  const unscheduledTasks = tasks.filter(t => t.status !== 'Scheduled');
  const completedTasks = tasks.filter(t => t.status === 'Completed').length;
  const scheduledTasks = tasks.filter(t => t.status === 'Scheduled').length;
  const overdueTasks = tasks.filter(t => {
    if (!t.due_date) return false;
    const due = new Date(t.due_date);
    return due < new Date() && t.status !== 'Completed';
  }).length;
  const completionRate = tasks.length ? Math.round((completedTasks / tasks.length) * 100) : 0;

  const columns = [
    { key: 'Inbox', title: 'Inbox', description: 'Unscheduled items', filter: (t) => t.status !== 'Scheduled' && t.status !== 'Completed' && t.status !== 'In Progress' },
    { key: 'In Progress', title: 'In Progress', description: 'Actively being worked on', filter: (t) => t.status === 'In Progress' },
    { key: 'Scheduled', title: 'Scheduled', description: 'On your calendar', filter: (t) => t.status === 'Scheduled' },
    { key: 'Completed', title: 'Completed', description: 'Finished tasks', filter: (t) => t.status === 'Completed' },
  ];

  return (
    <div className="dashboard-page">
      <Navbar onLogout={onLogout} />
      
      <div className="dashboard-container">
        {/* Header Section */}
        <div className="dashboard-header fade-in">
          <div>
            <h1 className="dashboard-title">Welcome Back!</h1>
            <p className="dashboard-subtitle">Here's what's happening with your tasks today.</p>
          </div>

          <div className="header-actions">
            {calendarConnected ? (
              <div className="calendar-status connected">
                <CheckCircle2 size={20} />
                <span>Calendar Connected</span>
              </div>
            ) : (
              <button onClick={handleConnectCalendar} className="btn btn-primary">
                <Link2 size={20} />
                Connect Google Calendar
              </button>
            )}

            <button className="btn btn-secondary quick-create" onClick={handleQuickCreateButton}>
              <Plus size={16} /> Quick Task
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-overview fade-in">
          <div className="stat-card-mini">
            <div className="stat-icon-mini stat-primary">
              <TrendingUp size={20} />
            </div>
            <div>
              <div className="stat-value-mini">{tasks.length}</div>
              <div className="stat-label-mini">Total Tasks</div>
            </div>
          </div>

          <div className="stat-card-mini">
            <div className="stat-icon-mini stat-success">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <div className="stat-value-mini">{completedTasks}</div>
              <div className="stat-label-mini">Completed</div>
            </div>
          </div>

          <div className="stat-card-mini">
            <div className="stat-icon-mini stat-info">
              <CalendarIcon size={20} />
            </div>
            <div>
              <div className="stat-value-mini">{scheduledTasks}</div>
              <div className="stat-label-mini">Scheduled</div>
            </div>
          </div>

          <div className="stat-card-mini">
            <div className="stat-icon-mini stat-warning">
              <SlidersHorizontal size={20} />
            </div>
            <div>
              <div className="stat-value-mini">{overdueTasks}</div>
              <div className="stat-label-mini">Overdue</div>
            </div>
          </div>

          <div className="stat-card-mini">
            <div className="stat-icon-mini stat-primary">
              <TrendingUp size={20} />
            </div>
            <div>
              <div className="stat-value-mini">{completionRate}%</div>
              <div className="stat-label-mini">Completion Rate</div>
            </div>
          </div>
        </div>

        {/* Calendar Section */}
        <div className="calendar-section fade-in">
          <CalendarView
            tasks={tasks}
            onCreateFromSlot={handleSlotCreate}
            onEditEvent={handleEventEdit}
          />
        </div>

        {/* Kanban / List Toggle */}
        <div className="kanban-section fade-in">
          <div className="kanban-header">
            <div>
              <h2 className="section-title">Board View</h2>
              <p className="kanban-subtitle">Organize like Linear/Asana: columns by status.</p>
            </div>
            <div className="kanban-controls">
              <button
                className={`chip ${viewMode === 'board' ? 'chip-active' : ''}`}
                onClick={() => setViewMode('board')}
              >
                Board
              </button>
              <button
                className={`chip ${viewMode === 'list' ? 'chip-active' : ''}`}
                onClick={() => setViewMode('list')}
              >
                List
              </button>
            </div>
          </div>

          {viewMode === 'board' ? (
            <div className="kanban-grid">
              {columns.map(col => {
                const colTasks = tasks.filter(col.filter);
                return (
                  <div
                    key={col.key}
                    className="kanban-column"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDropOnColumn(e, col.key)}
                  >
                    <div className="kanban-column-header">
                      <div>
                        <div className="kanban-title">{col.title}</div>
                        <div className="kanban-desc">{col.description}</div>
                      </div>
                      <span className="badge badge-primary">{colTasks.length}</span>
                    </div>

                    <div className="kanban-cards">
                      {loading ? (
                        <div className="loading-state"><div className="spinner"></div></div>
                      ) : colTasks.length === 0 ? (
                        <div className="empty-state small">No items</div>
                      ) : (
                        colTasks.map(task => (
                          <div
                            key={task.id}
                            className={`kanban-card ${task.isGoogleEvent ? 'google-event' : ''}`}
                            draggable={!task.isGoogleEvent}
                            onDragStart={(e) => !task.isGoogleEvent && handleDragStart(e, task)}
                          >
                            <div className="kanban-card-top">
                              <div className={`priority-dot priority-${(task.priority || 'Low').toLowerCase()}`}></div>
                              <span className="kanban-card-title">{task.description}</span>
                              {task.isGoogleEvent && <span className="badge badge-info">Google</span>}
                            </div>
                            <div className="kanban-card-meta">
                              {task.estimated_duration && <span>{task.estimated_duration}m</span>}
                              {task.due_date && (
                                <span>Due {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                              )}
                              {(task.start || task.scheduled_start) && (
                                <span>{new Date(task.start || task.scheduled_start).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="list-view fade-in">
              <div className="card">
                <div className="card-header">
                  <h2 className="section-title">
                    Inbox <span className="badge badge-primary">{unscheduledTasks.length}</span>
                  </h2>
                </div>
                <div className="card-body">
                  {loading ? (
                    <div className="loading-state"><div className="spinner"></div><p>Loading tasks...</p></div>
                  ) : unscheduledTasks.length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-icon">📭</div>
                      <h3>All caught up!</h3>
                      <p>Your inbox is empty. Great work!</p>
                    </div>
                  ) : (
                    <div className="tasks-list">
                      {unscheduledTasks.map(task => (
                        <TaskItem key={task.id} task={task} onUpdate={fetchData} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tasks Grid */}
        <div className="tasks-grid">
          {/* Task Form */}
          <div className="task-form-section fade-in">
            <div className="card">
              <div className="card-header">
                <h2 className="section-title">Create New Task</h2>
              </div>
              <div className="card-body">
                <TaskForm onTaskAdded={fetchData} />
              </div>
            </div>
          </div>

          {/* Task List */}
          <div className="task-list-section fade-in">
            <div className="card">
              <div className="card-header">
                <h2 className="section-title">
                  Inbox 
                  <span className="badge badge-primary">{unscheduledTasks.length}</span>
                </h2>
              </div>
              <div className="card-body">
                {loading ? (
                  <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading tasks...</p>
                  </div>
                ) : unscheduledTasks.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">📭</div>
                    <h3>All caught up!</h3>
                    <p>Your inbox is empty. Great work!</p>
                  </div>
                ) : (
                  <div className="tasks-list">
                    {unscheduledTasks.map(task => (
                      <TaskItem key={task.id} task={task} onUpdate={fetchData} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Lightweight Analytics */}
        <div className="analytics-grid fade-in">
          <div className="card analytics-card">
            <div className="analytics-header">
              <h3>Completed vs Created</h3>
              <span className="badge badge-info">7d</span>
            </div>
            <div className="analytics-body">
              <div className="bar-row">
                <span>Created</span>
                <div className="bar-track"><div className="bar-fill" style={{ width: '100%' }} /></div>
                <span className="bar-value">{tasks.length}</span>
              </div>
              <div className="bar-row">
                <span>Completed</span>
                <div className="bar-track"><div className="bar-fill success" style={{ width: `${completionRate}%` }} /></div>
                <span className="bar-value">{completedTasks}</span>
              </div>
            </div>
          </div>

          <div className="card analytics-card">
            <div className="analytics-header">
              <h3>Burnup (simple)</h3>
              <span className="badge badge-warning">beta</span>
            </div>
            <div className="analytics-body">
              <p className="text-muted">Tasks done vs total: {completedTasks}/{tasks.length}</p>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${completionRate}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <QuickTaskModal
        isOpen={quickModalOpen}
        onClose={() => setQuickModalOpen(false)}
        onSaved={fetchData}
        initialData={selectedTask}
      />
    </div>
  );
};

export default Dashboard;