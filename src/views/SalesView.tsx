import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  ShoppingCart,
  Search,
  Plus,
  Minus,
  Trash2,
  Printer,
  CheckCircle2,
  Receipt,
  User,
  CreditCard,
  QrCode,
  Banknote,
  Percent,
  X,
  Eye,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useDatabase } from '../context/DatabaseContext';
import { Product, StockType, Sale } from '../types';
import { formatCurrency, formatDateTime } from '../utils/formatters';

interface CartItem {
  productId: string;
  name: string;
  sku: string;
  unit: string;
  stockType: StockType;
  quantity: number;
  unitPrice: number;
  discount: number;
  availableOwnStock: number;
  availableCommStock: number;
}

export const SalesView: React.FC = () => {
  const { products, sales, createSale, deleteSale, settings, currentIntern } = useDatabase();

  const [activeTab, setActiveTab] = useState<'pos' | 'history'>('pos');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // POS Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isWalkIn, setIsWalkIn] = useState(true);
  const [customerName, setCustomerName] = useState('Walk-in Student');
  const [customerPhone, setCustomerPhone] = useState('');
  const [overallDiscount, setOverallDiscount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'UPI' | 'CARD'>('CASH');
  const [notes, setNotes] = useState('');

  // Receipt Modal State
  const [activeReceipt, setActiveReceipt] = useState<Sale | null>(null);

  // Add product to cart
  const handleAddToCart = (product: Product) => {
    const totalAvail = product.ownStock + product.commissionStock;
    if (totalAvail <= 0) {
      alert('This product is out of stock!');
      return;
    }

    // Default to OWN if available, else COMMISSION
    const preferredType: StockType = product.ownStock > 0 ? 'OWN' : 'COMMISSION';

    const existingIdx = cart.findIndex(
      it => it.productId === product.id && it.stockType === preferredType
    );

    if (existingIdx >= 0) {
      const current = cart[existingIdx];
      const maxForType = preferredType === 'OWN' ? product.ownStock : product.commissionStock;
      if (current.quantity < maxForType) {
        const updated = [...cart];
        updated[existingIdx].quantity += 1;
        setCart(updated);
      } else {
        alert(`Cannot exceed available ${preferredType} stock (${maxForType})`);
      }
    } else {
      setCart([
        ...cart,
        {
          productId: product.id,
          name: product.name,
          sku: product.sku,
          unit: product.unit || 'pcs',
          stockType: preferredType,
          quantity: 1,
          unitPrice: product.sellingRate,
          discount: 0,
          availableOwnStock: product.ownStock,
          availableCommStock: product.commissionStock
        }
      ]);
    }
  };

  // Switch stock source for an item in cart
  const handleToggleStockType = (index: number, newType: StockType) => {
    const item = cart[index];
    const max = newType === 'OWN' ? item.availableOwnStock : item.availableCommStock;
    if (max <= 0) {
      alert(`No ${newType} stock available for this product.`);
      return;
    }

    const updated = [...cart];
    updated[index] = {
      ...item,
      stockType: newType,
      quantity: Math.min(item.quantity, max)
    };
    setCart(updated);
  };

  const handleUpdateQty = (index: number, delta: number) => {
    const item = cart[index];
    const max = item.stockType === 'OWN' ? item.availableOwnStock : item.availableCommStock;
    const newQty = item.quantity + delta;

    if (newQty <= 0) {
      setCart(cart.filter((_, i) => i !== index));
      return;
    }

    if (newQty > max) {
      alert(`Cannot add more than available ${item.stockType} stock (${max})`);
      return;
    }

    const updated = [...cart];
    updated[index].quantity = newQty;
    setCart(updated);
  };

  const handleRemoveFromCart = (index: number) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  // Financial calculations
  const subtotal = cart.reduce((sum, it) => sum + (it.quantity * it.unitPrice), 0);
  const grandTotal = Math.max(0, subtotal - overallDiscount);

  // Live Commission vs Own projection for the intern
  const cartFinancials = cart.reduce((acc, it) => {
    const lineVal = it.quantity * it.unitPrice;
    if (it.stockType === 'COMMISSION') {
      const comm = (lineVal * settings.defaultCommissionRate) / 100;
      acc.commissionSales += lineVal;
      acc.commissionEarned += comm;
      acc.ownerPayout += (lineVal - comm);
    } else {
      acc.ownSales += lineVal;
    }
    return acc;
  }, { ownSales: 0, commissionSales: 0, commissionEarned: 0, ownerPayout: 0 });

  // Complete Sale
  const handleCompleteSale = () => {
    if (cart.length === 0) return;

    try {
      const newSale = createSale({
        customerName: isWalkIn ? 'Walk-in Student' : (customerName || 'Walk-in Student'),
        customerPhone: isWalkIn ? undefined : customerPhone,
        isWalkIn,
        items: cart.map(it => ({
          productId: it.productId,
          stockType: it.stockType,
          quantity: it.quantity,
          unitPrice: it.unitPrice,
          discount: it.discount
        })),
        discount: overallDiscount,
        paymentMethod,
        notes
      });

      // Confetti celebration
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 }
        });
      } catch (e) {}

      // Reset cart and open receipt
      setCart([]);
      setOverallDiscount(0);
      setNotes('');
      if (isWalkIn) {
        setCustomerName('Walk-in Student');
        setCustomerPhone('');
      }
      setActiveReceipt(newSale);
    } catch (e) {
      console.error(e);
      alert('Error completing sale');
    }
  };

  // Filter products for catalog picker
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="page-wrapper">
      {/* Header with POS vs History tab toggle */}
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
            Sales & Billing Terminal
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Fast daily billing for walk-in students and faculty
          </p>
        </div>

        <div style={{
          display: 'flex',
          background: '#FFFFFF',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '3px',
          boxShadow: 'var(--shadow-xs)'
        }}>
          <button
            onClick={() => setActiveTab('pos')}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '12.5px',
              fontWeight: activeTab === 'pos' ? 600 : 500,
              background: activeTab === 'pos' ? 'var(--primary-orange)' : 'transparent',
              color: activeTab === 'pos' ? '#FFFFFF' : 'var(--text-secondary)'
            }}
          >
            Terminal (New Bill)
          </button>
          <button
            onClick={() => setActiveTab('history')}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '12.5px',
              fontWeight: activeTab === 'history' ? 600 : 500,
              background: activeTab === 'history' ? 'var(--primary-orange)' : 'transparent',
              color: activeTab === 'history' ? '#FFFFFF' : 'var(--text-secondary)'
            }}
          >
            Sales Register ({sales.length})
          </button>
        </div>
      </div>

      {activeTab === 'pos' ? (
        /* POS Layout: Left Product Picker, Right Cart Terminal */
        <div className="pos-layout-grid">
          {/* Left: Product Picker */}
          <div>
            {/* Search & Category Filter */}
            <div className="pos-filter-container">
              <div className="pos-search-wrapper">
                <input
                  type="text"
                  placeholder="Search products by name or code..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '32px', fontSize: '13px' }}
                />
                <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="form-select pos-category-select"
              >
                <option value="ALL">All Categories</option>
                {settings.categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Product Cards Grid */}
            <div className="pos-products-grid">
              {filteredProducts.map(prod => {
                const totalStock = prod.ownStock + prod.commissionStock;
                const isOut = totalStock <= 0;

                return (
                  <div
                    key={prod.id}
                    onClick={() => !isOut && handleAddToCart(prod)}
                    className="tk-card"
                    style={{
                      padding: '10px',
                      cursor: isOut ? 'not-allowed' : 'pointer',
                      opacity: isOut ? 0.6 : 1,
                      display: 'flex',
                      flexDirection: 'column',
                      border: '1px solid var(--border-subtle)',
                      transition: 'transform 0.1s ease, border-color 0.1s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (!isOut) {
                        e.currentTarget.style.borderColor = 'var(--primary-orange)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isOut) {
                        e.currentTarget.style.borderColor = 'var(--border-subtle)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }
                    }}
                  >
                    <div style={{ height: '90px', borderRadius: '6px', overflow: 'hidden', marginBottom: '8px', background: '#F1F5F9' }}>
                      <img src={prod.mainImage} alt={prod.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>

                    <div style={{ fontSize: '10.5px', color: 'var(--text-light)', textTransform: 'uppercase' }}>
                      {prod.category.split(' ')[0]}
                    </div>
                    <div style={{
                      fontSize: '12.5px',
                      fontWeight: 700,
                      color: 'var(--text-main)',
                      lineHeight: 1.25,
                      marginBottom: '6px',
                      flex: 1
                    }}>
                      {prod.name}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                      <span style={{ fontSize: '13.5px', fontWeight: 800, color: 'var(--primary-orange)' }}>
                        {formatCurrency(prod.sellingRate)}
                      </span>
                      {isOut ? (
                        <span className="badge badge-danger" style={{ fontSize: '9.5px' }}>Out</span>
                      ) : (
                        <div style={{ display: 'flex', gap: '4px' }}>
                          {prod.ownStock > 0 && (
                            <span className="badge badge-own" style={{ fontSize: '9px', padding: '2px 5px' }}>
                              Own:{prod.ownStock}
                            </span>
                          )}
                          {prod.commissionStock > 0 && (
                            <span className="badge badge-commission" style={{ fontSize: '9px', padding: '2px 5px' }}>
                              Comm:{prod.commissionStock}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Cart & Order Billing Terminal */}
          <div className="tk-card pos-cart-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid var(--border-light)', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShoppingCart size={18} color="var(--primary-orange)" />
                <span style={{ fontSize: '15px', fontWeight: 700 }}>Current Bill</span>
              </div>
              {cart.length > 0 && (
                <button onClick={() => setCart([])} className="btn-ghost" style={{ fontSize: '11.5px', color: 'var(--danger)' }}>
                  Clear Cart
                </button>
              )}
            </div>

            {/* Customer Toggle (Default Walk-in) */}
            <div style={{ marginBottom: '14px', background: '#F8FAFC', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: isWalkIn ? 0 : '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <User size={15} color="var(--primary-blue)" />
                  <span style={{ fontSize: '12.5px', fontWeight: 600 }}>Customer:</span>
                  <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                    {isWalkIn ? 'Walk-in Student' : 'Registered / Named'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsWalkIn(!isWalkIn)}
                  style={{ fontSize: '11px', color: 'var(--primary-blue)', fontWeight: 600 }}
                >
                  {isWalkIn ? '+ Add Name / Phone' : 'Reset to Walk-in'}
                </button>
              </div>

              {!isWalkIn && (
                <div className="pos-customer-inputs">
                  <input
                    type="text"
                    placeholder="Student / Parent Name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="form-input"
                    style={{ fontSize: '12px' }}
                  />
                  <input
                    type="text"
                    placeholder="Phone (Optional)"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="form-input"
                    style={{ fontSize: '12px' }}
                  />
                </div>
              )}
            </div>

            {/* Cart Items List */}
            {cart.length === 0 ? (
              <div style={{ padding: '40px 10px', textAlign: 'center', color: 'var(--text-light)' }}>
                <ShoppingCart size={32} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                <p style={{ fontSize: '13px' }}>Cart is empty</p>
                <p style={{ fontSize: '11.5px', marginTop: '2px' }}>Click products on the left to add to bill</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '250px', overflowY: 'auto', marginBottom: '16px', paddingRight: '4px' }}>
                {cart.map((item, idx) => (
                  <div
                    key={`${item.productId}-${item.stockType}`}
                    style={{
                      padding: '10px',
                      background: '#F8FAFC',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-light)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ fontSize: '13px', color: 'var(--text-main)' }}>{item.name}</strong>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--primary-orange)' }}>
                        {formatCurrency(item.quantity * item.unitPrice)}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      {/* Stock Source Selector (Own vs Commission) */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <button
                          type="button"
                          onClick={() => handleToggleStockType(idx, 'OWN')}
                          style={{
                            padding: '2px 7px',
                            borderRadius: '4px',
                            fontSize: '10.5px',
                            fontWeight: item.stockType === 'OWN' ? 700 : 500,
                            background: item.stockType === 'OWN' ? 'var(--primary-blue)' : '#FFFFFF',
                            color: item.stockType === 'OWN' ? '#FFFFFF' : 'var(--text-muted)',
                            border: '1px solid var(--border-subtle)'
                          }}
                        >
                          Own ({item.availableOwnStock})
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleStockType(idx, 'COMMISSION')}
                          style={{
                            padding: '2px 7px',
                            borderRadius: '4px',
                            fontSize: '10.5px',
                            fontWeight: item.stockType === 'COMMISSION' ? 700 : 500,
                            background: item.stockType === 'COMMISSION' ? 'var(--primary-orange)' : '#FFFFFF',
                            color: item.stockType === 'COMMISSION' ? '#FFFFFF' : 'var(--text-muted)',
                            border: '1px solid var(--border-subtle)'
                          }}
                        >
                          Commission ({item.availableCommStock})
                        </button>
                      </div>

                      {/* Quantity Stepper */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={() => handleUpdateQty(idx, -1)}
                          style={{ width: '24px', height: '24px', borderRadius: '4px', background: '#FFFFFF', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <Minus size={12} />
                        </button>
                        <span style={{ fontSize: '13px', fontWeight: 700, minWidth: '20px', textAlign: 'center' }}>
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUpdateQty(idx, 1)}
                          style={{ width: '24px', height: '24px', borderRadius: '4px', background: '#FFFFFF', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <Plus size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveFromCart(idx)}
                          style={{ color: 'var(--text-light)', padding: '2px 4px', marginLeft: '4px' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Payment Method Selector */}
            <div style={{ marginBottom: '14px' }}>
              <label className="form-label">Payment Method</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                {(['CASH', 'UPI', 'CARD'] as const).map(pm => {
                  const active = paymentMethod === pm;
                  return (
                    <button
                      key={pm}
                      type="button"
                      onClick={() => setPaymentMethod(pm)}
                      style={{
                        padding: '7px 4px',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '12px',
                        fontWeight: active ? 700 : 500,
                        background: active ? '#0F172A' : '#FFFFFF',
                        color: active ? '#FFFFFF' : 'var(--text-secondary)',
                        border: active ? '1px solid #0F172A' : '1px solid var(--border-subtle)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '5px'
                      }}
                    >
                      {pm === 'CASH' && <Banknote size={14} />}
                      {pm === 'UPI' && <QrCode size={14} />}
                      {pm === 'CARD' && <CreditCard size={14} />}
                      <span>{pm}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Discount field */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>Discount (₹):</span>
              <input
                type="number"
                min="0"
                value={overallDiscount}
                onChange={(e) => setOverallDiscount(Number(e.target.value))}
                className="form-input"
                style={{ width: '90px', padding: '4px 8px', textAlign: 'right', fontSize: '13px' }}
              />
            </div>

            {/* Financial Summary */}
            <div style={{
              background: '#F8FAFC',
              borderRadius: 'var(--radius-md)',
              padding: '12px',
              border: '1px solid var(--border-subtle)',
              marginBottom: '16px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '4px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Subtotal:</span>
                <span style={{ fontWeight: 600 }}>{formatCurrency(subtotal)}</span>
              </div>
              {overallDiscount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--danger)' }}>Discount:</span>
                  <span style={{ fontWeight: 600, color: 'var(--danger)' }}>- {formatCurrency(overallDiscount)}</span>
                </div>
              )}
              <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', fontWeight: 800 }}>Grand Total:</span>
                <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--primary-orange)' }}>
                  {formatCurrency(grandTotal)}
                </span>
              </div>

              {/* Commission calculation preview for intern */}
              {cartFinancials.commissionSales > 0 && (
                <div style={{ marginTop: '8px', paddingTop: '6px', borderTop: '1px dashed #CBD5E1', fontSize: '11px', color: 'var(--text-muted)' }}>
                  Includes ₹{cartFinancials.commissionSales} commission items &rarr; 
                  <strong style={{ color: 'var(--primary-orange)' }}> Thinkaroo Earns 10% (₹{cartFinancials.commissionEarned})</strong>, 
                  Owner payout is ₹{cartFinancials.ownerPayout}.
                </div>
              )}
            </div>

            {/* Complete Sale Button */}
            <button
              onClick={handleCompleteSale}
              disabled={cart.length === 0}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '12px',
                justifyContent: 'center',
                fontSize: '14.5px',
                fontWeight: 700,
                opacity: cart.length === 0 ? 0.5 : 1,
                cursor: cart.length === 0 ? 'not-allowed' : 'pointer'
              }}
            >
              <span>Complete Sale & Generate Bill</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      ) : (
        /* Sales Register / History Table */
        <div className="tk-table-container">
          <table className="tk-table">
            <thead>
              <tr>
                <th>Bill #</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Items Sold</th>
                <th>Own Share</th>
                <th>Comm Share</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Intern</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sales.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-light)' }}>
                    No sales recorded yet
                  </td>
                </tr>
              ) : (
                sales.map(sale => (
                  <tr key={sale.id}>
                    <td>
                      <strong style={{ fontSize: '13px', color: 'var(--text-main)' }}>{sale.billNumber}</strong>
                    </td>
                    <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {sale.date}
                    </td>
                    <td>
                      <div style={{ fontSize: '13px', fontWeight: 600 }}>{sale.customerName}</div>
                      {sale.customerPhone && <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{sale.customerPhone}</div>}
                    </td>
                    <td>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        {sale.items.map(it => `${it.productName} (${it.quantity} ${it.stockType})`).join(', ')}
                      </div>
                    </td>
                    <td style={{ fontSize: '12px', color: 'var(--primary-blue)', fontWeight: 600 }}>
                      {formatCurrency(sale.ownSalesTotal)}
                    </td>
                    <td style={{ fontSize: '12px', color: 'var(--primary-orange)', fontWeight: 600 }}>
                      {formatCurrency(sale.commissionSalesTotal)}
                    </td>
                    <td>
                      <strong style={{ fontSize: '13.5px', color: 'var(--primary-orange)' }}>
                        {formatCurrency(sale.total)}
                      </strong>
                    </td>
                    <td>
                      <span className="badge badge-neutral">{sale.paymentMethod}</span>
                    </td>
                    <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{sale.internName}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          onClick={() => setActiveReceipt(sale)}
                          className="btn-secondary"
                          style={{ padding: '4px 8px', fontSize: '12px' }}
                          title="View / Print Receipt"
                        >
                          <Printer size={13} />
                          <span>Receipt</span>
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to void/delete bill ${sale.billNumber}? Stock will be restored.`)) {
                              deleteSale(sale.id);
                            }
                          }}
                          className="btn-ghost"
                          style={{ color: 'var(--danger)', padding: '4px 8px' }}
                          title="Void / Delete Bill"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Printable Receipt Modal */}
      {activeReceipt && (
        <div className="modal-overlay" onClick={() => setActiveReceipt(null)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '420px', background: '#FFFFFF' }}
          >
            <div className="modal-header no-print">
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Receipt size={16} color="var(--primary-orange)" />
                <h3 style={{ fontSize: '15px', fontWeight: 700 }}>Tax Invoice / Bill</h3>
              </div>
              <button onClick={() => setActiveReceipt(null)}>
                <X size={18} color="var(--text-light)" />
              </button>
            </div>

            {/* Printable Receipt Body */}
            <div className="modal-body printable-receipt" style={{ padding: '24px 20px', fontSize: '12.5px' }}>
              {/* Header */}
              <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                <img src="/thinkaroo-logo.png" alt="Thinkaroo" style={{ width: '48px', height: '48px', margin: '0 auto 6px', objectFit: 'contain' }} />
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--primary-orange)', margin: 0 }}>
                  THINKAROO
                </h2>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--primary-blue)', textTransform: 'uppercase' }}>
                  {settings.schoolName}
                </div>
                <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {settings.tagline}
                </div>
                <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
                  {settings.address} • Ph: {settings.phone}
                </div>
              </div>

              {/* Invoice Meta */}
              <div style={{
                borderTop: '1px dashed #CBD5E1',
                borderBottom: '1px dashed #CBD5E1',
                padding: '8px 0',
                marginBottom: '12px',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '4px',
                fontSize: '11px'
              }}>
                <div><strong>Bill No:</strong> {activeReceipt.billNumber}</div>
                <div style={{ textAlign: 'right' }}><strong>Date:</strong> {formatDateTime(activeReceipt.createdAt)}</div>
                <div><strong>Customer:</strong> {activeReceipt.customerName}</div>
                <div style={{ textAlign: 'right' }}><strong>Intern:</strong> {activeReceipt.internName}</div>
                <div><strong>Payment:</strong> {activeReceipt.paymentMethod}</div>
                <div style={{ textAlign: 'right' }}><strong>Status:</strong> PAID</div>
              </div>

              {/* Line Items Table */}
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '14px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #E2E8F0', fontSize: '11px', color: 'var(--text-muted)', textAlign: 'left' }}>
                    <th style={{ padding: '4px 0' }}>Item</th>
                    <th style={{ padding: '4px 0', textAlign: 'center' }}>Qty</th>
                    <th style={{ padding: '4px 0', textAlign: 'right' }}>Rate</th>
                    <th style={{ padding: '4px 0', textAlign: 'right' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {activeReceipt.items.map(item => (
                    <tr key={item.id} style={{ borderBottom: '1px dotted #F1F5F9', fontSize: '12px' }}>
                      <td style={{ padding: '6px 0' }}>
                        <div>{item.productName}</div>
                        <span style={{ fontSize: '9.5px', color: item.stockType === 'OWN' ? 'var(--primary-blue)' : 'var(--primary-orange)' }}>
                          [{item.stockType}]
                        </span>
                      </td>
                      <td style={{ padding: '6px 0', textAlign: 'center' }}>{item.quantity}</td>
                      <td style={{ padding: '6px 0', textAlign: 'right' }}>₹{item.unitPrice}</td>
                      <td style={{ padding: '6px 0', textAlign: 'right', fontWeight: 600 }}>₹{item.lineTotal}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals Summary */}
              <div style={{ borderTop: '1px dashed #CBD5E1', paddingTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span>Subtotal:</span>
                  <span>{formatCurrency(activeReceipt.subtotal)}</span>
                </div>
                {activeReceipt.discount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--danger)' }}>
                    <span>Discount:</span>
                    <span>- {formatCurrency(activeReceipt.discount)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: 800, borderTop: '1px solid #E2E8F0', paddingTop: '6px' }}>
                  <span>Total Amount Paid:</span>
                  <span style={{ color: 'var(--primary-orange)' }}>{formatCurrency(activeReceipt.total)}</span>
                </div>
              </div>

              {/* Footer */}
              <div style={{ textAlign: 'center', marginTop: '20px', paddingTop: '12px', borderTop: '1px dashed #CBD5E1' }}>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                  "{settings.billFooterMessage}"
                </p>
                <div style={{ fontSize: '10px', color: 'var(--text-light)', marginTop: '4px' }}>
                  Computer generated bill • Thinkaroo Student Management System
                </div>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="modal-footer no-print">
              <button onClick={() => setActiveReceipt(null)} className="btn-secondary">
                Close
              </button>
              <button onClick={() => window.print()} className="btn-primary">
                <Printer size={15} />
                <span>Print Bill</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
