import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isRegisterOpen, setIsRegisterOpen] = useState(true);
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const fetchRegisterStatus = async () => {
      const response = await api.getRegisterStatus();
      if (response.success) {
        setIsRegisterOpen(response.data.isOpen);
      }
    };
    fetchRegisterStatus();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const response = await api.login(username, password);
    if (response.success) {
      login(response.data.user, response.data.access_token);
      navigate('/me');
    } else {
      setError(response.error || 'Login failed.');
    }
  };
  
  return (
    <div className="page-container auth-container">
      <div className="auth-form-wrapper">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="error-message">{error}</p>}
          <button type="submit" className="auth-button">Login</button>
        </form>
        <div className="auth-footer">
          <p>
            No account?{' '}
            {isRegisterOpen ? (
              <Link to="/register">Click here to register one.</Link>
            ) : (
              <span className="disabled-link" title="Registration is currently closed.">
                Registration is closed.
              </span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;