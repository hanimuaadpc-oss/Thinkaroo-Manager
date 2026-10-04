import React, { useMemo } from 'react';
import {
  LayoutDashboard,
  ReceiptText,
  Package,
  Boxes,
  Truck,
  Users,
  CreditCard,
  AlertTriangle,
  BarChart3,
  GraduationCap,
  Settings,
  ArrowRight,
  TrendingUp,
  Zap,
  Activity,
  LucideIcon
} from 'lucide-react';
import { useDatabase } from '../context/DatabaseContext';
import { formatCurrency, formatDate } from '../utils/formatters';
import { NavTab } from '../components/layout/Sidebar';

interface HomeViewProps {
  onNavigateTab: (tab: NavTab) => void;
  onNewSaleClick: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigateTab, onNewSaleClick }) => {
  const {
    currentIntern,
    products,
    sales,
    activityLogs
  } = useDatabase();

  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const todaySalesStats = useMemo(() => {
    const todaySales = sales.filter(s => (s.date || s.createdAt).slice(0, 10) === todayStr);
    const totalAmount = todaySales.reduce((sum, s) => sum + s.total, 0);
    return {
      count: todaySales.length,
      totalAmount
    };
  }, [sales, todayStr]);

  const lowStockCount = useMemo(() => {
    return products.filter(
      p => (p.ownStock + p.commissionStock) <= p.minStockAlert && (p.ownStock + p.commissionStock) > 0
    ).length;
  }, [products]);

  const shortcuts: {
    id: NavTab;
    title: string;
    icon: LucideIcon;
    color: string;
    bgColor: string;
    badge?: string;
  }[] = [
    {
      id: 'sales',
      title: 'Sales & POS',
      icon: ReceiptText,
      color: '#FF6B00',
      bgColor: '#FFF7ED',
      badge: `${todaySalesStats.count} today`
    },
    {
      id: 'dashboard',
      title: 'Management Dashboard',
      icon: LayoutDashboard,
      color: '#0284C7',
      bgColor: '#F0F9FF',
      badge: 'Analytics'
    },
    {
      id: 'products',
      title: 'Products',
      icon: Package,
      color: '#10B981',
      bgColor: '#ECFDF5',
      badge: `${products.length} items`
    },
    {
      id: 'stock',
      title: 'Stock & Inventory',
      icon: Boxes,
      color: '#F59E0B',
      bgColor: '#FFFBEB',
      badge: lowStockCount > 0 ? `${lowStockCount} alert` : undefined
    },
    {
      id: 'purchase',
      title: 'Purchases',
      icon: Truck,
      color: '#06B6D4',
      bgColor: '#ECFEFF'
    },
    {
      id: 'reports',
      title: 'Reports & Analytics',
      icon: BarChart3,
      color: '#8B5CF6',
      bgColor: '#F5F3FF'
    },
    {
      id: 'customers',
      title: 'Customers',
      icon: Users,
      color: '#3B82F6',
      bgColor: '#EFF6FF'
    },
    {
      id: 'expenses',
      title: 'Expenses',
      icon: CreditCard,
      color: '#EC4899',
      bgColor: '#FDF2F8'
    },
    {
      id: 'wastage',
      title: 'Wastage & Loss',
      icon: AlertTriangle,
      color: '#EF4444',
      bgColor: '#FEF2F2'
    },
    {
      id: 'interns',
      title: 'Interns',
      icon: GraduationCap,
      color: '#6366F1',
      bgColor: '#EEF2FF'
    },
    {
      id: 'settings',
      title: 'Settings',
      icon: Settings,
      color: '#64748B',
      bgColor: '#F8FAFC'
    }
  ];

  const recentLogs = useMemo(() => {
    return (activityLogs || []).slice(0, 4);
  }, [activityLogs]);

  return (
    <div className="page-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '20px 28px 40px' }}>
      {/* Minimal Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', margin: 0 }}>
            Home
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px', margin: 0 }}>
            Welcome back, <strong style={{ color: 'var(--text-main)' }}>{currentIntern?.name || 'Intern'}</strong>
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={onNewSaleClick}
            className="btn-primary"
            style={{ padding: '8px 16px', fontSize: '13px', borderRadius: 'var(--radius-md)' }}
          >
            <Zap size={15} />
            Launch POS
          </button>
          <button
            onClick={() => onNavigateTab('dashboard')}
            className="btn-secondary"
            style={{ padding: '8px 14px', fontSize: '13px', borderRadius: 'var(--radius-md)' }}
          >
            <LayoutDashboard size={15} />
            Dashboard
          </button>
        </div>
      </div>

      {/* Compact Quick Summary Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
        <div className="tk-card" style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Today's Sales
            </div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px' }}>
              {formatCurrency(todaySalesStats.totalAmount)}
            </div>
          </div>
          <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: '#FFF7ED', color: 'var(--primary-orange)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TrendingUp size={16} />
          </div>
        </div>

        <div className="tk-card" style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Catalog Items
            </div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px' }}>
              {products.length} Products
            </div>
          </div>
          <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: '#ECFDF5', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Package size={16} />
          </div>
        </div>

        <div className="tk-card" style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Inventory Health
            </div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: lowStockCount > 0 ? '#D97706' : '#10B981', marginTop: '4px' }}>
              {lowStockCount > 0 ? `${lowStockCount} Low Stock Alert` : 'All Stock Healthy'}
            </div>
          </div>
          <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: lowStockCount > 0 ? '#FFFBEB' : '#ECFDF5', color: lowStockCount > 0 ? '#F59E0B' : '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Boxes size={16} />
          </div>
        </div>
      </div>

      {/* Module Shortcuts - Compact Grid Launcher */}
      <div>
        <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
          Quick Navigation
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
          {shortcuts.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                onClick={() => onNavigateTab(item.id)}
                className="tk-card"
                style={{
                  padding: '12px 14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '10px',
                  borderRadius: 'var(--radius-md)',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = item.color;
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                  <div
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '8px',
                      background: item.bgColor,
                      color: item.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <Icon size={18} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.title}
                    </div>
                    {item.badge && (
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500, marginTop: '1px' }}>
                        {item.badge}
                      </div>
                    )}
                  </div>
                </div>

                <ArrowRight size={14} style={{ color: 'var(--text-light)', flexShrink: 0 }} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="tk-card" style={{ borderRadius: 'var(--radius-md)' }}>
        <div className="tk-card-header" style={{ padding: '12px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={16} style={{ color: 'var(--primary-blue)' }} />
            <h3 style={{ fontSize: '13.5px', fontWeight: 700 }}>Recent Activity</h3>
          </div>
          <button
            onClick={() => onNavigateTab('reports')}
            className="btn-ghost"
            style={{ fontSize: '12px', padding: '2px 6px' }}
          >
            View All &rarr;
          </button>
        </div>
        <div className="tk-card-body" style={{ padding: '8px 16px 12px' }}>
          {recentLogs.length === 0 ? (
            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', textAlign: 'center', padding: '8px 0' }}>
              No recent activity recorded.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {recentLogs.map((log) => (
                <div
                  key={log.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '12.5px',
                    padding: '4px 0',
                    borderBottom: '1px solid var(--border-light)'
                  }}
                >
                  <span style={{ fontWeight: 500, color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%' }}>
                    {log.details || log.action}
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', flexShrink: 0 }}>
                    {log.internName} &bull; {formatDate(log.timestamp)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomeView;
