import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = ({ user }) => {
  return (
    <div className="homepage-container">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="container">
          <div className="row align-items-center min-vh-100">
            <div className="col-lg-6">
              <div className="hero-content">
                <h1 className="hero-title">
                  Lost & Found
                  <span className="text-primary"> Management System</span>
                </h1>
                <p className="hero-subtitle">
                  Reuniting people with their lost belongings through intelligent matching and community support.
                </p>
                
                {user ? (
                  <div className="welcome-section">
                    <div className="welcome-card">
                      <div className="welcome-icon">👋</div>
                      <h3>Welcome back, {user.name}!</h3>
                      <p>You're logged in and ready to help others find their lost items.</p>
                      {user.role === 'admin' && (
                        <div className="admin-badge">
                          <span className="badge bg-warning text-dark">
                            <i className="bi bi-shield-check"></i> Admin Access
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="cta-buttons">
                    <Link to="/login" className="btn btn-primary btn-lg me-3">
                      <i className="bi bi-box-arrow-in-right"></i> Login
                    </Link>
                    <Link to="/signup" className="btn btn-outline-primary btn-lg">
                      <i className="bi bi-person-plus"></i> Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </div>
            <div className="col-lg-6">
              <div className="hero-image">
                <div className="floating-cards">
                  <div className="card-item lost-card">
                    <i className="bi bi-search"></i>
                    <span>Lost Items</span>
                  </div>
                  <div className="card-item found-card">
                    <i className="bi bi-check-circle"></i>
                    <span>Found Items</span>
                  </div>
                  <div className="card-item match-card">
                    <i className="bi bi-heart"></i>
                    <span>Smart Matching</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      {user && (
        <div className="features-section">
          <div className="container">
            <div className="row">
              <div className="col-12 text-center mb-5">
                <h2 className="section-title">Quick Actions</h2>
                <p className="section-subtitle">What would you like to do today?</p>
              </div>
            </div>
            <div className="row g-4">
              <div className="col-md-6 col-lg-4">
                <div className="feature-card lost-feature">
                  <div className="feature-icon">
                    <i className="bi bi-exclamation-triangle"></i>
                  </div>
                  <h4>Report Lost Item</h4>
                  <p>Help others find your lost belongings by providing detailed information.</p>
                  <Link to="/lost" className="btn btn-outline-danger">
                    <i className="bi bi-plus-circle"></i> Report Lost
                  </Link>
                </div>
              </div>
              <div className="col-md-6 col-lg-4">
                <div className="feature-card found-feature">
                  <div className="feature-icon">
                    <i className="bi bi-check-circle"></i>
                  </div>
                  <h4>Report Found Item</h4>
                  <p>Help reunite found items with their rightful owners.</p>
                  <Link to="/found" className="btn btn-outline-success">
                    <i className="bi bi-plus-circle"></i> Report Found
                  </Link>
                </div>
              </div>
              {user.role === 'admin' && (
                <div className="col-md-6 col-lg-4">
                  <div className="feature-card admin-feature">
                    <div className="feature-icon">
                      <i className="bi bi-shield-check"></i>
                    </div>
                    <h4>Admin Dashboard</h4>
                    <p>Manage the system, view all items, and run matching algorithms.</p>
                    <Link to="/admin" className="btn btn-outline-warning">
                      <i className="bi bi-speedometer2"></i> Admin Panel
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* How It Works Section */}
      <div className="how-it-works-section">
        <div className="container">
          <div className="row">
            <div className="col-12 text-center mb-5">
              <h2 className="section-title">How It Works</h2>
              <p className="section-subtitle">Simple steps to reunite lost items with their owners</p>
            </div>
          </div>
          <div className="row g-4">
            <div className="col-md-4">
              <div className="step-card">
                <div className="step-number">1</div>
                <div className="step-icon">
                  <i className="bi bi-file-earmark-text"></i>
                </div>
                <h4>Report</h4>
                <p>Submit detailed information about your lost or found item through our easy-to-use forms.</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="step-card">
                <div className="step-number">2</div>
                <div className="step-icon">
                  <i className="bi bi-search-heart"></i>
                </div>
                <h4>Match</h4>
                <p>Our intelligent system automatically matches lost and found items using advanced algorithms.</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="step-card">
                <div className="step-number">3</div>
                <div className="step-icon">
                  <i className="bi bi-heart-fill"></i>
                </div>
                <h4>Reunite</h4>
                <p>.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="stats-section">
        <div className="container">
          <div className="row text-center">
            <div className="col-md-3">
              <div className="stat-item">
                <div className="stat-number">100+</div>
                <div className="stat-label">Items Recovered</div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="stat-item">
                <div className="stat-number">500+</div>
                <div className="stat-label">Happy Users</div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="stat-item">
                <div className="stat-number">95%</div>
                <div className="stat-label">Success Rate</div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="stat-item">
                <div className="stat-number">24/7</div>
                <div className="stat-label">Support</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
