import React, { useState } from 'react';
import { 
  Menu, 
  Plus, 
  ChevronDown, 
  Clock,
  GraduationCap,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import { useDatabase } from '../../context/DatabaseContext';
import { NavTab } from './Sidebar';

interface HeaderProps {
  currentTab: NavTab;
  onOpenMobileMenu: () => void;
  onNewSaleClick: () => void;
  onSearchClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onOpenMobileMenu,
  onNewSaleClick,
}) => {
  const { currentIntern, logout } = useDatabase();
  const [showMenu, setShowMenu] = useState(false);

  const getTabTitle = (tab: NavTab) => {
    switch (tab) {
      case 'dashboard': return 'Dashboard';
      case 'products': return 'Products';
      case 'stock': return 'Stock & Inventory';
      case 'purchase': return 'Purchases';
      case 'sales': return 'Sales & POS';
      case 'customers': return 'Customers';
      case 'expenses': return 'Expenses';
      case 'wastage': return 'Wastage';
      case 'reports': return 'Reports & Analytics';
      case 'interns': return 'Interns';
      case 'settings': return 'Settings';
      default: return 'Thinkaroo ERP';
    }
  };

  const currentDate = new Date().toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const roleLabel =
    currentIntern?.role === 'ADMIN'       ? 'Faculty Mentor / Admin' :
    currentIntern?.role === 'COORDINATOR' ? 'Student Coordinator' :
    'Student Intern';

  return (
    <header className="app-header">
      {/* Left side: Hamburger & Title */}
      <div className="header-left">
        <button
          onClick={onOpenMobileMenu}
          className="mobile-menu-btn"
          aria-label="Toggle menu"
        >
          <Menu size={20} />
        </button>

        <div className="header-title-group">
          <h1 className="header-title">
            {getTabTitle(currentTab)}
          </h1>
          <div className="header-subtitle">
            <span className="school-tag">
              <GraduationCap size={13} />
              <span className="school-tag-text">Caliph Life School Internal Management</span>
              <span className="school-tag-short">Caliph Life School</span>
            </span>
            <span className="subtitle-divider">•</span>
            <span className="date-tag">
              <Clock size={11} /> {currentDate}
            </span>
          </div>
        </div>
      </div>

      {/* Right side: Quick Action "New Sale" and Profile dropdown */}
      <div className="header-actions">
        <button
          onClick={onNewSaleClick}
          className="btn-primary header-new-sale-btn"
        >
          <Plus size={16} strokeWidth={2.5} />
          <span className="btn-text">New Sale</span>
        </button>

        {/* Profile Dropdown — shows ONLY the current user + Sign Out */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 10px',
              background: '#F8FAFC',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              fontSize: '12.5px',
              fontWeight: 500,
              color: 'var(--text-secondary)'
            }}
          >
            <div style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: 'var(--primary-orange)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '11px',
              fontWeight: 700
            }}>
              {currentIntern?.name?.charAt(0) || 'I'}
            </div>
            <span style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {currentIntern?.name || 'Intern'}
            </span>
            <ChevronDown size={14} color="#64748B" />
          </button>

          {showMenu && (
            <>
              {/* Backdrop to close on outside click */}
              <div
                style={{ position: 'fixed', inset: 0, zIndex: 49 }}
                onClick={() => setShowMenu(false)}
              />

              <div style={{
                position: 'absolute',
                right: 0,
                top: 'calc(100% + 6px)',
                width: '260px',
                background: '#FFFFFF',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-subtle)',
                boxShadow: 'var(--shadow-lg)',
                padding: '8px',
                zIndex: 50
              }}>
                {/* Current user info — no other users shown here */}
                <div style={{
                  padding: '10px 12px',
                  borderBottom: '1px solid var(--border-light)',
                  marginBottom: '6px'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '6px'
                  }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: 'var(--primary-orange)',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '14px',
                      flexShrink: 0,
                    }}>
                      {currentIntern?.name?.charAt(0) || 'I'}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {currentIntern?.name}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '1px' }}>
                        {roleLabel}
                      </div>
                    </div>
                  </div>

                  {/* Verified badge */}
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '3px 8px',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--success-light)',
                    border: '1px solid var(--success-border)',
                    fontSize: '10.5px',
                    fontWeight: 600,
                    color: 'var(--success)',
                  }}>
                    <ShieldCheck size={11} />
                    Verified Session
                  </div>
                </div>

                {/* Sign Out — the ONLY action in this dropdown */}
                <button
                  onClick={() => {
                    setShowMenu(false);
                    logout();
                  }}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '9px 12px',
                    color: 'var(--danger)',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#FEF2F2'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <LogOut size={14} />
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
