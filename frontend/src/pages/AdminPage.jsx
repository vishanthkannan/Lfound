import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './AdminPage.css';

const AdminPage = () => {
  const [lostItems, setLostItems] = useState([]);
  const [foundItems, setFoundItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [matching, setMatching] = useState(false);
  const [matchResults, setMatchResults] = useState(null);
  const [emailLoading, setEmailLoading] = useState({}); // Track individual email loading states
  const [emailStatus, setEmailStatus] = useState({}); // Track email send status per match
  const [isDarkTheme, setIsDarkTheme] = useState(true); // Default to dark theme

  // Fetch data from backend
  useEffect(() => {
    fetchData();
    // Load theme preference from localStorage
    const savedTheme = localStorage.getItem('adminTheme');
    if (savedTheme) {
      setIsDarkTheme(savedTheme === 'dark');
    }
  }, []);

  // Apply theme class to body and root element
  useEffect(() => {
    const themeClass = isDarkTheme ? 'dark-theme' : 'light-theme';
    // Remove existing theme classes
    document.body.className = document.body.className.replace(/dark-theme|light-theme/g, '').trim();
    // Add new theme class
    document.body.className += ' ' + themeClass;
    // Also apply to root element
    const root = document.documentElement;
    root.className = root.className.replace(/dark-theme|light-theme/g, '').trim();
    root.className += ' ' + themeClass;
    localStorage.setItem('adminTheme', isDarkTheme ? 'dark' : 'light');
    console.log('Theme applied:', themeClass, 'Body classes:', document.body.className);
  }, [isDarkTheme]);

  const toggleTheme = () => {
    console.log('Theme toggle clicked. Current theme:', isDarkTheme ? 'dark' : 'light');
    setIsDarkTheme(!isDarkTheme);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const backendUrl = 'http://localhost:5000';
      const [lostResponse, foundResponse] = await Promise.all([
        fetch(`${backendUrl}/api/lost`).catch(err => {
          console.error('Lost items fetch error:', err);
          return { ok: false, error: err.message };
        }),
        fetch(`${backendUrl}/api/found`).catch(err => {
          console.error('Found items fetch error:', err);
          return { ok: false, error: err.message };
        })
      ]);

      // Check if responses are valid
      if (lostResponse.error || foundResponse.error) {
        const errorMsg = lostResponse.error || foundResponse.error;
        setError(`Failed to connect to backend server. Please make sure the backend is running on port 5000. Error: ${errorMsg}`);
        return;
      }

      if (lostResponse.ok && foundResponse.ok) {
        const lostData = await lostResponse.json();
        const foundData = await foundResponse.json();
        setLostItems(lostData);
        setFoundItems(foundData);
      } else {
        const lostStatus = lostResponse.status || 'Unknown';
        const foundStatus = foundResponse.status || 'Unknown';
        setError(`Failed to fetch data from server. Lost items: ${lostStatus}, Found items: ${foundStatus}. Please check if the backend server is running.`);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError(`Error connecting to server: ${err.message}. Please ensure the backend server is running on http://localhost:5000`);
    } finally {
      setLoading(false);
    }
  };

  const handleMatch = async () => {
    try {
      setMatching(true);
      setMatchResults(null);
      
      const backendUrl = 'http://localhost:5000';
      const response = await fetch(`${backendUrl}/api/matches/match`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        setMatchResults(result);
        // Reset email statuses when new matches are loaded
        setEmailLoading({});
        setEmailStatus({});
      } else {
        setError(`Failed to perform matching: ${response.status} ${response.statusText}`);
      }
    } catch (err) {
      setError('Error during matching: ' + err.message);
    } finally {
      setMatching(false);
    }
  };

  const handleSendEmail = async (match, matchIndex) => {
    const matchKey = `${match.lostItem._id}-${match.foundItem._id}`;
    
    try {
      // Set loading state only for this specific match
      setEmailLoading(prev => ({ ...prev, [matchKey]: true }));
      setEmailStatus(prev => ({ ...prev, [matchKey]: null }));

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
        const result = await response.json();
        setEmailStatus(prev => ({ ...prev, [matchKey]: 'success' }));
        setTimeout(() => {
          setEmailStatus(prev => {
            const newStatus = { ...prev };
            delete newStatus[matchKey];
            return newStatus;
          });
        }, 3000);
      } else {
        setEmailStatus(prev => ({ ...prev, [matchKey]: 'error' }));
      }
    } catch (err) {
      setEmailStatus(prev => ({ ...prev, [matchKey]: 'error' }));
      console.error('Error sending email:', err);
    } finally {
      // Clear loading state only for this specific match
      setEmailLoading(prev => {
        const newLoading = { ...prev };
        delete newLoading[matchKey];
        return newLoading;
      });
    }
  };

  const getItemDisplayName = (item) => {
    if (item.itemName) return item.itemName;
    if (item.otherName) return item.otherName;
    if (item.brand) return item.brand;
    if (item.moneyNoteType) return `${item.moneyNoteType} Notes`;
    if (item.noteType) return `${item.noteType} Notes`;
    return 'Unnamed Item';
  };

  const getItemDetails = (item) => {
    const details = [];
    if (item.description) details.push(`Description: ${item.description}`);
    if (item.brand) details.push(`Brand: ${item.brand}`);
    if (item.material) details.push(`Material: ${item.material}`);
    if (item.moneyNoteType) details.push(`Note Type: ${item.moneyNoteType}`);
    if (item.moneyNotes) details.push(`Note Count: ${item.moneyNotes}`);
    if (item.noteType) details.push(`Note Type: ${item.noteType}`);
    if (item.noteCount) details.push(`Note Count: ${item.noteCount}`);
    if (item.model) details.push(`Model: ${item.model}`);
    return details.join(', ');
  };

  const getMatchBadgeColor = (percentage) => {
    if (percentage >= 80) return 'bg-success';
    if (percentage >= 60) return 'bg-warning';
    if (percentage >= 40) return 'bg-info';
    return 'bg-secondary';
  };

  // Theme styles object
  const themeStyles = isDarkTheme ? {
    background: '#1a1a1a',
    cardBackground: '#2a2a2a',
    text: '#ffffff',
    textMuted: '#b0b0b0',
    border: '#404040',
    tableHeaderBg: '#1a1a1a',
    tableRowBg: '#2a2a2a',
    tableRowHover: '#333333',
    matchHeaderBg: '#333333',
    matchHeaderText: '#ffffff'
  } : {
    background: '#f8f9fa',
    cardBackground: '#ffffff',
    text: '#212529',
    textMuted: '#6c757d',
    border: '#dee2e6',
    tableHeaderBg: '#f8f9fa',
    tableRowBg: '#ffffff',
    tableRowHover: '#f8f9fa',
    matchHeaderBg: '#ffc107',
    matchHeaderText: '#000000'
  };

  const themeClass = isDarkTheme ? 'dark-theme' : 'light-theme';

  if (loading) {
    return (
      <div 
        className={`admin-page ${themeClass}`}
        style={{
          minHeight: '100vh',
          backgroundColor: themeStyles.background,
          color: themeStyles.text,
          paddingTop: '20px',
          paddingBottom: '40px'
        }}
      >
        <div className="container mt-5" style={{ minHeight: '100vh' }}>
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3" style={{ color: themeStyles.text }}>Loading admin data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div 
        className={`admin-page ${themeClass}`}
        style={{
          minHeight: '100vh',
          backgroundColor: themeStyles.background,
          color: themeStyles.text,
          paddingTop: '20px',
          paddingBottom: '40px'
        }}
      >
        <div className="container mt-5" style={{ minHeight: '100vh' }}>
          <div className="alert alert-danger">
            <h4>Error</h4>
            <p>{error}</p>
            <button className="btn btn-primary" onClick={fetchData}>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`admin-page ${themeClass}`}
      style={{
        minHeight: '100vh',
        backgroundColor: themeStyles.background,
        color: themeStyles.text,
        paddingTop: '20px',
        paddingBottom: '40px'
      }}
    >
      <div className="container mt-4">
        <div className="row mb-4">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h2 className="text-center mb-0" style={{ color: themeStyles.text }}>
                Admin Dashboard
              </h2>
              <button 
                className="btn btn-primary"
                onClick={(e) => {
                  e.preventDefault();
                  console.log('Button clicked! Current theme:', isDarkTheme);
                  toggleTheme();
                }}
                title={isDarkTheme ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
                style={{ 
                  zIndex: 1000,
                  padding: '10px 20px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  backgroundColor: isDarkTheme ? '#ffc107' : '#1a1a1a',
                  color: isDarkTheme ? '#000' : '#fff',
                  border: '2px solid',
                  borderColor: isDarkTheme ? '#ffc107' : '#1a1a1a',
                  cursor: 'pointer'
                }}
              >
                {isDarkTheme ? (
                  <>
                    ☀️ Switch to Light Mode
                  </>
                ) : (
                  <>
                    🌙 Switch to Dark Mode
                  </>
                )}
              </button>
            </div>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <span className="badge bg-danger me-2">Lost Items: {lostItems.length}</span>
                <span className="badge bg-success">Found Items: {foundItems.length}</span>
              </div>
              <div>
                <button className="btn btn-outline-primary me-2" onClick={fetchData}>
                  <i className="bi bi-arrow-clockwise"></i> Refresh
                </button>
                <button 
                  className="btn btn-warning" 
                  onClick={handleMatch}
                  disabled={matching || lostItems.length === 0 || foundItems.length === 0}
                >
                  {matching ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Matching...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-search"></i> Match Items
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Match Results */}
        {matchResults && (
          <div className="row mb-4">
            <div className="col-12">
              <div 
                className="card shadow" 
                style={{
                  backgroundColor: themeStyles.cardBackground,
                  borderColor: themeStyles.border,
                  color: themeStyles.text
                }}
              >
                <div 
                  className="card-header" 
                  style={{
                    backgroundColor: themeStyles.matchHeaderBg,
                    color: themeStyles.matchHeaderText,
                    borderColor: themeStyles.border
                  }}
                >
                  <h5 className="mb-0">
                    <i className="bi bi-search"></i> Matching Results ({matchResults.totalMatches} matches found)
                  </h5>
                </div>
                <div 
                  className="card-body" 
                  style={{
                    backgroundColor: themeStyles.cardBackground,
                    color: themeStyles.text
                  }}
                >
                  {matchResults.matches.length === 0 ? (
                    <div className="text-center" style={{ color: themeStyles.textMuted }}>
                      <p>No matches found between lost and found items.</p>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table 
                        className="table table-hover table-bordered" 
                        style={{
                          backgroundColor: themeStyles.cardBackground,
                          color: themeStyles.text,
                          borderColor: themeStyles.border
                        }}
                      >
                        <thead style={{ backgroundColor: themeStyles.tableHeaderBg }}>
                          <tr>
                            <th width="5%" style={{ borderColor: themeStyles.border, color: themeStyles.text }}>#</th>
                            <th width="20%" style={{ borderColor: themeStyles.border, color: themeStyles.text }}>Lost Item</th>
                            <th width="20%" style={{ borderColor: themeStyles.border, color: themeStyles.text }}>Found Item</th>
                            <th width="10%" style={{ borderColor: themeStyles.border, color: themeStyles.text }}>Match %</th>
                            <th width="25%" style={{ borderColor: themeStyles.border, color: themeStyles.text }}>Reasons</th>
                            <th width="20%" style={{ borderColor: themeStyles.border, color: themeStyles.text }}>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {matchResults.matches.map((match, index) => {
                            const matchKey = `${match.lostItem._id}-${match.foundItem._id}`;
                            const isEmailLoading = emailLoading[matchKey];
                            const emailSendStatus = emailStatus[matchKey];

                            return (
                              <tr 
                                key={index}
                                style={{
                                  backgroundColor: themeStyles.tableRowBg,
                                  color: themeStyles.text,
                                  borderColor: themeStyles.border
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = themeStyles.tableRowHover;
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = themeStyles.tableRowBg;
                                }}
                              >
                                <td className="text-center fw-bold" style={{ borderColor: themeStyles.border, color: themeStyles.text }}>
                                  {index + 1}
                                </td>
                                <td style={{ borderColor: themeStyles.border }}>
                                  <strong style={{ color: themeStyles.text }}>{match.lostItem.itemName || 'Unnamed'}</strong><br/>
                                  <small style={{ color: themeStyles.textMuted }}>
                                    Lost at: {match.lostItem.lostPlace}<br/>
                                    Date: {new Date(match.lostItem.lostDateTime).toLocaleDateString()}
                                  </small>
                                </td>
                                <td style={{ borderColor: themeStyles.border }}>
                                  <strong style={{ color: themeStyles.text }}>{match.foundItem.itemName || 'Unnamed'}</strong><br/>
                                  <small style={{ color: themeStyles.textMuted }}>
                                    Found at: {match.foundItem.foundPlace}<br/>
                                    Date: {new Date(match.foundItem.foundDateTime).toLocaleDateString()}
                                  </small>
                                </td>
                                <td style={{ borderColor: themeStyles.border }}>
                                  <span className={`badge ${getMatchBadgeColor(match.matchPercentage)} fs-6`}>
                                    {match.matchPercentage}%
                                  </span>
                                </td>
                                <td style={{ borderColor: themeStyles.border }}>
                                  <ul className="list-unstyled mb-0">
                                    {match.reasons.map((reason, idx) => (
                                      <li key={idx} className="small" style={{ color: themeStyles.textMuted }}>
                                        • {reason}
                                      </li>
                                    ))}
                                  </ul>
                                </td>
                                <td style={{ borderColor: themeStyles.border }}>
                                  <button
                                    className={`btn btn-sm ${
                                      emailSendStatus === 'success' 
                                        ? 'btn-success' 
                                        : emailSendStatus === 'error'
                                        ? 'btn-danger'
                                        : 'btn-primary'
                                    }`}
                                    onClick={() => handleSendEmail(match, index)}
                                    disabled={isEmailLoading}
                                  >
                                    {isEmailLoading ? (
                                      <>
                                        <span className="spinner-border spinner-border-sm me-1"></span>
                                        Sending...
                                      </>
                                    ) : emailSendStatus === 'success' ? (
                                      <>
                                        <i className="bi bi-check-circle me-1"></i> Sent
                                      </>
                                    ) : emailSendStatus === 'error' ? (
                                      <>
                                        <i className="bi bi-x-circle me-1"></i> Failed
                                      </>
                                    ) : (
                                      <>
                                        <i className="bi bi-envelope me-1"></i> Send Mail
                                      </>
                                    )}
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="row">
          {/* Lost Items */}
          <div className="col-md-6 mb-4">
            <div 
              className="card shadow" 
              style={{
                backgroundColor: themeStyles.cardBackground,
                borderColor: themeStyles.border,
                color: themeStyles.text
              }}
            >
              <div className="card-header bg-danger text-white">
                <h5 className="mb-0">
                  <i className="bi bi-exclamation-triangle"></i> Lost Items ({lostItems.length})
                </h5>
              </div>
              <div 
                className="card-body" 
                style={{ 
                  backgroundColor: themeStyles.cardBackground,
                  color: themeStyles.text,
                  maxHeight: '600px', 
                  overflowY: 'auto' 
                }}
              >
                {lostItems.length === 0 ? (
                  <div className="text-center" style={{ color: themeStyles.textMuted }}>
                    <i className="bi bi-inbox display-4"></i>
                    <p>No lost items reported</p>
                  </div>
                ) : (
                  lostItems.map((item, index) => (
                    <div 
                      key={item._id || index} 
                      className="border-bottom pb-3 mb-3"
                      style={{ borderColor: themeStyles.border }}
                    >
                      <div className="d-flex justify-content-between align-items-start">
                        <div className="flex-grow-1">
                          <h6 className="text-danger mb-1">
                            {getItemDisplayName(item)}
                          </h6>
                          <p className="mb-1" style={{ color: themeStyles.textMuted }}>
                            <strong>Lost at:</strong> {item.lostPlace || 'Unknown location'}
                          </p>
                          <p className="mb-1" style={{ color: themeStyles.textMuted }}>
                            <strong>Date:</strong> {item.lostDateTime ? new Date(item.lostDateTime).toLocaleDateString() : 'Unknown'}
                          </p>
                          {getItemDetails(item) && (
                            <p className="small mb-0" style={{ color: themeStyles.textMuted }}>
                              {getItemDetails(item)}
                            </p>
                          )}
                        </div>
                        {item.image && (
                          <img 
                            src={`http://localhost:5000${item.image}`} 
                            alt="Item" 
                            className="ms-2"
                            style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
                          />
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Found Items */}
          <div className="col-md-6 mb-4">
            <div 
              className="card shadow" 
              style={{
                backgroundColor: themeStyles.cardBackground,
                borderColor: themeStyles.border,
                color: themeStyles.text
              }}
            >
              <div className="card-header bg-success text-white">
                <h5 className="mb-0">
                  <i className="bi bi-check-circle"></i> Found Items ({foundItems.length})
                </h5>
              </div>
              <div 
                className="card-body" 
                style={{ 
                  backgroundColor: themeStyles.cardBackground,
                  color: themeStyles.text,
                  maxHeight: '600px', 
                  overflowY: 'auto' 
                }}
              >
                {foundItems.length === 0 ? (
                  <div className="text-center" style={{ color: themeStyles.textMuted }}>
                    <i className="bi bi-inbox display-4"></i>
                    <p>No found items reported</p>
                  </div>
                ) : (
                  foundItems.map((item, index) => (
                    <div 
                      key={item._id || index} 
                      className="border-bottom pb-3 mb-3"
                      style={{ borderColor: themeStyles.border }}
                    >
                      <div className="d-flex justify-content-between align-items-start">
                        <div className="flex-grow-1">
                          <h6 className="text-success mb-1">
                            {getItemDisplayName(item)}
                          </h6>
                          <p className="mb-1" style={{ color: themeStyles.textMuted }}>
                            <strong>Found at:</strong> {item.foundPlace || 'Unknown location'}
                          </p>
                          <p className="mb-1" style={{ color: themeStyles.textMuted }}>
                            <strong>Date:</strong> {item.foundDateTime ? new Date(item.foundDateTime).toLocaleDateString() : 'Unknown'}
                          </p>
                          {getItemDetails(item) && (
                            <p className="small mb-0" style={{ color: themeStyles.textMuted }}>
                              {getItemDetails(item)}
                            </p>
                          )}
                        </div>
                        {item.image && (
                          <img 
                            src={`http://localhost:5000${item.image}`} 
                            alt="Item" 
                            className="ms-2"
                            style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
                          />
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="row mt-4">
          <div className="col-12">
            <div 
              className="card shadow" 
              style={{
                backgroundColor: themeStyles.cardBackground,
                borderColor: themeStyles.border,
                color: themeStyles.text
              }}
            >
              <div className="card-body text-center" style={{ backgroundColor: themeStyles.cardBackground }}>
                <h6 style={{ color: themeStyles.textMuted }}>Summary</h6>
                <div className="row">
                  <div className="col-md-4">
                    <div className="border-end" style={{ borderColor: themeStyles.border }}>
                      <h4 className="text-danger">{lostItems.length}</h4>
                      <small style={{ color: themeStyles.textMuted }}>Lost Items</small>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="border-end" style={{ borderColor: themeStyles.border }}>
                      <h4 className="text-success">{foundItems.length}</h4>
                      <small style={{ color: themeStyles.textMuted }}>Found Items</small>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <h4 className="text-primary">{lostItems.length + foundItems.length}</h4>
                    <small style={{ color: themeStyles.textMuted }}>Total Items</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
