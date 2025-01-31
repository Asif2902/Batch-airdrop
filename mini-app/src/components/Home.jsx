import { useEffect, useState } from 'react';
import { WebApp } from '@telegram-web-app/core';
import { getBalance, getReferralCode } from '../utils/api';

export default function Home() {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [balance, referral] = await Promise.all([
          getBalance(),
          getReferralCode()
        ]);
        setUserData({ balance, referral });
      } catch (err) {
        WebApp.showAlert(err.message);
      }
    };
    loadData();
  }, []);

  return (
    <div className="telegram-theme">
      <div className="balance-card">
        <h3>{userData?.balance ?? 0} Points</h3>
        <p>Referral Code: {userData?.referral ?? 'LOADING...'}</p>
      </div>
      
      <button 
        className="telegram-button"
        onClick={claimDailyReward}
      >
        Claim Daily Reward
      </button>
    </div>
  );
}