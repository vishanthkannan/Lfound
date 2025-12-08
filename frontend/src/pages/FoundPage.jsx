import React from 'react';
import FoundForm from '../components/FoundForm';
import './FormPage.css';

const FoundPage = ({ user, token }) => {
  return (
    <div className="form-page-container">
      <div className="form-page-background">
        <div className="form-page-gradient"></div>
      </div>
      
      <div className="form-page-content">
        <div className="form-page-header">
          <div className="form-page-icon">
            <i className="bi bi-heart-fill"></i>
          </div>
          <h1 className="form-page-title">Report Found Item</h1>
          <p className="form-page-subtitle">
            Help us reunite found items with their owners. Your contribution makes a difference!
          </p>
          {user && (
            <div className="form-page-user-badge">
              <i className="bi bi-person-circle"></i>
              <span>Reporting as: <strong>{user.name}</strong></span>
            </div>
          )}
        </div>

        <FoundForm user={user} token={token} />
      </div>
    </div>
  );
};

export default FoundPage;
