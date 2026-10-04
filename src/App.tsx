import React, { useState, useEffect } from 'react';
import { useDatabase } from './context/DatabaseContext';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { BottomNav } from './components/layout/BottomNav';
import { LoginModal } from './components/auth/LoginModal';
import { AccessDeniedModal } from './components/auth/AccessDeniedModal';

// Views
import { HomeView } from './views/HomeView';
import { DashboardView } from './views/DashboardView';
import { ProductsView } from './views/ProductsView';
import { StockView } from './views/StockView';
import { PurchaseView } from './views/PurchaseView';
import { SalesView } from './views/SalesView';
import { CustomersView } from './views/CustomersView';
import { ExpensesView } from './views/ExpensesView';
import { WastageView } from './views/WastageView';
import { ReportsView } from './views/ReportsView';
import { InternsView } from './views/InternsView';
import { SettingsView } from './views/SettingsView';

const VALID_TABS: NavTab[] = [
  'home',
  'dashboard',
  'products',
  'stock',
  'purchase',
  'sales',
  'customers',
  'expenses',
  'wastage',
  'reports',
  'interns',
  'settings'
];

const getInitialTab = (): NavTab => {
  const rawHash = window.location.hash.replace('#', '').trim().toLowerCase();
  if (VALID_TABS.includes(rawHash as NavTab)) {
    return rawHash as NavTab;
  }
  return 'home';
};

export const App: React.FC = () => {
  const { isAuthenticated, isAccessDenied } = useDatabase();
  const [currentTab, setCurrentTabState] = useState<NavTab>(getInitialTab);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Helper to change tab & sync with URL hash so direct navigation/refresh works
  const setCurrentTab = (tab: NavTab) => {
    setCurrentTabState(tab);
    if (window.location.hash !== `#${tab}`) {
      window.location.hash = tab;
    }
  };

  useEffect(() => {
    const handleHashChange = () => {
      const rawHash = window.location.hash.replace('#', '').trim().toLowerCase();
      if (VALID_TABS.includes(rawHash as NavTab)) {
        setCurrentTabState(rawHash as NavTab);
      }
    };

    window.addEventListener('hashchange', handleHashChange);

    // Sync initial hash if absent
    const rawHash = window.location.hash.replace('#', '').trim().toLowerCase();
    if (!VALID_TABS.includes(rawHash as NavTab)) {
      window.location.hash = currentTab;
    }

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Quick action from header to jump straight to POS terminal
  const handleNewSaleClick = () => {
    setCurrentTab('sales');
  };

  return (
    <div className="app-container">
      {/* Authentication checks */}
      {!isAuthenticated && <LoginModal />}
      {isAccessDenied && <AccessDeniedModal />}

      {/* Main Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      {/* Main App Content */}
      <div className="main-content">
        <Header
          currentTab={currentTab}
          onOpenMobileMenu={() => setIsMobileOpen(true)}
          onNewSaleClick={handleNewSaleClick}
        />

        <main style={{ flex: 1 }}>
          {currentTab === 'home' && (
            <HomeView
              onNavigateTab={(tab) => setCurrentTab(tab)}
              onNewSaleClick={handleNewSaleClick}
            />
          )}
          {currentTab === 'dashboard' && (
            <DashboardView
              onNavigateTab={(tab) => setCurrentTab(tab)}
              onNewSaleClick={handleNewSaleClick}
            />
          )}
          {currentTab === 'products' && <ProductsView />}
          {currentTab === 'stock' && <StockView />}
          {currentTab === 'purchase' && <PurchaseView />}
          {currentTab === 'sales' && <SalesView />}
          {currentTab === 'customers' && <CustomersView />}
          {currentTab === 'expenses' && <ExpensesView />}
          {currentTab === 'wastage' && <WastageView />}
          {currentTab === 'reports' && <ReportsView />}
          {currentTab === 'interns' && <InternsView />}
          {currentTab === 'settings' && <SettingsView />}
        </main>

        {/* Fixed Mobile Bottom Navigation Bar */}
        <BottomNav
          currentTab={currentTab}
          onSelectTab={(tab) => setCurrentTab(tab)}
        />
      </div>
    </div>
  );
};

export default App;
