import React, { useState } from 'react';
import {
  AlertTriangle,
  Plus,
  Search,
  Trash2,
  Calendar,
  X,
  Package,
  TrendingDown
} from 'lucide-react';
import { useDatabase } from '../context/DatabaseContext';
import { Wastage, StockType } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';

const REASONS: Wastage['reason'][] = ['Damaged', 'Expired', 'Lost', 'Defective', 'Sample', 'Other'];

export const WastageView: React.FC = () => {
  const { wastages, products, addWastage, deleteWastage } = useDatabase();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [stockType, setStockType] = useState<StockType>('OWN');
  const [quantity, setQuantity] = useState<number>(1);
  const [reason, setReason] = useState<Wastage['reason']>('Damaged');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const selectedProduct = products.find(p => p.id === selectedProductId);

  const handleOpenAdd = () => {
    const prod = products[0];
    setSelectedProductId(prod?.id || '');
    setStockType(prod?.ownStock > 0 ? 'OWN' : 'COMMISSION');
    setQuantity(1);
    setReason('Damaged');
    setDate(new Date().toISOString().slice(0, 10));
    setNote('');
    setIsModalOpen(true);
  };

  const handleSaveWastage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || quantity <= 0) return;

    const available = stockType === 'OWN' ? selectedProduct.ownStock : selectedProduct.commissionStock;
    if (quantity > available) {
      alert(`Cannot record wastage higher than current ${stockType} stock (${available} units)`);
      return;
    }

    addWastage({
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      stockType,
      quantity: Number(quantity),
      unitCost: selectedProduct.purchaseRate,
      reason,
      date,
      note: note.trim()
    });

    setIsModalOpen(false);
  };

  const totalLossValue = wastages.reduce((sum, w) => sum + w.totalLoss, 0);
  const totalItemsLost = wastages.reduce((sum, w) => sum + w.quantity, 0);

  const filteredWastages = wastages.filter(w => {
    return w.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
           w.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
           w.note.toLowerCase().includes(searchQuery.toLowerCase());
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
            Wastage & Damaged Goods
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Deducts from inventory and tracks loss value
          </p>
        </div>

        <button onClick={handleOpenAdd} className="btn-primary">
          <Plus size={16} strokeWidth={2.5} />
          <span>Record Wastage</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '14px',
        marginBottom: '20px'
      }}>
        <div className="tk-card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Total Financial Loss</span>
            <TrendingDown size={16} color="var(--danger)" />
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--danger)' }}>
            {formatCurrency(totalLossValue)}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-light)', marginTop: '4px' }}>
            Cost value of discarded inventory
          </div>
        </div>

        <div className="tk-card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Discarded Quantity</span>
            <AlertTriangle size={16} color="#B45309" />
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-main)' }}>
            {totalItemsLost} units
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-light)', marginTop: '4px' }}>
            Across {wastages.length} incidents
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '14px' }}>
        <div style={{ position: 'relative', width: '240px' }}>
          <input
            type="text"
            placeholder="Search product or reason..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '32px', fontSize: '13px' }}
          />
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
        </div>
      </div>

      {/* Wastage Table */}
      <div className="tk-table-container">
        <table className="tk-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Product</th>
              <th>Stock Source</th>
              <th>Quantity Lost</th>
              <th>Unit Cost</th>
              <th>Total Loss Value</th>
              <th>Reason</th>
              <th>Notes / Intern</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredWastages.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-light)' }}>
                  No wastage records logged
                </td>
              </tr>
            ) : (
              filteredWastages.map(w => (
                <tr key={w.id}>
                  <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {formatDate(w.date)}
                  </td>
                  <td>
                    <strong style={{ fontSize: '13px', color: 'var(--text-main)' }}>{w.productName}</strong>
                  </td>
                  <td>
                    <span className={w.stockType === 'OWN' ? 'badge badge-own' : 'badge badge-commission'}>
                      {w.stockType}
                    </span>
                  </td>
                  <td>
                    <strong style={{ fontSize: '13px', color: 'var(--danger)' }}>
                      -{w.quantity}
                    </strong>
                  </td>
                  <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {formatCurrency(w.unitCost)}
                  </td>
                  <td>
                    <strong style={{ fontSize: '13.5px', color: 'var(--danger)' }}>
                      {formatCurrency(w.totalLoss)}
                    </strong>
                  </td>
                  <td>
                    <span className="badge badge-warning" style={{ fontSize: '11px' }}>
                      {w.reason}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{w.note || 'No notes'}</div>
                    <div style={{ fontSize: '10.5px', color: 'var(--text-light)' }}>by {w.recordedByIntern}</div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete wastage entry for "${w.productName}"?`)) {
                          deleteWastage(w.id);
                        }
                      }}
                      className="btn-ghost"
                      style={{ color: 'var(--danger)', padding: '4px 8px' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Record Wastage Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '460px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Record Product Wastage</h3>
              <button onClick={() => setIsModalOpen(false)}>
                <X size={18} color="var(--text-light)" />
              </button>
            </div>

            <form onSubmit={handleSaveWastage}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Select Damaged / Lost Product *</label>
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="form-select"
                  >
                    {products.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} (Own: {p.ownStock}, Comm: {p.commissionStock})
                      </option>
                    ))}
                  </select>
                </div>

                {selectedProduct && (
                  <div className="form-group">
                    <label className="form-label">Deduct from Stock Pool *</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => setStockType('OWN')}
                        style={{
                          padding: '8px',
                          borderRadius: 'var(--radius-md)',
                          border: stockType === 'OWN' ? '2px solid var(--primary-blue)' : '1px solid var(--border-subtle)',
                          background: stockType === 'OWN' ? 'var(--primary-blue-light)' : '#FFFFFF',
                          fontWeight: 600,
                          fontSize: '12px',
                          color: stockType === 'OWN' ? 'var(--primary-blue)' : 'var(--text-secondary)'
                        }}
                      >
                        Own Stock ({selectedProduct.ownStock} left)
                      </button>
                      <button
                        type="button"
                        onClick={() => setStockType('COMMISSION')}
                        style={{
                          padding: '8px',
                          borderRadius: 'var(--radius-md)',
                          border: stockType === 'COMMISSION' ? '2px solid var(--primary-orange)' : '1px solid var(--border-subtle)',
                          background: stockType === 'COMMISSION' ? 'var(--primary-orange-light)' : '#FFFFFF',
                          fontWeight: 600,
                          fontSize: '12px',
                          color: stockType === 'COMMISSION' ? 'var(--primary-orange)' : 'var(--text-secondary)'
                        }}
                      >
                        Commission ({selectedProduct.commissionStock} left)
                      </button>
                    </div>
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div className="form-group">
                    <label className="form-label">Quantity Lost *</label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Incident Reason *</label>
                    <select
                      value={reason}
                      onChange={(e) => setReason(e.target.value as any)}
                      className="form-select"
                    >
                      {REASONS.map(r => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Date *</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Notes (Damage description)</label>
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="form-input"
                    placeholder="e.g. Broken cover spine during shelf restocking"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Deduct & Log Wastage
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
