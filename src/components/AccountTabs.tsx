import React from 'react';
import { Account, Transaction } from '../App';

interface AccountTabsProps {
  accounts: Account[];
  transactions: Transaction[];
  selectedAccountId: string | null;
  onAccountSelect: (accountId: string | null) => void;
}

const AccountTabs: React.FC<AccountTabsProps> = ({ 
  accounts, 
  transactions, 
  selectedAccountId, 
  onAccountSelect 
}) => {
  // Get all account IDs (excluding maybuy savers)
  const getAllAccountIds = () => {
    return accounts
      .filter(account => account.type !== 'MAYBUY_SAVER')
      .map(account => account.id);
  };

  // Get account info by ID
  const getAccountById = (accountId: string) => {
    return accounts.find(account => account.id === accountId);
  };

  // Get transaction count for an account
  const getTransactionCount = (accountId: string | null) => {
    if (accountId === null) {
      return transactions.length;
    }
    return transactions.filter(transaction => transaction.accountId === accountId).length;
  };

  const accountIds = getAllAccountIds();

  return (
    <div className="card mb-4">
      <div className="card-body p-0">
        <ul className="nav nav-tabs nav-fill" role="tablist">
          {/* All Transactions Tab */}
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link ${selectedAccountId === null ? 'active' : ''}`}
              onClick={() => onAccountSelect(null)}
              type="button"
              role="tab"
            >
              <div className="d-flex flex-column align-items-center">
                <span className="fw-bold">All</span>
                <small className="text-muted">{getTransactionCount(null)} transactions</small>
              </div>
            </button>
          </li>

          {/* Individual Account Tabs */}
          {accountIds.map((accountId) => {
            const account = getAccountById(accountId);
            const transactionCount = getTransactionCount(accountId);
            
            if (!account) return null;

            return (
              <li key={accountId} className="nav-item" role="presentation">
                <button
                  className={`nav-link ${selectedAccountId === accountId ? 'active' : ''}`}
                  onClick={() => onAccountSelect(accountId)}
                  type="button"
                  role="tab"
                >
                  <div className="d-flex flex-column align-items-center">
                    <span className="fw-bold">{account.name}</span>
                    <small className="text-muted">{transactionCount} transactions</small>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default AccountTabs;
