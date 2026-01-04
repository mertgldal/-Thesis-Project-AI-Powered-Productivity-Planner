import axios from 'axios';

// Create a configured instance of axios
const api = axios.create({
    baseURL: 'http://127.0.0.1:5000/api', // Flask Backend URL
    headers: {
        'Content-Type': 'application/json',
    },
});


// This means you don't have to manually send the token every time since interceptor automatically attach the Token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        // Control to avoid sending invalid tokens
        if (token && token !== 'undefined' && token !== 'null') {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// --- API FUNCTIONS ---

export const login = (email, password) => api.post('/auth/login', { email, password });
export const register = (email, password) => api.post('/auth/register', { email, password });

// Tasks
export const getTasks = () => api.get('/tasks');
export const createTask = (taskData) => api.post('/tasks', taskData);
export const updateTask = (taskId, taskData) => api.put(`/tasks/${taskId}`, taskData);
export const deleteTask = (taskId) => api.delete(`/tasks/${taskId}`);
export const updateTaskStatus = (taskId, status) => api.put(`/tasks/${taskId}`, { status });

// Task comments (optional: backend endpoints should exist)
export const getTaskComments = (taskId) => api.get(`/tasks/${taskId}/comments`);
export const addTaskComment = (taskId, comment) => api.post(`/tasks/${taskId}/comments`, { comment });

// Task scheduling/recurrence (optional: backend support required)
export const setTaskRecurrence = (taskId, recurrence, reminderMinutes) =>
    api.post(`/tasks/${taskId}/recurrence`, { recurrence, reminder_minutes: reminderMinutes });

// Google Calendar
export const getGoogleAuthUrl = () => api.get('/calendar/auth/url');
export const scheduleTask = (taskId, startTime, endTime) => api.post('/calendar/schedule', {
    task_id: taskId,
    start_time: startTime,
    end_time: endTime
});
export const getCalendarEvents = () => api.get('/calendar/events');

// AI Planner
export const getAISuggestions = (taskId) => api.post('/ai/suggest', { task_id: taskId });

export const getCalendarStatus = () => api.get('/calendar/status');

export default api;