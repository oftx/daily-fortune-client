import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const SettingsPage = () => {
    const { i18n } = useTranslation();
    const [username, setUsername] = useState('testuser');
    const [bio, setBio] = useState('永远相信美好的事情即将发生。');
    const [avatar, setAvatar] = useState('');
    const [background, setBackground] = useState('');

    const handleLanguageChange = (e) => {
        i18n.changeLanguage(e.target.value);
    };

    const handleSave = () => {
        alert("Settings saved!");
        // Here you would call an API to save the user settings
    };

  return (
    <div className="page-container settings-container">
      <h1>Settings</h1>
      <div className="settings-section">
        <h3>Profile</h3>
        <div className="form-group">
          <label>Username</label>
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Bio</label>
          <textarea value={bio} onChange={(e) => setBio(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Avatar Image Link</label>
          <input type="text" value={avatar} onChange={(e) => setAvatar(e.target.value)} />
        </div>
         <div className="form-group">
          <label>Userpage background Image Link</label>
          <input type="text" value={background} onChange={(e) => setBackground(e.target.value)} />
        </div>
        <div className="form-group">
          <label>UserID</label>
          <input type="text" value="userid#0" disabled />
        </div>
        <div className="form-group">
          <label>Email Address</label>
          <input type="text" value="me@mail.com" disabled />
        </div>
      </div>

      <div className="settings-section">
        <h3>Preference</h3>
        <div className="form-group">
            <label>Language</label>
            <select onChange={handleLanguageChange} value={i18n.language}>
                <option value="zh">简体中文 (中国)</option>
                <option value="en">English</option>
            </select>
        </div>
      </div>
      
       <div className="settings-section">
        <h3>Security</h3>
        <div className="form-group">
            <label>Password</label>
            <button className="change-password-btn">Change</button>
        </div>
      </div>
      
      <button className="save-settings-btn" onClick={handleSave}>Save Changes</button>
    </div>
  );
};

export default SettingsPage;