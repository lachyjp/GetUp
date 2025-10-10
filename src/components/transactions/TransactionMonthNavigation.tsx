import React from 'react';
import { Button } from '../shared';

interface TransactionMonthNavigationProps {
  currentMonth: string;
  availableMonths: string[];
  onPrevious: () => void;
  onNext: () => void;
  transactionCount: number;
}

const TransactionMonthNavigation: React.FC<TransactionMonthNavigationProps> = ({
  currentMonth,
  availableMonths,
  onPrevious,
  onNext,
  transactionCount
}) => {
  const formatMonth = (monthKey: string) => {
    const [year, month] = monthKey.split('-');
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                   'July', 'August', 'September', 'October', 'November', 'December'];
    return `${months[parseInt(month) - 1]} ${year}`;
  };

  const getCurrentMonthIndex = () => {
    return availableMonths.indexOf(currentMonth);
  };

  const currentIndex = getCurrentMonthIndex();

  return (
    <div className="mt-2">
      <div className="d-flex align-items-center justify-content-between">
        <span className="fw-bold text-primary">
          {currentMonth ? formatMonth(currentMonth) : 'Select Month'}
        </span>
        <div className="d-flex align-items-center gap-2">
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={onPrevious}
            disabled={currentIndex >= availableMonths.length - 1}
          >
            ←
          </Button>
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={onNext}
            disabled={currentIndex <= 0}
          >
            →
          </Button>
        </div>
      </div>
      <div className="mt-1">
        <small className="text-muted">
          Showing {transactionCount} transactions for {currentMonth ? formatMonth(currentMonth) : 'selected month'}
        </small>
      </div>
    </div>
  );
};

export default TransactionMonthNavigation;
