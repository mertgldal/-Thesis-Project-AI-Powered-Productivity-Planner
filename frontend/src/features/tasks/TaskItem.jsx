import React, { useState } from 'react';
import { getAISuggestions } from '../../api/axios'; // Ensure this exists
import AIPlanModal from './AIPlanModal';

const TaskItem = ({ task, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [suggestions, setSuggestions] = useState(null);

  const handlePlanClick = async () => {
    setLoading(true);
    try {
      const response = await getAISuggestions(task.id);
      // The backend returns: { "suggestions": "{...json string...}" }
      setSuggestions(response.data.suggestions); 
      setShowModal(true);
    } catch (error) {
      alert("Error getting suggestions. Make sure Calendar is connected!");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="border p-4 rounded mb-2 bg-gray-50 flex justify-between items-center">
        <div>
          <h4 className="font-bold text-lg flex items-center">
            {task.description}
            {task.status === 'Scheduled' && (
              <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded">
                Scheduled
              </span>
            )}
          </h4>
          <div className="text-sm text-gray-600">
            <span className={`mr-2 px-2 py-0.5 rounded text-xs ${
              task.priority === 'High' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
            }`}>
              {task.priority}
            </span>
            <span>{task.estimated_duration} mins</span>
          </div>
        </div>
        
        <div>
          {task.status !== 'Scheduled' ? (
            <button 
              onClick={handlePlanClick}
              disabled={loading}
              className={`text-white px-3 py-1 rounded text-sm shadow transition ${
                loading ? 'bg-gray-400' : 'bg-purple-600 hover:bg-purple-700'
              }`}
            >
              {loading ? 'Thinking...' : '✨ Plan with AI'}
            </button>
          ) : (
             <a href="https://calendar.google.com" target="_blank" rel="noreferrer" className="text-blue-600 text-sm hover:underline">
               View on Calendar
             </a>
          )}
        </div>
      </div>

      {showModal && (
        <AIPlanModal 
          task={task} 
          suggestions={suggestions} 
          onClose={() => setShowModal(false)}
          onSuccess={onUpdate}
        />
      )}
    </>
  );
};

export default TaskItem;