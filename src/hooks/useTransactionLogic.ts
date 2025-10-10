import { useCallback } from 'react';
import { Transaction } from '../App';

interface UseTransactionLogicReturn {
  filteredTransactions: Transaction[];
  groupedTransactions: { [key: string]: Transaction[] };
  availableMonths: string[];
  coalesceTransferPairs: (transactions: Transaction[]) => Transaction[];
}

export const useTransactionLogic = (
  transactions: Transaction[],
  selectedAccountId?: string | null
): UseTransactionLogicReturn => {
  // Filter transactions by selected account
  const getFilteredTransactions = useCallback(() => {
    if (selectedAccountId === null || selectedAccountId === undefined) {
      return transactions;
    }
    return transactions.filter(transaction => transaction.accountId === selectedAccountId);
  }, [transactions, selectedAccountId]);

  // Get unique months from transactions
  const getAvailableMonths = useCallback(() => {
    const filteredTransactions = getFilteredTransactions();
    const months = new Set<string>();
    
    filteredTransactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      months.add(monthKey);
    });
    
    return Array.from(months).sort().reverse(); // Most recent first
  }, [getFilteredTransactions]);

  // Coalesce paired transfer rows
  const coalesceTransferPairs = useCallback((items: Transaction[]): Transaction[] => {
    const result: Transaction[] = [];
    const used = new Set<number>();
    
    for (let i = 0; i < items.length; i++) {
      if (used.has(i)) continue;
      const a = items[i];
      const fromMatch = /^Transfer from\s+(.+)$/i.exec(a.description);
      const toMatch = /^Transfer to\s+(.+)$/i.exec(a.description);

      // Try to find a pair at the same time with opposite sign and same absolute amount
      let pairedIndex = -1;
      for (let j = i + 1; j < items.length; j++) {
        if (used.has(j)) continue;
        const b = items[j];
        if (a.time === b.time && Math.abs(a.amount - b.amount) < 0.001 && (a.type === '+' ? b.type !== '+' : b.type === '+')) {
          const bFrom = /^Transfer from\s+(.+)$/i.exec(b.description);
          const bTo = /^Transfer to\s+(.+)$/i.exec(b.description);
          if ((fromMatch && bTo) || (toMatch && bFrom)) {
            pairedIndex = j;
            break;
          }
        }
      }

      if (pairedIndex >= 0) {
        const b = items[pairedIndex];
        const fromName = (fromMatch ? fromMatch[1] : (/^Transfer from\s+(.+)$/i.exec(b.description)?.[1])) || '';
        const toName = (toMatch ? toMatch[1] : (/^Transfer to\s+(.+)$/i.exec(b.description)?.[1])) || '';
        const amount = a.amount;
        const merged: Transaction = {
          id: `${a.id || i}_x_${b.id || pairedIndex}`,
          description: 'Transfer',
          amount,
          type: '',
          status: 'SETTLED',
          date: a.date,
          time: a.time,
          text: `${fromName} → ${toName}`,
          message: '',
          roundup: 'false',
          tags: Array.from(new Set([...(a.tags || []), ...(b.tags || []), 'internal'])),
          merchantLogoUrl: undefined,
        };
        result.push(merged);
        used.add(i);
        used.add(pairedIndex);
      } else {
        result.push(a);
      }
    }
    return result;
  }, []);


  const filteredTransactions = getFilteredTransactions();
  const availableMonths = getAvailableMonths();

  return {
    filteredTransactions,
    groupedTransactions: {}, // Will be populated when month is selected
    availableMonths,
    coalesceTransferPairs,
  };
};
