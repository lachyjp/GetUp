import { useState, useCallback } from 'react';
import { Account, Transaction, UserData } from '../App';
import upBankApi from '../services/apiService';
import { demoAccounts, demoTransactions } from '../data/demoData';
import { CONFIG } from '../config/constants';

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
      if (userData.apiKey === CONFIG.DEFAULTS.DEMO_API_KEY) {
        // Demo mode: simulate network latency, then populate from bundled data
        await new Promise(resolve => setTimeout(resolve, CONFIG.UI.DEMO_LOADING_DELAY_MS));
        setAccounts(demoAccounts);
        setTransactions(demoTransactions);
        return;
      }

      // Set API key
      upBankApi.setApiKey(userData.apiKey);

      // Clear cache to ensure we get fresh data with new transaction count
      upBankApi.clearCache();

      // Fetch all data (up to max transaction count)
      const transactionLimit = Math.min(userData.transactionCount || CONFIG.DEFAULTS.TRANSACTION_COUNT, CONFIG.API.MAX_TRANSACTION_COUNT);
      const result = await upBankApi.fetchAllData(transactionLimit);

      // Handle accounts result
      if (result.accounts.success && result.accounts.data) {
        setAccounts(result.accounts.data);
        
        // Console log accounts if setting is enabled
        try {
          const consoleLogEnabled = localStorage.getItem('txnConsoleAccounts') === '1';
          if (consoleLogEnabled) {
            console.log('🏦 Accounts fetched:', result.accounts.data);
            console.table(result.accounts.data.map(a => ({
              id: a.id,
              name: a.name,
              balance: `$${a.balance.toFixed(2)}`,
              type: a.type,
              owner: a.owner
            })));
          }
        } catch (err) {
          // Silently fail if localStorage access fails
        }
      } else if (result.accounts.error) {
        setError(result.accounts.error);
        return;
      }

      // Handle transactions result
      if (result.transactions.success && result.transactions.data) {
        setTransactions(result.transactions.data);
        
        // Console log transactions if setting is enabled
        try {
          const consoleLogEnabled = localStorage.getItem('txnConsoleLog') === '1';
          if (consoleLogEnabled) {
            console.log('🔍 Transactions fetched:', result.transactions.data);
            console.table(result.transactions.data.map(t => ({
              id: t.id,
              description: t.description,
              amount: `$${t.amount.toFixed(2)}`,
              type: t.type,
              status: t.status,
              date: t.date,
              time: t.time
            })));
          }
        } catch (err) {
          // Silently fail if localStorage access fails
        }
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
      if (userData.apiKey === CONFIG.DEFAULTS.DEMO_API_KEY) {
        await new Promise(resolve => setTimeout(resolve, CONFIG.UI.DEMO_REFRESH_DELAY_MS));
        setAccounts(demoAccounts);
        setTransactions(demoTransactions);
        return;
      }

      // Clear cache to force refresh
      upBankApi.clearCache();
      
      // Set API key
      upBankApi.setApiKey(userData.apiKey);

      // Fetch all data (up to max transaction count)
      const transactionLimit = Math.min(userData.transactionCount || CONFIG.DEFAULTS.TRANSACTION_COUNT, CONFIG.API.MAX_TRANSACTION_COUNT);
      const result = await upBankApi.fetchAllData(transactionLimit);

      // Handle accounts result
      if (result.accounts.success && result.accounts.data) {
        setAccounts(result.accounts.data);
        
        // Console log accounts if setting is enabled
        try {
          const consoleLogEnabled = localStorage.getItem('txnConsoleAccounts') === '1';
          if (consoleLogEnabled) {
            console.log('🔄 Accounts refreshed:', result.accounts.data);
            console.table(result.accounts.data.map(a => ({
              id: a.id,
              name: a.name,
              balance: `$${a.balance.toFixed(2)}`,
              type: a.type,
              owner: a.owner
            })));
          }
        } catch (err) {
          // Silently fail if localStorage access fails
        }
      } else if (result.accounts.error) {
        setError(result.accounts.error);
        return;
      }

      // Handle transactions result
      if (result.transactions.success && result.transactions.data) {
        setTransactions(result.transactions.data);
        
        // Console log transactions if setting is enabled
        try {
          const consoleLogEnabled = localStorage.getItem('txnConsoleLog') === '1';
          if (consoleLogEnabled) {
            console.log('🔄 Transactions refreshed:', result.transactions.data);
            console.table(result.transactions.data.map(t => ({
              id: t.id,
              description: t.description,
              amount: `$${t.amount.toFixed(2)}`,
              type: t.type,
              status: t.status,
              date: t.date,
              time: t.time
            })));
          }
        } catch (err) {
          // Silently fail if localStorage access fails
        }
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
