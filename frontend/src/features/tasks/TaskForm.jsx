import React, { useState } from 'react';
import { createTask } from '../../api/axios'; // Adjust path if needed

const TaskForm = ({ onTaskAdded }) => {
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [duration, setDuration] = useState(30);
  const [deadline, setDeadline] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description) return;

    try {
      // Create the task object
      const newTask = {
        description,
        priority,
        estimated_duration: parseInt(duration),
        deadline: deadline || null
      };

      await createTask(newTask);
      
      // Clear form and notify parent
      setDescription('');
      setDuration(30);
      setDeadline('');
      alert('Task Created!');
      onTaskAdded(); // Refresh the list
    } catch (error) {
      console.error("Failed to create task", error);
      alert("Error creating task");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow mb-6">
      <h3 className="font-bold text-lg mb-3">Add New Task</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input 
          type="text" 
          placeholder="Task Description" 
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border p-2 rounded w-full"
          required
        />
        
        <select 
          value={priority} 
          onChange={(e) => setPriority(e.target.value)}
          className="border p-2 rounded w-full"
        >
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>

        <input 
          type="number" 
          placeholder="Duration (mins)" 
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          className="border p-2 rounded w-full"
        />

        <input 
          type="datetime-local" 
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          className="border p-2 rounded w-full"
        />
      </div>
      <button 
        type="submit" 
        className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 w-full md:w-auto"
      >
        + Add Task
      </button>
    </form>
  );
};

export default TaskForm;