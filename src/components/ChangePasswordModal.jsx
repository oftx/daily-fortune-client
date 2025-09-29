// src/components/ChangePasswordModal.jsx

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from './Modal';

const ChangePasswordModal = ({ isOpen, onClose, onConfirm }) => {
  const { t } = useTranslation();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Reset state when modal is closed/opened
  useEffect(() => {
    if (isOpen) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setError('');
      setMessage('');
      setLoading(false);
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    setError('');
    setMessage('');
    
    if (newPassword !== confirmPassword) {
      setError(t('passwordMismatchError'));
      return;
    }
    
    setLoading(true);
    const result = await onConfirm(currentPassword, newPassword);
    setLoading(false);
    
    if (result.success) {
      setMessage(t('passwordChangedSuccess'));
      // Close the modal after a short delay to show success message
      setTimeout(() => {
        onClose();
      }, 1500);
    } else {
      setError(result.error || 'An unknown error occurred.');
    }
  };

  return (
    // --- MODIFIED: Added the backdropClosable={false} prop to prevent closing on backdrop click ---
    <Modal isOpen={isOpen} onClose={onClose} title={t('changePasswordTitle')} backdropClosable={false}>
      <div className="form-group">
        <label htmlFor="currentPassword">{t('currentPasswordLabel')}</label>
        <input
          type="password"
          id="currentPassword"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label htmlFor="newPassword">{t('newPasswordLabel')}</label>
        <input
          type="password"
          id="newPassword"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label htmlFor="confirmPassword">{t('confirmNewPasswordLabel')}</label>
        <input
          type="password"
          id="confirmPassword"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
      </div>
      
      {error && <p className="error-message" style={{ marginBottom: '1rem' }}>{error}</p>}
      {message && <p style={{ color: 'green', textAlign: 'center', marginBottom: '1rem' }}>{message}</p>}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
        <button className="change-password-btn" onClick={onClose} disabled={loading}>{t('cancel')}</button>
        <button className="save-settings-btn" onClick={handleSubmit} disabled={loading}>
            {loading ? t('loading') : t('confirmChange')}
        </button>
      </div>
    </Modal>
  );
};

export default ChangePasswordModal;