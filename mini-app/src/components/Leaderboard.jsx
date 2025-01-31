import { useEffect, useState } from 'react';

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    // Fetch leaderboard data from API
    const mockData = [
      { name: 'User1', points: 15000 },
      { name: 'User2', points: 12000 },
      { name: 'User3', points: 9800 },
    ];
    setLeaderboard(mockData);
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Leaderboard</h2>
      <div className="space-y-3">
        {leaderboard.map((user, index) => (
          <div key={index} className="bg-white p-4 rounded-xl shadow-md flex justify-between items-center">
            <div className="flex items-center gap-4">
              <span className="font-bold text-gray-500">#{index + 1}</span>
              <span className="font-medium">{user.name}</span>
            </div>
            <span className="font-bold text-blue-600">{user.points.toLocaleString()} PTS</span>
          </div>
        ))}
      </div>
    </div>
  );
}