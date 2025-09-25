// src/pages/LeaderboardPage.jsx

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
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
            // --- MODIFICATION: Reworked rendering to join users on one line ---
            <ul className="leaderboard-list">
              {leaderboard.map((group) => (
                <li key={group.fortune}>
                  <strong>{group.fortune}</strong> -{' '}
                  {group.users.map((user, index) => (
                    <React.Fragment key={user.username}>
                      <Link to={`/u/${user.username}`}>
                        {user.display_name || user.username}
                      </Link>
                      {/* Add a comma and space if it's not the last user */}
                      {index < group.users.length - 1 ? ', ' : ''}
                    </React.Fragment>
                  ))}
                </li>
              ))}
            </ul>
            // --- END OF MODIFICATION ---
        ) : (
            <p>{t('noDrawsToday')}</p>
        )}
      </div>
    </div>
  );
};

export default LeaderboardPage;