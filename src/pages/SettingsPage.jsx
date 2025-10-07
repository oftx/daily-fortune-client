// src/pages/SettingsPage.jsx

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import timezones from '../utils/timezones.json';
import ChangePasswordModal from '../components/ChangePasswordModal';

const SettingsPage = () => {
    const { t, i18n } = useTranslation();
    // --- MODIFIED: Destructure updateToken from useAuth ---
    const { user, updateUser, updateToken } = useAuth();

    const [displayName, setDisplayName] = useState('');
    const [bio, setBio] = useState('');
    const [avatar, setAvatar] = useState('');
    const [background, setBackground] = useState('');
    const [language, setLanguage] = useState(i18n.language);
    const [timezone, setTimezone] = useState('');
    const [qq, setQq] = useState('');
    const [useQqAvatar, setUseQqAvatar] = useState(false);
    
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

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
            setQq(user.qq || '');
            setUseQqAvatar(user.use_qq_avatar || false);
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
            qq: qq ? parseInt(qq, 10) : null,
            use_qq_avatar: useQqAvatar,
        };

        const response = await api.updateMyProfile(updateData);
        if (response.success) {
            setMessage(t('settingsSavedSuccess'));
            updateUser(response.data.user);
        } else {
            setError(`${t('error')}: ${response.error}`);
        }
    };
    
    // --- MODIFIED: The function now updates the token in the context on success ---
    const handleChangePassword = async (currentPassword, newPassword) => {
      const response = await api.changePassword(currentPassword, newPassword);
      
      // If the API call was successful and returned a new access token...
      if (response.success && response.data.access_token) {
        // ...update the token in our application's state and localStorage.
        updateToken(response.data.access_token);
      }

      // Return the result to the modal so it can display success/error messages.
      return {
        success: response.success,
        error: response.error,
      };
    };

    if (loading) return <div className="page-container">{t('loadingSettings')}</div>;

    return (
    <>
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
          <div className="form-group">
              <label>{t('qqLabel')}</label>
              <input 
                  type="number" 
                  value={qq} 
                  onChange={(e) => setQq(e.target.value)} 
                  placeholder="5-10位数字"
              />
          </div>
          <div className="form-group">
              <label>{t('useQqAvatarLabel')}</label>
              <select value={useQqAvatar} onChange={(e) => setUseQqAvatar(e.target.value === 'true')}>
                  <option value={true}>{t('qqAvatarYes')}</option>
                  <option value={false}>{t('qqAvatarNo')}</option>
              </select>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem', textAlign: 'left' }}>
                  {t('qqAvatarWarning')}
              </p>
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
              <button className="change-password-btn" onClick={() => setIsPasswordModalOpen(true)}>
                {t('changePasswordBtn')}
              </button>
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

      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onConfirm={handleChangePassword}
      />
    </>
  );
};

export default SettingsPage;