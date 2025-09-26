// src/pages/SettingsPage.jsx

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import timezones from '../utils/timezones.json';

const SettingsPage = () => {
    const { t, i18n } = useTranslation();
    const { user } = useAuth();

    const [displayName, setDisplayName] = useState('');
    const [bio, setBio] = useState('');
    const [avatar, setAvatar] = useState('');
    const [background, setBackground] = useState('');
    const [language, setLanguage] = useState(i18n.language);
    const [timezone, setTimezone] = useState('');
    
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (user) {
            setDisplayName(user.display_name || user.username || '');
            setBio(user.bio || '');
            setAvatar(user.avatar_url || '');
            setBackground(user.background_url || '');
            setLanguage(user.language || 'zh');
            setTimezone(user.timezone || 'Asia/Shanghai');
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
        setError('');
        const updateData = {
            display_name: displayName,
            bio: bio,
            avatar_url: avatar,
            background_url: background,
            language: language,
            timezone: timezone,
        };

        const response = await api.updateMyProfile(updateData);
        if (response.success) {
            setMessage(t('settingsSavedSuccess'));
        } else {
            setError(`${t('error')}: ${response.error}`);
        }
    };

    if (loading) return <div className="page-container">{t('loadingSettings')}</div>;

    return (
    <div className="page-container settings-container">
      <h1>{t('settings')}</h1>
      
      <div className="settings-section">
        <h3>{t('profileSection')}</h3>
        <div className="form-group">
          <label>{t('userIdLabelImmutable')}</label>
          <input type="text" value={user.username} disabled />
        </div>
        <div className="form-group">
          <label>{t('displayNameLabel')}</label>
          <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
        </div>
        <div className="form-group">
          <label>{t('bioLabel')}</label>
          <textarea value={bio} onChange={(e) => setBio(e.target.value)} />
        </div>
        <div className="form-group">
          <label>{t('avatarUrlLabel')}</label>
          <input type="text" value={avatar} onChange={(e) => setAvatar(e.target.value)} />
        </div>
         <div className="form-group">
          <label>{t('backgroundUrlLabel')}</label>
          <input type="text" value={background} onChange={(e) => setBackground(e.target.value)} />
        </div>
        <div className="form-group">
          <label>{t('emailLabel')}</label>
          <input type="text" value={user.email} disabled />
        </div>
      </div>

      <div className="settings-section">
        <h3>{t('preferenceSection')}</h3>
        <div className="form-group">
            <label>{t('languageLabel')}</label>
            <select onChange={handleLanguageChange} value={language}>
                <option value="zh">{t('langZh')}</option>
                <option value="en">{t('langEn')}</option>
            </select>
        </div>
        <div className="form-group">
            <label>{t('timezoneLabel')}</label>
            <select onChange={(e) => setTimezone(e.target.value)} value={timezone}>
                {timezones.map(tz => (
                    <option key={tz} value={tz}>{tz}</option>
                ))}
            </select>
        </div>
      </div>
      
       <div className="settings-section">
        <h3>{t('securitySection')}</h3>
        <div className="form-group">
            <label>{t('passwordLabel')}</label>
            <button className="change-password-btn" disabled>{t('changePasswordBtn')}</button>
        </div>
      </div>

      <div style={{ marginBottom: '1rem', minHeight: '1.2em', textAlign: 'center' }}>
        {message && <p style={{ color: 'green', margin: 0 }}>{message}</p>}
        {error && <p className="error-message" style={{ margin: 0 }}>{error}</p>}
      </div>
      
      <div className="settings-actions">
        <button className="save-settings-btn" onClick={handleSave}>{t('saveChanges')}</button>
      </div>
    </div>
  );
};

export default SettingsPage;