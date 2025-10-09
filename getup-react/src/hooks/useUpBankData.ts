import { useState, useCallback } from 'react';
import { Account, Transaction, UserData } from '../App';
import upBankApi from '../services/apiService';

// Hook for managing Up Bank data
export const useUpBankData = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all data (accounts + transactions)
  const fetchData = useCallback(async (userData: UserData) => {
    setLoading(true);
    setError(null);

    try {
      // Set API key
      upBankApi.setApiKey(userData.apiKey);

      // Fetch all data
      const result = await upBankApi.fetchAllData(userData.transactionCount);

      // Handle accounts result
      if (result.accounts.success && result.accounts.data) {
        setAccounts(result.accounts.data);
      } else if (result.accounts.error) {
        setError(result.accounts.error);
        return;
      }

      // Handle transactions result
      if (result.transactions.success && result.transactions.data) {
        setTransactions(result.transactions.data);
      } else if (result.transactions.error) {
        setError(result.transactions.error);
        return;
      }

    } catch (err) {
      setError('Failed to fetch data. Please check your API key and try again.');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh data (force refresh, bypass cache)
  const refreshData = useCallback(async (userData: UserData) => {
    setLoading(true);
    setError(null);

    try {
      // Clear cache to force refresh
      upBankApi.clearCache();
      
      // Set API key
      upBankApi.setApiKey(userData.apiKey);

      // Fetch all data
      const result = await upBankApi.fetchAllData(userData.transactionCount);

      // Handle accounts result
      if (result.accounts.success && result.accounts.data) {
        setAccounts(result.accounts.data);
      } else if (result.accounts.error) {
        setError(result.accounts.error);
        return;
      }

      // Handle transactions result
      if (result.transactions.success && result.transactions.data) {
        setTransactions(result.transactions.data);
      } else if (result.transactions.error) {
        setError(result.transactions.error);
        return;
      }

    } catch (err) {
      setError('Failed to refresh data. Please try again.');
      console.error('Error refreshing data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Clear all data
  const clearData = useCallback(() => {
    setAccounts([]);
    setTransactions([]);
    setError(null);
    setLoading(false);
  }, []);

  return {
    accounts,
    transactions,
    loading,
    error,
    fetchData,
    refreshData,
    clearData,
  };
};
