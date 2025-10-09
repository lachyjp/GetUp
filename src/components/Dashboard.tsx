import React from 'react';
import { AppState } from '../App';
import AccountSummary from './AccountSummary';
import TransactionList from './TransactionList';
import SpendingStats from './SpendingStats';

interface DashboardProps {
  state: AppState;
  onLogout: () => void;
  onRefresh: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ state, onLogout, onRefresh }) => {
  const { userData, accounts, transactions, loading, error } = state;

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
          {/* Account Summary */}
          <SpendingStats transactions={transactions} />

          {/* Two-column layout: accounts (narrow) | transactions (wide) */}
          <div className="row">
            <div className="col-md-4 col-lg-3 mb-4">
              <AccountSummary accounts={accounts} />
            </div>
            <div className="col-md-8 col-lg-9">
              <TransactionList transactions={transactions} />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
