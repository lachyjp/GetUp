import { useCallback } from 'react';
import { Transaction, Account } from '../App';

interface SpendingStats {
  totalSpent: number;
  daysBetween: number;
  averageDaily: number;
  uniqueMerchants: number;
}

export const useSpendingStats = (
  transactions: Transaction[],
  accounts: Account[],
  selectedAccountId?: string | null
) => {
  const calculateStats = useCallback((): SpendingStats => {
    if (!transactions || transactions.length === 0) {
      return {
        totalSpent: 0,
        daysBetween: 0,
        averageDaily: 0,
        uniqueMerchants: 0
      };
    }

    // Filter transactions by selected account
    let filteredTransactions = transactions;
    if (selectedAccountId !== null && selectedAccountId !== undefined) {
      filteredTransactions = transactions.filter(transaction => transaction.accountId === selectedAccountId);
    }

    if (filteredTransactions.length === 0) {
      return {
        totalSpent: 0,
        daysBetween: 0,
        averageDaily: 0,
        uniqueMerchants: 0
      };
    }

    // Filter out transfers
    const nonTransferTxn = filteredTransactions.filter(
      transaction => !transaction.description.includes("Transfer")
    );
    
    const sum = nonTransferTxn.reduce((total, transaction) => total + transaction.amount, 0);
    const sumPlus = nonTransferTxn
      .filter(transaction => transaction.type === "+")
      .reduce((total, transaction) => total + transaction.amount, 0);

    const sumMinus = sum - sumPlus;

    // Calculate days between first and last transaction
    const firstDate = new Date(filteredTransactions[0].date);
    const lastDate = new Date(filteredTransactions[filteredTransactions.length - 1].date);
    const daysBetween = Math.abs(Math.round((lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)));

    // Calculate average daily spending
    const averageDaily = daysBetween > 0 ? Math.abs(sumMinus / daysBetween) : 0;

    // Count unique merchants
    const excludedDescriptions = ["Transfer from Spending", "Transfer to Savings", "Beem"];
    const uniqueMerchants = filteredTransactions
      .filter(transaction => !excludedDescriptions.includes(transaction.description))
      .map(transaction => transaction.text)
      .filter((text, index, array) => array.indexOf(text) === index);

    return {
      totalSpent: Math.abs(sumMinus),
      daysBetween,
      averageDaily,
      uniqueMerchants: uniqueMerchants.length
    };
  }, [transactions, selectedAccountId]);

  const getAccountName = useCallback(() => {
    if (selectedAccountId === null || selectedAccountId === undefined) {
      return "All Accounts";
    }
    const account = accounts.find(acc => acc.id === selectedAccountId);
    return account ? account.name : "Unknown Account";
  }, [accounts, selectedAccountId]);

  return {
    stats: calculateStats(),
    accountName: getAccountName(),
    calculateStats
  };
};
