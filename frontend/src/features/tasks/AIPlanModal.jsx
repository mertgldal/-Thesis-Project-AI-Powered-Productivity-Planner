import React, { useState } from 'react';
import { scheduleTask } from '../../api/axios'; // Make sure this is exported in your api file!

const AIPlanModal = ({ task, suggestions, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  // Parse the JSON string from Gemini if it's a string
  let parsedSuggestions = [];
  try {
    const rawData = typeof suggestions === 'string' ? JSON.parse(suggestions) : suggestions;
    parsedSuggestions = rawData.suggestions || [];
  } catch (e) {
    console.error("Failed to parse AI response", e);
  }

  const handleConfirm = async (slot) => {
    setLoading(true);
    try {
      // Calculate end time based on duration
      const startTime = new Date(slot.start);
      const endTime = new Date(startTime.getTime() + task.estimated_duration * 60000);

      await scheduleTask(
        task.id, 
        startTime.toISOString().slice(0, 19), // Format: YYYY-MM-DDTHH:mm:ss
        endTime.toISOString().slice(0, 19)
      );
      
      alert(`Success! "${task.description}" is on your Google Calendar.`);
      onSuccess(); // Refresh dashboard
      onClose();   // Close modal
    } catch (error) {
      alert("Failed to schedule. Is Google Calendar connected?");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-lg w-full p-6 shadow-xl">
        <h2 className="text-xl font-bold mb-2">AI Suggestions</h2>
        <p className="text-gray-600 mb-4">
          Best times for <strong>"{task.description}"</strong> based on your calendar:
        </p>

        <div className="space-y-3">
          {parsedSuggestions.length === 0 ? (
            <p className="text-red-500">No suggestions found. Try again later.</p>
          ) : (
            parsedSuggestions.map((slot, index) => (
              <div key={index} className="border p-4 rounded hover:bg-blue-50 transition cursor-pointer flex justify-between items-center group">
                <div>
                  <p className="font-semibold text-blue-700">
                    {new Date(slot.start).toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <p className="text-sm text-gray-500">{slot.reason}</p>
                </div>
                <button 
                  onClick={() => handleConfirm(slot)}
                  disabled={loading}
                  className="bg-blue-600 text-white px-3 py-1 rounded text-sm opacity-0 group-hover:opacity-100 transition"
                >
                  {loading ? '...' : 'Select'}
                </button>
              </div>
            ))
          )}
        </div>

        <button 
          onClick={onClose}
          className="mt-6 text-gray-500 hover:text-gray-700 w-full text-center text-sm"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default AIPlanModal;