// src/pages/RegisterPage.jsx

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';

const RegisterPage = () => {
  const { t } = useTranslation();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const { login } = useAuth();

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

  return (
    <div className="page-container auth-container">
      <div className="auth-form-wrapper">
        <h2>{t('register')}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">{t('userIdLabel')}</label>
            <input type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
            {errors.username && <p className="error-message" style={{textAlign: 'left', marginTop: '5px'}}>{errors.username}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="email">{t('emailLabel')}</label>
            <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            {errors.email && <p className="error-message" style={{textAlign: 'left', marginTop: '5px'}}>{errors.email}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="password">{t('passwordLabel')}</label>
            <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            {errors.password && <p className="error-message" style={{textAlign: 'left', marginTop: '5px'}}>{errors.password}</p>}
          </div>
          <div className="form-group-checkbox">
            <input type="checkbox" id="agree" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
            <label htmlFor="agree">{t('agreeTerms')}</label>
          </div>
          
          {errors.form && <p className="error-message">{errors.form}</p>}
          
          <button type="submit" className="auth-button">{t('register')}</button>
        </form>
        <div className="auth-footer">
          <p>{t('haveAccountPrompt')} <Link to="/login">{t('loginLink')}</Link></p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;