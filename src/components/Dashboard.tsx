import React, { useState } from 'react';
import { AppState } from '../App';
import AccountSummary from './AccountSummary';
import AccountTabs from './AccountTabs';
import TransactionList from './transactions/TransactionList';
import SpendingStats from './SpendingStats';
import Settings from './Settings';
import { LoadingSpinner, ErrorAlert, Button } from './shared';

interface DashboardProps {
  state: AppState;
  onLogout: () => void;
  onRefresh: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ state, onLogout, onRefresh }) => {
  const { userData, accounts, transactions, loading, error } = state;
  const [showSettings, setShowSettings] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);

  return (
    <div>
      {/* Welcome Header */}
      <div className="row mb-4">
        <div className="col">
          <h2>Welcome, ${userData?.userName}! 👋</h2>
        </div>
        <div className="col-auto">
          <div className="btn-group">
            <Button 
              variant="outline-secondary"
              onClick={onRefresh}
              loading={loading}
            >
              🔄 Refresh Data
            </Button>
            <Button 
              variant="outline-secondary"
              onClick={() => setShowSettings(true)}
            >
              Settings
            </Button>
            <Button 
              variant="outline-danger"
              onClick={onLogout}
            >
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && <ErrorAlert message={error} />}

      {/* Loading State */}
      {loading && <LoadingSpinner text="Loading your data..." />}

      {/* Main Content */}
      {!loading && (
        <>
          {showSettings ? (
            <Settings onClose={() => setShowSettings(false)} />
          ) : (
            <div className="row g-3" style={{position: 'relative', zIndex: 0}}>
              <div className="col-md-4 col-lg-3 mb-4 position-relative" style={{zIndex: 1}}>
                <div className="column-clip">
                  <AccountSummary accounts={accounts} />
                  <SpendingStats 
                    transactions={transactions} 
                    accounts={accounts}
                    selectedAccountId={selectedAccountId}
                  />
                </div>
              </div>
              <div className="col-md-8 col-lg-9 position-relative" style={{zIndex: 1}}>
                <div className="column-clip">
                  <AccountTabs 
                    accounts={accounts}
                    transactions={transactions}
                    selectedAccountId={selectedAccountId}
                    onAccountSelect={setSelectedAccountId}
                  />
                  <TransactionList 
                    transactions={transactions} 
                    selectedAccountId={selectedAccountId}
                  />
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;
