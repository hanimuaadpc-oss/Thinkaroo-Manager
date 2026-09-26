import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  Package,
  Boxes,
  AlertTriangle,
  Receipt,
  ReceiptText,
  LayoutDashboard,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Sparkles,
  Calendar,
  Layers,
  ChevronRight,
  Activity,
  Truck,
  Users,
  CreditCard,
  BarChart3,
  GraduationCap,
  Settings,
  Plus
} from 'lucide-react';
import { useDatabase } from '../context/DatabaseContext';
import { formatCurrency, formatDate } from '../utils/formatters';

type DateFilterOption = 'today' | '7days' | '30days' | 'thisMonth' | 'all';

interface DashboardViewProps {
  onNavigateTab: (tab: any) => void;
  onNewSaleClick: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigateTab, onNewSaleClick }) => {
  const {
    sales,
    purchases,
    expenses,
    wastages,
    products,
    stockMovements,
    activityLogs,
    settings,
    customers,
    currentIntern
  } = useDatabase();

  const [dateFilter, setDateFilter] = useState<DateFilterOption>('all');

  // Compute date filter boundary
  const filteredData = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);

    const isWithinFilter = (dateStr: string) => {
      if (dateFilter === 'all') return true;
      const d = new Date(dateStr);
      if (dateFilter === 'today') {
        return dateStr.slice(0, 10) === todayStr;
      }
      if (dateFilter === '7days') {
        const diffDays = (now.getTime() - d.getTime()) / (1000 * 3600 * 24);
        return diffDays <= 7;
      }
      if (dateFilter === '30days') {
        const diffDays = (now.getTime() - d.getTime()) / (1000 * 3600 * 24);
        return diffDays <= 30;
      }
      if (dateFilter === 'thisMonth') {
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }
      return true;
    };

    const fSales = sales.filter(s => isWithinFilter(s.date || s.createdAt));
    const fPurchases = purchases.filter(p => isWithinFilter(p.date || p.createdAt));
    const fExpenses = expenses.filter(e => isWithinFilter(e.date || e.createdAt));
    const fWastages = wastages.filter(w => isWithinFilter(w.date || w.createdAt));

    const todaySales = sales
      .filter(s => (s.date || s.createdAt).slice(0, 10) === todayStr)
      .reduce((sum, s) => sum + s.total, 0);

    const totalSales = fSales.reduce((sum, s) => sum + s.total, 0);
    const ownSales = fSales.reduce((sum, s) => sum + s.ownSalesTotal, 0);
    const commissionSales = fSales.reduce((sum, s) => sum + s.commissionSalesTotal, 0);
    const commissionEarned = fSales.reduce((sum, s) => sum + s.commissionEarnedTotal, 0);
    const purchaseValue = fPurchases.reduce((sum, p) => sum + p.totalAmount, 0);
    const totalExpenses = fExpenses.reduce((sum, e) => sum + e.amount, 0);
    const totalWastageLoss = fWastages.reduce((sum, w) => sum + w.totalLoss, 0);

    const netProfit = fSales.reduce((sum, s) => sum + s.netThinkarooProfit, 0) - totalExpenses - totalWastageLoss;

    return {
      todaySales,
      totalSales,
      ownSales,
      commissionSales,
      commissionEarned,
      purchaseValue,
      totalExpenses,
      totalWastageLoss,
      netProfit,
      salesCount: fSales.length,
      filteredSales: fSales,
      filteredPurchases: fPurchases
    };
  }, [sales, purchases, expenses, wastages, dateFilter]);

  // Inventory Totals (Current Snapshot)
  const inventoryStats = useMemo(() => {
    let ownStockTotal = 0;
    let commissionStockTotal = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    products.forEach(p => {
      ownStockTotal += p.ownStock;
      commissionStockTotal += p.commissionStock;
      const total = p.ownStock + p.commissionStock;
      if (total <= 0) outOfStockCount++;
      else if (total <= p.minStockAlert) lowStockCount++;
    });

    return {
      totalProducts: products.length,
      totalStock: ownStockTotal + commissionStockTotal,
      ownStockTotal,
      commissionStockTotal,
      lowStockCount,
      outOfStockCount
    };
  }, [products]);

  // Top Selling Products
  const topProducts = useMemo(() => {
    const map = new Map<string, { product: typeof products[0]; count: number; revenue: number }>();
    sales.forEach(sale => {
      sale.items.forEach(item => {
        const prod = products.find(p => p.id === item.productId);
        if (prod) {
          const current = map.get(prod.id) || { product: prod, count: 0, revenue: 0 };
          current.count += item.quantity;
          current.revenue += item.lineTotal;
          map.set(prod.id, current);
        }
      });
    });
    return Array.from(map.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 4);
  }, [sales, products]);

  // Low stock products alert list
  const lowStockAlerts = useMemo(() => {
    return products
      .filter(p => (p.ownStock + p.commissionStock) <= p.minStockAlert)
      .slice(0, 4);
  }, [products]);

  return (
    <div className="page-wrapper">
      {/* Mobile App Style Launcher Branding Header */}
      <div className="launcher-brand-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div className="launcher-logo-box">
            <img 
              src="/thinkaroo-logo.png" 
              alt="Thinkaroo Logo" 
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </div>
          <div>
            <h1 className="launcher-brand-title">
              Thinkaroo – Caliph Life School
            </h1>
            <p className="launcher-brand-subtitle">
              Select an option to continue
            </p>
          </div>
        </div>

        <button
          onClick={onNewSaleClick}
          className="btn-primary launcher-pos-btn"
        >
          <Plus size={16} strokeWidth={2.5} />
          <span>POS Terminal</span>
        </button>
      </div>

      {/* 2-Column Mobile App Style Launcher Cards Matrix */}
      <div style={{ marginBottom: '24px' }}>
        <div className="launcher-grid">
          {[
            {
              id: 'dashboard',
              title: 'Dashboard',
              description: 'Overview & Analytics',
              icon: LayoutDashboard,
              bg: '#EEF2FF',
              color: '#4F46E5'
            },
            {
              id: 'products',
              title: 'Products',
              description: 'Catalog & Pricing',
              icon: Package,
              bg: '#F0F9FF',
              color: 'var(--primary-blue)',
              badge: `${products.length}`
            },
            {
              id: 'stock',
              title: 'Stock',
              description: 'Inventory Balance',
              icon: Boxes,
              bg: '#F0FDFA',
              color: '#0D9488',
              badge: inventoryStats.lowStockCount > 0 ? `${inventoryStats.lowStockCount} Low` : 'Optimal'
            },
            {
              id: 'purchase',
              title: 'Purchase',
              description: 'Intake & Suppliers',
              icon: Truck,
              bg: '#F3E8FF',
              color: '#9333EA',
              badge: `${purchases.length}`
            },
            {
              id: 'sales',
              title: 'Sales',
              description: 'POS & Billing',
              icon: ReceiptText,
              bg: '#FFF7ED',
              color: 'var(--primary-orange)',
              badge: 'POS'
            },
            {
              id: 'customers',
              title: 'Customers',
              description: 'Clients & History',
              icon: Users,
              bg: '#EFF6FF',
              color: '#2563EB',
              badge: `${customers.length}`
            },
            {
              id: 'expenses',
              title: 'Expenses',
              description: 'Business Spend',
              icon: CreditCard,
              bg: '#FEF2F2',
              color: '#DC2626',
              badge: `${expenses.length}`
            },
            {
              id: 'wastage',
              title: 'Wastage',
              description: 'Damage & Loss',
              icon: AlertTriangle,
              bg: '#FFFBEB',
              color: '#D97706',
              badge: `${wastages.length}`
            },
            {
              id: 'reports',
              title: 'Reports',
              description: 'P&L & Analytics',
              icon: BarChart3,
              bg: '#F0FDF4',
              color: '#16A34A',
              badge: 'P&L'
            },
            {
              id: 'interns',
              title: 'Interns',
              description: 'Access & Audit',
              icon: GraduationCap,
              bg: '#EEF2FF',
              color: '#4F46E5',
              badge: `${activityLogs.length}`
            },
            {
              id: 'settings',
              title: 'Settings',
              description: 'Config & Rules',
              icon: Settings,
              bg: '#F8FAFC',
              color: '#475569',
              badge: 'Config'
            }
          ].map(mod => {
            const Icon = mod.icon;
            return (
              <div
                key={mod.id}
                onClick={() => {
                  if (mod.id === 'sales') onNewSaleClick();
                  else onNavigateTab(mod.id);
                }}
                className="tk-card launcher-card"
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div 
                    className="launcher-icon-box"
                    style={{ background: mod.bg }}
                  >
                    <Icon size={18} color={mod.color} />
                  </div>
                  {mod.badge && (
                    <span className="badge badge-neutral launcher-badge">
                      {mod.badge}
                    </span>
                  )}
                </div>
                <div className="launcher-card-title">{mod.title}</div>
                <div className="launcher-card-desc">{mod.description}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Header with Date Filter */}
      <div className="dashboard-metrics-header">
        <div>
          <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
            Performance Metrics
          </h3>
        </div>

        {/* Date Filter Tabs */}
        <div className="dashboard-date-filter-scroll">
          <div className="dashboard-date-filter-tabs">
            {(['all', 'today', '7days', '30days', 'thisMonth'] as DateFilterOption[]).map(opt => {
              const labels: Record<DateFilterOption, string> = {
                all: 'All',
                today: 'Today',
                '7days': '7 Days',
                '30days': '30 Days',
                thisMonth: 'This Month'
              };
              const active = dateFilter === opt;
              return (
                <button
                  key={opt}
                  onClick={() => setDateFilter(opt)}
                  className={`dashboard-date-btn ${active ? 'active' : ''}`}
                >
                  {labels[opt]}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="dashboard-kpi-grid">
        {/* Today's Sales */}
        <div className="tk-card" style={{ padding: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Today's Sales</span>
            <div style={{ width: '26px', height: '26px', borderRadius: '6px', background: 'var(--primary-orange-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={14} color="var(--primary-orange)" />
            </div>
          </div>
          <div className="dashboard-kpi-value" style={{ color: 'var(--primary-orange)' }}>
            {formatCurrency(filteredData.todaySales)}
          </div>
          <div style={{ fontSize: '10.5px', color: 'var(--text-light)', marginTop: '2px' }}>
            Today
          </div>
        </div>

        {/* Total Sales */}
        <div className="tk-card" style={{ padding: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Total Sales</span>
            <div style={{ width: '26px', height: '26px', borderRadius: '6px', background: 'var(--primary-blue-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Receipt size={14} color="var(--primary-blue)" />
            </div>
          </div>
          <div className="dashboard-kpi-value" style={{ color: 'var(--text-main)' }}>
            {formatCurrency(filteredData.totalSales)}
          </div>
          <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
            {filteredData.salesCount} bills
          </div>
        </div>

        {/* Own Sales */}
        <div className="tk-card" style={{ padding: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Own Sales</span>
            <span className="badge badge-own" style={{ fontSize: '9.5px' }}>Own</span>
          </div>
          <div className="dashboard-kpi-value" style={{ color: 'var(--primary-blue)' }}>
            {formatCurrency(filteredData.ownSales)}
          </div>
          <div style={{ fontSize: '10.5px', color: 'var(--text-light)', marginTop: '2px' }}>
            Thinkaroo stock
          </div>
        </div>

        {/* Commission Sales */}
        <div className="tk-card" style={{ padding: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Commission Sales</span>
            <span className="badge badge-commission" style={{ fontSize: '9.5px' }}>10%</span>
          </div>
          <div className="dashboard-kpi-value" style={{ color: 'var(--text-main)' }}>
            {formatCurrency(filteredData.commissionSales)}
          </div>
          <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
            Earned: <strong style={{ color: 'var(--primary-orange)' }}>{formatCurrency(filteredData.commissionEarned)}</strong>
          </div>
        </div>

        {/* Net Profit */}
        <div className="tk-card" style={{ padding: '14px', background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#166534' }}>Net Result</span>
            <TrendingUp size={14} color="#166534" />
          </div>
          <div className="dashboard-kpi-value" style={{ color: '#166534' }}>
            {formatCurrency(filteredData.netProfit)}
          </div>
          <div style={{ fontSize: '10.5px', color: '#15803D', marginTop: '2px' }}>
            Net profit
          </div>
        </div>

        {/* Expenses */}
        <div className="tk-card" style={{ padding: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Expenses</span>
            <TrendingDown size={14} color="#EF4444" />
          </div>
          <div className="dashboard-kpi-value" style={{ color: '#EF4444' }}>
            {formatCurrency(filteredData.totalExpenses)}
          </div>
          <div style={{ fontSize: '10.5px', color: 'var(--text-light)', marginTop: '2px' }}>
            Operating spend
          </div>
        </div>
      </div>

      {/* Secondary Row: Inventory Snapshot (Compact Row) */}
      <div className="tk-card dashboard-inventory-snapshot" style={{ padding: '12px 18px', marginBottom: '20px', background: '#FFFFFF' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Boxes size={17} color="var(--primary-blue)" />
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>
              Inventory Balance
            </span>
          </div>

          <div className="inventory-stats-group">
            <div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Products: </span>
              <strong style={{ fontSize: '12.5px', color: 'var(--text-main)' }}>{inventoryStats.totalProducts}</strong>
            </div>
            <div className="stat-divider" />
            <div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Stock: </span>
              <strong style={{ fontSize: '12.5px', color: 'var(--text-main)' }}>{inventoryStats.totalStock} units</strong>
            </div>
            <div className="stat-divider" />
            <div>
              <span style={{ fontSize: '11px', color: 'var(--primary-blue)' }}>Own: </span>
              <strong style={{ fontSize: '12.5px', color: 'var(--primary-blue)' }}>{inventoryStats.ownStockTotal}</strong>
            </div>
            <div className="stat-divider" />
            <div>
              <span style={{ fontSize: '11px', color: 'var(--primary-orange)' }}>Commission: </span>
              <strong style={{ fontSize: '12.5px', color: 'var(--primary-orange)' }}>{inventoryStats.commissionStockTotal}</strong>
            </div>
            <div className="stat-divider" />
            <div>
              <span style={{ fontSize: '11px', color: '#B45309' }}>Low: </span>
              <strong style={{ fontSize: '12.5px', color: '#B45309' }}>{inventoryStats.lowStockCount}</strong>
            </div>
            <div className="stat-divider" />
            <div>
              <span style={{ fontSize: '11px', color: 'var(--danger)' }}>Out: </span>
              <strong style={{ fontSize: '12.5px', color: 'var(--danger)' }}>{inventoryStats.outOfStockCount}</strong>
            </div>
          </div>

          <button 
            onClick={() => onNavigateTab('stock')}
            className="btn-ghost"
            style={{ fontSize: '12px', fontWeight: 600, color: 'var(--primary-blue)' }}
          >
            <span>Manage</span>
            <ChevronRight size={13} />
          </button>
        </div>
      </div>

      {/* Visual Analytics / Charts Section (Compact Base44 style) */}
      <div className="dashboard-analytics-grid">
        {/* Sales Distribution Card */}
        <div className="tk-card">
          <div className="tk-card-header">
            <span style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-main)' }}>
              Sales Stream Distribution
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Own vs 10% Commission</span>
          </div>
          <div className="tk-card-body">
            {filteredData.totalSales === 0 ? (
              <div style={{ padding: '30px 0', textAlign: 'center', color: 'var(--text-light)', fontSize: '13px' }}>
                No sales in selected period
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--primary-blue)' }}>
                    Own Sales ({Math.round((filteredData.ownSales / filteredData.totalSales) * 100) || 0}%)
                  </span>
                  <span style={{ fontSize: '12.5px', fontWeight: 700 }}>
                    {formatCurrency(filteredData.ownSales)}
                  </span>
                </div>
                {/* Progress bar */}
                <div style={{ height: '10px', width: '100%', background: '#F1F5F9', borderRadius: '5px', overflow: 'hidden', display: 'flex', marginBottom: '16px' }}>
                  <div style={{
                    width: `${(filteredData.ownSales / filteredData.totalSales) * 100}%`,
                    background: 'var(--primary-blue)',
                    transition: 'width 0.3s ease'
                  }} />
                  <div style={{
                    width: `${(filteredData.commissionSales / filteredData.totalSales) * 100}%`,
                    background: 'var(--primary-orange)',
                    transition: 'width 0.3s ease'
                  }} />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--primary-orange)' }}>
                    Commission Sales Total
                  </span>
                  <span style={{ fontSize: '12.5px', fontWeight: 700 }}>
                    {formatCurrency(filteredData.commissionSales)}
                  </span>
                </div>

                <div style={{
                  background: '#F8FAFC',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  border: '1px solid var(--border-subtle)',
                  marginTop: '12px'
                }}>
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Thinkaroo Commission (10%)</div>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--primary-orange)' }}>
                      {formatCurrency(filteredData.commissionEarned)}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Owner Payout (90%)</div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-secondary)' }}>
                      {formatCurrency(filteredData.commissionSales - filteredData.commissionEarned)}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Business Result Breakdown */}
        <div className="tk-card">
          <div className="tk-card-header">
            <span style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-main)' }}>
              Financial Net Result
            </span>
            <span className="badge badge-success" style={{ fontSize: '10px' }}>P&L</span>
          </div>
          <div className="tk-card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Gross Business Margin:</span>
                <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                  {formatCurrency(filteredData.filteredSales.reduce((sum, s) => sum + s.netThinkarooProfit, 0))}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Operating Expenses:</span>
                <span style={{ fontWeight: 600, color: 'var(--danger)' }}>
                  - {formatCurrency(filteredData.totalExpenses)}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Wastage Loss:</span>
                <span style={{ fontWeight: 600, color: 'var(--danger)' }}>
                  - {formatCurrency(filteredData.totalWastageLoss)}
                </span>
              </div>
              <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>Final Net Earning:</span>
                <span style={{ fontWeight: 800, color: filteredData.netProfit >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                  {formatCurrency(filteredData.netProfit)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Two Columns: Left (Top Products & Low Stock Alerts), Right (Recent Sales & Live Intern Activity) */}
      <div className="dashboard-columns-grid">
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Top Selling Products */}
          <div className="tk-card">
            <div className="tk-card-header">
              <span style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-main)' }}>
                Top Selling Products
              </span>
              <button onClick={() => onNavigateTab('products')} className="btn-ghost" style={{ fontSize: '11.5px' }}>
                View All
              </button>
            </div>
            <div className="tk-card-body" style={{ padding: '8px 16px' }}>
              {topProducts.length === 0 ? (
                <p style={{ padding: '16px', color: 'var(--text-light)', fontSize: '12.5px', textAlign: 'center' }}>
                  No product sales yet
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {topProducts.map((item, idx) => (
                    <div
                      key={item.product.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 0',
                        borderBottom: idx < topProducts.length - 1 ? '1px solid var(--border-light)' : 'none'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img
                          src={item.product.mainImage}
                          alt={item.product.name}
                          style={{ width: '36px', height: '36px', borderRadius: '6px', objectFit: 'cover' }}
                        />
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>
                            {item.product.name}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                            {item.count} units sold
                          </div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>
                          {formatCurrency(item.revenue)}
                        </div>
                        <div style={{ fontSize: '10.5px', color: 'var(--text-light)' }}>
                          {item.product.category}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Low Stock Alerts */}
          <div className="tk-card">
            <div className="tk-card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertTriangle size={15} color="#D97706" />
                <span style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-main)' }}>
                  Low Stock Alerts
                </span>
              </div>
              <button onClick={() => onNavigateTab('stock')} className="btn-ghost" style={{ fontSize: '11.5px' }}>
                View Stock
              </button>
            </div>
            <div className="tk-card-body" style={{ padding: '8px 16px' }}>
              {lowStockAlerts.length === 0 ? (
                <div style={{ padding: '16px', color: 'var(--success)', fontSize: '12.5px', textAlign: 'center' }}>
                  ✓ All stock levels are healthy!
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {lowStockAlerts.map((prod, idx) => {
                    const total = prod.ownStock + prod.commissionStock;
                    return (
                      <div
                        key={prod.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 0',
                          borderBottom: idx < lowStockAlerts.length - 1 ? '1px solid var(--border-light)' : 'none'
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>
                            {prod.name}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                            Own: {prod.ownStock} | Commission: {prod.commissionStock}
                          </div>
                        </div>
                        <span className={`badge ${total <= 0 ? 'badge-danger' : 'badge-warning'}`}>
                          {total <= 0 ? 'Out of Stock' : `${total} Left`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Recent Sales & Intern Activity Feed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Recent Sales */}
          <div className="tk-card">
            <div className="tk-card-header">
              <span style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-main)' }}>
                Recent Sales
              </span>
              <button onClick={() => onNavigateTab('sales')} className="btn-ghost" style={{ fontSize: '11.5px' }}>
                Open Terminal
              </button>
            </div>
            <div className="tk-card-body" style={{ padding: '8px 16px' }}>
              {sales.length === 0 ? (
                <p style={{ padding: '16px', color: 'var(--text-light)', fontSize: '12.5px', textAlign: 'center' }}>
                  No recent sales
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {sales.slice(0, 4).map((sale, idx) => (
                    <div
                      key={sale.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 0',
                        borderBottom: idx < Math.min(sales.length, 4) - 1 ? '1px solid var(--border-light)' : 'none'
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>
                          {sale.billNumber}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          {sale.customerName} • {sale.paymentMethod}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--primary-orange)' }}>
                          {formatCurrency(sale.total)}
                        </div>
                        <div style={{ fontSize: '10.5px', color: 'var(--text-light)' }}>
                          by {sale.internName}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Intern Activity History */}
          <div className="tk-card">
            <div className="tk-card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Activity size={15} color="var(--primary-blue)" />
                <span style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-main)' }}>
                  Recent Intern Activity
                </span>
              </div>
              <button onClick={() => onNavigateTab('interns')} className="btn-ghost" style={{ fontSize: '11.5px' }}>
                View Interns
              </button>
            </div>
            <div className="tk-card-body" style={{ padding: '8px 16px' }}>
              {activityLogs.slice(0, 4).map((act, idx) => (
                <div
                  key={act.id}
                  style={{
                    padding: '8px 0',
                    borderBottom: idx < 3 ? '1px solid var(--border-light)' : 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-main)' }}>
                      {act.internName}
                    </span>
                    <span style={{ fontSize: '10.5px', color: 'var(--text-light)' }}>
                      {new Date(act.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                    {act.details}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
