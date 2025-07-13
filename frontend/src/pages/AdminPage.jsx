import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const AdminPage = () => {
  const [lostItems, setLostItems] = useState([]);
  const [foundItems, setFoundItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [matching, setMatching] = useState(false);
  const [matchResults, setMatchResults] = useState(null);

  // Fetch data from backend
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [lostResponse, foundResponse] = await Promise.all([
            fetch('http://localhost:5000/api/lost'),
    fetch('http://localhost:5000/api/found')
      ]);

      if (lostResponse.ok && foundResponse.ok) {
        const lostData = await lostResponse.json();
        const foundData = await foundResponse.json();
        setLostItems(lostData);
        setFoundItems(foundData);
      } else {
        setError('Failed to fetch data from server');
      }
    } catch (err) {
      setError('Error connecting to server: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMatch = async () => {
    try {
      setMatching(true);
      setMatchResults(null);
      
      // First test the simple matches endpoint
      const simpleTestResponse = await fetch('http://localhost:5000/api/matches/simple-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ test: 'data' })
      });

      if (simpleTestResponse.ok) {
        console.log('Simple matches endpoint works, trying full match endpoint...');
        
        const response = await fetch('http://localhost:5000/api/matches/match', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const result = await response.json();
          setMatchResults(result);
        } else {
          setError(`Failed to perform matching: ${response.status} ${response.statusText}`);
        }
      } else {
        setError('Server connection failed');
      }
    } catch (err) {
      setError('Error during matching: ' + err.message);
    } finally {
      setMatching(false);
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

  const getClassificationBadgeColor = (classification) => {
    switch (classification) {
      case 'Strong Match':
        return 'bg-success';
      case 'Possible Match':
        return 'bg-warning';
      case 'Weak or No Match':
        return 'bg-danger';
      default:
        return 'bg-info';
    }
  };

  const getProgressBarVariant = (percentage) => {
    if (percentage >= 80) return 'success';
    if (percentage >= 60) return 'warning';
    return 'danger';
  };

  const getClassificationIcon = (classification) => {
    switch (classification) {
      case 'Strong Match':
        return '🟢';
      case 'Possible Match':
        return '🟡';
      case 'Weak or No Match':
        return '🔴';
      default:
        return 'ℹ️';
    }
  };

  const calculateAverageMatch = (matches) => {
    if (matches.length === 0) return 0;
    const total = matches.reduce((sum, m) => sum + m.matchPercentage, 0);
    return Math.round(total / matches.length);
  };

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading admin data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">
          <h4>Error</h4>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={fetchData}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row mb-4">
        <div className="col-12">
          <h2 className="text-center text-primary mb-3">Admin Dashboard</h2>
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
            {/* Match Statistics */}
            <div className="row mb-3">
              <div className="col-md-3">
                <div className="card bg-success text-white">
                  <div className="card-body text-center">
                    <h4>{matchResults.matches.filter(m => m.matchPercentage >= 80).length}</h4>
                    <small>Strong Matches (≥80%)</small>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card bg-warning text-dark">
                  <div className="card-body text-center">
                    <h4>{matchResults.matches.filter(m => m.matchPercentage >= 60 && m.matchPercentage < 80).length}</h4>
                    <small>Possible Matches (60-79%)</small>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card bg-danger text-white">
                  <div className="card-body text-center">
                    <h4>{matchResults.matches.filter(m => m.matchPercentage < 60).length}</h4>
                    <small>Weak Matches (&lt;60%)</small>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card bg-info text-white">
                  <div className="card-body text-center">
                    <h4>{calculateAverageMatch(matchResults.matches)}%</h4>
                    <small>Average Match %</small>
                  </div>
                </div>
              </div>
            </div>

            <div className="card shadow">
              <div className="card-header bg-warning text-dark">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">
                    <i className="bi bi-search"></i> Matching Results ({matchResults.totalMatches} matches found)
                  </h5>
                  <div className="btn-group" role="group">
                    <button type="button" className="btn btn-outline-dark btn-sm">
                      <i className="bi bi-funnel"></i> Filter
                    </button>
                    <button type="button" className="btn btn-outline-dark btn-sm">
                      <i className="bi bi-download"></i> Export
                    </button>
                  </div>
                </div>
              </div>
              <div className="card-body">
                {matchResults.matches.length === 0 ? (
                  <div className="text-center text-muted">
                    <p>No matches found between lost and found items.</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead className="table-dark">
                        <tr>
                          <th width="5%">#</th>
                          <th width="25%">Lost Item</th>
                          <th width="25%">Found Item</th>
                          <th width="15%">Match %</th>
                          <th width="15%">Classification</th>
                          <th width="15%">Reasons</th>
                        </tr>
                      </thead>
                      <tbody>
                        {matchResults.matches.map((match, index) => (
                          <tr key={index} className={match.matchPercentage >= 80 ? 'table-success' : match.matchPercentage >= 60 ? 'table-warning' : 'table-danger'}>
                            <td className="text-center fw-bold">{index + 1}</td>
                            <td>
                              <div className="d-flex align-items-start">
                                <div className="flex-grow-1">
                                  <div className="mb-1">
                                    <span className="badge bg-secondary me-1">{match.lostItem.customId || 'N/A'}</span>
                                    <strong className="text-primary">{match.lostItem.itemName || 'Unnamed'}</strong>
                                  </div>
                                  <div className="small text-muted mt-1">
                                    <i className="bi bi-geo-alt"></i> {match.lostItem.lostPlace}<br/>
                                    <i className="bi bi-calendar"></i> {new Date(match.lostItem.lostDateTime).toLocaleDateString()}
                                  </div>
                                  {match.lostItem.moneyDenominations && match.lostItem.moneyDenominations.length > 0 && (
                                    <div className="small text-info">
                                      <i className="bi bi-cash"></i> 
                                      {match.lostItem.moneyDenominations.map((denom, idx) => (
                                        <span key={idx}>
                                          {denom.denomination}×{denom.count}
                                          {idx < match.lostItem.moneyDenominations.length - 1 ? ', ' : ''}
                                        </span>
                                      ))}
                                      {match.lostItem.totalAmount && (
                                        <span className="ms-2 fw-bold">(₹{match.lostItem.totalAmount})</span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td>
                              <div className="d-flex align-items-start">
                                <div className="flex-grow-1">
                                  <div className="mb-1">
                                    <span className="badge bg-secondary me-1">{match.foundItem.customId || 'N/A'}</span>
                                    <strong className="text-success">{match.foundItem.itemName || 'Unnamed'}</strong>
                                  </div>
                                  <div className="small text-muted mt-1">
                                    <i className="bi bi-geo-alt"></i> {match.foundItem.foundPlace}<br/>
                                    <i className="bi bi-calendar"></i> {new Date(match.foundItem.foundDateTime).toLocaleDateString()}
                                  </div>
                                  {match.foundItem.moneyDenominations && match.foundItem.moneyDenominations.length > 0 && (
                                    <div className="small text-info">
                                      <i className="bi bi-cash"></i> 
                                      {match.foundItem.moneyDenominations.map((denom, idx) => (
                                        <span key={idx}>
                                          {denom.denomination}×{denom.count}
                                          {idx < match.foundItem.moneyDenominations.length - 1 ? ', ' : ''}
                                        </span>
                                      ))}
                                      {match.foundItem.totalAmount && (
                                        <span className="ms-2 fw-bold">(₹{match.foundItem.totalAmount})</span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td>
                              <div className="text-center">
                                <div className="mb-2">
                                  <strong className={`text-${getProgressBarVariant(match.matchPercentage)}`}>
                                    {match.matchPercentage}%
                                  </strong>
                                </div>
                                <div className="progress" style={{ height: '8px' }}>
                                  <div 
                                    className={`progress-bar bg-${getProgressBarVariant(match.matchPercentage)}`}
                                    role="progressbar"
                                    style={{ width: `${match.matchPercentage}%` }}
                                    aria-valuenow={match.matchPercentage}
                                    aria-valuemin="0"
                                    aria-valuemax="100"
                                  ></div>
                                </div>
                              </div>
                            </td>
                            <td className="text-center">
                              <span className={`badge ${getClassificationBadgeColor(match.classification)} fs-6 px-3 py-2`}>
                                {getClassificationIcon(match.classification)} {match.classification}
                              </span>
                            </td>
                            <td>
                              <div className="dropdown">
                                <button 
                                  className="btn btn-outline-secondary btn-sm dropdown-toggle" 
                                  type="button" 
                                  data-bs-toggle="dropdown" 
                                  aria-expanded="false"
                                >
                                  <i className="bi bi-list-ul"></i> View Reasons
                                </button>
                                <ul className="dropdown-menu dropdown-menu-end" style={{ maxWidth: '300px' }}>
                                  {match.reasons.map((reason, idx) => (
                                    <li key={idx}>
                                      <span className="dropdown-item-text small">
                                        <i className="bi bi-check-circle text-success me-2"></i>
                                        {reason}
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              
              {/* Matching Criteria Legend */}
              <div className="card-footer bg-light">
                <div className="row">
                  <div className="col-md-6">
                    <h6 className="text-muted mb-2">
                      <i className="bi bi-info-circle"></i> Matching Criteria (Total: 100%)
                    </h6>
                    <div className="row">
                      <div className="col-6">
                        <small className="text-muted">
                          • Item Name: <strong>10%</strong><br/>
                          • Denominations: <strong>20%</strong><br/>
                          • Total Amount: <strong>25%</strong>
                        </small>
                      </div>
                      <div className="col-6">
                        <small className="text-muted">
                          • Location: <strong>20%</strong><br/>
                          • Date: <strong>15%</strong><br/>
                          • Description: <strong>10%</strong>
                        </small>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <h6 className="text-muted mb-2">
                      <i className="bi bi-flag"></i> Classification
                    </h6>
                    <div className="d-flex gap-2">
                     
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="row">
        {/* Lost Items */}
        <div className="col-md-6 mb-4">
          <div className="card shadow">
            <div className="card-header bg-danger text-white">
              <h5 className="mb-0">
                <i className="bi bi-exclamation-triangle"></i> Lost Items ({lostItems.length})
              </h5>
            </div>
            <div className="card-body" style={{ maxHeight: '600px', overflowY: 'auto' }}>
              {lostItems.length === 0 ? (
                <div className="text-center text-muted">
                  <i className="bi bi-inbox display-4"></i>
                  <p>No lost items reported</p>
                </div>
              ) : (
                lostItems.map((item, index) => (
                  <div key={item._id || index} className="border-bottom pb-3 mb-3">
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="flex-grow-1">
                        <h6 className="text-danger mb-1">
                          <span className="badge bg-secondary me-2">{item.customId || 'N/A'}</span>
                          {getItemDisplayName(item)}
                        </h6>
                        <p className="text-muted mb-1">
                          <strong>Lost at:</strong> {item.lostPlace || 'Unknown location'}
                        </p>
                        <p className="text-muted mb-1">
                          <strong>Date:</strong> {item.lostDateTime ? new Date(item.lostDateTime).toLocaleDateString() : 'Unknown'}
                        </p>
                        {getItemDetails(item) && (
                          <p className="text-muted small mb-0">
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
          <div className="card shadow">
            <div className="card-header bg-success text-white">
              <h5 className="mb-0">
                <i className="bi bi-check-circle"></i> Found Items ({foundItems.length})
              </h5>
            </div>
            <div className="card-body" style={{ maxHeight: '600px', overflowY: 'auto' }}>
              {foundItems.length === 0 ? (
                <div className="text-center text-muted">
                  <i className="bi bi-inbox display-4"></i>
                  <p>No found items reported</p>
                </div>
              ) : (
                foundItems.map((item, index) => (
                  <div key={item._id || index} className="border-bottom pb-3 mb-3">
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="flex-grow-1">
                        <h6 className="text-success mb-1">
                          <span className="badge bg-secondary me-2">{item.customId || 'N/A'}</span>
                          {getItemDisplayName(item)}
                        </h6>
                        <p className="text-muted mb-1">
                          <strong>Found at:</strong> {item.foundPlace || 'Unknown location'}
                        </p>
                        <p className="text-muted mb-1">
                          <strong>Date:</strong> {item.foundDateTime ? new Date(item.foundDateTime).toLocaleDateString() : 'Unknown'}
                        </p>
                        {getItemDetails(item) && (
                          <p className="text-muted small mb-0">
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
          <div className="card bg-light">
            <div className="card-body text-center">
              <h6 className="text-muted">Summary</h6>
              <div className="row">
                <div className="col-md-4">
                  <div className="border-end">
                    <h4 className="text-danger">{lostItems.length}</h4>
                    <small className="text-muted">Lost Items</small>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="border-end">
                    <h4 className="text-success">{foundItems.length}</h4>
                    <small className="text-muted">Found Items</small>
                  </div>
                </div>
                <div className="col-md-4">
                  <h4 className="text-primary">{lostItems.length + foundItems.length}</h4>
                  <small className="text-muted">Total Items</small>
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
