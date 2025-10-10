import React, { useState, useMemo } from 'react';
import { Transaction } from '../../App';
import { Card } from '../shared';
import { useTransactionLogic } from '../../hooks/useTransactionLogic';
import useLocalStorage from '../../hooks/useLocalStorage';
import TransactionDateGroup from './TransactionDateGroup';
import TransactionMonthNavigation from './TransactionMonthNavigation';

interface TransactionListProps {
  transactions: Transaction[];
  selectedAccountId?: string | null;
}

const TransactionList: React.FC<TransactionListProps> = ({ transactions, selectedAccountId }) => {
  const [currentMonth, setCurrentMonth] = useState<string>('');
  const { value: debugLogos } = useLocalStorage('txnDebugLogos', false);
  
  const {
    filteredTransactions,
    availableMonths,
    coalesceTransferPairs
  } = useTransactionLogic(transactions, selectedAccountId);

  // Set initial month to most recent
  React.useEffect(() => {
    if (availableMonths.length > 0 && !currentMonth) {
      setCurrentMonth(availableMonths[0]);
    }
  }, [availableMonths, currentMonth]);

  // Filter transactions by selected month
  const getTransactionsForMonth = (monthKey: string) => {
    return filteredTransactions.filter(transaction => {
      const date = new Date(transaction.date);
      const transactionMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      return transactionMonth === monthKey;
    });
  };

  // Group transactions by date for the selected month
  const groupTransactionsByDate = useMemo(() => {
    if (!currentMonth) return {};
    
    const monthTransactions = getTransactionsForMonth(currentMonth);
    const grouped: { [key: string]: Transaction[] } = {};
    
    monthTransactions.forEach(transaction => {
      const date = transaction.date;
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(transaction);
    });
    
    return grouped;
  }, [currentMonth, getTransactionsForMonth]);

  const formatMonth = (monthKey: string) => {
    const [year, month] = monthKey.split('-');
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                   'July', 'August', 'September', 'October', 'November', 'December'];
    return `${months[parseInt(month) - 1]} ${year}`;
  };

  const getCurrentMonthIndex = () => {
    return availableMonths.indexOf(currentMonth);
  };

  const goToPreviousMonth = () => {
    const currentIndex = getCurrentMonthIndex();
    if (currentIndex < availableMonths.length - 1) {
      setCurrentMonth(availableMonths[currentIndex + 1]);
    }
  };

  const goToNextMonth = () => {
    const currentIndex = getCurrentMonthIndex();
    if (currentIndex > 0) {
      setCurrentMonth(availableMonths[currentIndex - 1]);
    }
  };

  const monthTransactions = getTransactionsForMonth(currentMonth);

  return (
    <Card className="txn-contrast">
      <div className="card-header">
        <div className="d-flex align-items-center justify-content-between">
          <h5 className="mb-0">Transactions</h5>
        </div>
        {availableMonths.length > 0 && (
          <TransactionMonthNavigation
            currentMonth={currentMonth}
            availableMonths={availableMonths}
            onPrevious={goToPreviousMonth}
            onNext={goToNextMonth}
            transactionCount={monthTransactions.length}
          />
        )}
      </div>
      
      <div className="card-body">
        {Object.keys(groupTransactionsByDate).length === 0 ? (
          <p className="text-muted text-center">
            No transactions found for {currentMonth ? formatMonth(currentMonth) : 'this month'}
          </p>
        ) : (
          Object.entries(groupTransactionsByDate).map(([date, dayTransactions]) => (
            <TransactionDateGroup
              key={date}
              date={date}
              transactions={dayTransactions}
              debugLogos={debugLogos}
              coalesceTransferPairs={coalesceTransferPairs}
            />
          ))
        )}
      </div>
    </Card>
  );
};

export default TransactionList;
