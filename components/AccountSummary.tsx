import React from 'react';
import { Account } from '../App';

interface AccountSummaryProps {
  accounts: Account[];
}

const AccountSummary: React.FC<AccountSummaryProps> = ({ accounts }) => {
  // Calculate total balance
  const totalBalance = accounts.reduce((total, account) => total + account.balance, 0);

  return (
    <div className="card mb-4">
      <div className="card-header">
        <h3 className="mb-0">💯 Accounts</h3>
      </div>
      <div className="card-body">
        <div className="row">
          <div className="col-md-6">
            <h4 className="text-primary">Total Balance: ${totalBalance.toFixed(2)}</h4>
          </div>
        </div>
        
        <hr />
        
        <div className="row">
          {accounts.map((account, index) => (
            <div key={account.id || index} className="col-md-6 mb-3">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">
                    {account.name === "Spending" ? "💸" : ""} {account.name}
                  </h5>
                  <p className="card-text">
                    <strong>Balance:</strong> ${account.balance.toFixed(2)}
                  </p>
                  <small className="text-muted">
                    {account.type} • {account.owner}
                  </small>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AccountSummary;
