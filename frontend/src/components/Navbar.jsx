import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import UserDropdown from './UserDropdown';

const Navbar = ({ user, onLogout }) => {
  const [isNavCollapsed, setIsNavCollapsed] = useState(true);
  const location = useLocation();

  const handleNavCollapse = () => setIsNavCollapsed(!isNavCollapsed);

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark px-4 shadow-sm" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <div className="container-fluid">
        <Link className="navbar-brand fw-bold" to="/">
          <i className="bi bi-search me-2"></i>
          Lost & Found
        </Link>
        
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded={!isNavCollapsed ? true : false}
          aria-label="Toggle navigation"
          onClick={handleNavCollapse}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className={`${isNavCollapsed ? 'collapse' : ''} navbar-collapse`} id="navbarNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link 
                className={`nav-link ${isActive('/')}`} 
                to="/"
                onClick={() => setIsNavCollapsed(true)}
              >
                <i className="bi bi-house me-1"></i>
                Home
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
                    <i className="bi bi-exclamation-triangle me-1"></i>
                    Report Lost
                  </Link>
                </li>
                
                <li className="nav-item">
                  <Link 
                    className={`nav-link ${isActive('/found')}`} 
                    to="/found"
                    onClick={() => setIsNavCollapsed(true)}
                  >
                    <i className="bi bi-heart me-1"></i>
                    Report Found
                  </Link>
                </li>
                
                {user.role === 'admin' && (
                  <li className="nav-item">
                    <Link 
                      className={`nav-link ${isActive('/admin')}`} 
                      to="/admin"
                      onClick={() => setIsNavCollapsed(true)}
                    >
                      <i className="bi bi-graph-up me-1"></i>
                      Admin Dashboard
                    </Link>
                  </li>
                )}
              </>
            )}
          </ul>
          
          <ul className="navbar-nav">
            {user ? (
              <UserDropdown user={user} onLogout={onLogout} />
            ) : (
              <>
                <li className="nav-item">
                  <Link 
                    className={`nav-link ${isActive('/login')}`} 
                    to="/login"
                    onClick={() => setIsNavCollapsed(true)}
                  >
                    <i className="bi bi-box-arrow-in-right me-1"></i>
                    Login
                  </Link>
                </li>
                <li className="nav-item">
                  <Link 
                    className={`nav-link ${isActive('/signup')}`} 
                    to="/signup"
                    onClick={() => setIsNavCollapsed(true)}
                  >
                    <i className="bi bi-person-plus me-1"></i>
                    Sign Up
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
