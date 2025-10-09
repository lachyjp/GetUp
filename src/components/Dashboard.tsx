import React, { useState } from 'react';
import { AppState } from '../App';
import AccountSummary from './AccountSummary';
import TransactionList from './TransactionList';
import SpendingStats from './SpendingStats';
import Settings from './Settings';

interface DashboardProps {
  state: AppState;
  onLogout: () => void;
  onRefresh: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ state, onLogout, onRefresh }) => {
  const { userData, accounts, transactions, loading, error } = state;
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div>
      {/* Welcome Header */}
      <div className="row mb-4">
        <div className="col">
          <h2>Welcome, ${userData?.userName}! 👋</h2>
        </div>
        <div className="col-auto">
          <div className="btn-group">
            <button 
              className="btn btn-outline-secondary"
              onClick={onRefresh}
              disabled={loading}
            >
              {loading ? '⏳ Refreshing...' : '🔄 Refresh Data'}
            </button>
            <button 
              className="btn btn-outline-secondary"
              onClick={() => setShowSettings(true)}
            >
              Settings
            </button>
            <button 
              className="btn btn-outline-danger"
              onClick={onLogout}
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="alert alert-danger" role="alert">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading your data...</p>
        </div>
      )}

      {/* Main Content */}
      {!loading && (
        <>
          {showSettings ? (
            <Settings onClose={() => setShowSettings(false)} />
          ) : (
            <SpendingStats transactions={transactions} />
          )}

          {/* Two-column layout: accounts (narrow) | transactions (wide) */}
          <div className="row g-3" style={{position: 'relative', zIndex: 0}}>
            <div className="col-md-4 col-lg-3 mb-4 position-relative" style={{zIndex: 1}}>
              <div className="column-clip">
                <AccountSummary accounts={accounts} />
              </div>
            </div>
            <div className="col-md-8 col-lg-9 position-relative" style={{zIndex: 1}}>
              <div className="column-clip">
                {!showSettings && <TransactionList transactions={transactions} />}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
