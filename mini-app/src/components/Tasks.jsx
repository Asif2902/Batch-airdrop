import { useState } from 'react';
import { completeTask } from '../utils/api';

const tasks = [
  { id: 1, name: 'Join Telegram Channel', reward: 500 },
  { id: 2, name: 'Follow Twitter', reward: 300 },
  { id: 3, name: 'Daily Login', reward: 100 },
];

export default function Tasks() {
  const [completedTasks, setCompletedTasks] = useState([]);

  const handleCompleteTask = async (taskId) => {
    const token = localStorage.getItem('jwt');
    await completeTask(taskId, token);
    setCompletedTasks([...completedTasks, taskId]);
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-2xl font-bold">Available Tasks</h2>
      {tasks.map((task) => (
        <div key={task.id} className="bg-white p-4 rounded-xl shadow-md flex justify-between items-center">
          <div>
            <h3 className="font-bold text-lg">{task.name}</h3>
            <p className="text-gray-600">Reward: {task.reward} PTS</p>
          </div>
          <button
            onClick={() => handleCompleteTask(task.id)}
            disabled={completedTasks.includes(task.id)}
            className={`px-4 py-2 rounded-lg ${
              completedTasks.includes(task.id)
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            {completedTasks.includes(task.id) ? 'Completed' : 'Start'}
          </button>
        </div>
      ))}
    </div>
  );
}