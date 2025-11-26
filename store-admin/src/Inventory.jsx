import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Inventory.css';

// ⚠️ Use 'localhost' here because the Web App runs on the SAME computer as the Server
const API_URL = 'https://store-backend-api-athi.onrender.com/items';

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({ name: '', rate: '', unit: 'pcs', category: 'Groceries', image: '' });
  const [previewImage, setPreviewImage] = useState(null);
  const [editingItemId, setEditingItemId] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editData, setEditData] = useState(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await axios.get(API_URL);
      setItems(res.data);
    } catch (err) {
      console.error("Error fetching items:", err);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    await axios.post(API_URL, newItem);
    alert("✅ Item Added Successfully!");
    setNewItem({ name: '', rate: '', unit: 'pcs', category: 'Groceries', image: '' });
    setPreviewImage(null);
    fetchItems();
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target.result;
        compressImage(base64, (compressedBase64) => {
          setNewItem({ ...newItem, image: compressedBase64 });
          setPreviewImage(compressedBase64);
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const compressImage = (base64, callback) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      const maxDimension = 800;
      if (width > height) {
        if (width > maxDimension) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        }
      } else {
        if (height > maxDimension) {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
      callback(compressedBase64);
    };
    img.src = base64;
  };

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditStart = (item) => {
    setEditingItemId(item.id);
    setEditData({ ...item });
    setEditImagePreview(item.image);
  };

  const handleEditChange = (field, value) => {
    setEditData({ ...editData, [field]: value });
  };

  const handleEditImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target.result;
        compressImage(base64, (compressedBase64) => {
          setEditData({ ...editData, image: compressedBase64 });
          setEditImagePreview(compressedBase64);
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveEdit = async () => {
    if (!editData.name || !editData.rate) {
      alert("Please fill in all required fields!");
      return;
    }
    try {
      await axios.put(`${API_URL}/${editingItemId}`, editData);
      alert("✅ Item Updated Successfully!");
      setEditingItemId(null);
      setEditData(null);
      setEditImagePreview(null);
      fetchItems();
    } catch (err) {
      console.error("Error updating item:", err);
      alert("❌ Error updating item!");
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    try {
      await axios.delete(`${API_URL}/${itemId}`);
      alert("✅ Item Deleted Successfully!");
      fetchItems();
    } catch (err) {
      console.error("Error deleting item:", err);
      alert("❌ Error deleting item!");
    }
  };

  const handleCancelEdit = () => {
    setEditingItemId(null);
    setEditData(null);
    setEditImagePreview(null);
  };

  return (
    <div className="inventory-container">
      
      {/* --- LEFT: ADD ITEM FORM (Card Style) --- */}
      <div className="card-panel add-item-section">
        <div className="card-header">
          <h3>Add New Product</h3>
        </div>
        
        <form onSubmit={handleAdd} className="styled-form">
          <div className="form-group">
            <label>Product Name</label>
            <input 
              className="form-input"
              placeholder="e.g. Fresh Apples" 
              value={newItem.name} 
              onChange={e => setNewItem({...newItem, name: e.target.value})} 
              required 
            />
          </div>

          <div className="form-row-split">
            <div className="form-group">
              <label>Price (₹)</label>
              <input 
                className="form-input"
                placeholder="0.00" 
                type="number" 
                step="0.01"
                value={newItem.rate} 
                onChange={e => setNewItem({...newItem, rate: e.target.value})} 
                required 
              />
            </div>
            <div className="form-group">
              <label>Unit</label>
              <select 
                className="form-input"
                value={newItem.unit} 
                onChange={e => setNewItem({...newItem, unit: e.target.value})}
              >
                <option value="pcs">pcs</option>
                <option value="kg">kg</option>
                <option value="pkt">pkt</option>
                <option value="l">liters</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Category</label>
            <select 
              className="form-input"
              value={newItem.category} 
              onChange={e => setNewItem({...newItem, category: e.target.value})} 
            >
              <option value="Groceries">Groceries</option>
              <option value="Vegetables">Vegetables</option>
              <option value="Snacks">Snacks</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label>Product Image</label>
            <div className="upload-box">
              <input 
                type="file" 
                accept="image/*" 
                id="file-upload"
                onChange={handleImageUpload}
                hidden
              />
              <label htmlFor="file-upload" className="upload-label">
                {previewImage ? (
                  <img src={previewImage} alt="Preview" className="preview-thumb" />
                ) : (
                  <div className="upload-placeholder">
                     <span className="icon">☁️</span>
                     <span>Upload Image</span>
                  </div>
                )}
              </label>
            </div>
          </div>

          <button type="submit" className="btn-primary full-width">Create Product</button>
        </form>
      </div>

      {/* --- RIGHT: ITEMS LIST (Card Style) --- */}
      <div className="card-panel list-section">
        <div className="list-header-row">
          <h3>Inventory Items</h3>
          <div className="mini-search">
             <input 
               placeholder="Search items..." 
               value={searchTerm}
               onChange={e => setSearchTerm(e.target.value)}
             />
          </div>
        </div>

        <div className="table-container">
          <table className="design-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Unit</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <React.Fragment key={item.id}>
                  <tr>
                    <td>
                      <div className="product-cell">
                        <div className="product-img">
                          {item.image ? <img src={item.image} alt={item.name} /> : '📦'}
                        </div>
                        <div className="product-info">
                          <span className="p-name">{item.name}</span>
                          <span className="p-id">#{item.id}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${item.category ? item.category.toLowerCase() : 'default'}`}>
                        {item.category || 'General'}
                      </span>
                    </td>
                    <td className="price-text">₹{parseFloat(item.rate).toFixed(2)}</td>
                    <td className="unit-text">{item.unit}</td>
                    <td>
                      {editingItemId === item.id ? (
                        <div className="action-buttons">
                          <button className="action-btn save" onClick={handleSaveEdit}>Save</button>
                          <button className="action-btn cancel" onClick={handleCancelEdit}>Cancel</button>
                        </div>
                      ) : (
                        <div className="action-buttons">
                          <button className="action-btn edit" onClick={() => handleEditStart(item)}>Edit</button>
                          {item.usage_count > 0 ? (
                            <button 
                              className="action-btn delete" 
                              style={{ opacity: 0.5, cursor: 'not-allowed', backgroundColor: '#ccc' }}
                              title="Cannot delete: Item has existing sales records"
                              onClick={(e) => { e.preventDefault(); alert("Cannot delete this item because it has been sold previously. Deleting it would corrupt sales history."); }}
                            >
                              In Use
                            </button>
                          ) : (
                            <button className="action-btn delete" onClick={() => handleDeleteItem(item.id)}>Delete</button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>

                  {editingItemId === item.id && (
                    <tr className="edit-row">
                      <td colSpan="5">
                        <div className="edit-panel">
                          <div className="edit-form-grid">
                            <div className="edit-form-group">
                              <label>Product Name</label>
                              <input
                                type="text"
                                className="form-input"
                                value={editData?.name || ''}
                                onChange={(e) => handleEditChange('name', e.target.value)}
                              />
                            </div>
                            <div className="edit-form-group">
                              <label>Price (₹)</label>
                              <input
                                type="number"
                                step="0.01"
                                className="form-input"
                                value={editData?.rate || ''}
                                onChange={(e) => handleEditChange('rate', e.target.value)}
                              />
                            </div>
                            <div className="edit-form-group">
                              <label>Unit</label>
                              <select
                                className="form-input"
                                value={editData?.unit || 'pcs'}
                                onChange={(e) => handleEditChange('unit', e.target.value)}
                              >
                                <option value="pcs">pcs</option>
                                <option value="kg">kg</option>
                                <option value="pkt">pkt</option>
                                <option value="l">liters</option>
                              </select>
                            </div>
                            <div className="edit-form-group">
                              <label>Category</label>
                              <select
                                className="form-input"
                                value={editData?.category || 'Groceries'}
                                onChange={(e) => handleEditChange('category', e.target.value)}
                              >
                                <option value="Groceries">Groceries</option>
                                <option value="Vegetables">Vegetables</option>
                                <option value="Snacks">Snacks</option>
                                <option value="Other">Other</option>
                              </select>
                            </div>
                          </div>

                          <div className="edit-image-section">
                            <label>Update Image (Optional)</label>
                            <input
                              type="file"
                              accept="image/*"
                              id={`edit-file-${item.id}`}
                              onChange={handleEditImageUpload}
                              hidden
                            />
                            <label htmlFor={`edit-file-${item.id}`} className="edit-upload-label">
                              {editImagePreview ? (
                                <img src={editImagePreview} alt="Preview" className="edit-preview-img" />
                              ) : (
                                <span>📸 Change Image</span>
                              )}
                            </label>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}