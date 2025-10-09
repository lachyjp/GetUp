import React, { useState } from 'react';
import { Transaction } from '../App';

interface TransactionListProps {
  transactions: Transaction[];
}

const TransactionList: React.FC<TransactionListProps> = ({ transactions }) => {
  const [expandedTransactions, setExpandedTransactions] = useState<Set<number>>(new Set());

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

  // Toggle transaction expansion
  const toggleTransaction = (index: number) => {
    setExpandedTransactions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const groupedTransactions = groupTransactionsByDate();

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="mb-0">💳 Recent Transactions</h3>
      </div>
      <div className="card-body">
        {Object.keys(groupedTransactions).length === 0 ? (
          <p className="text-muted text-center">No transactions found</p>
        ) : (
          Object.entries(groupedTransactions).map(([date, dayTransactions]) => (
            <div key={date} className="mb-4">
              <h5 className="text-primary mb-3">{formatDate(date)}</h5>
              
              {dayTransactions.map((transaction, index) => (
                <div key={transaction.id || index} className="accordion mb-2">
                  <div className="accordion-item">
                    <h2 className="accordion-header">
                      <button
                        className={`accordion-button ${!expandedTransactions.has(index) ? 'collapsed' : ''}`}
                        type="button"
                        onClick={() => toggleTransaction(index)}
                        aria-expanded={expandedTransactions.has(index)}
                      >
                        <div className="d-flex justify-content-between w-100 me-3">
                          <span>{transaction.description}</span>
                          <span className={`badge ${transaction.type === '+' ? 'bg-success' : 'bg-danger'}`}>
                            {transaction.type}${transaction.amount.toFixed(2)}
                          </span>
                        </div>
                      </button>
                    </h2>
                    
                    {expandedTransactions.has(index) && (
                      <div className="accordion-collapse collapse show">
                        <div className="accordion-body">
                          <div className="row">
                            <div className="col-md-6">
                              <p><strong>Time:</strong> {transaction.time}</p>
                              <p><strong>Status:</strong> 
                                <span className={`badge ms-2 ${
                                  transaction.status === 'SETTLED' ? 'bg-success' : 'bg-warning'
                                }`}>
                                  {transaction.status}
                                </span>
                              </p>
                            </div>
                            <div className="col-md-6">
                              <p><strong>Merchant:</strong> {transaction.text}</p>
                              <p><strong>Message:</strong> {transaction.message}</p>
                              <p><strong>Round Up:</strong> {transaction.roundup}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
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
