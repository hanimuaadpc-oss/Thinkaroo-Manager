import React, { useState } from 'react';
import { useDatabase } from './context/DatabaseContext';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { LoginModal } from './components/auth/LoginModal';
import { AccessDeniedModal } from './components/auth/AccessDeniedModal';

// Views
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

export const App: React.FC = () => {
  const { isAuthenticated, isAccessDenied } = useDatabase();
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [isMobileOpen, setIsMobileOpen] = useState(false);

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
      </div>
    </div>
  );
};

export default App;
