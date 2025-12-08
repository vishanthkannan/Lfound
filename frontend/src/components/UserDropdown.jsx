import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './UserDropdown.css';

const UserDropdown = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen]);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    onLogout();
    setIsOpen(false);
  };

  return (
    <div className="user-dropdown" ref={dropdownRef}>
      <button 
        className="user-dropdown-toggle"
        onClick={toggleDropdown}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className="user-avatar">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div className="user-info">
          <span className="user-name">{user.name}</span>
          <span className="user-role">{user.role === 'admin' ? 'Admin' : 'User'}</span>
        </div>
        <i className={`bi bi-chevron-down dropdown-arrow ${isOpen ? 'open' : ''}`}></i>
      </button>
      
      {isOpen && (
        <div className="user-dropdown-menu animate-fade-in">
          <div className="dropdown-header">
            <div className="dropdown-user-avatar">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="dropdown-user-details">
              <div className="dropdown-user-name">{user.name}</div>
              <div className="dropdown-user-email">{user.email}</div>
            </div>
          </div>
          
          <div className="dropdown-divider"></div>
          
          <div className="dropdown-menu-items">
            <Link 
              to="/" 
              className="dropdown-item"
              onClick={() => setIsOpen(false)}
            >
              <i className="bi bi-house"></i>
              <span>Home</span>
            </Link>
            
            {user.role === 'admin' && (
              <Link 
                to="/admin" 
                className="dropdown-item"
                onClick={() => setIsOpen(false)}
              >
                <i className="bi bi-speedometer2"></i>
                <span>Admin Dashboard</span>
              </Link>
            )}
            
            <div className="dropdown-divider"></div>
            
            <button 
              className="dropdown-item dropdown-item-danger"
              onClick={handleLogout}
            >
              <i className="bi bi-box-arrow-right"></i>
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDropdown;
