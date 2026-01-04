import React, { useState, useCallback } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Clock,
  LayoutGrid,
  List,
  Maximize2
} from 'lucide-react';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './CalendarView.css';

const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

const CalendarView = ({ tasks = [], onCreateFromSlot, onEditEvent }) => {
  const [view, setView] = useState('month');
  const [date, setDate] = useState(new Date());

  // Convert tasks to calendar events
  const events = tasks
    .filter(task => (task.status === 'Scheduled' && task.scheduled_start && task.scheduled_end) || (task.isGoogleEvent && (task.start || task.end)))
    .map(task => ({
      title: task.isGoogleEvent ? `📅 ${task.description || task.summary}` : task.description,
      start: new Date(task.scheduled_start || task.start),
      end: new Date(task.scheduled_end || task.end),
      resource: {
        priority: task.priority,
        id: task.id,
        status: task.status,
        isGoogleEvent: task.isGoogleEvent,
        task
      }
    }));

  // Add upcoming tasks (not yet scheduled) as all-day events
  const upcomingEvents = tasks
    .filter(task => task.due_date && task.status !== 'Scheduled')
    .map(task => ({
      title: `📌 ${task.description}`,
      start: new Date(task.due_date),
      end: new Date(task.due_date),
      allDay: true,
      resource: {
        priority: task.priority,
        id: task.id,
        status: task.status,
        isDeadline: true,
        task
      }
    }));

  const allEvents = [...events, ...upcomingEvents];

  // Event styling based on priority and type
  const eventStyleGetter = useCallback((event) => {
    const { priority, isDeadline, isGoogleEvent } = event.resource;
    
    let backgroundColor = '#3B82F6';
    let borderColor = '#2563EB';
    let textColor = '#FFFFFF';

    if (isGoogleEvent) {
      backgroundColor = '#E8F0FE';
      borderColor = '#4285F4';
      textColor = '#1F2937';
    } else if (isDeadline) {
      backgroundColor = '#FEF3C7';
      borderColor = '#F59E0B';
      textColor = '#92400E';
    } else if (priority === 'High') {
      backgroundColor = '#FEE2E2';
      borderColor = '#EF4444';
      textColor = '#991B1B';
    } else if (priority === 'Medium') {
      backgroundColor = '#DBEAFE';
      borderColor = '#3B82F6';
      textColor = '#1E40AF';
    } else if (priority === 'Low') {
      backgroundColor = '#D1FAE5';
      borderColor = '#10B981';
      textColor = '#065F46';
    }

    return {
      style: {
        backgroundColor,
        borderLeft: `3px solid ${borderColor}`,
        color: textColor,
        borderRadius: '4px',
        border: 'none',
        padding: '4px 8px',
        fontSize: '0.85rem',
        fontWeight: '500'
      }
    };
  }, []);

  // Custom toolbar
  const CustomToolbar = ({ label, onNavigate, onView }) => {
    return (
      <div className="calendar-toolbar">
        <div className="toolbar-left">
          <h1 className="calendar-title">{label}</h1>
          <button 
            className="btn-today"
            onClick={() => onNavigate('TODAY')}
          >
            Today
          </button>
        </div>

        <div className="toolbar-right">
          {/* View switcher */}
          <div className="view-switcher">
            <button
              className={`view-btn ${view === 'month' ? 'active' : ''}`}
              onClick={() => { setView('month'); onView('month'); }}
              title="Month View"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              className={`view-btn ${view === 'week' ? 'active' : ''}`}
              onClick={() => { setView('week'); onView('week'); }}
              title="Week View"
            >
              <List size={16} />
            </button>
            <button
              className={`view-btn ${view === 'day' ? 'active' : ''}`}
              onClick={() => { setView('day'); onView('day'); }}
              title="Day View"
            >
              <Clock size={16} />
            </button>
          </div>

          {/* Navigation */}
          <div className="nav-buttons">
            <button 
              className="nav-btn"
              onClick={() => onNavigate('PREV')}
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              className="nav-btn"
              onClick={() => onNavigate('NEXT')}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="modern-calendar-wrapper">
      <div className="calendar-header-banner">
        <div className="banner-content">
          <CalendarIcon size={24} className="banner-icon" />
          <div>
            <h2 className="banner-title">Your Schedule</h2>
            <p className="banner-subtitle">
              {allEvents.length} event{allEvents.length !== 1 ? 's' : ''} • Stay organized
            </p>
          </div>
        </div>
      </div>

      <div className="calendar-container">
        <Calendar
          localizer={localizer}
          events={allEvents}
          startAccessor="start"
          endAccessor="end"
          view={view}
          date={date}
          onNavigate={setDate}
          onView={setView}
          views={['month', 'week', 'day']}
          step={30}
          showMultiDayTimes
          eventPropGetter={eventStyleGetter}
          components={{
            toolbar: CustomToolbar
          }}
          style={{ height: '600px' }}
          popup
          selectable
          onSelectSlot={(slotInfo) => onCreateFromSlot?.(slotInfo)}
          onSelectEvent={(event) => onEditEvent?.(event.resource.task)}
        />
      </div>

      {/* Quick Stats */}
      <div className="calendar-stats">
        <div className="stat-card">
          <div className="stat-label">Scheduled</div>
          <div className="stat-value">{events.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Upcoming Deadlines</div>
          <div className="stat-value">{upcomingEvents.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">High Priority</div>
          <div className="stat-value">
            {allEvents.filter(e => e.resource.priority === 'High').length}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;