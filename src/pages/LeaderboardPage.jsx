// src/pages/LeaderboardPage.jsx

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom'; // <-- IMPORT Link
import api from '../services/api';

const LeaderboardPage = () => {
  const { t } = useTranslation();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      const response = await api.getLeaderboard();
      if (response.success) {
        setLeaderboard(response.data);
      } else {
        setError(response.error);
      }
      setLoading(false);
    };
    fetchLeaderboard();
  }, []);

  if (loading) return <div className="page-container">{t('loading')}</div>;
  if (error) return <div className="page-container error-message">{error}</div>;

  return (
    <div className="page-container leaderboard-container">
      <h1>{t('leaderboardTitle')}</h1>
      <div className="leaderboard-section">
        <h2>{t('today')}</h2>
        {leaderboard.length > 0 ? (
            <ul className="leaderboard-list">
              {/* vvv THIS IS THE CHANGE vvv */}
              {leaderboard.map((entry, index) => (
                <li key={index}>
                  {entry.value} -{' '}
                  <Link to={`/u/${entry.username}`}>
                    {entry.display_name || entry.username}
                  </Link>
                </li>
              ))}
              {/* ^^^ END OF CHANGE ^^^ */}
            </ul>
        ) : (
            <p>{t('noDrawsToday')}</p>
        )}
      </div>
    </div>
  );
};

export default LeaderboardPage;