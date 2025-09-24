import React from 'react';

const LeaderboardPage = () => {
  return (
    <div className="page-container leaderboard-container">
      <h1>Fortune Leaderboard</h1>
      <div className="leaderboard-section">
        <h2>Today</h2>
        <ul className="leaderboard-list">
          <li>吉 user1</li>
          <li>凶 user2 user3</li>
          <li>大吉 user4</li>
        </ul>
      </div>
      <div className="leaderboard-section">
        <h2>This week</h2>
        <ul className="leaderboard-list">
            <li>user1 吉5凶1</li>
            <li>user2 吉2</li>
            <li>user3 凶1</li>
        </ul>
      </div>
    </div>
  );
};

export default LeaderboardPage;