import React from 'react';
import FoundForm from '../components/FoundForm';

const FoundPage = ({ user, token }) => {
  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4 text-success">Report Found Item</h2>
      <div className="text-center mb-3">
        <small className="text-muted">Reporting as: {user?.name}</small>
      </div>
      <FoundForm user={user} token={token} />
    </div>
  );
};

export default FoundPage;
