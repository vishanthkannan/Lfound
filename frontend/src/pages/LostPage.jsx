import React from 'react';
import LostForm from '../components/LostForm';

const LostPage = ({ user, token }) => {
  return (
    <div style={{ minHeight: '100vh', background: '#18191a', color: '#fff', paddingTop: '40px' }}>
      <nav style={{
        background: 'transparent',
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ fontWeight: 'bold', fontSize: '1.5rem', letterSpacing: '2px' }}>
          <span style={{ color: '#fff' }}>LOST&FOUND</span>
        </div>
        <div>
          <a href="/" style={{ color: '#fff', margin: '0 1rem', textDecoration: 'none' }}>Home</a>
          <a href="/found" style={{ color: '#fff', margin: '0 1rem', textDecoration: 'none' }}>Found</a>
          <a href="/admin" style={{ color: '#fff', margin: '0 1rem', textDecoration: 'none' }}>Admin</a>
        </div>
      </nav>
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
        <div style={{
          background: '#232526',
          borderRadius: '1.5rem',
          boxShadow: '0 4px 32px rgba(0,0,0,0.2)',
          padding: '2.5rem 2rem',
          maxWidth: 500,
          width: '100%'
        }}>
          <h2 className="text-center mb-3" style={{
            fontSize: '2.5rem',
            fontWeight: 'bold',
            letterSpacing: '2px',
            color: '#fff'
          }}>
            Report Lost Item
          </h2>
          <p className="text-center mb-4" style={{ color: '#bbb', fontSize: '1.1rem' }}>
            Help us return lost items to their owners.
          </p>
          <div className="text-center mb-3">
            <small style={{ color: '#bbb' }}>
              Reporting as: <span style={{ fontWeight: 600 }}>{user?.name || "Guest"}</span>
            </small>
          </div>
          <LostForm user={user} token={token} />
        </div>
      </div>
    </div>
  );
};

export default LostPage;