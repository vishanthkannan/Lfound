import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import UserDropdown from './UserDropdown';
import './Navbar.css';

const Navbar = ({ user, onLogout }) => {
  const [isNavCollapsed, setIsNavCollapsed] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavCollapse = () => setIsNavCollapsed(!isNavCollapsed);

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <nav className={`navbar-modern ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        <Link className="navbar-brand" to="/">
          <div className="brand-icon">
            <i className="bi bi-search-heart"></i>
          </div>
          <div className="brand-text">
            <span className="brand-title">Lost & Found</span>
            <span className="brand-subtitle">Reuniting People</span>
          </div>
        </Link>
        
        <button
          className={`navbar-toggler ${!isNavCollapsed ? 'active' : ''}`}
          type="button"
          onClick={handleNavCollapse}
          aria-label="Toggle navigation"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <div className={`navbar-menu ${!isNavCollapsed ? 'show' : ''}`}>
          <ul className="navbar-nav">
            <li className="nav-item">
              <Link 
                className={`nav-link ${isActive('/')}`} 
                to="/"
                onClick={() => setIsNavCollapsed(true)}
              >
                <i className="bi bi-house-door"></i>
                <span>Home</span>
              </Link>
            </li>
            
            {user && (
              <>
                <li className="nav-item">
                  <Link 
                    className={`nav-link ${isActive('/lost')}`} 
                    to="/lost"
                    onClick={() => setIsNavCollapsed(true)}
                  >
                    <i className="bi bi-exclamation-triangle"></i>
                    <span>Report Lost</span>
                  </Link>
                </li>
                
                <li className="nav-item">
                  <Link 
                    className={`nav-link ${isActive('/found')}`} 
                    to="/found"
                    onClick={() => setIsNavCollapsed(true)}
                  >
                    <i className="bi bi-heart"></i>
                    <span>Report Found</span>
                  </Link>
                </li>
                
                {user.role === 'admin' && (
                  <li className="nav-item">
                    <Link 
                      className={`nav-link ${isActive('/admin')}`} 
                      to="/admin"
                      onClick={() => setIsNavCollapsed(true)}
                    >
                      <i className="bi bi-speedometer2"></i>
                      <span>Dashboard</span>
                    </Link>
                  </li>
                )}
              </>
            )}
          </ul>
          
          <div className="navbar-actions">
            {user ? (
              <UserDropdown user={user} onLogout={onLogout} />
            ) : (
              <div className="auth-buttons">
                <Link 
                  className={`btn btn-outline ${isActive('/login')}`} 
                  to="/login"
                  onClick={() => setIsNavCollapsed(true)}
                >
                  <i className="bi bi-box-arrow-in-right"></i>
                  <span>Login</span>
                </Link>
                <Link 
                  className={`btn btn-primary ${isActive('/signup')}`} 
                  to="/signup"
                  onClick={() => setIsNavCollapsed(true)}
                >
                  <i className="bi bi-person-plus"></i>
                  <span>Sign Up</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
