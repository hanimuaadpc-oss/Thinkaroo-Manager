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
  ChevronDown,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { useDatabase } from '../context/DatabaseContext';
import { Product, StockType } from '../types';
import { formatCurrency } from '../utils/formatters';

export const ProductsView: React.FC = () => {
  const { products, isLoadingProducts, refetchProducts, addProduct, updateProduct, deleteProduct, settings } = useDatabase();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  
  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [historyProduct, setHistoryProduct] = useState<Product | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Async submission state
  const [isSaving, setIsSaving] = useState(false);
  const [submitError, setSubmitError] = useState('');

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
    setSubmitError('');
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
    setSubmitError('');
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

  // Save Product (Direct Supabase INSERT/UPDATE with Verification)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setIsSaving(true);
    setSubmitError('');

    const formattedImages = formData.imagesList.map((url, idx) => ({
      id: `img-${Date.now()}-${idx}`,
      url,
      isMain: url === formData.mainImage
    }));

    if (editingProduct) {
      // Update existing record in Supabase
      const res = await updateProduct(editingProduct.id, {
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

      setIsSaving(false);
      if (!res.success) {
        setSubmitError(res.error || 'Failed to update product in Supabase.');
        return;
      }
      setEditingProduct(null);
    } else {
      // Add new record to Supabase
      const res = await addProduct({
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

      setIsSaving(false);
      if (!res.success) {
        setSubmitError(res.error || 'Failed to save product to Supabase.');
        return;
      }
      setIsAddModalOpen(false);
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}" from Supabase?`)) return;
    setActiveMenuId(null);
    const res = await deleteProduct(id);
    if (!res.success) {
      alert(`Delete Error: ${res.error}`);
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
              Products Catalog
            </h2>
            <span className="badge badge-neutral" style={{ fontSize: '12px' }}>
              {products.length} Items (Supabase)
            </span>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Direct real-time inventory connected to Supabase Cloud Database
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Refresh button */}
          <button
            onClick={() => refetchProducts()}
            className="btn-secondary"
            title="Reload products from Supabase"
            style={{ padding: '8px 12px' }}
          >
            <RefreshCw size={15} className={isLoadingProducts ? 'spin-animation' : ''} />
          </button>

          {/* Search box */}
          <div style={{ position: 'relative', width: '220px' }}>
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

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="form-select"
            style={{ width: '160px', fontSize: '13px' }}
          >
            <option value="ALL">All Categories</option>
            {settings.categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Add Product Button */}
          <button
            onClick={handleOpenAdd}
            className="btn-primary"
          >
            <Plus size={16} />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Loading state indicator */}
      {isLoadingProducts ? (
        <div style={{
          textAlign: 'center',
          padding: '48px 20px',
          background: '#FFFFFF',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)'
        }}>
          <Loader2 size={32} color="var(--primary-blue)" style={{ animation: 'spin 1s linear infinite' }} />
          <div style={{ marginTop: '12px', fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>
            Loading Products directly from Supabase Database...
          </div>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '48px 20px',
          background: '#FFFFFF',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)'
        }}>
          <Boxes size={48} color="var(--text-light)" style={{ marginBottom: '12px' }} />
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)' }}>
            No Products Found in Supabase
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px', maxWidth: '400px', margin: '4px auto 16px' }}>
            Click "Add Product" above to create your first item directly in the Supabase public.products table.
          </p>
          <button onClick={handleOpenAdd} className="btn-primary">
            <Plus size={16} />
            <span>Add First Product</span>
          </button>
        </div>
      ) : (
        /* Product Cards Grid */
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '16px'
        }}>
          {filteredProducts.map((product) => {
            const totalStock = product.ownStock + product.commissionStock;
            const isLow = totalStock > 0 && totalStock <= product.minStockAlert;
            const isOut = totalStock <= 0;

            return (
              <div key={product.id} className="tk-card" style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
                {/* Product Image Header */}
                <div style={{
                  height: '150px',
                  background: 'var(--bg-surface-secondary)',
                  position: 'relative',
                  overflow: 'hidden',
                  borderTopLeftRadius: 'var(--radius-lg)',
                  borderTopRightRadius: 'var(--radius-lg)'
                }}>
                  <img
                    src={product.mainImage || 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=500&auto=format&fit=crop&q=60'}
                    alt={product.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=500&auto=format&fit=crop&q=60';
                    }}
                  />

                  {/* Stock Status Tag */}
                  <div style={{ position: 'absolute', top: '10px', left: '10px' }}>
                    {isOut ? (
                      <span className="badge badge-danger">Out of Stock</span>
                    ) : isLow ? (
                      <span className="badge badge-warning">Low Stock ({totalStock})</span>
                    ) : (
                      <span className="badge badge-success">In Stock ({totalStock})</span>
                    )}
                  </div>

                  {/* Action Menu button */}
                  <div style={{ position: 'absolute', top: '8px', right: '8px' }}>
                    <button
                      onClick={() => setActiveMenuId(activeMenuId === product.id ? null : product.id)}
                      style={{
                        background: 'rgba(255, 255, 255, 0.9)',
                        borderRadius: '50%',
                        padding: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: 'var(--shadow-sm)'
                      }}
                    >
                      <MoreVertical size={16} color="var(--text-main)" />
                    </button>

                    {activeMenuId === product.id && (
                      <div style={{
                        position: 'absolute',
                        right: 0,
                        top: 'calc(100% + 4px)',
                        background: '#FFFFFF',
                        borderRadius: 'var(--radius-md)',
                        boxShadow: 'var(--shadow-lg)',
                        border: '1px solid var(--border-subtle)',
                        padding: '4px',
                        zIndex: 20,
                        minWidth: '140px'
                      }}>
                        <button
                          onClick={() => handleOpenEdit(product)}
                          style={{
                            width: '100%',
                            textAlign: 'left',
                            padding: '6px 10px',
                            fontSize: '12.5px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            borderRadius: '4px'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#F1F5F9'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <Edit2 size={14} color="var(--primary-blue)" />
                          <span>Edit Product</span>
                        </button>

                        <button
                          onClick={() => { setActiveMenuId(null); setHistoryProduct(product); }}
                          style={{
                            width: '100%',
                            textAlign: 'left',
                            padding: '6px 10px',
                            fontSize: '12.5px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            borderRadius: '4px'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#F1F5F9'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <History size={14} color="var(--primary-orange)" />
                          <span>View History</span>
                        </button>

                        <button
                          onClick={() => handleDeleteProduct(product.id, product.name)}
                          style={{
                            width: '100%',
                            textAlign: 'left',
                            padding: '6px 10px',
                            fontSize: '12.5px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            color: 'var(--danger)',
                            borderRadius: '4px'
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

                {/* Product Content */}
                <div style={{ padding: '14px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-light)', textTransform: 'uppercase' }}>
                    {product.category} • <span style={{ fontFamily: 'monospace' }}>{product.sku}</span>
                  </div>

                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-main)', marginTop: '4px', marginBottom: '8px' }}>
                    {product.name}
                  </h3>

                  {product.description && (
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {product.description}
                    </p>
                  )}

                  <div style={{ marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Selling Price</div>
                      <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--primary-orange)' }}>
                        {formatCurrency(product.sellingRate)}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Cost Rate</div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                        {formatCurrency(product.purchaseRate)}
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: '8px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    <span className="badge badge-own" style={{ fontSize: '10px' }}>
                      Own: {product.ownStock} {product.unit}
                    </span>
                    {product.commissionStock > 0 && (
                      <span className="badge badge-commission" style={{ fontSize: '10px' }}>
                        Comm: {product.commissionStock} {product.unit}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {(isAddModalOpen || editingProduct) && (
        <div className="modal-overlay" onClick={() => { if (!isSaving) { setIsAddModalOpen(false); setEditingProduct(null); } }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
            <div className="modal-header">
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700 }}>
                  {editingProduct ? `Edit Product: ${editingProduct.name}` : 'Add New Product'}
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Saves directly to Supabase public.products table.
                </p>
              </div>
              <button disabled={isSaving} onClick={() => { setIsAddModalOpen(false); setEditingProduct(null); }}>
                <X size={18} color="var(--text-light)" />
              </button>
            </div>

            {/* Error Banner */}
            {submitError && (
              <div style={{
                margin: '12px 22px 0',
                padding: '10px 14px',
                background: '#FEF2F2',
                border: '1px solid #FECACA',
                borderRadius: 'var(--radius-md)',
                color: 'var(--danger)',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <div>
                  <strong>Supabase Error:</strong> {submitError}
                </div>
              </div>
            )}

            <form onSubmit={handleSaveProduct}>
              <div className="modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="form-label">Product Name *</label>
                    <input
                      type="text"
                      required
                      disabled={isSaving}
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
                      disabled={isSaving}
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select
                      disabled={isSaving}
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
                      disabled={isSaving}
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
                      disabled={isSaving}
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
                      disabled={isSaving}
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
                      disabled={isSaving}
                      min="0"
                      value={formData.commissionStock}
                      onChange={(e) => setFormData({ ...formData, commissionStock: Number(e.target.value) })}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="form-label">Description (Optional)</label>
                    <textarea
                      rows={2}
                      disabled={isSaving}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="form-textarea"
                      placeholder="Brief notes on dimensions, paper quality, etc."
                    />
                  </div>

                  {/* ── Image Management Section ── */}
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <ImageIcon size={14} />
                      Product Images (URL)
                    </label>

                    {/* Add new image URL row */}
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                      <input
                        type="url"
                        disabled={isSaving}
                        value={formData.newImageUrl}
                        onChange={(e) => setFormData({ ...formData, newImageUrl: e.target.value })}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddImage(); } }}
                        className="form-input"
                        placeholder="https://example.com/image.jpg"
                        style={{ flex: 1, fontSize: '12.5px' }}
                      />
                      <button
                        type="button"
                        disabled={isSaving || !formData.newImageUrl.trim()}
                        onClick={handleAddImage}
                        className="btn-primary"
                        style={{ padding: '8px 14px', fontSize: '12px', whiteSpace: 'nowrap' }}
                      >
                        <Plus size={14} />
                        <span>Add URL</span>
                      </button>
                    </div>

                    {/* Image thumbnails list */}
                    {formData.imagesList.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {formData.imagesList.map((url, idx) => {
                          const isMain = url === formData.mainImage;
                          return (
                            <div
                              key={idx}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                padding: '8px 10px',
                                borderRadius: 'var(--radius-md)',
                                border: isMain
                                  ? '2px solid var(--primary-blue)'
                                  : '1px solid var(--border-subtle)',
                                background: isMain ? '#EFF6FF' : '#F8FAFC'
                              }}
                            >
                              {/* Thumbnail preview */}
                              <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '6px',
                                overflow: 'hidden',
                                flexShrink: 0,
                                background: 'var(--bg-surface-secondary)'
                              }}>
                                <img
                                  src={url}
                                  alt={`Image ${idx + 1}`}
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                              </div>

                              {/* URL text */}
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  color: isMain ? 'var(--primary-blue)' : 'var(--text-muted)',
                                  marginBottom: '2px'
                                }}>
                                  {isMain ? '★ Main Image' : `Image ${idx + 1}`}
                                </div>
                                <div style={{
                                  fontSize: '11px',
                                  color: 'var(--text-secondary)',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap'
                                }}>
                                  {url}
                                </div>
                              </div>

                              {/* Set as main button */}
                              {!isMain && (
                                <button
                                  type="button"
                                  disabled={isSaving}
                                  onClick={() => setFormData({ ...formData, mainImage: url })}
                                  title="Set as main image"
                                  style={{
                                    padding: '4px 8px',
                                    fontSize: '11px',
                                    background: 'var(--primary-blue)',
                                    color: '#fff',
                                    borderRadius: '4px',
                                    flexShrink: 0,
                                    fontWeight: 600
                                  }}
                                >
                                  Set Main
                                </button>
                              )}
                              {isMain && (
                                <Check size={16} color="var(--primary-blue)" style={{ flexShrink: 0 }} />
                              )}

                              {/* Remove button */}
                              <button
                                type="button"
                                disabled={isSaving}
                                onClick={() => handleRemoveImage(idx)}
                                title="Remove image"
                                style={{
                                  padding: '4px 6px',
                                  borderRadius: '4px',
                                  color: 'var(--danger)',
                                  flexShrink: 0
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = '#FEF2F2'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                              >
                                <X size={14} />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div style={{
                        textAlign: 'center',
                        padding: '16px',
                        border: '1px dashed var(--border-subtle)',
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--text-muted)',
                        fontSize: '12px'
                      }}>
                        <ImageIcon size={20} style={{ marginBottom: '6px', opacity: 0.5 }} />
                        <div>No images added yet. Paste a URL above to add one.</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => { setIsAddModalOpen(false); setEditingProduct(null); }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" disabled={isSaving} className="btn-primary">
                  {isSaving ? (
                    <>
                      <Loader2 size={16} className="spin-animation" style={{ animation: 'spin 1s linear infinite' }} />
                      <span>Saving to Supabase...</span>
                    </>
                  ) : (
                    <span>{editingProduct ? 'Save Changes' : 'Create Product'}</span>
                  )}
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
                    <div key={item.id} style={{
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-md)',
                      background: '#F8FAFC',
                      border: '1px solid var(--border-subtle)',
                      fontSize: '12px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '4px' }}>
                        <span>{item.intern}</span>
                        <span>{new Date(item.timestamp).toLocaleString()}</span>
                      </div>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                        {item.details}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '13px' }}>
                  No history logs for this item.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
