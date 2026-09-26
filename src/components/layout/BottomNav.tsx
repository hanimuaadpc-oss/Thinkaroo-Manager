import React from 'react';
import { LayoutDashboard, ReceiptText, Package, Boxes, BarChart3, LucideIcon } from 'lucide-react';
import { NavTab } from './Sidebar';

interface BottomNavProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onSelectTab }) => {
  const items: { id: NavTab; label: string; icon: LucideIcon }[] = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'sales', label: 'Sales', icon: ReceiptText },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'stock', label: 'Stock', icon: Boxes },
    { id: 'reports', label: 'Reports', icon: BarChart3 }
  ];

  return (
    <nav className="app-bottom-nav" aria-label="Mobile Bottom Navigation">
      {items.map(item => {
        const Icon = item.icon;
        const isActive = currentTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onSelectTab(item.id)}
            className={`bottom-nav-item ${isActive ? 'active' : ''}`}
            aria-label={item.label}
          >
            <div className="bottom-nav-icon-wrapper">
              <Icon size={20} color={isActive ? 'var(--primary-orange)' : '#64748B'} />
            </div>
            <span className="bottom-nav-label">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
