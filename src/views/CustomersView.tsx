import React, { useState } from 'react';
import {
  Users,
  Search,
  Receipt,
  ShoppingBag,
  Clock,
  Phone,
  Calendar,
  X,
  ChevronRight
} from 'lucide-react';
import { useDatabase } from '../context/DatabaseContext';
import { Customer, Sale } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';

export const CustomersView: React.FC = () => {
  const { customers, sales } = useDatabase();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Filter customers
  const filteredCustomers = customers.filter(c => {
    return c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           (c.phone && c.phone.includes(searchQuery));
  });

  // Past bills for selected customer
  const customerSales: Sale[] = selectedCustomer
    ? sales.filter(s => 
        selectedCustomer.phone ? s.customerPhone === selectedCustomer.phone : s.customerName.toLowerCase() === selectedCustomer.name.toLowerCase()
      )
    : [];

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
            Customers & Purchase Records
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Generated automatically from sales (Walk-in students & parents)
          </p>
        </div>

        <div style={{ position: 'relative', width: '260px' }}>
          <input
            type="text"
            placeholder="Search customer or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '32px', fontSize: '13px' }}
          />
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
        </div>
      </div>

      {/* Customers Table */}
      <div className="tk-table-container">
        <table className="tk-table">
          <thead>
            <tr>
              <th>Customer Name</th>
              <th>Contact Phone</th>
              <th>Total Orders</th>
              <th>Total Spent</th>
              <th>First Visit</th>
              <th>Last Visit</th>
              <th style={{ textAlign: 'right' }}>Purchase History</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-light)' }}>
                  No customer records found
                </td>
              </tr>
            ) : (
              filteredCustomers.map(c => (
                <tr key={c.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '30px',
                        height: '30px',
                        borderRadius: '50%',
                        background: c.isWalkIn ? 'var(--primary-orange-light)' : 'var(--primary-blue-light)',
                        color: c.isWalkIn ? 'var(--primary-orange)' : 'var(--primary-blue)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '12px'
                      }}>
                        {c.name.charAt(0)}
                      </div>
                      <div>
                        <strong style={{ fontSize: '13px', color: 'var(--text-main)' }}>{c.name}</strong>
                        {c.isWalkIn && <span className="badge badge-neutral" style={{ marginLeft: '6px', fontSize: '9.5px' }}>Walk-in</span>}
                      </div>
                    </div>
                  </td>
                  <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {c.phone || '—'}
                  </td>
                  <td>
                    <span className="badge badge-neutral" style={{ fontSize: '11.5px' }}>
                      {c.ordersCount} bills
                    </span>
                  </td>
                  <td>
                    <strong style={{ fontSize: '13.5px', color: 'var(--primary-orange)' }}>
                      {formatCurrency(c.totalSpent)}
                    </strong>
                  </td>
                  <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {formatDate(c.firstVisit)}
                  </td>
                  <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    {formatDate(c.lastVisit)}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      onClick={() => setSelectedCustomer(c)}
                      className="btn-secondary"
                      style={{ padding: '4px 10px', fontSize: '12px' }}
                    >
                      <Receipt size={13} />
                      <span>View Orders</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Customer Order History Modal */}
      {selectedCustomer && (
        <div className="modal-overlay" onClick={() => setSelectedCustomer(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700 }}>
                  Purchase History: {selectedCustomer.name}
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Total Lifetime Spent: {formatCurrency(selectedCustomer.totalSpent)} ({selectedCustomer.ordersCount} bills)
                </p>
              </div>
              <button onClick={() => setSelectedCustomer(null)}>
                <X size={18} color="var(--text-light)" />
              </button>
            </div>

            <div className="modal-body" style={{ maxHeight: '420px' }}>
              {customerSales.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--text-light)', padding: '24px' }}>
                  No bill details found for this customer.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {customerSales.map(sale => (
                    <div
                      key={sale.id}
                      style={{
                        background: '#F8FAFC',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-light)',
                        padding: '12px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <div>
                          <strong style={{ fontSize: '13px', color: 'var(--text-main)' }}>{sale.billNumber}</strong>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '8px' }}>
                            {formatDate(sale.date)}
                          </span>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <strong style={{ fontSize: '14px', color: 'var(--primary-orange)' }}>
                            {formatCurrency(sale.total)}
                          </strong>
                          <span className="badge badge-neutral" style={{ marginLeft: '6px', fontSize: '10px' }}>
                            {sale.paymentMethod}
                          </span>
                        </div>
                      </div>

                      {/* Items */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', borderTop: '1px dotted #E2E8F0', paddingTop: '6px' }}>
                        {sale.items.map(it => (
                          <div key={it.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)' }}>
                            <span>
                              {it.quantity}x {it.productName} 
                              <span style={{ fontSize: '10px', color: it.stockType === 'OWN' ? 'var(--primary-blue)' : 'var(--primary-orange)', marginLeft: '4px' }}>
                                [{it.stockType}]
                              </span>
                            </span>
                            <span>{formatCurrency(it.lineTotal)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button onClick={() => setSelectedCustomer(null)} className="btn-secondary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
