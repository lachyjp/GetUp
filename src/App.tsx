import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import LoginForm from './components/LoginForm';
import Dashboard from './components/Dashboard';
import { useUpBankData } from './hooks/useUpBankData';

// Types for our app
export interface UserData {
  apiKey: string;
  userName: string;
  transactionCount: number;
}

export interface Account {
  id: string;
  name: string;
  balance: number;
  type: string;
  owner: string;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: string;
  status: string;
  date: string;
  time: string;
  text: string;
  message: string;
  roundup: string;
}

export interface AppState {
  isLoggedIn: boolean;
  userData: UserData | null;
  accounts: Account[];
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
}

function App() {
  // Use our custom hook for Up Bank data
  const {
    accounts,
    transactions,
    loading,
    error,
    fetchData,
    refreshData,
    clearData
  } = useUpBankData();

  // Main app state
  const [state, setState] = useState<AppState>({
    isLoggedIn: false,
    userData: null,
    accounts: [],
    transactions: [],
    loading: false,
    error: null
  });

  // Function to handle login
  const handleLogin = async (userData: UserData) => {
    setState(prev => ({
      ...prev,
      isLoggedIn: true,
      userData,
      loading: true,
      error: null
    }));
    
    // Fetch data from Up Bank API
    await fetchData(userData);
  };

  // Function to handle logout
  const handleLogout = () => {
    setState({
      isLoggedIn: false,
      userData: null,
      accounts: [],
      transactions: [],
      loading: false,
      error: null
    });
    clearData();
  };

  // Function to handle refresh
  const handleRefresh = async () => {
    if (state.userData) {
      await refreshData(state.userData);
    }
  };

  return (
    <div className="App">
      <div className="container">
        <h1 className="text-center mb-4">GetUp ↑</h1>
        
        {!state.isLoggedIn ? (
          <LoginForm onLogin={handleLogin} />
        ) : (
          <Dashboard 
            state={{
              ...state,
              accounts,
              transactions,
              loading,
              error
            }}
            onLogout={handleLogout}
            onRefresh={handleRefresh}
          />
        )}
      </div>
    </div>
  );
}

export default App;