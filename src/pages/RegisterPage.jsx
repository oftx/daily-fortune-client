import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';

const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agreed) {
        setError("You must agree to the terms and conditions.");
        return;
    }
    setError('');
    const response = await api.register(username, email, password);
    if (response.success) {
        login(response.data.user, response.data.token);
        navigate('/me');
    } else {
        setError(response.error || 'Registration failed.');
    }
  };

  return (
    <div className="page-container auth-container">
      <div className="auth-form-wrapper">
        <h2>Register</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">UserID*</label>
            <input type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email Address*</label>
            <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password*</label>
            <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <div className="form-group-checkbox">
            <input type="checkbox" id="agree" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
            <label htmlFor="agree">我已同意《用户协议》和《隐私政策》</label>
          </div>
          {error && <p className="error-message">{error}</p>}
          <button type="submit" className="auth-button">Register</button>
        </form>
        <div className="auth-footer">
          <p>Already have an account? <Link to="/login">Click here to login.</Link></p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;