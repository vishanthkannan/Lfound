import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const LostForm = ({ user, token }) => {
  const [submitted, setSubmitted] = useState(false);
  const [submittedItem, setSubmittedItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
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
      setFormData({ ...formData, image: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleCategoryChange = (e) => {
    const category = e.target.value;
    setFormData({ ...formData, category });
    // Reset category-specific fields when category changes
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
      totalAmount: 0
    }));
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
    
    // Calculate total amount in real-time
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Category-specific validation
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
      
      // Process money denominations if category is Money
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
      
      // Always include category as it's required
      data.append('category', formData.category);
      
      // Add other form data
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== 'moneyDenominations' && key !== 'image' && key !== 'category' && value !== null && value !== undefined) {
          data.append(key, value);
        }
      });

      // Add image if not Money category
      if (formData.image && formData.category !== 'Money') {
        data.append('image', formData.image);
      }

      const response = await fetch('http://localhost:5000/api/lost', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
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

  // Render category-specific fields
  const renderCategoryFields = () => {
    switch (formData.category) {
      case 'Money':
        return (
          <>
            <div className="mb-3">
              <label className="form-label">Item Name (e.g., Wallet, Purse) <span className="text-danger">*</span></label>
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
            
            <div className="mb-3">
              <label className="form-label">Money Denominations <span className="text-danger">*</span></label>
              {denominationInputs.map((input, index) => (
                <div key={index} className="row mb-2">
                  <div className="col-6">
                    <select
                      className="form-select"
                      value={input.denomination}
                      onChange={(e) => handleDenominationChange(index, 'denomination', e.target.value)}
                      required
                    >
                      <option value="">Select</option>
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
                  </div>
                  <div className="col-4">
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Count"
                      value={input.count}
                      onChange={(e) => handleDenominationChange(index, 'count', e.target.value)}
                      min="1"
                      required
                    />
                  </div>
                  <div className="col-2">
                    {denominationInputs.length > 1 && (
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => removeDenominationInput(index)}
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <button
                type="button"
                className="btn btn-outline-primary btn-sm"
                onClick={addDenominationInput}
              >
                + Add Denomination
              </button>
              {formData.totalAmount > 0 && (
                <div className="mt-2">
                  <strong>Total Amount: ₹{formData.totalAmount}</strong>
                </div>
              )}
            </div>
          </>
        );

      case 'Electronics':
        return (
          <>
            <div className="mb-3">
              <label className="form-label">Item Name <span className="text-danger">*</span></label>
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
            <div className="mb-3">
              <label className="form-label">Brand <span className="text-danger">*</span></label>
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
            <div className="mb-3">
              <label className="form-label">Model (Optional)</label>
              <input
                type="text"
                name="model"
                className="form-control"
                value={formData.model}
                onChange={handleChange}
                placeholder="e.g., A2482, Galaxy S23"
              />
            </div>
          </>
        );

      case 'Books':
        return (
          <>
            <div className="mb-3">
              <label className="form-label">Book Title <span className="text-danger">*</span></label>
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
            <div className="mb-3">
              <label className="form-label">Author <span className="text-danger">*</span></label>
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
          </>
        );

      case 'ID Cards':
        return (
          <>
            <div className="mb-3">
              <label className="form-label">Roll Number <span className="text-danger">*</span></label>
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
            <div className="mb-3">
              <label className="form-label">Name <span className="text-danger">*</span></label>
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
          </>
        );

      default:
        return (
          <div className="mb-3">
            <label className="form-label">Item Name <span className="text-danger">*</span></label>
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
        );
    }
  };

  return (
    <div className="container mt-4 d-flex justify-content-center">
      <div className="card shadow p-4" style={{ maxWidth: 600, width: '100%' }}>
        <h3 className="mb-3 text-primary text-center">Report Lost Item</h3>
        {submitted && (
          <div className="alert alert-success">
            <h5>Form submitted successfully!</h5>
            {submittedItem && submittedItem.customId && (
              <p className="mb-0">
                <strong>Your Lost Item ID:</strong> 
                <span className="badge bg-primary ms-2 fs-6">{submittedItem.customId}</span>
              </p>
            )}
            <p className="mb-0 mt-2">
              <small>Please keep this ID for future reference.</small>
            </p>
          </div>
        )}
        {error && (
          <div className="alert alert-danger">{error}</div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Category <span className="text-danger">*</span></label>
            <select name="category" className="form-select" value={formData.category} onChange={handleCategoryChange} required>
              <option value="">Select Category</option>
              <option value="Money">Money</option>
              <option value="Electronics">Electronics</option>
              <option value="Books">Books</option>
              <option value="ID Cards">ID Cards</option>
              <option value="Accessories">Accessories</option>
              <option value="Others">Others</option>
            </select>
          </div>

          {formData.category && renderCategoryFields()}

          <div className="mb-3">
            <label className="form-label">Lost Place <span className="text-danger">*</span></label>
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

          <div className="mb-3">
            <label className="form-label">Date & Time Lost</label>
            <input
              type="datetime-local"
              name="lostDateTime"
              className="form-control"
              value={formData.lostDateTime}
              onChange={handleChange}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Description</label>
            <textarea
              name="description"
              className="form-control"
              rows="3"
              value={formData.description}
              onChange={handleChange}
              placeholder="Additional details about the item..."
            />
          </div>

          {formData.category && formData.category !== 'Money' && (
            <div className="mb-3">
              <label className="form-label">Upload Image (Optional)</label>
              <input
                type="file"
                name="image"
                className="form-control"
                accept="image/*"
                onChange={handleChange}
              />
            </div>
          )}

          <div className="d-grid">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit Lost Item Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LostForm;
