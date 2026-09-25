import React, { useState } from 'react';
import {
  Boxes,
  Search,
  SlidersHorizontal,
  Plus,
  Minus,
  History,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownLeft,
  Filter,
  CheckCircle2,
  X
} from 'lucide-react';
import { useDatabase } from '../context/DatabaseContext';
import { Product, StockType, MovementType } from '../types';
import { formatMovementType, formatDateTime } from '../utils/formatters';

type StockFilter = 'ALL' | 'OWN_ONLY' | 'COMMISSION_ONLY' | 'LOW_STOCK' | 'OUT_OF_STOCK';

export const StockView: React.FC = () => {
  const { products, stockMovements, adjustStock } = useDatabase();

  const [activeTab, setActiveTab] = useState<'inventory' | 'history'>('inventory');
  const [filter, setFilter] = useState<StockFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Adjustment Modal state
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [adjustStockType, setAdjustStockType] = useState<StockType>('OWN');
  const [adjustDelta, setAdjustDelta] = useState<number>(1);
  const [adjustIsAdd, setAdjustIsAdd] = useState<boolean>(true); // true = + add, false = - remove
  const [adjustReason, setAdjustReason] = useState('Stock Count Verification');

  // Open adjustment modal for a specific product
  const handleOpenAdjust = (p: Product) => {
    setSelectedProduct(p);
    setAdjustStockType(p.ownStock >= p.commissionStock ? 'OWN' : 'COMMISSION');
    setAdjustDelta(1);
    setAdjustIsAdd(true);
    setAdjustReason('Physical Count Verification');
    setIsAdjustModalOpen(true);
  };

  const handleSaveAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    const delta = adjustIsAdd ? Math.abs(adjustDelta) : -Math.abs(adjustDelta);
    adjustStock(
      selectedProduct.id,
      adjustStockType,
      delta,
      'MANUAL_ADJUSTMENT',
      adjustReason
    );
    setIsAdjustModalOpen(false);
  };

  // Filter products
  const filteredProducts = products.filter(p => {
    const total = p.ownStock + p.commissionStock;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.sku.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filter === 'OWN_ONLY') return p.ownStock > 0;
    if (filter === 'COMMISSION_ONLY') return p.commissionStock > 0;
    if (filter === 'LOW_STOCK') return total > 0 && total <= p.minStockAlert;
    if (filter === 'OUT_OF_STOCK') return total <= 0;
    return true;
  });

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '20px'
      }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-main)' }}>
            Physical Stock Management
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Strict separation of Own Stock vs Commission Stock
          </p>
        </div>

        {/* View mode toggle */}
        <div style={{
          display: 'flex',
          background: '#FFFFFF',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '3px',
          boxShadow: 'var(--shadow-xs)'
        }}>
          <button
            onClick={() => setActiveTab('inventory')}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '12.5px',
              fontWeight: activeTab === 'inventory' ? 600 : 500,
              background: activeTab === 'inventory' ? 'var(--primary-blue)' : 'transparent',
              color: activeTab === 'inventory' ? '#FFFFFF' : 'var(--text-secondary)'
            }}
          >
            Current Stock Levels
          </button>
          <button
            onClick={() => setActiveTab('history')}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '12.5px',
              fontWeight: activeTab === 'history' ? 600 : 500,
              background: activeTab === 'history' ? 'var(--primary-blue)' : 'transparent',
              color: activeTab === 'history' ? '#FFFFFF' : 'var(--text-secondary)'
            }}
          >
            Movement History ({stockMovements.length})
          </button>
        </div>
      </div>

      {activeTab === 'inventory' ? (
        <>
          {/* Filter Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            marginBottom: '16px'
          }}>
            {/* Filter pills */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {(['ALL', 'OWN_ONLY', 'COMMISSION_ONLY', 'LOW_STOCK', 'OUT_OF_STOCK'] as StockFilter[]).map(f => {
                const labels: Record<StockFilter, string> = {
                  ALL: 'All Products',
                  OWN_ONLY: 'Own Stock',
                  COMMISSION_ONLY: 'Commission Stock',
                  LOW_STOCK: 'Low Stock',
                  OUT_OF_STOCK: 'Out of Stock'
                };
                const active = filter === f;
                return (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '12px',
                      fontWeight: active ? 600 : 500,
                      background: active ? '#0F172A' : '#FFFFFF',
                      color: active ? '#FFFFFF' : 'var(--text-secondary)',
                      border: active ? '1px solid #0F172A' : '1px solid var(--border-subtle)'
                    }}
                  >
                    {labels[f]}
                  </button>
                );
              })}
            </div>

            {/* Search */}
            <div style={{ position: 'relative', width: '220px' }}>
              <input
                type="text"
                placeholder="Search stock..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '32px', fontSize: '13px' }}
              />
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
            </div>
          </div>

          {/* Table Container */}
          <div className="tk-table-container">
            <table className="tk-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Category</th>
                  <th style={{ color: 'var(--primary-blue)' }}>Own Stock</th>
                  <th style={{ color: 'var(--primary-orange)' }}>Commission Stock</th>
                  <th>Total Stock</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-light)' }}>
                      No stock matches the selected filter
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map(p => {
                    const total = p.ownStock + p.commissionStock;
                    const isOut = total <= 0;
                    const isLow = !isOut && total <= p.minStockAlert;

                    return (
                      <tr key={p.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <img
                              src={p.mainImage}
                              alt={p.name}
                              style={{ width: '36px', height: '36px', borderRadius: '6px', objectFit: 'cover' }}
                            />
                            <div>
                              <strong style={{ fontSize: '13px', color: 'var(--text-main)' }}>{p.name}</strong>
                              <div style={{ fontSize: '11px', color: 'var(--text-light)' }}>Min Alert: {p.minStockAlert} {p.unit}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{p.sku}</td>
                        <td style={{ fontSize: '12px' }}>{p.category}</td>
                        <td>
                          <span className="badge badge-own" style={{ fontSize: '12px', padding: '4px 9px' }}>
                            {p.ownStock} {p.unit}
                          </span>
                        </td>
                        <td>
                          <span className="badge badge-commission" style={{ fontSize: '12px', padding: '4px 9px' }}>
                            {p.commissionStock} {p.unit}
                          </span>
                        </td>
                        <td>
                          <strong style={{ fontSize: '13px' }}>{total} {p.unit}</strong>
                        </td>
                        <td>
                          {isOut ? (
                            <span className="badge badge-danger">Out of Stock</span>
                          ) : isLow ? (
                            <span className="badge badge-warning">Low Stock</span>
                          ) : (
                            <span className="badge badge-success">In Stock</span>
                          )}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            onClick={() => handleOpenAdjust(p)}
                            className="btn-secondary"
                            style={{ padding: '5px 10px', fontSize: '12px' }}
                          >
                            <SlidersHorizontal size={13} />
                            <span>Adjust</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        /* Movement History Table */
        <div className="tk-table-container">
          <table className="tk-table">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Product</th>
                <th>Stock Category</th>
                <th>Movement Type</th>
                <th>Qty Change</th>
                <th>Qty After</th>
                <th>Intern</th>
                <th>Reason / Reference</th>
              </tr>
            </thead>
            <tbody>
              {stockMovements.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-light)' }}>
                    No stock movements recorded yet
                  </td>
                </tr>
              ) : (
                stockMovements.map(m => {
                  const typeInfo = formatMovementType(m.movementType);
                  return (
                    <tr key={m.id}>
                      <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {formatDateTime(m.timestamp)}
                      </td>
                      <td>
                        <strong style={{ fontSize: '13px' }}>{m.productName}</strong>
                      </td>
                      <td>
                        <span className={m.stockType === 'OWN' ? 'badge badge-own' : 'badge badge-commission'}>
                          {m.stockType}
                        </span>
                      </td>
                      <td>
                        <span className="badge badge-neutral" style={{ fontSize: '11px' }}>
                          {typeInfo.label}
                        </span>
                      </td>
                      <td>
                        <span style={{
                          fontWeight: 700,
                          fontSize: '13px',
                          color: m.quantityDelta > 0 ? 'var(--success)' : 'var(--danger)'
                        }}>
                          {m.quantityDelta > 0 ? `+${m.quantityDelta}` : m.quantityDelta}
                        </span>
                      </td>
                      <td style={{ fontSize: '12.5px', fontWeight: 600 }}>{m.quantityAfter}</td>
                      <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{m.internName}</td>
                      <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {m.reason} {m.referenceId ? `(#${m.referenceId})` : ''}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Stock Adjustment Modal */}
      {isAdjustModalOpen && selectedProduct && (
        <div className="modal-overlay" onClick={() => setIsAdjustModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Adjust Stock Level</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {selectedProduct.name} ({selectedProduct.sku})
                </p>
              </div>
              <button onClick={() => setIsAdjustModalOpen(false)}>
                <X size={18} color="var(--text-light)" />
              </button>
            </div>

            <form onSubmit={handleSaveAdjustment}>
              <div className="modal-body">
                {/* Current Stock Preview */}
                <div style={{
                  background: '#F8FAFC',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px',
                  display: 'flex',
                  justifyContent: 'space-around',
                  border: '1px solid var(--border-light)',
                  marginBottom: '16px'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: 'var(--primary-blue)', fontWeight: 600 }}>CURRENT OWN STOCK</div>
                    <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--primary-blue)' }}>
                      {selectedProduct.ownStock}
                    </div>
                  </div>
                  <div style={{ width: '1px', background: 'var(--border-subtle)' }} />
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: 'var(--primary-orange)', fontWeight: 600 }}>CURRENT COMMISSION</div>
                    <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--primary-orange)' }}>
                      {selectedProduct.commissionStock}
                    </div>
                  </div>
                </div>

                {/* Select which stock pool to adjust */}
                <div className="form-group">
                  <label className="form-label">Which stock pool are you adjusting? *</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={() => setAdjustStockType('OWN')}
                      style={{
                        padding: '10px',
                        borderRadius: 'var(--radius-md)',
                        border: adjustStockType === 'OWN' ? '2px solid var(--primary-blue)' : '1px solid var(--border-subtle)',
                        background: adjustStockType === 'OWN' ? 'var(--primary-blue-light)' : '#FFFFFF',
                        fontWeight: 600,
                        fontSize: '13px',
                        color: adjustStockType === 'OWN' ? 'var(--primary-blue)' : 'var(--text-secondary)'
                      }}
                    >
                      Own Stock (Thinkaroo)
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdjustStockType('COMMISSION')}
                      style={{
                        padding: '10px',
                        borderRadius: 'var(--radius-md)',
                        border: adjustStockType === 'COMMISSION' ? '2px solid var(--primary-orange)' : '1px solid var(--border-subtle)',
                        background: adjustStockType === 'COMMISSION' ? 'var(--primary-orange-light)' : '#FFFFFF',
                        fontWeight: 600,
                        fontSize: '13px',
                        color: adjustStockType === 'COMMISSION' ? 'var(--primary-orange)' : 'var(--text-secondary)'
                      }}
                    >
                      Commission Stock (Owner)
                    </button>
                  </div>
                </div>

                {/* Adjustment Direction (+ or -) */}
                <div className="form-group">
                  <label className="form-label">Adjustment Direction & Quantity *</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => setAdjustIsAdd(true)}
                      style={{
                        flex: 1,
                        padding: '8px',
                        borderRadius: 'var(--radius-md)',
                        border: adjustIsAdd ? '2px solid var(--success)' : '1px solid var(--border-subtle)',
                        background: adjustIsAdd ? 'var(--success-light)' : '#FFFFFF',
                        fontWeight: 600,
                        fontSize: '13px',
                        color: adjustIsAdd ? 'var(--success)' : 'var(--text-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <Plus size={15} />
                      <span>Add (+ Stock)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdjustIsAdd(false)}
                      style={{
                        flex: 1,
                        padding: '8px',
                        borderRadius: 'var(--radius-md)',
                        border: !adjustIsAdd ? '2px solid var(--danger)' : '1px solid var(--border-subtle)',
                        background: !adjustIsAdd ? 'var(--danger-light)' : '#FFFFFF',
                        fontWeight: 600,
                        fontSize: '13px',
                        color: !adjustIsAdd ? 'var(--danger)' : 'var(--text-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <Minus size={15} />
                      <span>Deduct (- Stock)</span>
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Quantity ({selectedProduct.unit}) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={adjustDelta}
                    onChange={(e) => setAdjustDelta(Number(e.target.value))}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Reason for Adjustment *</label>
                  <input
                    type="text"
                    required
                    value={adjustReason}
                    onChange={(e) => setAdjustReason(e.target.value)}
                    className="form-input"
                    placeholder="e.g. Physical stock count check / misplaced items found"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setIsAdjustModalOpen(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Confirm Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
