import React, { useState } from 'react';
import {
  LayoutDashboard,
  Package,
  Boxes,
  Truck,
  ReceiptText,
  Users,
  CreditCard,
  AlertTriangle,
  BarChart3,
  GraduationCap,
  Settings,
  LogOut,
  ChevronRight,
  ChevronLeft,
  X,
  LucideIcon
} from 'lucide-react';
import { useDatabase } from '../../context/DatabaseContext';

export type NavTab = 
  | 'dashboard'
  | 'products'
  | 'stock'
  | 'purchase'
  | 'sales'
  | 'customers'
  | 'expenses'
  | 'wastage'
  | 'reports'
  | 'interns'
  | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isMobileOpen,
  onCloseMobile
}) => {
  const { currentIntern, logout, products } = useDatabase();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Calculate low stock alert count for badge
  const lowStockCount = products.filter(
    p => (p.ownStock + p.commissionStock) <= p.minStockAlert && (p.ownStock + p.commissionStock) > 0
  ).length;

  const navItems: { id: NavTab; label: string; icon: LucideIcon; badge?: number | string; badgeColor?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package, badge: products.length },
    { id: 'stock', label: 'Stock', icon: Boxes, badge: lowStockCount > 0 ? lowStockCount : undefined, badgeColor: 'warning' },
    { id: 'purchase', label: 'Purchase', icon: Truck },
    { id: 'sales', label: 'Sales', icon: ReceiptText },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'expenses', label: 'Expenses', icon: CreditCard },
    { id: 'wastage', label: 'Wastage', icon: AlertTriangle },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'interns', label: 'Interns', icon: GraduationCap },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div 
          onClick={onCloseMobile} 
          className="sidebar-overlay"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.5)',
            zIndex: 40,
            backdropFilter: 'blur(3px)',
            animation: 'fadeIn 0.2s ease-out'
          }}
        />
      )}

      <aside
        className={`app-sidebar ${isMobileOpen ? 'mobile-open' : ''} ${isCollapsed ? 'collapsed' : ''}`}
      >
        {/* Brand Header */}
        <div className="sidebar-brand-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="sidebar-logo-box">
              <img 
                src="/thinkaroo-logo.png" 
                alt="Thinkaroo Logo" 
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </div>
            {!isCollapsed && (
              <div className="sidebar-brand-text">
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ 
                    fontFamily: 'Plus Jakarta Sans', 
                    fontWeight: 800, 
                    fontSize: '17px', 
                    color: 'var(--primary-orange)',
                    letterSpacing: '-0.02em',
                    lineHeight: 1.1
                  }}>
                    THINK<span style={{ color: 'var(--primary-blue)' }}>AROO</span>
                  </span>
                </div>
                <p style={{ 
                  fontSize: '10.5px', 
                  fontWeight: 600, 
                  color: 'var(--text-muted)', 
                  letterSpacing: '0.02em',
                  textTransform: 'uppercase',
                  marginTop: '2px',
                  margin: 0
                }}>
                  Caliph Life School
                </p>
              </div>
            )}
          </div>

          {/* Controls: Close Mobile or Collapse Desktop */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {/* Mobile Close Button */}
            <button
              onClick={onCloseMobile}
              className="sidebar-mobile-close-btn"
              title="Close menu"
              aria-label="Close menu"
            >
              <X size={18} />
            </button>

            {/* Desktop Collapse Toggle Button */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="sidebar-collapse-btn"
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
          </div>
        </div>

        {/* Navigation List */}
        <div className="sidebar-nav-container">
          {!isCollapsed && (
            <div className="sidebar-section-title">
              Business Operations
            </div>
          )}

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  if (isMobileOpen) onCloseMobile();
                }}
                className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                title={isCollapsed ? item.label : undefined}
              >
                <div className="sidebar-nav-item-inner">
                  <Icon 
                    size={18} 
                    style={{ color: isActive ? 'var(--primary-orange)' : '#64748B', flexShrink: 0 }} 
                  />
                  {!isCollapsed && <span className="sidebar-nav-label">{item.label}</span>}
                </div>

                {item.badge !== undefined && (
                  <span className={`sidebar-badge ${item.badgeColor === 'warning' ? 'badge-warn' : 'badge-def'} ${isCollapsed ? 'dot-only' : ''}`}>
                    {isCollapsed ? '' : item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Intern Tag / Switcher & Logout */}
        <div className="sidebar-footer">
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: isCollapsed ? 'center' : 'space-between',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '9px', minWidth: 0 }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--primary-orange), var(--primary-blue))',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '12px',
                flexShrink: 0
              }}>
                {currentIntern?.name?.charAt(0) || 'I'}
              </div>
              {!isCollapsed && (
                <div style={{ minWidth: 0 }}>
                  <div style={{
                    fontSize: '12.5px',
                    fontWeight: 600,
                    color: 'var(--text-main)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {currentIntern?.name || 'Student Intern'}
                  </div>
                  <div style={{
                    fontSize: '11px',
                    color: 'var(--text-light)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {currentIntern?.email}
                  </div>
                </div>
              )}
            </div>

            {!isCollapsed && (
              <button
                onClick={logout}
                title="Sign Out / Switch Intern"
                className="sidebar-logout-btn"
              >
                <LogOut size={16} />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

