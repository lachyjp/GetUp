import React from 'react';
import { Transaction } from '../App';

interface SpendingStatsProps {
  transactions: Transaction[];
}

const SpendingStats: React.FC<SpendingStatsProps> = ({ transactions }) => {
  // Calculate spending statistics
  const calculateStats = () => {
    if (!transactions || transactions.length === 0) {
      return {
        totalSpent: 0,
        daysBetween: 0,
        averageDaily: 0,
        uniqueMerchants: 0
      };
    }

    // Filter out transfers
    const nonTransferTxn = transactions.filter(
      transaction => !transaction.description.includes("Transfer")
    );
    
    const sum = nonTransferTxn.reduce((total, transaction) => total + transaction.amount, 0);
    const sumPlus = nonTransferTxn
      .filter(transaction => transaction.type === "+")
      .reduce((total, transaction) => total + transaction.amount, 0);

    const sumMinus = sum - sumPlus;

    // Calculate days between first and last transaction
    const firstDate = new Date(transactions[0].date);
    const lastDate = new Date(transactions[transactions.length - 1].date);
    const daysBetween = Math.abs(Math.round((lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)));

    // Calculate average daily spending
    const averageDaily = daysBetween > 0 ? Math.abs(sumMinus / daysBetween) : 0;

    // Count unique merchants
    const excludedDescriptions = ["Transfer from Spending", "Transfer to Savings", "Beem"];
    const uniqueMerchants = transactions
      .filter(transaction => !excludedDescriptions.includes(transaction.description))
      .map(transaction => transaction.text)
      .filter((text, index, array) => array.indexOf(text) === index);

    return {
      totalSpent: Math.abs(sumMinus),
      daysBetween,
      averageDaily,
      uniqueMerchants: uniqueMerchants.length
    };
  };

  const stats = calculateStats();

  return (
    <div className="card mb-4">
      <div className="card-header">
        <h3 className="mb-0">📊 Activity</h3>
      </div>
      <div className="card-body">
        <div className="row">
          <div className="col-md-3">
            <div className="text-center">
              <h4 className="text-primary">${stats.totalSpent.toFixed(2)}</h4>
              <p className="text-muted">Total Spent</p>
            </div>
          </div>
          <div className="col-md-3">
            <div className="text-center">
              <h4 className="text-info">{stats.daysBetween}</h4>
              <p className="text-muted">Days</p>
            </div>
          </div>
          <div className="col-md-3">
            <div className="text-center">
              <h4 className="text-success">${stats.averageDaily.toFixed(2)}</h4>
              <p className="text-muted">Daily Average</p>
            </div>
          </div>
          <div className="col-md-3">
            <div className="text-center">
              <h4 className="text-warning">{stats.uniqueMerchants}</h4>
              <p className="text-muted">Unique Merchants</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpendingStats;
