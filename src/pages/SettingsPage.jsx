// src/pages/SettingsPage.jsx

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';

const SettingsPage = () => {
    const { i18n } = useTranslation();
    const { user } = useAuth();

    // Form state
    const [displayName, setDisplayName] = useState(''); // <-- NEW
    const [bio, setBio] = useState('');
    const [avatar, setAvatar] = useState('');
    const [background, setBackground] = useState('');
    const [language, setLanguage] = useState(i18n.language);
    
    // UI state
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [error, setError] = useState(''); // <-- NEW: for errors

    useEffect(() => {
        if (user) {
            setDisplayName(user.display_name || user.username || ''); // <-- NEW
            setBio(user.bio || '');
            setAvatar(user.avatar_url || '');
            setBackground(user.background_url || '');
            setLanguage(user.language || 'zh');
            setLoading(false);
        }
    }, [user]);

    const handleLanguageChange = (e) => {
        const newLang = e.target.value;
        setLanguage(newLang);
        i18n.changeLanguage(newLang);
    };

    const handleSave = async () => {
        setMessage('');
        setError(''); // <-- NEW: reset error
        const updateData = {
            display_name: displayName, // <-- NEW
            bio: bio,
            avatar_url: avatar,
            background_url: background,
            language: language
        };

        const response = await api.updateMyProfile(updateData);
        if (response.success) {
            setMessage("Settings saved successfully! You may need to refresh to see all changes.");
        } else {
            // vvv NEW: Handle specific errors from the backend vvv
            setError(`Error: ${response.error}`);
        }
    };

    if (loading) return <div className="page-container">Loading settings...</div>;

    return (
    <div className="page-container settings-container">
      <h1>Settings</h1>
      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p className="error-message">{error}</p>}
      
      <div className="settings-section">
        <h3>Profile</h3>
        <div className="form-group">
          <label>UserID (cannot be changed)</label>
          <input type="text" value={user.username} disabled />
        </div>

        {/* vvv NEW FIELD vvv */}
        <div className="form-group">
          <label>Display Name</label>
          <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
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
          <label>Email Address</label>
          <input type="text" value={user.email} disabled />
        </div>
      </div>

      <div className="settings-section">
        <h3>Preference</h3>
        <div className="form-group">
            <label>Language</label>
            <select onChange={handleLanguageChange} value={language}>
                <option value="zh">简体中文 (中国)</option>
                <option value="en">English</option>
            </select>
        </div>
      </div>
      
       <div className="settings-section">
        <h3>Security</h3>
        <div className="form-group">
            <label>Password</label>
            <button className="change-password-btn" disabled>Change (Not Implemented)</button>
        </div>
      </div>
      
      <button className="save-settings-btn" onClick={handleSave}>Save Changes</button>
    </div>
  );
};

export default SettingsPage;