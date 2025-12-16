import React, { useState } from 'react';
import './Form.css';

const LostForm = ({ user, token }) => {
  const [submitted, setSubmitted] = useState(false);
  const [submittedItem, setSubmittedItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    category: '',
    lostPlace: '',
    description: '',
    moneyDenominations: [],
    totalAmount: 0,
    brand: '',
    model: '',
    material: '',
    itemName: '',
    bookTitle: '',
    author: '',
    rollNumber: '',
    name: '',
    image: null,
    lostDateTime: ''
  });

  const [denominationInputs, setDenominationInputs] = useState([
    { denomination: '', count: '' }
  ]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image') {
      const file = files[0];
      setFormData({ ...formData, image: file });
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        setImagePreview(null);
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
    setError('');
  };

  const handleCategoryChange = (e) => {
    const category = e.target.value;
    setFormData(prev => ({
      ...prev,
      category,
      brand: '',
      model: '',
      bookTitle: '',
      author: '',
      rollNumber: '',
      name: '',
      moneyDenominations: [],
      totalAmount: 0,
      image: null
    }));
    setImagePreview(null);
    if (category !== 'Money') {
      setDenominationInputs([{ denomination: '', count: '' }]);
    }
  };

  const addDenominationInput = () => {
    setDenominationInputs([...denominationInputs, { denomination: '', count: '' }]);
  };

  const removeDenominationInput = (index) => {
    if (denominationInputs.length > 1) {
      setDenominationInputs(denominationInputs.filter((_, i) => i !== index));
    }
  };

  const handleDenominationChange = (index, field, value) => {
    const newInputs = [...denominationInputs];
    newInputs[index][field] = value;
    setDenominationInputs(newInputs);
    
    if (formData.category === 'Money') {
      const validDenominations = newInputs
        .filter(input => input.denomination && input.count)
        .map(input => ({
          denomination: input.denomination,
          count: parseInt(input.count) || 0
        }));
      
      const totalAmount = validDenominations.reduce((sum, denom) => {
        const amount = parseInt(denom.denomination.replace(/[^\d]/g, '')) * denom.count;
        return sum + amount;
      }, 0);
      
      setFormData(prev => ({ ...prev, totalAmount }));
    }
  };

  const resetForm = () => {
    setFormData({
      category: '',
      lostPlace: '',
      description: '',
      moneyDenominations: [],
      totalAmount: 0,
      brand: '',
      model: '',
      material: '',
      itemName: '',
      bookTitle: '',
      author: '',
      rollNumber: '',
      name: '',
      image: null,
      lostDateTime: ''
    });
    setDenominationInputs([{ denomination: '', count: '' }]);
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Ensure user is authenticated
    if (!token) {
      setError('Your session has expired. Please log in again to report a lost item.');
      setLoading(false);
      return;
    }

    let isValid = true;
    let errorMessage = '';

    switch (formData.category) {
      case 'Money':
        if (!formData.itemName || !formData.lostPlace || denominationInputs.some(input => !input.denomination || !input.count)) {
          isValid = false;
          errorMessage = 'Please fill all required fields for Money category.';
        }
        break;
      case 'Electronics':
        if (!formData.itemName || !formData.lostPlace || !formData.brand) {
          isValid = false;
          errorMessage = 'Please fill Item Name, Brand, and Lost Place for Electronics.';
        }
        break;
      case 'Books':
        if (!formData.bookTitle || !formData.lostPlace || !formData.author) {
          isValid = false;
          errorMessage = 'Please fill Book Title, Author, and Lost Place for Books.';
        }
        break;
      case 'ID Cards':
        if (!formData.rollNumber || !formData.name || !formData.lostPlace) {
          isValid = false;
          errorMessage = 'Please fill Roll Number, Name, and Lost Place for ID Cards.';
        }
        break;
      default:
        if (!formData.itemName || !formData.lostPlace) {
          isValid = false;
          errorMessage = 'Please fill Item Name and Lost Place.';
        }
    }

    if (!isValid) {
      setError(errorMessage);
      setLoading(false);
      return;
    }

    try {
      const data = new FormData();
      
      if (formData.category === 'Money') {
        const validDenominations = denominationInputs
          .filter(input => input.denomination && input.count)
          .map(input => ({
            denomination: input.denomination,
            count: parseInt(input.count)
          }));
        
        if (validDenominations.length > 0) {
          data.append('moneyDenominations', JSON.stringify(validDenominations));
          data.append('totalAmount', formData.totalAmount);
        }
      }
      
      data.append('category', formData.category);
      
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== 'moneyDenominations' && key !== 'image' && key !== 'category' && value !== null && value !== undefined) {
          data.append(key, value);
        }
      });

      if (formData.image && formData.category !== 'Money') {
        data.append('image', formData.image);
      }

      const headers = {
        Authorization: `Bearer ${token}`
      };

      const response = await fetch('http://localhost:5000/api/lost', {
        method: 'POST',
        headers,
        body: data,
      });

      if (!response.ok) throw new Error('Failed to submit. Try again.');

      const result = await response.json();
      setSubmittedItem(result);
      setSubmitted(true);
      resetForm();
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const renderCategoryFields = () => {
    switch (formData.category) {
      case 'Money':
        return (
          <div className="form-section">
            <div className="form-group">
              <label className="form-label">
                <i className="bi bi-wallet2"></i>
                Item Name (e.g., Wallet, Purse) <span className="required">*</span>
              </label>
              <input
                type="text"
                name="itemName"
                className="form-control"
                value={formData.itemName}
                onChange={handleChange}
                placeholder="e.g., Brown leather wallet"
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">
                <i className="bi bi-cash-coin"></i>
                Money Denominations <span className="required">*</span>
              </label>
              <div className="denomination-list">
                {denominationInputs.map((input, index) => (
                  <div key={index} className="denomination-item">
                    <select
                      className="form-select"
                      value={input.denomination}
                      onChange={(e) => handleDenominationChange(index, 'denomination', e.target.value)}
                      required
                    >
                      <option value="">Select Denomination</option>
                      <option value="₹2000">₹2000</option>
                      <option value="₹500">₹500</option>
                      <option value="₹200">₹200</option>
                      <option value="₹100">₹100</option>
                      <option value="₹50">₹50</option>
                      <option value="₹20">₹20</option>
                      <option value="₹10">₹10</option>
                      <option value="₹5">₹5</option>
                      <option value="₹2">₹2</option>
                      <option value="₹1">₹1</option>
                    </select>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Count"
                      value={input.count}
                      onChange={(e) => handleDenominationChange(index, 'count', e.target.value)}
                      min="1"
                      required
                    />
                    {denominationInputs.length > 1 && (
                      <button
                        type="button"
                        className="btn-remove"
                        onClick={() => removeDenominationInput(index)}
                        aria-label="Remove denomination"
                      >
                        <i className="bi bi-x-lg"></i>
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={addDenominationInput}
              >
                <i className="bi bi-plus-circle"></i>
                Add Denomination
              </button>
              {formData.totalAmount > 0 && (
                <div className="total-amount">
                  <i className="bi bi-calculator"></i>
                  <strong>Total Amount: ₹{formData.totalAmount.toLocaleString()}</strong>
                </div>
              )}
            </div>
          </div>
        );

      case 'Electronics':
        return (
          <div className="form-section">
            <div className="form-group">
              <label className="form-label">
                <i className="bi bi-device-ssd"></i>
                Item Name <span className="required">*</span>
              </label>
              <input
                type="text"
                name="itemName"
                className="form-control"
                value={formData.itemName}
                onChange={handleChange}
                placeholder="e.g., iPhone 13, Laptop"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">
                <i className="bi bi-tag"></i>
                Brand <span className="required">*</span>
              </label>
              <input
                type="text"
                name="brand"
                className="form-control"
                value={formData.brand}
                onChange={handleChange}
                placeholder="e.g., Apple, Samsung, Dell"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">
                <i className="bi bi-upc-scan"></i>
                Model (Optional)
              </label>
              <input
                type="text"
                name="model"
                className="form-control"
                value={formData.model}
                onChange={handleChange}
                placeholder="e.g., A2482, Galaxy S23"
              />
            </div>
          </div>
        );

      case 'Books':
        return (
          <div className="form-section">
            <div className="form-group">
              <label className="form-label">
                <i className="bi bi-book"></i>
                Book Title <span className="required">*</span>
              </label>
              <input
                type="text"
                name="bookTitle"
                className="form-control"
                value={formData.bookTitle}
                onChange={handleChange}
                placeholder="e.g., Data Structures and Algorithms"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">
                <i className="bi bi-person"></i>
                Author <span className="required">*</span>
              </label>
              <input
                type="text"
                name="author"
                className="form-control"
                value={formData.author}
                onChange={handleChange}
                placeholder="e.g., Thomas H. Cormen"
                required
              />
            </div>
          </div>
        );

      case 'ID Cards':
        return (
          <div className="form-section">
            <div className="form-group">
              <label className="form-label">
                <i className="bi bi-123"></i>
                Roll Number <span className="required">*</span>
              </label>
              <input
                type="text"
                name="rollNumber"
                className="form-control"
                value={formData.rollNumber}
                onChange={handleChange}
                placeholder="e.g., CS2024001"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">
                <i className="bi bi-person-badge"></i>
                Name <span className="required">*</span>
              </label>
              <input
                type="text"
                name="name"
                className="form-control"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., John Doe"
                required
              />
            </div>
          </div>
        );

      default:
        return (
          <div className="form-section">
            <div className="form-group">
              <label className="form-label">
                <i className="bi bi-box"></i>
                Item Name <span className="required">*</span>
              </label>
              <input
                type="text"
                name="itemName"
                className="form-control"
                value={formData.itemName}
                onChange={handleChange}
                placeholder="e.g., Black backpack, Water bottle"
                required
              />
            </div>
          </div>
        );
    }
  };

  if (submitted) {
    return (
      <div className="form-card success-state animate-fade-in">
        <div className="success-icon">
          <i className="bi bi-check-circle-fill"></i>
        </div>
        <h3>Form Submitted Successfully!</h3>
        {submittedItem && submittedItem.customId && (
          <div className="submitted-id">
            <p>Your Lost Item ID:</p>
            <div className="id-badge">{submittedItem.customId}</div>
          </div>
        )}
        <p className="success-message">
          Don't worry! Our smart matching system will notify you when your item is found.
        </p>
        <button
          className="btn btn-primary"
          onClick={() => {
            setSubmitted(false);
            setSubmittedItem(null);
            resetForm();
          }}
        >
          Report Another Item
        </button>
      </div>
    );
  }

  return (
    <div className="form-card animate-fade-in">
      {error && (
        <div className="alert alert-danger animate-fade-in">
          <i className="bi bi-exclamation-circle"></i>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="modern-form">
        <div className="form-group">
          <label className="form-label">
            <i className="bi bi-folder"></i>
            Category <span className="required">*</span>
          </label>
          <select
            name="category"
            className="form-select"
            value={formData.category}
            onChange={handleCategoryChange}
            required
          >
            <option value="">Select Category</option>
            <option value="Money">💰 Money</option>
            <option value="Electronics">📱 Electronics</option>
            <option value="Books">📚 Books</option>
            <option value="ID Cards">🪪 ID Cards</option>
            <option value="Accessories">👓 Accessories</option>
            <option value="Others">📦 Others</option>
          </select>
        </div>

        {formData.category && renderCategoryFields()}

        <div className="form-group">
          <label className="form-label">
            <i className="bi bi-geo-alt"></i>
            Lost Place <span className="required">*</span>
          </label>
          <input
            type="text"
            name="lostPlace"
            className="form-control"
            value={formData.lostPlace}
            onChange={handleChange}
            placeholder="e.g., Library Building, Cafeteria"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            <i className="bi bi-calendar-event"></i>
            Date & Time Lost
          </label>
          <input
            type="datetime-local"
            name="lostDateTime"
            className="form-control"
            value={formData.lostDateTime}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            <i className="bi bi-card-text"></i>
            Description
          </label>
          <textarea
            name="description"
            className="form-control"
            rows="4"
            value={formData.description}
            onChange={handleChange}
            placeholder="Additional details about the item (color, size, condition, etc.)..."
          />
        </div>

        {formData.category && formData.category !== 'Money' && (
          <div className="form-group">
            <label className="form-label">
              <i className="bi bi-image"></i>
              Upload Image (Optional)
            </label>
            <div className="image-upload-wrapper">
              <input
                type="file"
                name="image"
                className="form-control file-input"
                accept="image/*"
                onChange={handleChange}
                id="image-upload-lost"
              />
              <label htmlFor="image-upload-lost" className="file-label">
                <i className="bi bi-cloud-upload"></i>
                <span>Choose Image</span>
              </label>
              {imagePreview && (
                <div className="image-preview">
                  <img src={imagePreview} alt="Preview" />
                  <button
                    type="button"
                    className="remove-image"
                    onClick={() => {
                      setFormData({ ...formData, image: null });
                      setImagePreview(null);
                    }}
                  >
                    <i className="bi bi-x-lg"></i>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="form-actions">
          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner spinner-sm"></span>
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <i className="bi bi-exclamation-triangle"></i>
                <span>Submit Lost Item Report</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LostForm;
