import React, { useEffect, useState } from 'react';

const MatchList = () => {
  const [matches, setMatches] = useState([]);
  const [lostItems, setLostItems] = useState([]);
  const [foundItems, setFoundItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [manualLost, setManualLost] = useState('');
  const [manualFound, setManualFound] = useState('');
  const [matching, setMatching] = useState(false);
  const [manualMsg, setManualMsg] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('lost'); // 'lost' or 'found'

  // Fetch matches, lost, and found items
  useEffect(() => {
    setLoading(true);
    Promise.all([
          fetch('http://localhost:5000/api/matches').then(res => res.json()),
    fetch('http://localhost:5000/api/lost').then(res => res.json()),
    fetch('http://localhost:5000/api/found').then(res => res.json())
    ]).then(([matchesData, lostData, foundData]) => {
      setMatches(matchesData);
      setLostItems(lostData);
      setFoundItems(foundData);
      setLoading(false);
    });
  }, [matching, manualMsg]);

  // Auto-match handler
  const handleAutoMatch = async () => {
    setMatching(true);
          await fetch('http://localhost:5000/api/matches/auto', { method: 'POST' });
    setMatching(false);
  };

  // Manual match handler
  const handleManualMatch = async (e) => {
    e.preventDefault();
    if (!manualLost || !manualFound) {
      setManualMsg('Please select both lost and found items.');
      return;
    }
    setManualMsg('');
    setMatching(true);
    const res = await fetch('http://localhost:5000/api/matches/manual', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lostId: manualLost, foundId: manualFound })
    });
    if (res.ok) {
      setManualMsg('Manual match successful!');
    } else {
      setManualMsg('Manual match failed.');
    }
    setMatching(false);
    setManualLost('');
    setManualFound('');
  };

  // Helper to open modal
  const handleViewDetails = (item, type) => {
    setSelectedItem(item);
    setModalType(type);
    setShowModal(true);
  };

  return (
    <div className="container mt-4">
      <div className="card shadow p-4 mb-4">
        <h2 className="mb-3 text-primary text-center">Admin - Matched Lost & Found Items</h2>
        <div className="mb-3 d-flex gap-2">
          <button className="btn btn-success" onClick={handleAutoMatch} disabled={matching}>
            {matching ? 'Checking...' : 'Check Matching Items'}
          </button>
        </div>
        {loading ? (
          <div>Loading...</div>
        ) : matches.length === 0 ? (
          <div className="alert alert-info">No matches found.</div>
        ) : (
          <div className="table-responsive mb-4">
            <table className="table table-striped align-middle">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Lost Item</th>
                  <th>Found Item</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {matches.map((match, idx) => (
                  <tr key={match._id || idx}>
                    <td>{idx + 1}</td>
                    <td>{match.lostItemName}</td>
                    <td>{match.foundItemName}</td>
                    <td>
                      <span className={`badge ${match.status === 'matched' ? 'bg-success' : 'bg-secondary'}`}>
                        {match.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <h4 className="mt-4 mb-2">Manual Match</h4>
        <form className="row g-2 align-items-end" onSubmit={handleManualMatch}>
          <div className="col-md-5">
            <label className="form-label">Lost Item</label>
            <select className="form-select" value={manualLost} onChange={e => setManualLost(e.target.value)}>
              <option value="">Select Lost Item</option>
              {lostItems.map(item => (
                <option key={item._id} value={item._id}>
                  {item.itemName || item.otherName || item.brand || item.moneyNoteType || 'Unnamed'} ({item.lostPlace})
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-5">
            <label className="form-label">Found Item</label>
            <select className="form-select" value={manualFound} onChange={e => setManualFound(e.target.value)}>
              <option value="">Select Found Item</option>
              {foundItems.map(item => (
                <option key={item._id} value={item._id}>
                  {item.itemName || item.brand || item.noteType || 'Unnamed'} ({item.foundPlace})
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-2">
            <button className="btn btn-primary w-100" type="submit" disabled={matching}>
              Match
            </button>
          </div>
        </form>
        {manualMsg && (
          <div className={`mt-2 alert ${manualMsg.includes('success') ? 'alert-success' : 'alert-danger'}`}>
            {manualMsg}
          </div>
        )}
      </div>

      <div className="row">
        <div className="col-md-6 mb-4">
          <div className="card shadow">
            <div className="card-header bg-primary text-white">Lost Items</div>
            <ul className="list-group list-group-flush">
              {lostItems.map(item => (
                <li key={item._id} className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <strong>{item.itemName || item.otherName || item.brand || item.moneyNoteType || 'Unnamed'}</strong>
                    <br />
                    <small>Place: {item.lostPlace}</small>
                  </div>
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => handleViewDetails(item, 'lost')}
                  >
                    View Details
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="col-md-6 mb-4">
          <div className="card shadow">
            <div className="card-header bg-success text-white">Found Items</div>
            <ul className="list-group list-group-flush">
              {foundItems.map(item => (
                <li key={item._id} className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <strong>
                      {item.itemName || item.brand || item.noteType || 'Unnamed'}
                    </strong>
                    <br />
                    <small>Place: {item.foundPlace}</small>
                  </div>
                  <button
                    className="btn btn-sm btn-outline-success"
                    onClick={() => handleViewDetails(item, 'found')}
                  >
                    View Details
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {showModal && selectedItem && (
        <div className="modal show d-block" tabIndex="-1" role="dialog" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className={`modal-header ${modalType === 'lost' ? 'bg-primary' : 'bg-success'} text-white`}>
                <h5 className="modal-title">{modalType === 'lost' ? 'Lost Item Details' : 'Found Item Details'}</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                {Object.entries(selectedItem).map(([key, value]) => (
                  key !== '_id' && key !== 'image' && value && (
                    <div key={key}>
                      <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong> {value.toString()}
                    </div>
                  )
                ))}
                {selectedItem.image && (
                  <div className="mt-3">
                    <strong>Image:</strong><br />
                    <a href={selectedItem.image} target="_blank" rel="noopener noreferrer">
                      <img
                        src={selectedItem.image}
                        alt="Item"
                        style={{ maxWidth: '100%', maxHeight: 200, cursor: 'pointer', border: '1px solid #ccc', borderRadius: 8 }}
                        title="Click to view full image"
                      />
                    </a>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchList;