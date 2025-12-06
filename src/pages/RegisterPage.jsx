// src/pages/RegisterPage.jsx

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import Modal from '../components/Modal'; // <-- NEW: Import the Modal component

const RegisterPage = () => {
  const { t } = useTranslation();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const { login } = useAuth();

  // --- NEW: State to manage the modal ---
  const [modalContent, setModalContent] = useState(null); // null, or { title, content }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    if (!agreed) {
      setErrors({ form: t('agreeTermsError') });
      return;
    }

    const response = await api.register(username, email, password);

    if (response.success) {
      login(response.data.user, response.data.access_token);
      navigate('/me');
    } else {
      if (response.error && Array.isArray(response.error)) {
        const newErrors = {};
        response.error.forEach(err => {
          const fieldName = err.loc[1];
          if (fieldName) {
            newErrors[fieldName] = err.msg;
          }
        });
        setErrors(newErrors);
      } else if (response.error && typeof response.error === 'string') {
        setErrors({ form: response.error });
      } else {
        setErrors({ form: 'An unexpected error occurred during registration.' });
      }
    }
  };

  // --- NEW: Functions to show the modals ---
  const showModal = (type) => {
    if (type === 'agreement') {
      setModalContent({
        title: t('userAgreementTitle'),
        content: t('userAgreementContent'),
      });
    } else if (type === 'privacy') {
      setModalContent({
        title: t('privacyPolicyTitle'),
        content: t('privacyPolicyContent'),
      });
    }
  };

  const closeModal = () => {
    setModalContent(null);
  };

  const handleLinkClick = (e, type) => {
    e.preventDefault(); // Prevent the link from navigating
    showModal(type);
  };

  return (
    <>
      <div className="page-container auth-container">
        <div className="auth-form-wrapper">
          <h2>{t('register')}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username">{t('userIdLabel')}</label>
              <input type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
              {errors.username && <p className="error-message" style={{ textAlign: 'left', marginTop: '5px' }}>{errors.username}</p>}
            </div>
            <div className="form-group">
              <label htmlFor="email">{t('emailLabel')}</label>
              <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              {errors.email && <p className="error-message" style={{ textAlign: 'left', marginTop: '5px' }}>{errors.email}</p>}
            </div>
            <div className="form-group">
              <label htmlFor="password">{t('passwordLabel')}</label>
              <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              {errors.password && <p className="error-message" style={{ textAlign: 'left', marginTop: '5px' }}>{errors.password}</p>}
            </div>

            {/* --- MODIFIED: The terms agreement section --- */}
            <div className="form-group-checkbox">
              <input type="checkbox" id="agree" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
              <label htmlFor="agree" style={{ cursor: 'default' }}>
                {t('agreeTerms_part1')}{' '}
                <a href="#" onClick={(e) => handleLinkClick(e, 'agreement')}>
                  {t('userAgreementLinkText')}
                </a>{' '}
                {t('agreeTerms_part2')}{' '}
                <a href="#" onClick={(e) => handleLinkClick(e, 'privacy')}>
                  {t('privacyPolicyLinkText')}
                </a>
              </label>
            </div>

            {errors.form && <p className="error-message">{errors.form}</p>}

            <button type="submit" className="auth-button">{t('register')}</button>
          </form>
          <div className="auth-footer">
            <p>{t('haveAccountPrompt')} <Link to="/login">{t('loginLink')}</Link></p>
          </div>
        </div>
      </div>

      {/* --- NEW: The Modal component for displaying policies --- */}
      <Modal isOpen={!!modalContent} onClose={closeModal} title={modalContent?.title || ''}>
        <div style={{ whiteSpace: 'pre-wrap', maxHeight: '60vh', overflowY: 'auto', textAlign: 'left' }}>
          {modalContent?.content}
        </div>
      </Modal>
    </>
  );
};

export default RegisterPage;