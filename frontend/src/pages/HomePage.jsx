import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = ({ user }) => {
  return (
    <div className="modern-homepage">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-tagline">
            We reunite people through
          </div>
          
          <div className="hero-title-container">
            <div className="creative-text">
              <span className="letter letter-l">
                <div className="letter-icon">📱</div>
                L
              </span>
              <span className="letter letter-o">
                <div className="letter-icon">🔍</div>
                o
              </span>
              <span className="letter letter-s">
                <div className="letter-icon">👤</div>
                s
              </span>
              <span className="letter letter-t">
                <div className="letter-icon">✨</div>
                t
              </span>
              <span className="letter letter-space">&</span>
              <span className="letter letter-f">
                <div className="letter-icon">🎯</div>
                F
              </span>
              <span className="letter letter-o2">
                <div className="letter-icon">👥</div>
                o
              </span>
              <span className="letter letter-u">
                <div className="letter-icon">🏠</div>
                u
              </span>
              <span className="letter letter-n">
                <div className="letter-icon">💝</div>
                n
              </span>
              <span className="letter letter-d">
                <div className="letter-icon">🔄</div>
                d
              </span>
            </div>
          </div>
          
          <div className="hero-subtitle">
            Exceptional results for students and communities through
            <br />
            smart matching, instant notifications and seamless technology.
          </div>

          {user ? (
            <div className="user-welcome">
              <div className="welcome-card">
                <div className="welcome-icon">👋</div>
                <h3>Welcome back, {user.name}!</h3>
                <p>Ready to help reunite people with their belongings?</p>
                {user.role === 'admin' && (
                  <span className="admin-badge">Admin Access</span>
                )}
              </div>
              <div className="action-buttons">
                <Link to="/lost" className="btn btn-primary">Report Lost Item</Link>
                <Link to="/found" className="btn btn-secondary">Report Found Item</Link>
              </div>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-primary">Get Started</Link>
              <Link to="/signup" className="btn btn-outline">Join Community</Link>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="row">
            <div className="col-md-4">
              <div className="feature-card">
                <div className="feature-icon">🔍</div>
                <h3>Smart Matching</h3>
                <p>AI-powered system matches lost and found items automatically</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="feature-card">
                <div className="feature-icon">📧</div>
                <h3>Instant Alerts</h3>
                <p>Get notified immediately when your item is found</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="feature-card">
                <div className="feature-icon">🤝</div>
                <h3>Community Driven</h3>
                <p>Built by students, for students and the community</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    {/* Modern Footer */}
    <footer className="modern-footer">
      <div>
        &copy; {new Date().getFullYear()} Lost &amp; Found | Made with <span style={{color:'#00bcd4'}}>♥</span> by Your Team
      </div>
      <div style={{marginTop:'0.5rem'}}>
        <a href="/about">About</a>|
        <a href="/blog">Blog</a>|
        <a href="/contact">Contact</a>
      </div>
    </footer>
  </div>
  );
};

export default HomePage;