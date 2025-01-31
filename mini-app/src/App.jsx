import { useEffect, useState } from 'react';
import { initializeApp } from './utils/auth';
import Home from './components/Home';
import Tasks from './components/Tasks';
import Leaderboard from './components/Leaderboard';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const init = async () => {
      const authStatus = await initializeApp();
      setIsAuthenticated(authStatus);
    };
    init();
  }, []);

  if (!isAuthenticated) return <div className="p-4 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm fixed bottom-0 w-full">
        <div className="flex justify-around p-4">
          <button onClick={() => setActiveTab('home')} className={`p-2 ${activeTab === 'home' ? 'text-blue-500' : ''}`}>
            🏠 Home
          </button>
          <button onClick={() => setActiveTab('tasks')} className={`p-2 ${activeTab === 'tasks' ? 'text-blue-500' : ''}`}>
            📝 Tasks
          </button>
          <button onClick={() => setActiveTab('leaderboard')} className={`p-2 ${activeTab === 'leaderboard' ? 'text-blue-500' : ''}`}>
            🏆 Leaderboard
          </button>
        </div>
      </nav>

      <main className="pb-16">
        {activeTab === 'home' && <Home />}
        {activeTab === 'tasks' && <Tasks />}
        {activeTab === 'leaderboard' && <Leaderboard />}
      </main>
    </div>
  );
}