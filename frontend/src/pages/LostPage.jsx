import React from 'react';
import LostForm from '../components/LostForm';
import './FormPage.css';

const LostPage = ({ user, token }) => {
  return (
    <div className="form-page-container">
      <div className="form-page-background">
        <div className="form-page-gradient"></div>
      </div>
      
      <div className="form-page-content">
        <div className="form-page-header">
          <div className="form-page-icon lost-icon">
            <i className="bi bi-exclamation-triangle-fill"></i>
          </div>
          <h1 className="form-page-title">Report Lost Item</h1>
          <p className="form-page-subtitle">
            Don't worry! Report your lost item and our smart matching system will help find it.
          </p>
          {user && (
            <div className="form-page-user-badge">
              <i className="bi bi-person-circle"></i>
              <span>Reporting as: <strong>{user.name}</strong></span>
            </div>
          )}
        </div>

        <LostForm user={user} token={token} />
      </div>
    </div>
  );
};

export default LostPage;
