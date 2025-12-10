import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = ({ user }) => {
  return (
    <div className="modern-homepage">
      <section className="hero-section">
        <div className="hero-grid">
          <div className="hero-copy">
            <span className="eyebrow">Campus Lost &amp; Found</span>
            <h1>Find what matters, faster.</h1>
            <p className="hero-lead">
              A streamlined, trustworthy hub to report, track, and reunite lost items with their owners.
              Clear steps, instant status, and a community verified by your campus.
            </p>

            <div className="cta-buttons">
              {user ? (
                <>
                  <Link to="/lost" className="btn btn-primary">Report Lost Item</Link>
                  <Link to="/found" className="btn btn-secondary">Report Found Item</Link>
                </>
              ) : (
                <>
                  <Link to="/login" className="btn btn-primary">Sign in</Link>
                  <Link to="/signup" className="btn btn-outline">Create account</Link>
                </>
              )}
            </div>

            <div className="hero-meta">
              <div className="meta-card">
                <span className="meta-value">3k+</span>
                <span className="meta-label">Items matched</span>
              </div>
              <div className="meta-card">
                <span className="meta-value">24/7</span>
                <span className="meta-label">Status updates</span>
              </div>
              <div className="meta-card">
                <span className="meta-value">Secure</span>
                <span className="meta-label">Verified community</span>
              </div>
            </div>
          </div>

          <div className="hero-panel">
            <div className="panel-card">
              <h3>How it works</h3>
              <ul className="panel-list">
                <li>
                  <div className="icon-circle"><i className="bi bi-pencil-square"></i></div>
                  <div>
                    <span className="panel-label">Log a lost or found item</span>
                    <p>Structured forms capture the details that matter.</p>
                  </div>
                </li>
                <li>
                  <div className="icon-circle"><i className="bi bi-lightning-charge"></i></div>
                  <div>
                    <span className="panel-label">Smart matching</span>
                    <p>We surface likely matches immediately after submission.</p>
                  </div>
                </li>
                <li>
                  <div className="icon-circle"><i className="bi bi-shield-check"></i></div>
                  <div>
                    <span className="panel-label">Verified handover</span>
                    <p>Admins and owners confirm before closing the case.</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="features-section">
        <div className="container">
          <div className="row">
            <div className="col-md-4">
              <div className="feature-card">
                <div className="feature-icon"><i className="bi bi-magic"></i></div>
                <h3>Smart matching</h3>
                <p>Detailed tags and filters ensure lost and found reports connect quickly.</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="feature-card">
                <div className="feature-icon"><i className="bi bi-bell"></i></div>
                <h3>Instant alerts</h3>
                <p>Stay informed with timely updates every time a new match is detected.</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="feature-card">
                <div className="feature-icon"><i className="bi bi-people"></i></div>
                <h3>Built for campus</h3>
                <p>Role-aware access, admin oversight, and a trustworthy community workflow.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="modern-footer">
        <div className="footer-content">
          <p className="footer-text">
            &copy; {new Date().getFullYear()} Lost &amp; Found | Purpose-built for your campus community
          </p>
          <div className="footer-links">
            <a href="/about">About</a>
            <span className="footer-separator">|</span>
            <a href="/blog">Blog</a>
            <span className="footer-separator">|</span>
            <a href="/contact">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;