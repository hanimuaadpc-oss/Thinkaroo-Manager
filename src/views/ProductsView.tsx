import React, { useState } from 'react';
import {
  Plus,
  Search,
  MoreVertical,
  Edit2,
  Boxes,
  Trash2,
  History,
  Image as ImageIcon,
  Tag,
  AlertCircle,
  X,
  Check,
  ChevronDown
} from 'lucide-react';
import { useDatabase } from '../context/DatabaseContext';
import { Product, StockType } from '../types';
import { formatCurrency } from '../utils/formatters';

export const ProductsView: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct, settings } = useDatabase();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  
  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [historyProduct, setHistoryProduct] = useState<Product | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Form State for Add / Edit
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    category: settings.categories[0] || 'Notebooks & Planners',
    description: '',
    unit: 'pcs',
    purchaseRate: 50,
    sellingRate: 100,
    discountPercent: 0,
    taxPercent: 0,
    ownStock: 0,
    commissionStock: 0,
    minStockAlert: 10,
    mainImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
    imagesList: ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80'],
    newImageUrl: ''
  });

  // Open Edit Modal
  const handleOpenEdit = (p: Product) => {
    setActiveMenuId(null);
    setEditingProduct(p);
    setFormData({
      sku: p.sku,
      name: p.name,
      category: p.category,
      description: p.description || '',
      unit: p.unit || 'pcs',
      purchaseRate: p.purchaseRate,
      sellingRate: p.sellingRate,
      discountPercent: p.discountPercent || 0,
      taxPercent: p.taxPercent || 0,
      ownStock: p.ownStock,
      commissionStock: p.commissionStock,
      minStockAlert: p.minStockAlert,
      mainImage: p.mainImage,
      imagesList: p.images.length > 0 ? p.images.map(img => img.url) : [p.mainImage],
      newImageUrl: ''
    });
  };

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      sku: `TK-${Math.floor(1000 + Math.random() * 9000)}`,
      name: '',
      category: settings.categories[0] || 'Notebooks & Planners',
      description: '',
      unit: 'pcs',
      purchaseRate: 40,
      sellingRate: 80,
      discountPercent: 0,
      taxPercent: 0,
      ownStock: 10,
      commissionStock: 0,
      minStockAlert: 5,
      mainImage: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=600&q=80',
      imagesList: ['https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=600&q=80'],
      newImageUrl: ''
    });
    setIsAddModalOpen(true);
  };

  // Add Image URL to form
  const handleAddImage = () => {
    if (formData.newImageUrl.trim()) {
      const updated = [...formData.imagesList, formData.newImageUrl.trim()];
      setFormData({
        ...formData,
        imagesList: updated,
        mainImage: formData.mainImage || formData.newImageUrl.trim(),
        newImageUrl: ''
      });
    }
  };

  const handleRemoveImage = (index: number) => {
    const updated = formData.imagesList.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      imagesList: updated,
      mainImage: updated[0] || ''
    });
  };

  // Save Product (Add or Edit existing)
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const formattedImages = formData.imagesList.map((url, idx) => ({
      id: `img-${Date.now()}-${idx}`,
      url,
      isMain: url === formData.mainImage
    }));

    if (editingProduct) {
      // Update existing
      updateProduct(editingProduct.id, {
        sku: formData.sku,
        name: formData.name,
        category: formData.category,
        description: formData.description,
        unit: formData.unit,
        purchaseRate: Number(formData.purchaseRate),
        sellingRate: Number(formData.sellingRate),
        discountPercent: Number(formData.discountPercent),
        taxPercent: Number(formData.taxPercent),
        ownStock: Number(formData.ownStock),
        commissionStock: Number(formData.commissionStock),
        minStockAlert: Number(formData.minStockAlert),
        mainImage: formData.mainImage || formData.imagesList[0] || '',
        images: formattedImages,
      }, 'Details updated via Edit Product');
      setEditingProduct(null);
    } else {
      // Add new
      addProduct({
        sku: formData.sku,
        name: formData.name,
        category: formData.category,
        description: formData.description,
        unit: formData.unit,
        purchaseRate: Number(formData.purchaseRate),
        sellingRate: Number(formData.sellingRate),
        discountPercent: Number(formData.discountPercent),
        taxPercent: Number(formData.taxPercent),
        ownStock: Number(formData.ownStock),
        commissionStock: Number(formData.commissionStock),
        minStockAlert: Number(formData.minStockAlert),
        mainImage: formData.mainImage || formData.imagesList[0] || '',
        images: formattedImages,
        status: (Number(formData.ownStock) + Number(formData.commissionStock)) <= 0 ? 'OUT_OF_STOCK' : 'ACTIVE',
      });
      setIsAddModalOpen(false);
    }
  };

  // Filtered products
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="page-wrapper">
      {/* Top action bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '20px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-main)' }}>
              Products
            </h2>
            <span className="badge badge-neutral" style={{ fontSize: '12px' }}>
              {products.length} Items
            </span>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Catalogue of student stationery & commission craft products
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Search box */}
          <div style={{ position: 'relative', width: '240px' }}>
            <input
              type="text"
              placeholder="Search products or SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '32px', fontSize: '13px' }}
            />
            <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
          </div>

          <button onClick={handleOpenAdd} className="btn-primary">
            <Plus size={16} strokeWidth={2.5} />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Category Pills Filter */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        overflowX: 'auto',
        paddingBottom: '12px',
        marginBottom: '16px'
      }}>
        <button
          onClick={() => setSelectedCategory('ALL')}
          style={{
            padding: '6px 14px',
            borderRadius: 'var(--radius-full)',
            fontSize: '12.5px',
            fontWeight: selectedCategory === 'ALL' ? 600 : 500,
            background: selectedCategory === 'ALL' ? 'var(--primary-orange)' : '#FFFFFF',
            color: selectedCategory === 'ALL' ? '#FFFFFF' : 'var(--text-secondary)',
            border: selectedCategory === 'ALL' ? '1px solid var(--primary-orange)' : '1px solid var(--border-subtle)',
            whiteSpace: 'nowrap'
          }}
        >
          All Categories
        </button>
        {settings.categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              fontSize: '12.5px',
              fontWeight: selectedCategory === cat ? 600 : 500,
              background: selectedCategory === cat ? 'var(--primary-orange)' : '#FFFFFF',
              color: selectedCategory === cat ? '#FFFFFF' : 'var(--text-secondary)',
              border: selectedCategory === cat ? '1px solid var(--primary-orange)' : '1px solid var(--border-subtle)',
              whiteSpace: 'nowrap'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Products Grid - Base44 Style Premium Cards */}
      {filteredProducts.length === 0 ? (
        <div className="tk-card" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <Tag size={32} color="#94A3B8" style={{ margin: '0 auto 10px' }} />
          <h3 style={{ fontSize: '16px', color: 'var(--text-secondary)' }}>No products found</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-light)', marginTop: '4px' }}>
            Try changing the category filter or search query.
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '16px'
        }}>
          {filteredProducts.map(product => {
            const totalStock = product.ownStock + product.commissionStock;
            const isOutOfStock = totalStock <= 0;
            const isLowStock = !isOutOfStock && totalStock <= product.minStockAlert;

            return (
              <div
                key={product.id}
                className="tk-card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  position: 'relative'
                }}
              >
                {/* Product Image & Badges */}
                <div style={{
                  position: 'relative',
                  height: '160px',
                  background: '#F1F5F9',
                  overflow: 'hidden'
                }}>
                  <img
                    src={product.mainImage}
                    alt={product.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />

                  {/* Stock Alert Badge */}
                  <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', gap: '6px' }}>
                    {isOutOfStock ? (
                      <span className="badge badge-danger" style={{ boxShadow: 'var(--shadow-sm)' }}>
                        Out of Stock
                      </span>
                    ) : isLowStock ? (
                      <span className="badge badge-warning" style={{ boxShadow: 'var(--shadow-sm)' }}>
                        Low Stock
                      </span>
                    ) : null}

                    {product.commissionStock > 0 && (
                      <span className="badge badge-commission" style={{ boxShadow: 'var(--shadow-sm)' }}>
                        Commission
                      </span>
                    )}
                  </div>

                  {/* Three dot actions menu button */}
                  <div style={{ position: 'absolute', top: '8px', right: '8px' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuId(activeMenuId === product.id ? null : product.id);
                      }}
                      style={{
                        background: 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(4px)',
                        borderRadius: '50%',
                        width: '30px',
                        height: '30px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: 'var(--shadow-sm)',
                        color: 'var(--text-main)'
                      }}
                    >
                      <MoreVertical size={16} />
                    </button>

                    {/* Dropdown Menu */}
                    {activeMenuId === product.id && (
                      <div
                        style={{
                          position: 'absolute',
                          right: 0,
                          top: '36px',
                          background: '#FFFFFF',
                          borderRadius: 'var(--radius-md)',
                          boxShadow: 'var(--shadow-lg)',
                          border: '1px solid var(--border-subtle)',
                          width: '150px',
                          padding: '4px',
                          zIndex: 20
                        }}
                      >
                        <button
                          onClick={() => handleOpenEdit(product)}
                          style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '8px 10px',
                            fontSize: '12.5px',
                            borderRadius: 'var(--radius-sm)',
                            color: 'var(--text-main)'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#F8FAFC'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <Edit2 size={14} color="var(--primary-blue)" />
                          <span>Edit Product</span>
                        </button>

                        <button
                          onClick={() => {
                            setActiveMenuId(null);
                            setHistoryProduct(product);
                          }}
                          style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '8px 10px',
                            fontSize: '12.5px',
                            borderRadius: 'var(--radius-sm)',
                            color: 'var(--text-main)'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#F8FAFC'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <History size={14} color="var(--primary-orange)" />
                          <span>Edit History</span>
                        </button>

                        <button
                          onClick={() => {
                            setActiveMenuId(null);
                            if (window.confirm(`Are you sure you want to delete "${product.name}"?`)) {
                              deleteProduct(product.id);
                            }
                          }}
                          style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '8px 10px',
                            fontSize: '12.5px',
                            borderRadius: 'var(--radius-sm)',
                            color: 'var(--danger)'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#FEF2F2'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <Trash2 size={14} />
                          <span>Delete</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Content */}
                <div style={{ padding: '14px 16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-light)', textTransform: 'uppercase', marginBottom: '2px' }}>
                    {product.category}
                  </div>
                  <h4 style={{
                    fontSize: '14px',
                    fontWeight: 700,
                    color: 'var(--text-main)',
                    lineHeight: 1.3,
                    marginBottom: '8px',
                    flex: 1
                  }}>
                    {product.name}
                  </h4>

                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                    SKU: {product.sku}
                  </div>

                  {/* Financial & Stock Details */}
                  <div style={{
                    background: '#F8FAFC',
                    borderRadius: 'var(--radius-md)',
                    padding: '10px 12px',
                    border: '1px solid var(--border-light)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Selling Price:</span>
                      <strong style={{ fontSize: '14px', color: 'var(--primary-orange)' }}>
                        {formatCurrency(product.sellingRate)}
                      </strong>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Purchase Cost:</span>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                        {formatCurrency(product.purchaseRate)}
                      </span>
                    </div>

                    <div style={{
                      borderTop: '1px solid #E2E8F0',
                      paddingTop: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Available Stock:</span>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <span className="badge badge-own" style={{ fontSize: '10px' }}>
                          Own: {product.ownStock}
                        </span>
                        {product.commissionStock > 0 && (
                          <span className="badge badge-commission" style={{ fontSize: '10px' }}>
                            Comm: {product.commissionStock}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {(isAddModalOpen || editingProduct) && (
        <div className="modal-overlay" onClick={() => { setIsAddModalOpen(false); setEditingProduct(null); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
            <div className="modal-header">
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700 }}>
                  {editingProduct ? `Edit Product: ${editingProduct.name}` : 'Add New Product'}
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {editingProduct ? 'Updating this record will preserve its history and historical transactions.' : 'Create an item for the Thinkaroo catalogue.'}
                </p>
              </div>
              <button onClick={() => { setIsAddModalOpen(false); setEditingProduct(null); }}>
                <X size={18} color="var(--text-light)" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct}>
              <div className="modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="form-label">Product Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="form-input"
                      placeholder="e.g. Thinkaroo Spiral Notebook"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">SKU / Item Code *</label>
                    <input
                      type="text"
                      required
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="form-select"
                    >
                      {settings.categories.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Purchase Rate (₹ Cost)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.purchaseRate}
                      onChange={(e) => setFormData({ ...formData, purchaseRate: Number(e.target.value) })}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Selling Rate (₹ Price) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.sellingRate}
                      onChange={(e) => setFormData({ ...formData, sellingRate: Number(e.target.value) })}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Own Stock (Qty)</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.ownStock}
                      onChange={(e) => setFormData({ ...formData, ownStock: Number(e.target.value) })}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Commission Stock (Qty)</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.commissionStock}
                      onChange={(e) => setFormData({ ...formData, commissionStock: Number(e.target.value) })}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Unit of Measure</label>
                    <select
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      className="form-select"
                    >
                      <option value="pcs">Pieces (pcs)</option>
                      <option value="pack">Pack</option>
                      <option value="set">Set</option>
                      <option value="box">Box</option>
                      <option value="book">Book</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Low Stock Alert Threshold</label>
                    <input
                      type="number"
                      min="1"
                      value={formData.minStockAlert}
                      onChange={(e) => setFormData({ ...formData, minStockAlert: Number(e.target.value) })}
                      className="form-input"
                    />
                  </div>

                  {/* Images Section */}
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="form-label">Product Images & Gallery</label>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                      <input
                        type="url"
                        placeholder="Paste image URL here..."
                        value={formData.newImageUrl}
                        onChange={(e) => setFormData({ ...formData, newImageUrl: e.target.value })}
                        className="form-input"
                      />
                      <button type="button" onClick={handleAddImage} className="btn-secondary" style={{ flexShrink: 0 }}>
                        Add Image
                      </button>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                      {formData.imagesList.map((url, index) => (
                        <div
                          key={index}
                          style={{
                            position: 'relative',
                            width: '64px',
                            height: '64px',
                            borderRadius: 'var(--radius-sm)',
                            border: formData.mainImage === url ? '2px solid var(--primary-orange)' : '1px solid var(--border-subtle)',
                            overflow: 'hidden'
                          }}
                        >
                          <img src={url} alt={`Preview ${index}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            style={{
                              position: 'absolute',
                              top: '2px',
                              right: '2px',
                              background: 'rgba(0, 0, 0, 0.6)',
                              color: '#FFFFFF',
                              borderRadius: '50%',
                              width: '16px',
                              height: '16px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '10px'
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="form-label">Description (Optional)</label>
                    <textarea
                      rows={2}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="form-textarea"
                      placeholder="Brief notes on dimensions, paper quality, etc."
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => { setIsAddModalOpen(false); setEditingProduct(null); }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change History Modal */}
      {historyProduct && (
        <div className="modal-overlay" onClick={() => setHistoryProduct(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <History size={18} color="var(--primary-orange)" />
                <h3 style={{ fontSize: '15px', fontWeight: 700 }}>
                  Edit History: {historyProduct.name}
                </h3>
              </div>
              <button onClick={() => setHistoryProduct(null)}>
                <X size={18} color="var(--text-light)" />
              </button>
            </div>
            <div className="modal-body" style={{ maxHeight: '400px' }}>
              {historyProduct.changeHistory && historyProduct.changeHistory.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {historyProduct.changeHistory.map(item => (
                    <div
                      key={item.id}
                      style={{
                        padding: '10px',
                        background: '#F8FAFC',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-light)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', marginBottom: '4px' }}>
                        <strong style={{ color: 'var(--text-main)' }}>{item.intern}</strong>
                        <span style={{ color: 'var(--text-light)' }}>{new Date(item.timestamp).toLocaleString('en-IN')}</span>
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        {item.details}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ textAlign: 'center', color: 'var(--text-light)', padding: '20px' }}>
                  No changes recorded yet.
                </p>
              )}
            </div>
            <div className="modal-footer">
              <button onClick={() => setHistoryProduct(null)} className="btn-secondary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
