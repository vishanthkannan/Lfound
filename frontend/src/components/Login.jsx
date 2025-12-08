import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../api/auth';

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await authAPI.login(formData.email, formData.password);

      if (data.success) {
        // Store token and user data
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Call the onLogin callback
        if (onLogin) {
          onLogin(data.user, data.token);
        }
        
        // Navigate to home page
        navigate('/');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#18191a', color: '#fff', paddingTop: '40px' }}>
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
        <div style={{ maxWidth: 400, width: '100%' }}>
          <div className="card shadow-lg border-0 p-4" style={{ background: '#232526', borderRadius: '1.5rem', color: '#fff' }}>
            <div className="card-body p-4">
              <h3 className="text-center mb-4" style={{ fontSize: '2rem', fontWeight: 'bold', color: '#fff' }}>Login</h3>
              
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ fontSize: '1.08rem' }}>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label" style={{ fontWeight: 600, color: '#fff' }}>Email</label>
                  <input
                    type="email"
                    className="form-control login-input"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    style={{ background: '#18191a', color: '#fff', border: '1px solid #444' }}
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="password" className="form-label" style={{ fontWeight: 600, color: '#fff' }}>Password</label>
                  <input
                    type="password"
                    className="form-control login-input"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    style={{ background: '#18191a', color: '#fff', border: '1px solid #444' }}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100 btn-lg"
                  style={{ borderRadius: '2rem', fontWeight: 600, fontSize: '1.1rem', letterSpacing: '1px' }}
                  disabled={loading}
                >
                  {loading ? 'Logging in...' : 'Login'}
                </button>
              </form>

              <div className="text-center mt-3">
                <p className="mb-0" style={{ color: '#bbb' }}>
                  Don't have an account?{' '}
                  <a href="/signup" style={{ color: '#0d6efd', textDecoration: 'underline' }}>Sign up</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 