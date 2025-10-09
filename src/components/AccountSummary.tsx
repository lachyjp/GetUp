import React, { useEffect, useState } from 'react';
import { Account } from '../App';

interface AccountSummaryProps {
  accounts: Account[];
}

const AccountSummary: React.FC<AccountSummaryProps> = ({ accounts }) => {
  // Calculate total balance
  const totalBalance = accounts.reduce((total, account) => total + account.balance, 0);

  // Ordering rules:
  // 1) Personal Spending first (name contains 'Spending' but not '2Up')
  // 2) 2Up spending/savers (name contains '2Up')
  // 3) Essentials (name contains 'Essential')
  // 4) Maybuys (name contains 'Maybuy')
  // 5) Original savers (fallback)
  const rankAccount = (a: Account): number => {
    const n = a.name.toLowerCase();
    if (n.includes('spending') && !n.includes('2up')) return 0;
    if (n.includes('2up')) return 1;
    if (n.includes('essential')) return 2;
    if (n.includes('maybuy')) return 3;
    return 4;
  };

  const ordered = [...accounts].sort((a, b) => rankAccount(a) - rankAccount(b));

  return (
    <div className="card mb-4 accounts-card">
      <div className="card-header">
        <h3 className="mb-0">💯 Accounts</h3>
      </div>
      <div className="card-body">
        <div className="mb-2">
          <div className="total-balance-amount">${totalBalance.toFixed(2)}</div>
          <div className="text-muted small">Total balance</div>
        </div>
        
        <div className="d-flex flex-column gap-2">
          {ordered.map((account, index) => (
            <div key={account.id || index} className="card account-card w-100">
              <div className="card-body py-2 px-3">
                <h5 className="card-title mb-1">
                  {account.name.toLowerCase().includes('spending') && !account.name.toLowerCase().includes('2up') ? "💸" : ""} {account.name}
                </h5>
                <div className="d-flex align-items-center justify-content-between">
                  <span className="fw-bold">${account.balance.toFixed(2)}</span>
                  {account.type?.toLowerCase().includes('saver') && (
                    <SaverGoal accountId={account.id} balance={account.balance} />
                  )}
                </div>
                {/* Removed type/owner tags as requested */}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AccountSummary;

// Inline component for saver goal
const SaverGoal: React.FC<{ accountId: string; balance: number }> = ({ accountId, balance }) => {
  const storageKey = `saver-goal-${accountId}`;
  const [editing, setEditing] = useState(false);
  const [goal, setGoal] = useState<string>('');

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) setGoal(saved);
    } catch {}
  }, [storageKey]);

  const saveGoal = () => {
    try { localStorage.setItem(storageKey, goal); } catch {}
    setEditing(false);
  };

  return (
    <div className="d-flex align-items-center gap-2" style={{ minWidth: 160 }}>
      {!editing ? (
        <>
          {goal ? (
            <div className="saver-goal d-flex align-items-center" style={{ width: 160 }}>
              <div className="progress flex-grow-1" style={{ height: 6, backgroundColor: '#3a3a4a' }}>
                <div
                  className="progress-bar"
                  role="progressbar"
                  style={{ width: `${Math.min(100, Math.max(0, (balance / parseFloat(goal)) * 100))}%`, backgroundColor: '#e57d68' }}
                />
              </div>
              <span className="ms-2 text-muted small">${goal}</span>
            </div>
          ) : (
            <span className="text-muted small">No goal</span>
          )}
          <button className="btn btn-sm btn-outline-secondary" onClick={() => setEditing(true)}>Set</button>
        </>
      ) : (
        <div className="d-flex align-items-center gap-2">
          <input
            type="number"
            className="form-control form-control-sm"
            placeholder="Amount"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            style={{ width: 110 }}
          />
          <button className="btn btn-sm btn-primary" onClick={saveGoal}>Save</button>
        </div>
      )}
    </div>
  );
};
