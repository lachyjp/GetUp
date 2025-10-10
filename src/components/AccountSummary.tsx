import React, { useEffect, useState } from 'react';
import { Account } from '../App';
import { ErrorLogger } from '../utils/errorLogger';
import { CONFIG } from '../config/constants';

interface AccountSummaryProps {
  accounts: Account[];
}

const AccountSummary: React.FC<AccountSummaryProps> = ({ accounts }) => {
  // Calculate total balance
  const totalBalance = accounts.reduce((total, account) => total + account.balance, 0);

  // Group accounts by type
  const groupAccountsByType = (accounts: Account[]) => {
    const groups = {
      transactional: [] as Account[],
      essentials: [] as Account[],
      saver: [] as Account[],
      maybuy: [] as Account[]
    };

    accounts.forEach(account => {
      if (account.type === 'MAYBUY_SAVER') {
        groups.maybuy.push(account);
      } else if (account.name.toLowerCase().includes('essential')) {
        groups.essentials.push(account);
      } else if (account.type === 'TRANSACTIONAL') {
        groups.transactional.push(account);
      } else if (account.type === 'SAVER') {
        groups.saver.push(account);
      } else {
        // Fallback to name-based categorization
        const name = account.name.toLowerCase();
        if (name.includes('essential')) {
          groups.essentials.push(account);
        } else if (name.includes('maybuy')) {
          groups.maybuy.push(account);
        } else {
          groups.saver.push(account);
        }
      }
    });

    return groups;
  };

  const accountGroups = groupAccountsByType(accounts);

  return (
    <div className="card mb-4 accounts-card">
      <div className="card-header">
        <div className="d-flex align-items-center justify-content-between">
          <h3 className="mb-0">💯 Accounts</h3>
          <span className="badge bg-primary">{accounts.length} accounts</span>
        </div>
      </div>
      <div className="card-body">
        {/* Total Balance Section */}
        <div className="total-balance-section mb-4">
          <div className="total-balance-amount">${totalBalance.toFixed(2)}</div>
          <div className="text-muted small">Total balance across all accounts</div>
          <div className="balance-trend mt-2">
            <span className="text-success small">↗ +2.3% this month</span>
          </div>
        </div>
        
        <div className="d-flex flex-column gap-4">
          {/* Transactional Accounts */}
          {accountGroups.transactional.length > 0 && (
            <AccountGroup 
              title="💳 Transactional" 
              accounts={accountGroups.transactional}
              description="Your everyday spending accounts"
            />
          )}

          {/* Essentials Accounts */}
          {accountGroups.essentials.length > 0 && (
            <AccountGroup 
              title="🏠 Essentials" 
              accounts={accountGroups.essentials}
              description="Bills and essential expenses"
            />
          )}

          {/* Saver Accounts */}
          {accountGroups.saver.length > 0 && (
            <AccountGroup 
              title="💰 Saver" 
              accounts={accountGroups.saver}
              description="Your savings and investment accounts"
            />
          )}

          {/* Maybuy Accounts */}
          {accountGroups.maybuy.length > 0 && (
            <AccountGroup 
              title="🤔 Maybuy" 
              accounts={accountGroups.maybuy}
              description="Future purchases and goals"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountSummary;

// Account group component
const AccountGroup: React.FC<{ 
  title: string; 
  accounts: Account[]; 
  description: string; 
}> = ({ title, accounts, description }) => {
  const totalGroupBalance = accounts.reduce((sum, account) => sum + account.balance, 0);
  
  return (
    <div className="account-group">
      <div className="account-group-header mb-3">
        <div className="d-flex align-items-center justify-content-between">
          <h6 className="text-muted mb-1 fw-bold">{title}</h6>
          <span className="badge bg-secondary">{accounts.length}</span>
        </div>
        <div className="text-muted small mb-2">{description}</div>
        <div className="group-balance">
          <span className="fw-bold text-success">${totalGroupBalance.toFixed(2)}</span>
          <span className="text-muted small ms-2">total</span>
        </div>
      </div>
      <div className="d-flex flex-column gap-2">
        {accounts.map((account, index) => (
          <AccountCard key={account.id || index} account={account} />
        ))}
      </div>
    </div>
  );
};

// Account card component
const AccountCard: React.FC<{ account: Account }> = ({ account }) => {
  const getAccountIcon = (account: Account) => {
    if (account.name.toLowerCase().includes('spending') && !account.name.toLowerCase().includes('2up')) {
      return "💸";
    }
    if (account.type === 'TRANSACTIONAL') {
      return "💳";
    }
    if (account.type === 'SAVER') {
      return "💰";
    }
    if (account.type === 'MAYBUY_SAVER') {
      return "🤔";
    }
    if (account.name.toLowerCase().includes('essential')) {
      return "🏠";
    }
    return "🏦";
  };

  return (
    <div className="card account-card w-100">
      <div className="card-body py-3 px-3">
        <div className="d-flex align-items-start justify-content-between mb-2">
          <div className="d-flex align-items-center">
            <span className="account-icon me-2">{getAccountIcon(account)}</span>
            <h6 className="card-title mb-0">{account.name}</h6>
          </div>
          <AccountMenu account={account} />
        </div>
        
        <div className="d-flex align-items-center justify-content-between">
          <div className="account-balance">
            <span className="fw-bold fs-5">${account.balance.toFixed(2)}</span>
          </div>
        </div>
        
        {/* Show goal progress at bottom if goal is set */}
        {account.type?.toLowerCase().includes('saver') && (
          <SaverGoalDisplay accountId={account.id} balance={account.balance} />
        )}
      </div>
    </div>
  );
};

// Account menu dropdown component
const AccountMenu: React.FC<{ account: Account }> = ({ account }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showDropdown]);

  return (
    <div className={`dropdown ${showDropdown ? 'show' : ''}`} ref={dropdownRef}>
      <button
        className="btn btn-sm btn-outline-secondary dropdown-toggle"
        type="button"
        onClick={() => setShowDropdown(!showDropdown)}
        aria-expanded={showDropdown}
      >
        ⋯
      </button>
      {showDropdown && (
        <div className="dropdown-menu show">
          {account.type?.toLowerCase().includes('saver') && (
            <SaverGoalDropdown accountId={account.id} balance={account.balance} />
          )}
          <div className="dropdown-item-text">
            <small className="text-muted">Account ID: {account.id}</small>
          </div>
        </div>
      )}
    </div>
  );
};

// Saver goal component for dropdown
const SaverGoalDropdown: React.FC<{ accountId: string; balance: number }> = ({ accountId, balance }) => {
  const storageKey = `${CONFIG.STORAGE.SAVER_GOAL_PREFIX}${accountId}`;
  const [editing, setEditing] = useState(false);
  const [goal, setGoal] = useState<string>('');

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) setGoal(saved);
    } catch {}
  }, [storageKey]);

  const saveGoal = () => {
    try { 
      localStorage.setItem(storageKey, goal); 
    } catch (error) {
      ErrorLogger.logError('AccountSummary.saveGoal', error, { accountId, goal });
    }
    setEditing(false);
  };

  return (
    <div className="px-3 py-2">
      <h6 className="dropdown-header">Savings Goal</h6>
      {!editing ? (
        <div>
          {goal && (
            <div className="mb-2">
              <div className="progress mb-2" style={{ height: 6, backgroundColor: '#3a3a4a' }}>
                <div
                  className="progress-bar"
                  role="progressbar"
                  style={{ width: `${Math.min(100, Math.max(0, (balance / parseFloat(goal)) * 100))}%`, backgroundColor: '#e57d68' }}
                />
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <span className="text-muted small">${goal} goal</span>
                <span className="text-muted small">{Math.round((balance / parseFloat(goal)) * 100)}%</span>
              </div>
            </div>
          )}
          <button className="btn btn-sm btn-primary w-100" onClick={() => setEditing(true)}>
            {goal ? 'Edit Goal' : 'Set Goal'}
          </button>
        </div>
      ) : (
        <div>
          <input
            type="number"
            className="form-control form-control-sm mb-2"
            placeholder="Goal amount"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
          />
          <div className="d-flex gap-1">
            <button className="btn btn-sm btn-primary flex-fill" onClick={saveGoal}>Save</button>
            <button className="btn btn-sm btn-outline-secondary" onClick={() => setEditing(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

// Display component for saver goal at bottom of account card
const SaverGoalDisplay: React.FC<{ accountId: string; balance: number }> = ({ accountId, balance }) => {
  const storageKey = `${CONFIG.STORAGE.SAVER_GOAL_PREFIX}${accountId}`;
  const [goal, setGoal] = useState<string>('');

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) setGoal(saved);
    } catch {}
  }, [storageKey]);

  // Only show if goal is set
  if (!goal) return null;

  const progressPercentage = Math.min(100, Math.max(0, (balance / parseFloat(goal)) * 100));

  return (
    <div className="mt-3 pt-2 border-top border-secondary">
      <div className="d-flex align-items-center justify-content-between mb-1">
        <span className="text-muted small">Goal Progress</span>
        <span className="text-muted small">{Math.round(progressPercentage)}%</span>
      </div>
      <div className="progress mb-1" style={{ height: 8, backgroundColor: '#3a3a4a' }}>
        <div
          className="progress-bar"
          role="progressbar"
          style={{ 
            width: `${progressPercentage}%`, 
            backgroundColor: '#e57d68',
            transition: 'width 0.3s ease'
          }}
        />
      </div>
      <div className="d-flex justify-content-between">
        <span className="text-muted small">${balance.toFixed(2)} of ${goal}</span>
        <span className="text-muted small">${(parseFloat(goal) - balance).toFixed(2)} to go</span>
      </div>
    </div>
  );
};

