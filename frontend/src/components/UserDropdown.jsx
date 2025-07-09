import React, { useState, useRef, useEffect } from 'react';

const UserDropdown = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    onLogout();
    setIsOpen(false);
  };

  return (
    <div className="nav-item dropdown" ref={dropdownRef}>
      <button 
        className="nav-link dropdown-toggle" 
        onClick={toggleDropdown}
        style={{ background: 'none', border: 'none', color: 'inherit' }}
      >
        <i className="bi bi-person-circle me-1"></i>
        {user.name}
      </button>
      {isOpen && (
        <ul className="dropdown-menu dropdown-menu-end show" style={{ display: 'block' }}>
          <li><span className="dropdown-item-text text-muted">Signed in as {user.email}</span></li>
          <li><hr className="dropdown-divider" /></li>
          <li>
            <button 
              className="dropdown-item" 
              onClick={handleLogout}
              style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', padding: '0.25rem 1rem' }}
            >
              Logout
            </button>
          </li>
        </ul>
      )}
    </div>
  );
};

export default UserDropdown; 