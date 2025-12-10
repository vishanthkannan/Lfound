import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { useTheme } from '../contexts/ThemeContext';
import './AdminDashboard.css';

const AdminDashboard = ({ user, token }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({});
  const [matches, setMatches] = useState([]);
  const [lostItems, setLostItems] = useState([]);
  const [foundItems, setFoundItems] = useState([]);
  const [users, setUsers] = useState([]);
  
  // New state for modals and details
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [matchDetails, setMatchDetails] = useState(null);
  const [emailLoading, setEmailLoading] = useState({});
  const [emailStatus, setEmailStatus] = useState({});
  const [matchesLoading, setMatchesLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  
  // Use global theme
  const { isDarkTheme } = useTheme();
  const themeStyles = isDarkTheme ? {
    background: '#1a1a1a',
    cardBackground: '#2a2a2a',
    text: '#ffffff',
    textMuted: '#b0b0b0',
    border: '#404040',
    tableHeaderBg: '#1a1a1a',
    tableRowBg: '#2a2a2a',
    tableRowHover: '#333333'
  } : {
    background: '#f8f9fa',
    cardBackground: '#ffffff',
    text: '#212529',
    textMuted: '#6c757d',
    border: '#dee2e6',
    tableHeaderBg: '#f8f9fa',
    tableRowBg: '#ffffff',
    tableRowHover: '#f8f9fa'
  };

  useEffect(() => {
    if (user && token) {
      loadDashboardStatsAndItems();
    }
  }, [user, token]);

  // Only load stats and first 10 items on initial load
  const loadDashboardStatsAndItems = async () => {
    setLoading(true);
    setError('');
    try {
      const backendUrl = 'http://localhost:5000';
      // Load stats
      const statsResponse = await fetch(`${backendUrl}/api/admin/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }
      // Load first 10 lost items
      const lostResponse = await fetch(`${backendUrl}/api/lost`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (lostResponse.ok) {
        const lostData = await lostResponse.json();
        setLostItems(lostData.items || lostData || []);
      }
      // Load first 10 found items
      const foundResponse = await fetch(`${backendUrl}/api/found`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (foundResponse.ok) {
        const foundData = await foundResponse.json();
        setFoundItems(foundData.items || foundData || []);
      }
    } catch (err) {
      setError('Failed to load dashboard data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Load users only when Users tab is clicked
  const loadUsers = async () => {
    setUsersLoading(true);
    setError('');
    try {
      const backendUrl = 'http://localhost:5000';
      const usersResponse = await fetch(`${backendUrl}/api/admin/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(usersData.users || []);
      }
    } catch (err) {
      setError('Failed to load users: ' + err.message);
    } finally {
      setUsersLoading(false);
    }
  };

  // Load matches only when Matches tab or Run Matching is clicked
  const loadMatches = async () => {
    setMatchesLoading(true);
    setError('');
    try {
      const backendUrl = 'http://localhost:5000';
      const matchesResponse = await fetch(`${backendUrl}/api/matches/match`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });
      if (matchesResponse.ok) {
        const matchesData = await matchesResponse.json();
        setMatches(matchesData.matches || []);
        setEmailLoading({});
        setEmailStatus({});
        setActiveTab('matches');
        alert(`Matching completed! Found ${matchesData.totalMatches} matches.`);
      } else {
        throw new Error('Failed to run matching');
      }
    } catch (err) {
      setError('Failed to run matching algorithm');
    } finally {
      setMatchesLoading(false);
    }
  };

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'matches' && matches.length === 0) {
      loadMatches();
    }
    if (tab === 'users' && users.length === 0) {
      loadUsers();
    }
  };

  const getMatchBadgeClass = (percentage) => {
    if (percentage >= 80) return 'badge bg-success';
    if (percentage >= 60) return 'badge bg-warning';
    return 'badge bg-secondary';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMatchKey = (match) => `${match?.lostItem?._id || ''}-${match?.foundItem?._id || ''}`;

  // Handle view details button click
  const handleViewDetails = async (match) => {
    setSelectedMatch(match);
    setLoading(true);
    setError('');
    
    try {
      const backendUrl = 'http://localhost:5000';
      const response = await fetch(`${backendUrl}/api/admin/match-details`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          lostItemId: match.lostItem._id,
          foundItemId: match.foundItem._id
        })
      });

      if (response.ok) {
        const data = await response.json();
        setMatchDetails(data);
        setShowDetailsModal(true);
      } else {
        throw new Error('Failed to fetch match details');
      }
    } catch (err) {
      setError('Failed to load match details');
      console.error('View details error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle send email button click
  const handleSendEmail = async (match) => {
    const matchKey = getMatchKey(match);
    setEmailLoading(prev => ({ ...prev, [matchKey]: true }));
    setEmailStatus(prev => ({ ...prev, [matchKey]: null }));
    setError('');
    
    try {
      const backendUrl = 'http://localhost:5000';
      const response = await fetch(`${backendUrl}/api/matches/send-email`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          lostItemId: match.lostItem._id,
          foundItemId: match.foundItem._id
        })
      });

      if (response.ok) {
        await response.json();
        setEmailStatus(prev => ({ ...prev, [matchKey]: 'success' }));
      } else {
        throw new Error('Failed to send email');
      }
    } catch (err) {
      setError('Failed to send email notification');
      setEmailStatus(prev => ({ ...prev, [matchKey]: 'error' }));
      console.error('Send email error:', err);
    } finally {
      setEmailLoading(prev => ({ ...prev, [matchKey]: false }));
    }
  };

  // Close modal
  const handleCloseModal = () => {
    setShowDetailsModal(false);
    setSelectedMatch(null);
    setMatchDetails(null);
  };

  const renderOverview = () => (
    <div className="row">
      <div className="col-md-3 mb-4">
        <div className="card theme-card" style={{ backgroundColor: themeStyles.cardBackground, color: themeStyles.text, borderColor: themeStyles.border }}>
          <div className="card-body" style={{ backgroundColor: themeStyles.cardBackground, color: themeStyles.text }}>
            <h5 className="card-title">Total Lost Items</h5>
            <h2 className="card-text">{stats.totalLostItems || 0}</h2>
          </div>
        </div>
      </div>
      <div className="col-md-3 mb-4">
        <div className="card theme-card" style={{ backgroundColor: themeStyles.cardBackground, color: themeStyles.text, borderColor: themeStyles.border }}>
          <div className="card-body" style={{ backgroundColor: themeStyles.cardBackground, color: themeStyles.text }}>
            <h5 className="card-title">Total Found Items</h5>
            <h2 className="card-text">{stats.totalFoundItems || 0}</h2>
          </div>
        </div>
      </div>
      <div className="col-md-3 mb-4">
        <div className="card theme-card" style={{ backgroundColor: themeStyles.cardBackground, color: themeStyles.text, borderColor: themeStyles.border }}>
          <div className="card-body" style={{ backgroundColor: themeStyles.cardBackground, color: themeStyles.text }}>
            <h5 className="card-title">Total Matches</h5>
            <h2 className="card-text">{stats.totalMatches || 0}</h2>
          </div>
        </div>
      </div>
      <div className="col-md-3 mb-4">
        <div className="card theme-card" style={{ backgroundColor: themeStyles.cardBackground, color: themeStyles.text, borderColor: themeStyles.border }}>
          <div className="card-body" style={{ backgroundColor: themeStyles.cardBackground, color: themeStyles.text }}>
            <h5 className="card-title">Registered Users</h5>
            <h2 className="card-text">{stats.totalUsers || 0}</h2>
          </div>
        </div>
      </div>

      <div className="col-12 mb-4">
        <div className="card theme-card" style={{ backgroundColor: themeStyles.cardBackground, color: themeStyles.text, borderColor: themeStyles.border }}>
          <div className="card-header d-flex justify-content-between align-items-center" style={{ backgroundColor: themeStyles.cardBackground, color: themeStyles.text, borderColor: themeStyles.border }}>
            <h5 className="mb-0">Quick Actions</h5>
            <button 
              className="btn btn-primary" 
              onClick={loadMatches}
              disabled={loading}
            >
              {loading ? 'Running...' : 'Run Matching Algorithm'}
            </button>
          </div>
          <div className="card-body" style={{ backgroundColor: themeStyles.cardBackground, color: themeStyles.text }}>
            <div className="row">
              <div className="col-md-6">
                <h6>Recent Activity</h6>
                <ul className="list-unstyled">
                  <li><strong>• Last matching run:</strong> {stats.lastMatchingRun ? new Date(stats.lastMatchingRun).toLocaleString() : 'Never'}</li>
                  <li><strong>• Email notifications sent:</strong> {stats.emailNotificationsSent || 0}</li>
                  <li><strong>• High-confidence matches:</strong> {stats.highConfidenceMatches || 0}</li>
                </ul>
              </div>
              <div className="col-md-6">
                <h6>System Status</h6>
                <ul className="list-unstyled">
                  <li><strong>• Database:</strong> <span className="badge bg-success">Connected</span></li>
                  <li><strong>• Email Service:</strong> <span className="badge bg-success">Active</span></li>
                  <li><strong>• Matching Engine:</strong> <span className="badge bg-success">Ready</span></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMatches = () => (
    <div className="card theme-card" style={{ backgroundColor: themeStyles.cardBackground, color: themeStyles.text, borderColor: themeStyles.border }}>
      <div className="card-header d-flex justify-content-between align-items-center" style={{ backgroundColor: themeStyles.cardBackground, color: themeStyles.text, borderColor: themeStyles.border }}>
        <h5 className="mb-0 theme-text">Match Results</h5>
      </div>
      <div className="card-body theme-card" style={{ backgroundColor: themeStyles.cardBackground, color: themeStyles.text }}>
        {matches.length === 0 ? (
          <p className="theme-text-muted">No matches found. Run the matching algorithm to see results.</p>
        ) : (
          <div className="table-responsive">
            <table className="table theme-table" style={{ backgroundColor: themeStyles.cardBackground, color: themeStyles.text }}>
              <thead style={{ backgroundColor: themeStyles.tableHeaderBg, color: themeStyles.text }}>
                <tr style={{ backgroundColor: themeStyles.tableHeaderBg }}>
                  <th className="theme-text theme-border" style={{ backgroundColor: themeStyles.tableHeaderBg, color: themeStyles.text }}>Match %</th>
                  <th className="theme-text theme-border" style={{ backgroundColor: themeStyles.tableHeaderBg, color: themeStyles.text }}>Lost Item</th>
                  <th className="theme-text theme-border" style={{ backgroundColor: themeStyles.tableHeaderBg, color: themeStyles.text }}>Found Item</th>
                  <th className="theme-text theme-border" style={{ backgroundColor: themeStyles.tableHeaderBg, color: themeStyles.text }}>Category</th>
                  <th className="theme-text theme-border" style={{ backgroundColor: themeStyles.tableHeaderBg, color: themeStyles.text }}>Classification</th>
                  <th className="theme-text theme-border" style={{ backgroundColor: themeStyles.tableHeaderBg, color: themeStyles.text }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {matches.map((match, index) => (
                  <tr
                    key={index}
                    className="theme-table-row"
                    style={{ backgroundColor: themeStyles.tableRowBg, color: themeStyles.text }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = themeStyles.tableRowHover}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = themeStyles.tableRowBg}
                  >
                    <td className="theme-border" style={{ backgroundColor: 'transparent', color: themeStyles.text }}>
                      <span className={getMatchBadgeClass(match.matchPercentage)}>
                        {match.matchPercentage}%
                      </span>
                    </td>
                    <td className="theme-border" style={{ backgroundColor: 'transparent', color: themeStyles.text }}>
                      <strong className="theme-text">{match.lostItem.customId}</strong><br/>
                      <small className="theme-text-muted">{match.lostItem.itemName || match.lostItem.bookTitle || 'N/A'}</small>
                    </td>
                    <td className="theme-border" style={{ backgroundColor: 'transparent', color: themeStyles.text }}>
                      <strong className="theme-text">{match.foundItem.customId}</strong><br/>
                      <small className="theme-text-muted">{match.foundItem.itemName || match.foundItem.bookTitle || 'N/A'}</small>
                    </td>
                    <td className="theme-border theme-text" style={{ backgroundColor: 'transparent', color: themeStyles.text }}>{match.lostItem.category}</td>
                    <td className="theme-border theme-text" style={{ backgroundColor: 'transparent', color: themeStyles.text }}>{match.classification}</td>
                    <td className="theme-border" style={{ backgroundColor: 'transparent', color: themeStyles.text }}>
                      <button 
                        className="btn btn-sm btn-outline-primary me-1" 
                        onClick={() => handleViewDetails(match)}
                        disabled={loading}
                      >
                        View Details
                      </button>
                      {match.matchPercentage >= 70 && (
                        <button 
                          className="btn btn-sm btn-outline-success"
                          onClick={() => handleSendEmail(match)}
                          disabled={emailLoading[getMatchKey(match)]}
                        >
                          {emailLoading[getMatchKey(match)] ? 'Sending...' : (emailStatus[getMatchKey(match)] === 'success' ? 'Sent' : 'Send Email')}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  const renderItems = () => (
    <div className="row">
      <div className="col-md-6">
        <div className="card theme-card" style={{ backgroundColor: themeStyles.cardBackground, color: themeStyles.text, borderColor: themeStyles.border }}>
          <div className="card-header d-flex justify-content-between align-items-center" style={{ backgroundColor: themeStyles.cardBackground, color: themeStyles.text, borderColor: themeStyles.border }}>
            <h5 className="mb-0">Lost Items ({lostItems.length})</h5>
            <small className="theme-text-muted">Showing latest 10</small>
          </div>
          <div className="card-body" style={{ backgroundColor: themeStyles.cardBackground, color: themeStyles.text }}>
            <div className="table-responsive" style={{ maxHeight: '400px' }}>
              <table className="table table-sm theme-table" style={{ backgroundColor: themeStyles.cardBackground, color: themeStyles.text }}>
                <thead>
                  <tr>
                    <th className="theme-text theme-border" style={{ backgroundColor: themeStyles.tableHeaderBg, color: themeStyles.text }}>ID</th>
                    <th className="theme-text theme-border" style={{ backgroundColor: themeStyles.tableHeaderBg, color: themeStyles.text }}>Category</th>
                    <th className="theme-text theme-border" style={{ backgroundColor: themeStyles.tableHeaderBg, color: themeStyles.text }}>Item</th>
                    <th className="theme-text theme-border" style={{ backgroundColor: themeStyles.tableHeaderBg, color: themeStyles.text }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {lostItems.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center theme-text-muted">No lost items found</td>
                    </tr>
                  ) : (
                    lostItems.slice(0, 10).map((item) => (
                      <tr
                        key={item._id}
                        className="theme-table-row"
                        style={{ backgroundColor: themeStyles.tableRowBg }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = themeStyles.tableRowHover}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = themeStyles.tableRowBg}
                      >
                        <td className="theme-border theme-text" style={{ backgroundColor: 'transparent', color: themeStyles.text }}>{item.customId}</td>
                        <td className="theme-border" style={{ backgroundColor: 'transparent', color: themeStyles.text }}><span className="badge bg-primary">{item.category}</span></td>
                        <td className="theme-border theme-text" style={{ backgroundColor: 'transparent', color: themeStyles.text }}>{item.itemName || item.bookTitle || 'N/A'}</td>
                        <td className="theme-border theme-text" style={{ backgroundColor: 'transparent', color: themeStyles.text }}>{formatDate(item.lostDateTime)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <div className="col-md-6">
        <div className="card theme-card" style={{ backgroundColor: themeStyles.cardBackground, color: themeStyles.text, borderColor: themeStyles.border }}>
          <div className="card-header d-flex justify-content-between align-items-center" style={{ backgroundColor: themeStyles.cardBackground, color: themeStyles.text, borderColor: themeStyles.border }}>
            <h5 className="mb-0">Found Items ({foundItems.length})</h5>
            <small className="theme-text-muted">Showing latest 10</small>
          </div>
          <div className="card-body" style={{ backgroundColor: themeStyles.cardBackground, color: themeStyles.text }}>
            <div className="table-responsive" style={{ maxHeight: '400px' }}>
              <table className="table table-sm theme-table" style={{ backgroundColor: themeStyles.cardBackground, color: themeStyles.text }}>
                <thead>
                  <tr>
                    <th className="theme-text theme-border" style={{ backgroundColor: themeStyles.tableHeaderBg, color: themeStyles.text }}>ID</th>
                    <th className="theme-text theme-border" style={{ backgroundColor: themeStyles.tableHeaderBg, color: themeStyles.text }}>Category</th>
                    <th className="theme-text theme-border" style={{ backgroundColor: themeStyles.tableHeaderBg, color: themeStyles.text }}>Item</th>
                    <th className="theme-text theme-border" style={{ backgroundColor: themeStyles.tableHeaderBg, color: themeStyles.text }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {foundItems.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center theme-text-muted">No found items found</td>
                    </tr>
                  ) : (
                    foundItems.slice(0, 10).map((item) => (
                      <tr
                        key={item._id}
                        className="theme-table-row"
                        style={{ backgroundColor: themeStyles.tableRowBg }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = themeStyles.tableRowHover}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = themeStyles.tableRowBg}
                      >
                        <td className="theme-border theme-text" style={{ backgroundColor: 'transparent', color: themeStyles.text }}>{item.customId}</td>
                        <td className="theme-border" style={{ backgroundColor: 'transparent', color: themeStyles.text }}><span className="badge bg-success">{item.category}</span></td>
                        <td className="theme-border theme-text" style={{ backgroundColor: 'transparent', color: themeStyles.text }}>{item.itemName || item.bookTitle || 'N/A'}</td>
                        <td className="theme-border theme-text" style={{ backgroundColor: 'transparent', color: themeStyles.text }}>{formatDate(item.foundDateTime)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="card theme-card" style={{ backgroundColor: themeStyles.cardBackground, color: themeStyles.text, borderColor: themeStyles.border }}>
      <div className="card-header" style={{ backgroundColor: themeStyles.cardBackground, color: themeStyles.text, borderColor: themeStyles.border }}>
        <h5 className="mb-0">Registered Users</h5>
      </div>
      <div className="card-body" style={{ backgroundColor: themeStyles.cardBackground, color: themeStyles.text }}>
        <div className="table-responsive">
          <table className="table theme-table" style={{ backgroundColor: themeStyles.cardBackground, color: themeStyles.text }}>
            <thead style={{ backgroundColor: themeStyles.tableHeaderBg, color: themeStyles.text }}>
              <tr>
                <th className="theme-text theme-border" style={{ backgroundColor: themeStyles.tableHeaderBg, color: themeStyles.text }}>Name</th>
                <th className="theme-text theme-border" style={{ backgroundColor: themeStyles.tableHeaderBg, color: themeStyles.text }}>Email</th>
                <th className="theme-text theme-border" style={{ backgroundColor: themeStyles.tableHeaderBg, color: themeStyles.text }}>Role</th>
                <th className="theme-text theme-border" style={{ backgroundColor: themeStyles.tableHeaderBg, color: themeStyles.text }}>Joined</th>
                <th className="theme-text theme-border" style={{ backgroundColor: themeStyles.tableHeaderBg, color: themeStyles.text }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user._id}
                  className="theme-table-row"
                  style={{ backgroundColor: themeStyles.tableRowBg, color: themeStyles.text }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = themeStyles.tableRowHover}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = themeStyles.tableRowBg}
                >
                  <td className="theme-border theme-text" style={{ backgroundColor: 'transparent', color: themeStyles.text }}>{user.name}</td>
                  <td className="theme-border theme-text" style={{ backgroundColor: 'transparent', color: themeStyles.text }}>{user.email}</td>
                  <td className="theme-border" style={{ backgroundColor: 'transparent', color: themeStyles.text }}>
                    <span className={`badge ${user.role === 'admin' ? 'bg-danger' : 'bg-secondary'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="theme-border theme-text" style={{ backgroundColor: 'transparent', color: themeStyles.text }}>{formatDate(user.createdAt)}</td>
                  <td className="theme-border" style={{ backgroundColor: 'transparent', color: themeStyles.text }}>
                    <button className="btn btn-sm btn-outline-primary">View Profile</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  if (!user || user.role !== 'admin') {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger">
          <h4>Access Denied</h4>
          <p>You need admin privileges to access this dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <h2>Admin Dashboard</h2>
          {error && <div className="alert alert-danger">{error}</div>}
          
          <ul className="nav nav-tabs mb-4">
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => handleTabChange('overview')}
              >
                Overview
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'matches' ? 'active' : ''}`}
                onClick={() => handleTabChange('matches')}
              >
                Matches
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'items' ? 'active' : ''}`}
                onClick={() => handleTabChange('items')}
              >
                Items
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'users' ? 'active' : ''}`}
                onClick={() => handleTabChange('users')}
              >
                Users
              </button>
            </li>
          </ul>

          {loading && (
            <div className="text-center">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          )}

          {!loading && (
            <>
              {activeTab === 'overview' && renderOverview()}
              {activeTab === 'matches' && renderMatches()}
              {activeTab === 'items' && renderItems()}
              {activeTab === 'users' && renderUsers()}
            </>
          )}

          {/* Match Details Modal */}
          {showDetailsModal && selectedMatch && matchDetails && (
            <div className="modal fade show" style={{ display: 'block', zIndex: 1050 }} tabIndex="-1">
              <div className="modal-dialog modal-lg">
                <div 
                  className="modal-content" 
                  style={{ backgroundColor: themeStyles.cardBackground, color: themeStyles.text, borderColor: themeStyles.border }}
                >
                  <div 
                    className="modal-header" 
                    style={{ borderColor: themeStyles.border, backgroundColor: themeStyles.cardBackground, color: themeStyles.text }}
                  >
                    <h5 className="modal-title">Match Details</h5>
                  </div>
                  <div className="modal-body" style={{ backgroundColor: themeStyles.cardBackground, color: themeStyles.text }}>
                    <div className="row">
                      <div className="col-md-6">
                        <h6>Lost Item Details</h6>
                        <div className="card" style={{ backgroundColor: themeStyles.cardBackground, color: themeStyles.text, borderColor: themeStyles.border }}>
                          <div className="card-body">
                            <p><strong>ID:</strong> {matchDetails.lostItem.customId}</p>
                            <p><strong>Category:</strong> {matchDetails.lostItem.category}</p>
                            <p><strong>Item:</strong> {matchDetails.lostItem.itemName || matchDetails.lostItem.bookTitle || 'N/A'}</p>
                            {matchDetails.lostItem.category === 'Money' && (
                              <>
                                <p><strong>Denominations:</strong> {Array.isArray(matchDetails.lostItem.moneyDenominations) && matchDetails.lostItem.moneyDenominations.length > 0 ? matchDetails.lostItem.moneyDenominations.map(d => `${d.denomination} x ${d.count}`).join(', ') : 'N/A'}</p>
                                <p><strong>Total Amount:</strong> {matchDetails.lostItem.totalAmount || 'N/A'}</p>
                              </>
                            )}
                            {matchDetails.lostItem.category === 'ID Cards' && (
                              <>
                                <p><strong>Roll Number:</strong> {matchDetails.lostItem.rollNumber || 'N/A'}</p>
                                <p><strong>Name:</strong> {matchDetails.lostItem.name || 'N/A'}</p>
                              </>
                            )}
                            {matchDetails.lostItem.category === 'Books' && (
                              <>
                                <p><strong>Book Title:</strong> {matchDetails.lostItem.bookTitle || 'N/A'}</p>
                                <p><strong>Author:</strong> {matchDetails.lostItem.author || 'N/A'}</p>
                              </>
                            )}
                            <p><strong>Lost Place:</strong> {matchDetails.lostItem.lostPlace}</p>
                            <p><strong>Lost Date:</strong> {formatDate(matchDetails.lostItem.lostDateTime)}</p>
                            {matchDetails.lostItem.description && <p><strong>Description:</strong> {matchDetails.lostItem.description}</p>}
                            {matchDetails.lostItem.createdBy && (
                              <p><strong>Reported by:</strong> {matchDetails.lostItem.createdBy.name} ({matchDetails.lostItem.createdBy.email})</p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <h6>Found Item Details</h6>
                        <div className="card" style={{ backgroundColor: themeStyles.cardBackground, color: themeStyles.text, borderColor: themeStyles.border }}>
                          <div className="card-body">
                            <p><strong>ID:</strong> {matchDetails.foundItem.customId}</p>
                            <p><strong>Category:</strong> {matchDetails.foundItem.category}</p>
                            <p><strong>Item:</strong> {matchDetails.foundItem.itemName || matchDetails.foundItem.bookTitle || 'N/A'}</p>
                            {matchDetails.foundItem.category === 'Money' && (
                              <>
                                <p><strong>Denominations:</strong> {Array.isArray(matchDetails.foundItem.moneyDenominations) && matchDetails.foundItem.moneyDenominations.length > 0 ? matchDetails.foundItem.moneyDenominations.map(d => `${d.denomination} x ${d.count}`).join(', ') : 'N/A'}</p>
                                <p><strong>Total Amount:</strong> {matchDetails.foundItem.totalAmount || 'N/A'}</p>
                              </>
                            )}
                            {matchDetails.foundItem.category === 'ID Cards' && (
                              <>
                                <p><strong>Roll Number:</strong> {matchDetails.foundItem.rollNumber || 'N/A'}</p>
                                <p><strong>Name:</strong> {matchDetails.foundItem.name || 'N/A'}</p>
                              </>
                            )}
                            {matchDetails.foundItem.category === 'Books' && (
                              <>
                                <p><strong>Book Title:</strong> {matchDetails.foundItem.bookTitle || 'N/A'}</p>
                                <p><strong>Author:</strong> {matchDetails.foundItem.author || 'N/A'}</p>
                              </>
                            )}
                            <p><strong>Found Place:</strong> {matchDetails.foundItem.foundPlace}</p>
                            <p><strong>Found Date:</strong> {formatDate(matchDetails.foundItem.foundDateTime)}</p>
                            {matchDetails.foundItem.description && <p><strong>Description:</strong> {matchDetails.foundItem.description}</p>}
                            {matchDetails.foundItem.createdBy && (
                              <p><strong>Found by:</strong> {matchDetails.foundItem.createdBy.name} ({matchDetails.foundItem.createdBy.email})</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="row mt-3">
                      <div className="col-12">
                        <h6>Match Analysis</h6>
                        <div className="card" style={{ backgroundColor: themeStyles.cardBackground, color: themeStyles.text, borderColor: themeStyles.border }}>
                          <div className="card-body">
                            <p><strong>Match Percentage:</strong> 
                              <span className={`badge ms-2 ${getMatchBadgeClass(matchDetails.matchResult.percentage)}`}>
                                {matchDetails.matchResult.percentage}%
                              </span>
                            </p>
                            <p><strong>Classification:</strong> {matchDetails.matchResult.classification}</p>
                            {matchDetails.matchResult.reasons && matchDetails.matchResult.reasons.length > 0 && (
                              <div>
                                <strong>Match Reasons:</strong>
                                <ul className="mt-2">
                                  {matchDetails.matchResult.reasons.map((reason, index) => (
                                    <li key={index}>{reason}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer" style={{ borderColor: themeStyles.border, backgroundColor: themeStyles.cardBackground }}>
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      style={{ color: themeStyles.text, borderColor: themeStyles.border, backgroundColor: 'transparent' }}
                      onClick={handleCloseModal}
                    >
                      Close
                    </button>
                    {matchDetails.matchResult.percentage >= 70 && (
                      <button 
                        type="button" 
                        className="btn btn-success"
                        onClick={() => handleSendEmail(selectedMatch)}
                        disabled={emailLoading[getMatchKey(selectedMatch)]}
                      >
                        {emailLoading[getMatchKey(selectedMatch)] 
                          ? 'Sending...' 
                          : (emailStatus[getMatchKey(selectedMatch)] === 'success' ? 'Sent' : 'Send Email Notification')}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Modal Backdrop */}
          {showDetailsModal && (
            <div className="modal-backdrop fade show" style={{ zIndex: 1040 }}></div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 