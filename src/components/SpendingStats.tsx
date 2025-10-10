import React from 'react';
import { Transaction, Account } from '../App';
import { Card } from './shared';
import { useSpendingStats } from '../hooks/useSpendingStats';

interface SpendingStatsProps {
  transactions: Transaction[];
  accounts: Account[];
  selectedAccountId?: string | null;
}

const SpendingStats: React.FC<SpendingStatsProps> = ({ transactions, accounts, selectedAccountId }) => {
  const { stats, accountName } = useSpendingStats(transactions, accounts, selectedAccountId);

  return (
    <Card className="mb-3">
      <div className="card-body py-2">
        <div className="d-flex flex-column">
          <h6 className="mb-2 text-muted">📊 {accountName}</h6>
          <div className="d-flex flex-column gap-2">
            <div className="d-flex justify-content-between align-items-center">
              <small className="text-muted">Spent</small>
              <div className="fw-bold text-primary">${stats.totalSpent.toFixed(2)}</div>
            </div>
            <div className="d-flex justify-content-between align-items-center">
              <small className="text-muted">Days</small>
              <div className="fw-bold text-info">{stats.daysBetween}</div>
            </div>
            <div className="d-flex justify-content-between align-items-center">
              <small className="text-muted">Daily</small>
              <div className="fw-bold text-success">${stats.averageDaily.toFixed(2)}</div>
            </div>
            <div className="d-flex justify-content-between align-items-center">
              <small className="text-muted">Merchants</small>
              <div className="fw-bold text-warning">{stats.uniqueMerchants}</div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default SpendingStats;
