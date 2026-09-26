import React, { useState } from 'react';
import { 
  Menu, 
  Plus, 
  Search, 
  Bell, 
  UserCheck, 
  ChevronDown, 
  Clock, 
  Sparkles,
  ShieldAlert,
  GraduationCap
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
  const { currentIntern, interns, switchIntern, logout } = useDatabase();
  const [showInternMenu, setShowInternMenu] = useState(false);

  const getTabTitle = (tab: NavTab) => {
    switch (tab) {
      case 'dashboard': return 'Dashboard Overview';
      case 'products': return 'Products Catalogue';
      case 'stock': return 'Inventory & Stock Management';
      case 'purchase': return 'Purchases Intake';
      case 'sales': return 'Sales & Billing Terminal';
      case 'customers': return 'Customers & Purchase History';
      case 'expenses': return 'Business Expenses';
      case 'wastage': return 'Wastage & Damaged Goods';
      case 'reports': return 'Financial Reports & Analytics';
      case 'interns': return 'Intern Access Management';
      case 'settings': return 'Business Settings';
      default: return 'Thinkaroo ERP';
    }
  };

  const currentDate = new Date().toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

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

      {/* Right side: Quick Action "+ New Sale" and Intern Switcher */}
      <div className="header-actions">
        <button
          onClick={onNewSaleClick}
          className="btn-primary header-new-sale-btn"
        >
          <Plus size={16} strokeWidth={2.5} />
          <span className="btn-text">New Sale</span>
        </button>

        {/* Active Intern Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowInternMenu(!showInternMenu)}
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

          {showInternMenu && (
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
              <div style={{ padding: '6px 10px', borderBottom: '1px solid var(--border-light)', marginBottom: '6px' }}>
                <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-light)', textTransform: 'uppercase' }}>
                  Logged in as Approved Intern
                </div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginTop: '2px' }}>
                  {currentIntern?.name}
                </div>
                <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                  {currentIntern?.email}
                </div>
              </div>

              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', padding: '4px 10px' }}>
                Switch Intern (Active Desk)
              </div>

              <div style={{ maxHeight: '180px', overflowY: 'auto' }}>
                {interns.filter(i => i.status === 'ENABLED').map(intern => (
                  <button
                    key={intern.id}
                    onClick={() => {
                      switchIntern(intern.id);
                      setShowInternMenu(false);
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '7px 10px',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: intern.id === currentIntern?.id ? 'var(--primary-blue-light)' : 'transparent',
                      color: intern.id === currentIntern?.id ? 'var(--primary-blue)' : 'var(--text-secondary)',
                      fontSize: '12.5px',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600 }}>{intern.name}</div>
                      <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>{intern.email}</div>
                    </div>
                    {intern.id === currentIntern?.id && (
                      <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--primary-blue)' }}>ACTIVE</span>
                    )}
                  </button>
                ))}
              </div>

              <div style={{ borderTop: '1px solid var(--border-light)', marginTop: '6px', paddingTop: '6px' }}>
                <button
                  onClick={() => {
                    setShowInternMenu(false);
                    logout();
                  }}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '8px 10px',
                    color: 'var(--danger)',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#FEF2F2'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  Sign Out of Session
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
