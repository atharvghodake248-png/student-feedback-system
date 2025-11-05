// src/components/Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/api';
import '../App.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await login(username, password);
      
      if (response.success) {
        localStorage.setItem('userType', response.user_type);
        localStorage.setItem('username', response.username);

        switch (response.user_type) {
          case 'student':
            navigate('/student-dashboard');
            break;
          case 'teacher':
            navigate('/teacher-dashboard');
            break;
          case 'admin':
            navigate('/admin-dashboard');
            break;
          default:
            setError('Invalid user type');
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Simple popup alerts for forgot options
  const handleForgotPassword = () => {
    alert('Please contact your class teacher or admin to reset your password.');
  };

  const handleForgotUsername = () => {
    alert('If you forgot your username, contact your teacher or admin.');
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>🎓 NLP Feedback System</h1>
        <h2>Login</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username / PRN / Employee ID</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              disabled={loading}
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {/* 👇 Added section */}
        <div style={{ textAlign: 'center', marginTop: '15px' }}>
          <button
            onClick={handleForgotPassword}
            style={{
              background: 'none',
              border: 'none',
              color: '#4b57f5',
              fontWeight: '500',
              cursor: 'pointer',
            }}
          >
            Forgot Password?
          </button>
          <br />
          <button
            onClick={handleForgotUsername}
            style={{
              background: 'none',
              border: 'none',
              color: '#4b57f5',
              fontWeight: '500',
              cursor: 'pointer',
            }}
          >
            Forgot Username?
          </button>
        </div>

        <div className="login-info">
          <p>Default Admin: <strong>admin / admin123</strong></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
