import React from 'react';
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
  Sparkles,
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
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.5)',
            zIndex: 40,
            backdropFilter: 'blur(2px)'
          }}
        />
      )}

      <aside
        style={{
          width: '248px',
          background: '#FFFFFF',
          borderRight: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          position: 'sticky',
          top: 0,
          zIndex: 45,
          flexShrink: 0,
          transition: 'transform 0.2s ease',
          ...(isMobileOpen ? {
            position: 'fixed',
            left: 0,
            top: 0,
            bottom: 0,
            boxShadow: 'var(--shadow-lg)'
          } : {})
        }}
      >
        {/* Brand Header */}
        <div style={{
          padding: '20px 18px 16px',
          borderBottom: '1px solid var(--border-light)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '10px',
            background: '#FFF7ED',
            border: '1px solid #FED7AA',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '4px',
            boxShadow: '0 1px 3px rgba(255, 107, 0, 0.15)'
          }}>
            <img 
              src="/thinkaroo-logo.png" 
              alt="Thinkaroo Logo" 
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ 
                fontFamily: 'Plus Jakarta Sans', 
                fontWeight: 800, 
                fontSize: '18px', 
                color: 'var(--primary-orange)',
                letterSpacing: '-0.02em',
                lineHeight: 1.1
              }}>
                THINK<span style={{ color: 'var(--primary-blue)' }}>AROO</span>
              </span>
            </div>
            <p style={{ 
              fontSize: '11px', 
              fontWeight: 600, 
              color: 'var(--text-muted)', 
              letterSpacing: '0.02em',
              textTransform: 'uppercase',
              marginTop: '2px'
            }}>
              Caliph Life School
            </p>
          </div>
        </div>

        {/* Navigation List */}
        <div style={{
          flex: 1,
          padding: '12px 10px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '3px'
        }}>
          <div style={{ 
            fontSize: '10.5px', 
            fontWeight: 700, 
            color: 'var(--text-light)', 
            padding: '6px 12px',
            textTransform: 'uppercase',
            letterSpacing: '0.06em'
          }}>
            Business Operations
          </div>

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
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '13.5px',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? 'var(--primary-orange)' : 'var(--text-secondary)',
                  background: isActive ? 'var(--primary-orange-light)' : 'transparent',
                  border: isActive ? '1px solid var(--primary-orange-border)' : '1px solid transparent',
                  transition: 'all 0.15s ease',
                  textAlign: 'left',
                  width: '100%'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'var(--bg-surface-secondary)';
                    e.currentTarget.style.color = 'var(--text-main)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '11px' }}>
                  <Icon 
                    size={18} 
                    className={isActive ? 'text-orange-500' : 'text-slate-400'} 
                    style={{ color: isActive ? 'var(--primary-orange)' : '#64748B' }} 
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '2px 7px',
                    borderRadius: '10px',
                    background: item.badgeColor === 'warning' ? '#FEF3C7' : '#F1F5F9',
                    color: item.badgeColor === 'warning' ? '#B45309' : '#475569',
                  }}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Intern Tag / Switcher & Logout */}
        <div style={{
          padding: '12px 14px',
          borderTop: '1px solid var(--border-light)',
          background: '#FAFAFA'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
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
            </div>

            <button
              onClick={logout}
              title="Sign Out / Switch Intern"
              style={{
                color: 'var(--text-light)',
                padding: '6px',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#FEE2E2';
                e.currentTarget.style.color = 'var(--danger)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--text-light)';
              }}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
