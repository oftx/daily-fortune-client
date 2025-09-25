// src/pages/LeaderboardPage.jsx

import React, { useState, useEffect } from 'react';
import api from '../services/api';

const LeaderboardPage = () => {
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

  if (loading) return <div className="page-container">Loading leaderboard...</div>;
  if (error) return <div className="page-container error-message">{error}</div>;

  return (
    <div className="page-container leaderboard-container">
      <h1>Fortune Leaderboard</h1>
      <div className="leaderboard-section">
        <h2>Today</h2>
        {leaderboard.length > 0 ? (
            <ul className="leaderboard-list">
              {leaderboard.map((entry, index) => (
                <li key={index}>{entry.value} - {entry.username}</li>
              ))}
            </ul>
        ) : (
            <p>No one has drawn a fortune yet today.</p>
        )}
      </div>
    </div>
  );
};

export default LeaderboardPage;