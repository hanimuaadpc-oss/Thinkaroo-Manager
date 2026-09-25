import React, { useState } from 'react';
import {
  Truck,
  Plus,
  Search,
  Package,
  CheckCircle,
  Calendar,
  DollarSign,
  UserCheck,
  X,
  Trash2,
  ChevronDown
} from 'lucide-react';
import { useDatabase } from '../context/DatabaseContext';
import { Purchase, StockType } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';

export const PurchaseView: React.FC = () => {
  const { purchases, products, addPurchase, currentIntern, settings } = useDatabase();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [purchaseType, setPurchaseType] = useState<StockType>('OWN');
  const [supplierOrOwner, setSupplierOrOwner] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().slice(0, 10));
  const [commissionRate, setCommissionRate] = useState<number>(settings.defaultCommissionRate || 10);
  const [notes, setNotes] = useState('');
  
  // Selected items in intake (allows typing or selecting product)
  const [items, setItems] = useState<{ productId: string; productName: string; quantity: number; purchaseRate: number }[]>([
    {
      productId: products[0]?.id || '',
      productName: products[0]?.name || '',
      quantity: 10,
      purchaseRate: products[0]?.purchaseRate || 50
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'OWN' | 'COMMISSION'>('ALL');

  // Handle open add modal
  const handleOpenAdd = (type: StockType = 'OWN') => {
    setPurchaseType(type);
    setSupplierOrOwner(type === 'OWN' ? 'National Wholesale Stationery' : 'Caliph Art Club (Student Maker)');
    setPurchaseDate(new Date().toISOString().slice(0, 10));
    setCommissionRate(settings.defaultCommissionRate || 10);
    setNotes('');
    const defaultProd = products[0];
    setItems([
      {
        productId: defaultProd?.id || '',
        productName: defaultProd?.name || '',
        quantity: 10,
        purchaseRate: defaultProd?.purchaseRate || 50
      }
    ]);
    setIsModalOpen(true);
  };

  // Item row operations
  const handleAddItemRow = () => {
    setItems([
      ...items,
      { productId: '', productName: '', quantity: 1, purchaseRate: 0 }
    ]);
  };

  const handleRemoveItemRow = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  const handleItemChange = (idx: number, field: string, val: any) => {
    const updated = [...items];
    if (field === 'productName') {
      const typedName = String(val);
      const matchedProd = products.find(p => p.name.toLowerCase() === typedName.trim().toLowerCase());
      updated[idx] = {
        ...updated[idx],
        productName: typedName,
        productId: matchedProd ? matchedProd.id : '',
        purchaseRate: matchedProd ? matchedProd.purchaseRate : updated[idx].purchaseRate || 0
      };
    } else {
      updated[idx] = {
        ...updated[idx],
        [field]: val
      };
    }
    setItems(updated);
  };

  // Submit purchase
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validItems = items.filter(it => it.productName.trim().length > 0);
    if (!supplierOrOwner.trim() || validItems.length === 0) return;

    const formattedItems = validItems.map(it => {
      const prod = products.find(p => p.id === it.productId || p.name.toLowerCase() === it.productName.trim().toLowerCase());
      return {
        productId: prod?.id || it.productId || '',
        productName: it.productName.trim(),
        quantity: Number(it.quantity),
        purchaseRate: Number(it.purchaseRate),
        total: Number(it.quantity) * Number(it.purchaseRate)
      };
    });

    const totalAmount = formattedItems.reduce((acc, it) => acc + it.total, 0);

    addPurchase({
      type: purchaseType,
      supplierOrOwner: supplierOrOwner.trim(),
      date: purchaseDate,
      commissionRate: purchaseType === 'COMMISSION' ? Number(commissionRate) : undefined,
      items: formattedItems,
      totalAmount,
      status: 'RECEIVED',
      notes: notes.trim(),
      receivedByIntern: currentIntern?.name || 'Intern'
    });

    setIsModalOpen(false);
  };

  // Filtered purchases
  const filteredPurchases = purchases.filter(p => {
    const matchesSearch = p.purchaseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.supplierOrOwner.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'ALL' || p.type === filterType;
    return matchesSearch && matchesType;
  });

  const totalOwnPurchases = purchases
    .filter(p => p.type === 'OWN')
    .reduce((sum, p) => sum + p.totalAmount, 0);

  const totalCommPurchases = purchases
    .filter(p => p.type === 'COMMISSION')
    .reduce((sum, p) => sum + p.totalAmount, 0);

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
            Purchases & Intake
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Receive goods into Own Stock or Commission Stock
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => handleOpenAdd('OWN')} className="btn-blue">
            <Plus size={15} />
            <span>+ Own Purchase</span>
          </button>
          <button onClick={() => handleOpenAdd('COMMISSION')} className="btn-primary">
            <Plus size={15} />
            <span>+ Commission Purchase</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '14px',
        marginBottom: '20px'
      }}>
        <div className="tk-card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
            Total Intake Value
          </div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-main)' }}>
            {formatCurrency(totalOwnPurchases + totalCommPurchases)}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-light)', marginTop: '4px' }}>
            {purchases.length} total shipments received
          </div>
        </div>

        <div className="tk-card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--primary-blue)' }}>Own Purchases</span>
            <span className="badge badge-own">Own Stock</span>
          </div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--primary-blue)' }}>
            {formatCurrency(totalOwnPurchases)}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Direct Thinkaroo capital
          </div>
        </div>

        <div className="tk-card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--primary-orange)' }}>Commission Consignments</span>
            <span className="badge badge-commission">10% Comm</span>
          </div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--primary-orange)' }}>
            {formatCurrency(totalCommPurchases)}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Consigned by student makers/clubs
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '16px'
      }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          {(['ALL', 'OWN', 'COMMISSION'] as const).map(t => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-md)',
                fontSize: '12.5px',
                fontWeight: filterType === t ? 600 : 500,
                background: filterType === t ? '#0F172A' : '#FFFFFF',
                color: filterType === t ? '#FFFFFF' : 'var(--text-secondary)',
                border: filterType === t ? '1px solid #0F172A' : '1px solid var(--border-subtle)'
              }}
            >
              {t === 'ALL' ? 'All Purchases' : t === 'OWN' ? 'Own Purchases' : 'Commission Consignments'}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', width: '240px' }}>
          <input
            type="text"
            placeholder="Search PO # or Supplier..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '32px', fontSize: '13px' }}
          />
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
        </div>
      </div>

      {/* Purchases Table */}
      <div className="tk-table-container">
        <table className="tk-table">
          <thead>
            <tr>
              <th>PO Number</th>
              <th>Date</th>
              <th>Type</th>
              <th>Supplier / Owner</th>
              <th>Items Received</th>
              <th>Total Value</th>
              <th>Received By</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredPurchases.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-light)' }}>
                  No purchases recorded yet
                </td>
              </tr>
            ) : (
              filteredPurchases.map(p => (
                <tr key={p.id}>
                  <td>
                    <strong style={{ fontSize: '13px', color: 'var(--text-main)' }}>{p.purchaseNumber}</strong>
                  </td>
                  <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{formatDate(p.date)}</td>
                  <td>
                    {p.type === 'OWN' ? (
                      <span className="badge badge-own">Own Purchase</span>
                    ) : (
                      <span className="badge badge-commission">Commission ({p.commissionRate || 10}%)</span>
                    )}
                  </td>
                  <td>
                    <div style={{ fontSize: '13px', fontWeight: 600 }}>{p.supplierOrOwner}</div>
                    {p.notes && <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{p.notes}</div>}
                  </td>
                  <td>
                    <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                      {p.items.map(it => `${it.productName} (${it.quantity})`).join(', ')}
                    </div>
                  </td>
                  <td>
                    <strong style={{ fontSize: '13.5px', color: p.type === 'OWN' ? 'var(--primary-blue)' : 'var(--primary-orange)' }}>
                      {formatCurrency(p.totalAmount)}
                    </strong>
                  </td>
                  <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{p.receivedByIntern}</td>
                  <td>
                    <span className="badge badge-success">Received</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Purchase Modal with TWO CLEAR CHOICES */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
            <div className="modal-header">
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Record Product Intake</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Choose purchase type to correctly route stock into Own vs Commission
                </p>
              </div>
              <button onClick={() => setIsModalOpen(false)}>
                <X size={18} color="var(--text-light)" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {/* Two Clear Choices at the Top */}
                <div style={{ marginBottom: '18px' }}>
                  <label className="form-label">Purchase Type (Stock Destination) *</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setPurchaseType('OWN');
                        setSupplierOrOwner('National Wholesale Mart');
                      }}
                      style={{
                        padding: '12px',
                        borderRadius: 'var(--radius-md)',
                        border: purchaseType === 'OWN' ? '2px solid var(--primary-blue)' : '1px solid var(--border-subtle)',
                        background: purchaseType === 'OWN' ? 'var(--primary-blue-light)' : '#FFFFFF',
                        textAlign: 'left'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                        <span className="badge badge-own" style={{ fontSize: '10px' }}>OWN PURCHASE</span>
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>
                        Thinkaroo Owned
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        Adds directly to Own Stock.
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setPurchaseType('COMMISSION');
                        setSupplierOrOwner('Caliph Art Guild (Owner: Tariq)');
                      }}
                      style={{
                        padding: '12px',
                        borderRadius: 'var(--radius-md)',
                        border: purchaseType === 'COMMISSION' ? '2px solid var(--primary-orange)' : '1px solid var(--border-subtle)',
                        background: purchaseType === 'COMMISSION' ? 'var(--primary-orange-light)' : '#FFFFFF',
                        textAlign: 'left'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                        <span className="badge badge-commission" style={{ fontSize: '10px' }}>COMMISSION PURCHASE</span>
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>
                        Third-Party / Consignment
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        10% Thinkaroo commission on sale.
                      </div>
                    </button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">
                      {purchaseType === 'OWN' ? 'Supplier Name *' : 'Consignment Owner / Student Club *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={supplierOrOwner}
                      onChange={(e) => setSupplierOrOwner(e.target.value)}
                      className="form-input"
                      placeholder={purchaseType === 'OWN' ? 'e.g. Paper Mart Ltd' : 'e.g. Art Club (Sara)'}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Intake Date *</label>
                    <input
                      type="date"
                      required
                      value={purchaseDate}
                      onChange={(e) => setPurchaseDate(e.target.value)}
                      className="form-input"
                    />
                  </div>
                </div>

                {purchaseType === 'COMMISSION' && (
                  <div className="form-group" style={{ background: 'var(--primary-orange-light)', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--primary-orange-border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <label className="form-label" style={{ color: 'var(--primary-orange)', margin: 0 }}>
                        Agreed Commission Rate (%)
                      </label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <input
                          type="number"
                          min="1"
                          max="100"
                          value={commissionRate}
                          onChange={(e) => setCommissionRate(Number(e.target.value))}
                          className="form-input"
                          style={{ width: '80px', padding: '4px 8px', textAlign: 'center', fontWeight: 700 }}
                        />
                        <span style={{ fontSize: '13px', fontWeight: 700 }}>%</span>
                      </div>
                    </div>
                    <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      Default is 10%. Thinkaroo will earn {commissionRate}% from total sales value when sold.
                    </p>
                  </div>
                )}

                {/* Items List */}
                <div style={{ marginTop: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <label className="form-label" style={{ margin: 0 }}>Items in Shipment</label>
                    <button type="button" onClick={handleAddItemRow} className="btn-ghost" style={{ fontSize: '12px', color: 'var(--primary-blue)' }}>
                      + Add Item
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {items.map((row, idx) => {
                      const isExisting = products.some(
                        p => (row.productId && p.id === row.productId) || p.name.toLowerCase() === row.productName.trim().toLowerCase()
                      );
                      return (
                        <div
                          key={idx}
                          style={{
                            background: '#F8FAFC',
                            padding: '10px 12px',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--border-light)'
                          }}
                        >
                          <div
                            style={{
                              display: 'grid',
                              gridTemplateColumns: '2fr 1fr 1fr auto',
                              gap: '8px',
                              alignItems: 'center'
                            }}
                          >
                            <div style={{ position: 'relative' }}>
                              <input
                                type="text"
                                list={`product-options-${idx}`}
                                value={row.productName}
                                onChange={(e) => handleItemChange(idx, 'productName', e.target.value)}
                                placeholder="Type or select product..."
                                className="form-input"
                                style={{ fontSize: '12.5px' }}
                                required
                              />
                              <datalist id={`product-options-${idx}`}>
                                {products.map(p => (
                                  <option key={p.id} value={p.name}>
                                    {p.name} ({p.unit} - Current Rate: ₹{p.purchaseRate})
                                  </option>
                                ))}
                              </datalist>
                            </div>

                            <input
                              type="number"
                              min="1"
                              value={row.quantity || ''}
                              placeholder="Qty"
                              onChange={(e) => handleItemChange(idx, 'quantity', Number(e.target.value))}
                              className="form-input"
                              style={{ fontSize: '12.5px' }}
                              required
                            />

                            <input
                              type="number"
                              min="0"
                              value={row.purchaseRate || ''}
                              placeholder="Rate ₹"
                              onChange={(e) => handleItemChange(idx, 'purchaseRate', Number(e.target.value))}
                              className="form-input"
                              style={{ fontSize: '12.5px' }}
                              required
                            />

                            {items.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveItemRow(idx)}
                                style={{ color: 'var(--danger)', padding: '4px', background: 'none', border: 'none', cursor: 'pointer' }}
                                title="Remove Item"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>

                          {row.productName.trim() && (
                            <div
                              style={{
                                marginTop: '6px',
                                fontSize: '11px',
                                fontWeight: 500,
                                color: isExisting ? '#059669' : '#D97706',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              {isExisting ? (
                                <>✓ Existing product in catalog</>
                              ) : (
                                <>✨ New product (will automatically be created in catalog)</>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="form-group" style={{ marginTop: '14px' }}>
                  <label className="form-label">Notes (Optional)</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="form-input"
                    placeholder="e.g. Invoice #104 / Delivered directly to Innovation Lab"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className={purchaseType === 'OWN' ? 'btn-blue' : 'btn-primary'}>
                  Receive & Add to Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
