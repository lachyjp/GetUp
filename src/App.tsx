import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import LoginForm from './components/LoginForm';
import Dashboard from './components/Dashboard';
import ErrorBoundary from './components/ErrorBoundary';
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
  tags?: string[];
  merchantLogoUrl?: string;
  accountId?: string;
  accountName?: string;
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
  // Set dynamic tab title based on environment
  useEffect(() => {
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const baseTitle = 'GetUp ↑';
    const environment = isLocalhost ? ' [DEV]' : ' [PROD]';
    document.title = baseTitle + environment;
  }, []);

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

  // Main app state - only track login state and user data
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);

  // Function to handle login
  const handleLogin = async (userData: UserData) => {
    setIsLoggedIn(true);
    setUserData(userData);
    
    // Fetch data from Up Bank API
    await fetchData(userData);
  };

  // Function to handle logout
  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserData(null);
    clearData();
  };

  // Function to handle refresh
  const handleRefresh = async () => {
    if (userData) {
      await refreshData(userData);
    }
  };

  return (
    <div className="App">
      <div className="container">
        <h1 className="text-center mb-4">GetUp ↑</h1>
        
        <ErrorBoundary>
          {!isLoggedIn ? (
            <LoginForm onLogin={handleLogin} />
          ) : (
            <ErrorBoundary>
              <Dashboard 
                state={{
                  isLoggedIn,
                  userData,
                  accounts,
                  transactions,
                  loading,
                  error
                }}
                onLogout={handleLogout}
                onRefresh={handleRefresh}
              />
            </ErrorBoundary>
          )}
        </ErrorBoundary>
      </div>
    </div>
  );
}

export default App;