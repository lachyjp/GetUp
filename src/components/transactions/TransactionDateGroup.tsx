import React from 'react';
import { Transaction } from '../../App';
import TransactionRow from './TransactionRow';

interface TransactionDateGroupProps {
  date: string;
  transactions: Transaction[];
  debugLogos: boolean;
  coalesceTransferPairs: (transactions: Transaction[]) => Transaction[];
}

const TransactionDateGroup: React.FC<TransactionDateGroupProps> = ({ 
  date, 
  transactions, 
  debugLogos,
  coalesceTransferPairs 
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                   'July', 'August', 'September', 'October', 'November', 'December'];
    return `${date.getDate()} ${months[date.getMonth()]}`;
  };

  const coalesced = coalesceTransferPairs(transactions);

  return (
    <div className="mb-4">
      <div className="txn-date-divider">
        <span>{formatDate(date)}</span>
      </div>
      
      {coalesced.map((transaction, index) => (
        <TransactionRow
          key={transaction.id || index}
          transaction={transaction}
          debugLogos={debugLogos}
          index={index}
        />
      ))}
    </div>
  );
};

export default TransactionDateGroup;
