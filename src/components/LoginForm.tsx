import React, { useState } from 'react';
import { UserData } from '../App';

interface LoginFormProps {
  onLogin: (userData: UserData) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
  // Form state - React manages this for us!
  const [formData, setFormData] = useState({
    apiKey: '',
    userName: '',
    transactionCount: 20
  });
  
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Function to validate API key format
  const validateApiKey = (apiKey: string): boolean => {
    const trimmedKey = apiKey.trim();
    return trimmedKey.length >= 15 && /^up:yeah:[A-Za-z0-9_-]+$/.test(trimmedKey);
  };

  // Function to validate the form
  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.apiKey.trim()) {
      newErrors.apiKey = 'Please enter your Up API key to continue';
    } else if (!validateApiKey(formData.apiKey)) {
      newErrors.apiKey = 'Invalid API key format. Please check your key and try again.';
    }

    if (!formData.userName.trim()) {
      newErrors.userName = 'Please enter your name to personalize your experience';
    }

    const txnCount = parseInt(formData.transactionCount.toString());
    if (isNaN(txnCount) || txnCount < 1 || txnCount > 100) {
      newErrors.transactionCount = 'Transaction count must be a number between 1 and 100';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Function to handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onLogin({
        apiKey: formData.apiKey.trim(),
        userName: formData.userName.trim(),
        transactionCount: parseInt(formData.transactionCount.toString())
      });
    }
  };

  // Function to handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-6">
        <div className="card">
          <div className="card-header">
            <h3 className="mb-0">Welcome to GetUp ⚡</h3>
            <p className="text-muted mb-0">Enter your Up Bank API details to get started</p>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="userName" className="form-label">Your Name</label>
                <input
                  type="text"
                  className={`form-control ${errors.userName ? 'is-invalid' : ''}`}
                  id="userName"
                  name="userName"
                  value={formData.userName}
                  onChange={handleInputChange}
                  placeholder="Enter your name"
                  required
                />
                {errors.userName && (
                  <div className="invalid-feedback">{errors.userName}</div>
                )}
              </div>

              <div className="mb-3">
                <label htmlFor="apiKey" className="form-label">Up API Key</label>
                <input
                  type="password"
                  className={`form-control ${errors.apiKey ? 'is-invalid' : ''}`}
                  id="apiKey"
                  name="apiKey"
                  value={formData.apiKey}
                  onChange={handleInputChange}
                  placeholder="Enter your Up API key"
                  required
                />
                {errors.apiKey && (
                  <div className="invalid-feedback">{errors.apiKey}</div>
                )}
                <div className="form-text">
                  Get your API key from the Up mobile app
                </div>
              </div>

              <div className="mb-3">
                <label htmlFor="transactionCount" className="form-label">
                  Number of Transactions (1-100)
                </label>
                <input
                  type="number"
                  className={`form-control ${errors.transactionCount ? 'is-invalid' : ''}`}
                  id="transactionCount"
                  name="transactionCount"
                  value={formData.transactionCount}
                  onChange={handleInputChange}
                  min="1"
                  max="100"
                  placeholder="20"
                />
                {errors.transactionCount && (
                  <div className="invalid-feedback">{errors.transactionCount}</div>
                )}
                <div className="form-text">
                  Choose how many recent transactions to display
                </div>
              </div>

              <div className="d-grid">
                <button type="submit" className="btn btn-primary btn-lg">
                  Log In
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
