import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  Download,
  Calendar,
  DollarSign,
  TrendingUp,
  Receipt,
  Truck,
  Boxes,
  AlertTriangle,
  FileSpreadsheet,
  PieChart,
  Eye,
  Printer,
  X
} from 'lucide-react';
import { useDatabase } from '../context/DatabaseContext';
import { formatCurrency, formatDate, formatDateTime } from '../utils/formatters';
import { exportToCSV } from '../utils/exportUtils';
import { Sale } from '../types';

type ReportTab = 'financial' | 'commission' | 'sales' | 'purchases' | 'stock' | 'expenses' | 'wastage';
type DateFilter = 'all' | 'today' | '7days' | '30days' | 'thisMonth';

export const ReportsView: React.FC = () => {
  const { sales, purchases, expenses, wastages, products, stockMovements, settings } = useDatabase();

  const [activeReport, setActiveReport] = useState<ReportTab>('financial');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [activeReceipt, setActiveReceipt] = useState<Sale | null>(null);

  // Filtered dataset based on selected period
  const filteredData = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);

    const isWithinFilter = (dateStr: string) => {
      if (dateFilter === 'all') return true;
      const d = new Date(dateStr);
      if (dateFilter === 'today') return dateStr.slice(0, 10) === todayStr;
      if (dateFilter === '7days') return (now.getTime() - d.getTime()) / (1000 * 3600 * 24) <= 7;
      if (dateFilter === '30days') return (now.getTime() - d.getTime()) / (1000 * 3600 * 24) <= 30;
      if (dateFilter === 'thisMonth') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      return true;
    };

    const fSales = sales.filter(s => isWithinFilter(s.date || s.createdAt));
    const fPurchases = purchases.filter(p => isWithinFilter(p.date || p.createdAt));
    const fExpenses = expenses.filter(e => isWithinFilter(e.date || e.createdAt));
    const fWastages = wastages.filter(w => isWithinFilter(w.date || w.createdAt));

    const totalSales = fSales.reduce((s, x) => s + x.total, 0);
    const ownSales = fSales.reduce((s, x) => s + x.ownSalesTotal, 0);
    const commissionSales = fSales.reduce((s, x) => s + x.commissionSalesTotal, 0);
    const commissionEarned = fSales.reduce((s, x) => s + x.commissionEarnedTotal, 0);
    const ownerPayout = fSales.reduce((s, x) => s + x.ownerAmountTotal, 0);
    const ownProductProfit = fSales.reduce((s, x) => s + x.netThinkarooProfit, 0) - commissionEarned;

    const totalPurchases = fPurchases.reduce((s, x) => s + x.totalAmount, 0);
    const ownPurchases = fPurchases.filter(p => p.type === 'OWN').reduce((s, x) => s + x.totalAmount, 0);
    const commPurchases = fPurchases.filter(p => p.type === 'COMMISSION').reduce((s, x) => s + x.totalAmount, 0);

    const totalExpenses = fExpenses.reduce((s, x) => s + x.amount, 0);
    const totalWastage = fWastages.reduce((s, x) => s + x.totalLoss, 0);

    const grossMargin = fSales.reduce((s, x) => s + x.netThinkarooProfit, 0);
    const netBusinessResult = grossMargin - totalExpenses - totalWastage;

    return {
      sales: fSales,
      purchases: fPurchases,
      expenses: fExpenses,
      wastages: fWastages,
      totalSales,
      ownSales,
      commissionSales,
      commissionEarned,
      ownerPayout,
      totalPurchases,
      ownPurchases,
      commPurchases,
      totalExpenses,
      totalWastage,
      grossMargin,
      netBusinessResult
    };
  }, [sales, purchases, expenses, wastages, dateFilter]);

  // Export handlers
  const handleExportCSV = () => {
    if (activeReport === 'sales' || activeReport === 'financial') {
      const rows = filteredData.sales.map(s => ({
        BillNumber: s.billNumber,
        Date: s.date,
        Customer: s.customerName,
        PaymentMethod: s.paymentMethod,
        Total: s.total,
        OwnSales: s.ownSalesTotal,
        CommissionSales: s.commissionSalesTotal,
        CommissionEarned: s.commissionEarnedTotal,
        OwnerPayout: s.ownerAmountTotal,
        NetProfit: s.netThinkarooProfit,
        Intern: s.internName
      }));
      exportToCSV('thinkaroo_sales_report', rows);
    } else if (activeReport === 'commission') {
      const rows = filteredData.sales
        .filter(s => s.commissionSalesTotal > 0)
        .map(s => ({
          BillNumber: s.billNumber,
          Date: s.date,
          CommissionSales: s.commissionSalesTotal,
          ThinkarooEarning: s.commissionEarnedTotal,
          ConsignmentOwnerPayout: s.ownerAmountTotal,
          Intern: s.internName
        }));
      exportToCSV('thinkaroo_commission_settlement', rows);
    } else if (activeReport === 'purchases') {
      const rows = filteredData.purchases.map(p => ({
        PONumber: p.purchaseNumber,
        Date: p.date,
        Type: p.type,
        SupplierOrOwner: p.supplierOrOwner,
        TotalAmount: p.totalAmount,
        ReceivedBy: p.receivedByIntern
      }));
      exportToCSV('thinkaroo_purchases_report', rows);
    } else if (activeReport === 'expenses') {
      const rows = filteredData.expenses.map(e => ({
        Date: e.date,
        Category: e.category,
        Amount: e.amount,
        Note: e.note,
        RecordedBy: e.recordedByIntern
      }));
      exportToCSV('thinkaroo_expenses_report', rows);
    } else if (activeReport === 'stock') {
      const rows = products.map(p => ({
        SKU: p.sku,
        Name: p.name,
        Category: p.category,
        SellingRate: p.sellingRate,
        PurchaseRate: p.purchaseRate,
        OwnStock: p.ownStock,
        CommissionStock: p.commissionStock,
        TotalStock: p.ownStock + p.commissionStock,
        Status: p.status
      }));
      exportToCSV('thinkaroo_inventory_report', rows);
    }
  };

  return (
    <div className="page-wrapper">
      {/* Header with Export & Date Filters */}
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
            Financial Reports & Audits
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Caliph Life School Thinkaroo accounting & commission statements
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Date Filter */}
          <div style={{
            display: 'flex',
            background: '#FFFFFF',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '3px'
          }}>
            {(['all', 'today', '7days', '30days', 'thisMonth'] as DateFilter[]).map(df => {
              const labels = { all: 'All', today: 'Today', '7days': '7D', '30days': '30D', thisMonth: 'Month' };
              const active = dateFilter === df;
              return (
                <button
                  key={df}
                  onClick={() => setDateFilter(df)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '11.5px',
                    fontWeight: active ? 600 : 500,
                    background: active ? 'var(--primary-blue)' : 'transparent',
                    color: active ? '#FFFFFF' : 'var(--text-secondary)'
                  }}
                >
                  {labels[df]}
                </button>
              );
            })}
          </div>

          <button onClick={handleExportCSV} className="btn-secondary" style={{ fontSize: '12.5px' }}>
            <Download size={14} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Reports Sub-Navigation */}
      <div style={{
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        paddingBottom: '10px',
        marginBottom: '18px'
      }}>
        {[
          { id: 'financial', label: 'Overall P&L' },
          { id: 'commission', label: 'Commission Summary (10%)' },
          { id: 'sales', label: 'Sales Report' },
          { id: 'purchases', label: 'Purchases (Own vs Comm)' },
          { id: 'stock', label: 'Stock Valuation' },
          { id: 'expenses', label: 'Expenses' },
          { id: 'wastage', label: 'Wastage Loss' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveReport(tab.id as ReportTab)}
            style={{
              padding: '7px 14px',
              borderRadius: 'var(--radius-md)',
              fontSize: '12.5px',
              fontWeight: activeReport === tab.id ? 700 : 500,
              background: activeReport === tab.id ? '#0F172A' : '#FFFFFF',
              color: activeReport === tab.id ? '#FFFFFF' : 'var(--text-secondary)',
              border: activeReport === tab.id ? '1px solid #0F172A' : '1px solid var(--border-subtle)',
              whiteSpace: 'nowrap'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Report Content Panels */}
      {activeReport === 'financial' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Summary Row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '14px'
          }}>
            <div className="tk-card" style={{ padding: '16px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Total Sales Turnover</div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-main)' }}>
                {formatCurrency(filteredData.totalSales)}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-light)', marginTop: '2px' }}>
                {filteredData.sales.length} customer bills
              </div>
            </div>

            <div className="tk-card" style={{ padding: '16px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Thinkaroo Gross Profit</div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--primary-blue)' }}>
                {formatCurrency(filteredData.grossMargin)}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-light)', marginTop: '2px' }}>
                Own profit + 10% commission
              </div>
            </div>

            <div className="tk-card" style={{ padding: '16px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Operating Deductions</div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--danger)' }}>
                - {formatCurrency(filteredData.totalExpenses + filteredData.totalWastage)}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-light)', marginTop: '2px' }}>
                Expenses: {formatCurrency(filteredData.totalExpenses)} | Wastage: {formatCurrency(filteredData.totalWastage)}
              </div>
            </div>

            <div className="tk-card" style={{ padding: '16px', background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#166534', marginBottom: '4px' }}>Net Enterprise Result</div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#166534' }}>
                {formatCurrency(filteredData.netBusinessResult)}
              </div>
              <div style={{ fontSize: '11px', color: '#15803D', marginTop: '2px' }}>
                Surplus generated for school
              </div>
            </div>
          </div>

          {/* Statement Table */}
          <div className="tk-card">
            <div className="tk-card-header">
              <span style={{ fontSize: '14px', fontWeight: 700 }}>Income & Expenditure Statement</span>
              <span className="badge badge-neutral" style={{ fontSize: '11px' }}>Caliph Life School Thinkaroo</span>
            </div>
            <div className="tk-card-body" style={{ padding: 0 }}>
              <table className="tk-table">
                <tbody>
                  <tr>
                    <td><strong>1. Revenue from Own Inventory</strong></td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatCurrency(filteredData.ownSales)}</td>
                  </tr>
                  <tr>
                    <td><strong>2. Revenue from Commission Products (Total Value)</strong></td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatCurrency(filteredData.commissionSales)}</td>
                  </tr>
                  <tr style={{ background: '#F8FAFC' }}>
                    <td><strong style={{ color: 'var(--text-muted)' }}>Less: Consignment Owner Payout (90%)</strong></td>
                    <td style={{ textAlign: 'right', color: 'var(--text-secondary)' }}>- {formatCurrency(filteredData.ownerPayout)}</td>
                  </tr>
                  <tr>
                    <td><strong style={{ color: 'var(--primary-orange)' }}>Add: Thinkaroo Commission Share (10%)</strong></td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--primary-orange)' }}>+ {formatCurrency(filteredData.commissionEarned)}</td>
                  </tr>
                  <tr>
                    <td><strong>3. Operating Expenses</strong></td>
                    <td style={{ textAlign: 'right', color: 'var(--danger)' }}>- {formatCurrency(filteredData.totalExpenses)}</td>
                  </tr>
                  <tr>
                    <td><strong>4. Inventory Wastage & Loss</strong></td>
                    <td style={{ textAlign: 'right', color: 'var(--danger)' }}>- {formatCurrency(filteredData.totalWastage)}</td>
                  </tr>
                  <tr style={{ background: '#F0FDF4', borderTop: '2px solid #BBF7D0' }}>
                    <td style={{ fontSize: '14px', fontWeight: 800, color: '#166534' }}>NET PROFIT / SURPLUS</td>
                    <td style={{ textAlign: 'right', fontSize: '16px', fontWeight: 800, color: '#166534' }}>
                      {formatCurrency(filteredData.netBusinessResult)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Commission Specific Summary */}
      {activeReport === 'commission' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{
            background: 'var(--primary-orange-light)',
            border: '1px solid var(--primary-orange-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--primary-orange)' }}>
                Thinkaroo 10% Commission Engine
              </h3>
              <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Commission is calculated strictly as 10% of total commission product sales (not profit).
              </p>
            </div>
            <div style={{ display: 'flex', gap: '16px' }}>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Commission Sales:</div>
                <div style={{ fontSize: '16px', fontWeight: 800 }}>{formatCurrency(filteredData.commissionSales)}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Thinkaroo 10%:</div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--primary-orange)' }}>{formatCurrency(filteredData.commissionEarned)}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Owner 90%:</div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-secondary)' }}>{formatCurrency(filteredData.ownerPayout)}</div>
              </div>
            </div>
          </div>

          <div className="tk-table-container">
            <table className="tk-table">
              <thead>
                <tr>
                  <th>Bill #</th>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Total Commission Sales</th>
                  <th>Thinkaroo Earning (10%)</th>
                  <th>Owner Payable (90%)</th>
                  <th>Handled By</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.sales.filter(s => s.commissionSalesTotal > 0).length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-light)' }}>
                      No commission transactions in selected period
                    </td>
                  </tr>
                ) : (
                  filteredData.sales.filter(s => s.commissionSalesTotal > 0).map(s => (
                    <tr key={s.id}>
                      <td><strong>{s.billNumber}</strong></td>
                      <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{s.date}</td>
                      <td>{s.customerName}</td>
                      <td><strong>{formatCurrency(s.commissionSalesTotal)}</strong></td>
                      <td><strong style={{ color: 'var(--primary-orange)' }}>{formatCurrency(s.commissionEarnedTotal)}</strong></td>
                      <td style={{ color: 'var(--text-secondary)' }}>{formatCurrency(s.ownerAmountTotal)}</td>
                      <td style={{ fontSize: '12px' }}>{s.internName}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          onClick={() => setActiveReceipt(s)}
                          className="btn-secondary"
                          style={{ padding: '4px 10px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          title="See Bill / View Receipt"
                        >
                          <Eye size={13} />
                          <span>See Bill</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Stock Report */}
      {activeReport === 'stock' && (
        <div className="tk-table-container">
          <table className="tk-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Own Stock</th>
                <th>Commission Stock</th>
                <th>Total Stock</th>
                <th>Purchase Cost</th>
                <th>Own Inventory Value</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => {
                const total = p.ownStock + p.commissionStock;
                const ownVal = p.ownStock * p.purchaseRate;
                return (
                  <tr key={p.id}>
                    <td><strong>{p.name}</strong></td>
                    <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{p.sku}</td>
                    <td>{p.category}</td>
                    <td><span className="badge badge-own">{p.ownStock} {p.unit}</span></td>
                    <td><span className="badge badge-commission">{p.commissionStock} {p.unit}</span></td>
                    <td><strong>{total} {p.unit}</strong></td>
                    <td>{formatCurrency(p.purchaseRate)}</td>
                    <td><strong>{formatCurrency(ownVal)}</strong></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Sales / Purchases / Expenses tables when selected */}
      {(activeReport === 'sales' || activeReport === 'purchases' || activeReport === 'expenses' || activeReport === 'wastage') && (
        <div className="tk-table-container">
          {activeReport === 'sales' && (
            <table className="tk-table">
              <thead>
                <tr>
                  <th>Bill #</th>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Own Share</th>
                  <th>Comm Share</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Intern</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.sales.map(s => (
                  <tr key={s.id}>
                    <td><strong>{s.billNumber}</strong></td>
                    <td>{s.date}</td>
                    <td>{s.customerName}</td>
                    <td>{formatCurrency(s.ownSalesTotal)}</td>
                    <td>{formatCurrency(s.commissionSalesTotal)}</td>
                    <td><strong style={{ color: 'var(--primary-orange)' }}>{formatCurrency(s.total)}</strong></td>
                    <td><span className="badge badge-neutral">{s.paymentMethod}</span></td>
                    <td>{s.internName}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => setActiveReceipt(s)}
                        className="btn-secondary"
                        style={{ padding: '4px 10px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        title="See Bill / View Receipt"
                      >
                        <Eye size={13} />
                        <span>See Bill</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeReport === 'purchases' && (
            <table className="tk-table">
              <thead>
                <tr>
                  <th>PO #</th>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Supplier / Owner</th>
                  <th>Amount</th>
                  <th>Received By</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.purchases.map(p => (
                  <tr key={p.id}>
                    <td><strong>{p.purchaseNumber}</strong></td>
                    <td>{p.date}</td>
                    <td>
                      <span className={p.type === 'OWN' ? 'badge badge-own' : 'badge badge-commission'}>
                        {p.type}
                      </span>
                    </td>
                    <td>{p.supplierOrOwner}</td>
                    <td><strong>{formatCurrency(p.totalAmount)}</strong></td>
                    <td>{p.receivedByIntern}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeReport === 'expenses' && (
            <table className="tk-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Amount</th>
                  <th>Note</th>
                  <th>Recorded By</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.expenses.map(e => (
                  <tr key={e.id}>
                    <td>{formatDate(e.date)}</td>
                    <td><span className="badge badge-neutral">{e.category}</span></td>
                    <td><strong style={{ color: 'var(--danger)' }}>{formatCurrency(e.amount)}</strong></td>
                    <td>{e.note}</td>
                    <td>{e.recordedByIntern}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeReport === 'wastage' && (
            <table className="tk-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Product</th>
                  <th>Stock Type</th>
                  <th>Quantity</th>
                  <th>Loss Value</th>
                  <th>Reason</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.wastages.map(w => (
                  <tr key={w.id}>
                    <td>{formatDate(w.date)}</td>
                    <td>{w.productName}</td>
                    <td><span className={w.stockType === 'OWN' ? 'badge badge-own' : 'badge badge-commission'}>{w.stockType}</span></td>
                    <td>-{w.quantity}</td>
                    <td><strong style={{ color: 'var(--danger)' }}>{formatCurrency(w.totalLoss)}</strong></td>
                    <td>{w.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Printable Receipt Modal */}
      {activeReceipt && (
        <div className="modal-overlay" onClick={() => setActiveReceipt(null)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '440px', background: '#FFFFFF' }}
          >
            <div className="modal-header no-print">
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Receipt size={16} color="var(--primary-orange)" />
                <h3 style={{ fontSize: '15px', fontWeight: 700 }}>Tax Invoice / Bill Preview</h3>
              </div>
              <button onClick={() => setActiveReceipt(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
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
                <div style={{ textAlign: 'right' }}><strong>Date:</strong> {formatDateTime(activeReceipt.createdAt || activeReceipt.date)}</div>
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
