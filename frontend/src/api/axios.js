import axios from 'axios';

// Create a configured instance of axios
const api = axios.create({
    baseURL: 'http://127.0.0.1:5000/api', // Flask Backend URL
    headers: {
        'Content-Type': 'application/json',
    },
});

// 
// This means you don't have to manually send the token every time since interceptor automatically attach the Token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token'); // We will save the token here later
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// --- API FUNCTIONS ---

export const login = (email, password) => api.post('/auth/login', { email, password });
export const register = (username, email, password) => api.post('/auth/register', { username, email, password });

// Tasks
export const getTasks = () => api.get('/tasks');
export const createTask = (taskData) => api.post('/tasks', taskData);

// Google Calendar
export const getGoogleAuthUrl = () => api.get('/calendar/auth/url');
export const scheduleTask = (taskId, startTime, endTime) => api.post('/calendar/schedule', {
    task_id: taskId,
    start_time: startTime,
    end_time: endTime
});

// AI Planner
export const getAISuggestions = (taskId) => api.post('/ai/suggest', { task_id: taskId });

export const getCalendarStatus = () => api.get('/calendar/status');

export default api;