import { useEffect, useState } from 'react'
import { WebApp } from '@telegram-web-app/core'
import { getBalance, claimDailyReward } from '../utils/api'

export default function Home() {
  const [balance, setBalance] = useState(0)
  const [streak, setStreak] = useState(0)
  const [referralCode, setReferralCode] = useState('')

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await getBalance()
        setBalance(response.points)
        setStreak(response.loginStreak)
        setReferralCode(response.referralCode)
      } catch (error) {
        WebApp.showAlert(error.message)
      }
    }
    loadData()
  }, [])

  const handleClaimDaily = async () => {
    try {
      const result = await claimDailyReward()
      setBalance(result.newBalance)
      setStreak(result.newStreak)
      WebApp.showAlert(`Claimed ${result.reward} points! Streak: ${result.newStreak}`)
    } catch (error) {
      WebApp.showAlert(error.message)
    }
  }

  return (
    <div className="space-y-6">
      {/* Balance Card */}
      <div className="bg-telegram-bg-secondary p-6 rounded-xl shadow-lg">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-telegram-hint text-sm">Total Points</h3>
            <p className="text-3xl font-bold text-telegram-text">{balance.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <h3 className="text-telegram-hint text-sm">Login Streak</h3>
            <p className="text-2xl font-bold text-telegram-button-text">🔥 {streak}</p>
          </div>
        </div>
      </div>

      {/* Daily Reward Section */}
      <div className="bg-telegram-bg-secondary p-6 rounded-xl space-y-4">
        <h2 className="text-xl font-bold text-telegram-text">Daily Reward</h2>
        <button
          onClick={handleClaimDaily}
          className="w-full bg-telegram-button text-telegram-button-text py-3 rounded-lg
                   hover:bg-telegram-button-hover active:bg-telegram-button-active
                   transition-colors duration-200"
        >
          Claim Daily Reward
        </button>
        <p className="text-sm text-telegram-hint">
          {streak < 7 
            ? `Claim ${100 * (streak + 1)} points tomorrow!`
            : "50 points per day after 7-day streak"}
        </p>
      </div>

      {/* Referral Section */}
      <div className="bg-telegram-bg-secondary p-6 rounded-xl space-y-4">
        <h2 className="text-xl font-bold text-telegram-text">Referral System</h2>
        <div className="bg-telegram-bg p-4 rounded-lg">
          <p className="text-sm text-telegram-hint mb-2">Your Referral Code:</p>
          <div className="flex justify-between items-center">
            <code className="text-telegram-text font-mono text-lg">{referralCode}</code>
            <button
              onClick={() => {
                navigator.clipboard.writeText(referralCode)
                WebApp.showAlert('Copied to clipboard!')
              }}
              className="bg-telegram-button px-4 py-2 rounded-lg text-telegram-button-text"
            >
              Copy
            </button>
          </div>
        </div>
        <p className="text-sm text-telegram-hint">
          Earn 1000 points per referral (max 50 referrals)
        </p>
      </div>
    </div>
  )
}