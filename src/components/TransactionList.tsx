import React, { useState } from 'react';
import { Transaction } from '../App';

interface TransactionListProps {
  transactions: Transaction[];
}

const TransactionList: React.FC<TransactionListProps> = ({ transactions }) => {

  // Group transactions by date
  const groupTransactionsByDate = () => {
    const grouped: { [key: string]: Transaction[] } = {};
    
    transactions.forEach(transaction => {
      const date = transaction.date;
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(transaction);
    });
    
    return grouped;
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                   'July', 'August', 'September', 'October', 'November', 'December'];
    return `${date.getDate()} ${months[date.getMonth()]}`;
  };

  const isIncome = (t: Transaction) => t.type === '+' || t.amount < 0 === false && t.type === '+'; // conservative

  const isPresent = (value?: string) => {
    if (!value) return false;
    const trimmed = value.trim();
    if (!trimmed) return false;
    return trimmed.toUpperCase() !== 'N/A';
  };

  const groupedTransactions = groupTransactionsByDate();

  const [lightRows, setLightRows] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('txnLightRows');
      return saved === '1';
    } catch {
      return false;
    }
  });

  const [failedLogos, setFailedLogos] = useState<Set<string>>(new Set());

  const getDisplayName = (t: Transaction) => {
    const source = (t.text && t.text !== 'N/A' ? t.text : t.description) || '';
    // Prefer part before dash, else first word
    const dashed = source.split(' - ')[0];
    const word = dashed.split(' ')[0];
    return dashed || word || '•';
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/).slice(0, 2);
    return parts.map(p => p[0]).join('').toUpperCase();
  };

  return (
    <div className={`card txn-contrast ${lightRows ? 'txn-contrast-light' : ''}`}>
      <div className="card-header d-flex align-items-center justify-content-between">
        <h3 className="mb-0">💳 Recent Transactions</h3>
        <div className="form-check form-switch">
          <input
            className="form-check-input"
            type="checkbox"
            id="toggleLightRows"
            checked={lightRows}
            onChange={(e) => {
              const next = e.target.checked;
              setLightRows(next);
              try { localStorage.setItem('txnLightRows', next ? '1' : '0'); } catch {}
            }}
          />
          <label className="form-check-label" htmlFor="toggleLightRows">
            Light rows
          </label>
        </div>
      </div>
      <div className="card-body">
        {Object.keys(groupedTransactions).length === 0 ? (
          <p className="text-muted text-center">No transactions found</p>
        ) : (
          Object.entries(groupedTransactions).map(([date, dayTransactions]) => (
            <div key={date} className="mb-4">
              <div className="txn-date-divider">
                <span>{formatDate(date)}</span>
              </div>
              
              {dayTransactions.map((transaction, index) => (
                <div key={transaction.id || index} className="txn-row d-flex align-items-center justify-content-between">
                  <div className="txn-avatar me-3">
                    {transaction.merchantLogoUrl && !failedLogos.has(transaction.id) ? (
                      <img
                        src={transaction.merchantLogoUrl}
                        alt=""
                        className="txn-logo"
                        width={36}
                        height={36}
                        onError={() => setFailedLogos(prev => new Set(prev).add(transaction.id))}
                      />
                    ) : (
                      <div className="txn-initials">{getInitials(getDisplayName(transaction))}</div>
                    )}
                  </div>
                  <div className="d-flex flex-column flex-grow-1 me-3">
                    <div className="d-flex align-items-center">
                      <span className="txn-description me-2">{transaction.description}</span>
                      {isPresent(transaction.text) && (
                        <span className="txn-merchant text-muted small">{transaction.text}</span>
                      )}
                    </div>
                    <div className="d-flex align-items-center gap-2 flex-wrap">
                      {isPresent(transaction.status) && (
                        <span className={`badge ${transaction.status === 'SETTLED' ? 'bg-success' : 'bg-warning'} small`}>{transaction.status}</span>
                      )}
                      {isPresent(transaction.time) && (
                        <span className="text-muted small">{transaction.time}</span>
                      )}
                      {isPresent(transaction.message) && (
                        <span className="text-muted small">• {transaction.message}</span>
                      )}
                      {transaction.roundup === 'true' && (
                        <span className="text-info small">• Round Up</span>
                      )}
                      {Array.isArray(transaction.tags) && transaction.tags.length > 0 && (
                        <span className="txn-tags d-flex align-items-center gap-1 flex-wrap">
                          {transaction.tags.map((tag, i) => (
                            <span key={i} className="badge bg-secondary text-uppercase small">{tag}</span>
                          ))}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-end">
                    <span className={`txn-amount ${transaction.type === '+' ? 'text-success' : 'text-danger'}`}>
                      {transaction.type || (transaction.amount >= 0 ? '-' : '+')}${Math.abs(transaction.amount).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TransactionList;
