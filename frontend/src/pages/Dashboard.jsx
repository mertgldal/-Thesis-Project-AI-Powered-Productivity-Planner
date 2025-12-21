import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCalendarStatus, getGoogleAuthUrl, getTasks } from '../api/axios'; // Make sure this path is correct
import TaskForm from '../features/tasks/TaskForm';
import TaskItem from '../features/tasks/TaskItem';

const Dashboard = ({ onLogout }) => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [calendarConnected, setCalendarConnected] = useState(false);

  const fetchData = async () => {
    try {
      // 1. Fetch Tasks
      const tasksRes = await getTasks();
      setTasks(tasksRes.data);
      
      // 2. Fetch Calendar Status
      const calRes = await getCalendarStatus();
      setCalendarConnected(calRes.data.connected);
      
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      if (error.response && error.response.status === 401) {
        onLogout();
        navigate('/login');
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

   const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

// Logic to Connect Google Calendar
  const handleConnectCalendar = async () => {
    try {
      const response = await getGoogleAuthUrl();
      // Redirect the user to Google
      window.location.href = response.data.auth_url;
    } catch (error) {
      alert("Error initiating Google Login");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 border-b pb-4 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-500">Manage your thesis tasks efficiently.</p>
        </div>
        
        <div className="flex items-center gap-3">
            {/* Calendar Status Badge */}
            {calendarConnected ? (
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium border border-green-200 flex items-center">
                    ✅ Calendar Connected
                </span>
            ) : (
                <button 
                    onClick={handleConnectCalendar}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm flex items-center gap-2 shadow"
                >
                   🔗 Connect Google Calendar
                </button>
            )}

            <button 
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 text-sm"
            >
            Logout
            </button>
        </div>
      </div>

      {/* Form Section */}
      <TaskForm onTaskAdded={fetchData} />

      {/* List Section */}
      <div className="bg-white p-6 rounded shadow">
        <h3 className="text-xl font-semibold mb-4 border-b pb-2">Your Task List</h3>
        
        {loading ? (
          <p className="text-gray-500">Loading tasks...</p>
        ) : tasks.length === 0 ? (
          <p className="text-gray-400 italic text-center py-4">No tasks yet. Add one above!</p>
        ) : (
          <div>
            {tasks.map(task => (
              <TaskItem 
                key={task.id} 
                task={task} 
                onUpdate={fetchData} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;