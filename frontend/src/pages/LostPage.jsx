import React from 'react';
import LostForm from '../components/LostForm';

const LostPage = ({ user, token }) => {
  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4 text-primary">Report Lost Item</h2>
      <div className="text-center mb-3">
        <small className="text-muted">Reporting as: {user?.name}</small>
      </div>
      <LostForm user={user} token={token} />
    </div>
  );
};

export default LostPage;