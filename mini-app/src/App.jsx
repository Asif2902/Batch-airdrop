import { useEffect, useState } from 'react'
import { WebApp } from '@telegram-web-app/core'
import { initializeApp } from './utils/auth'
import Home from './components/Home'
import Tasks from './components/Tasks'
import Leaderboard from './components/Leaderboard'

export default function App() {
  const [activeTab, setActiveTab] = useState('home')
  const [user, setUser] = useState(null)

  useEffect(() => {
    const init = async () => {
      try {
        await initializeApp()
        WebApp.ready()
        setUser(WebApp.initDataUnsafe.user)
      } catch (error) {
        WebApp.showAlert(error.message)
      }
    }
    init()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-telegram-bg to-telegram-secondary-bg">
      {/* Header */}
      <header className="p-4 bg-telegram-header-bg">
        <h1 className="text-2xl font-bold text-telegram-text">
          {user?.first_name}'s Points
        </h1>
      </header>

      {/* Main Content */}
      <main className="p-4 space-y-6">
        {activeTab === 'home' && <Home />}
        {activeTab === 'tasks' && <Tasks />}
        {activeTab === 'leaderboard' && <Leaderboard />}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 w-full bg-telegram-bg border-t border-telegram-secondary-bg">
        <div className="flex justify-around p-3">
          <button
            onClick={() => setActiveTab('home')}
            className={`p-2 ${activeTab === 'home' ? 'text-telegram-button-text' : 'text-telegram-hint'}`}
          >
            🏠 Home
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`p-2 ${activeTab === 'tasks' ? 'text-telegram-button-text' : 'text-telegram-hint'}`}
          >
            📝 Tasks
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`p-2 ${activeTab === 'leaderboard' ? 'text-telegram-button-text' : 'text-telegram-hint'}`}
          >
            🏆 Leaderboard
          </button>
        </div>
      </nav>
    </div>
  )
}