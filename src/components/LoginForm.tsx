import React, { useEffect, useState } from 'react';
import { UserData } from '../App';
import { encryptAndStore, hasStored, tryDecrypt, clearStored } from '../services/secureStorage';
import { CONFIG } from '../config/constants';

interface LoginFormProps {
  onLogin: (userData: UserData) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
  // Form state - React manages this for us!
  const [formData, setFormData] = useState({
    apiKey: '',
    userName: ''
  });
  
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [pin, setPin] = useState<string>('');
  const [hasSavedKey, setHasSavedKey] = useState<boolean>(false);
  const STORAGE_KEY = CONFIG.STORAGE.API_KEY;
  const DEMO_KEY = CONFIG.DEFAULTS.DEMO_API_KEY;

  useEffect(() => {
    setHasSavedKey(hasStored(STORAGE_KEY));
  }, [STORAGE_KEY]);

  // Function to validate API key format
  const validateApiKey = (apiKey: string): boolean => {
    const trimmedKey = apiKey.trim();
    return trimmedKey.length >= CONFIG.VALIDATION.MIN_API_KEY_LENGTH && /^up:yeah:[A-Za-z0-9_-]+$/.test(trimmedKey);
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Function to handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const apiKey = formData.apiKey.trim();

    if (rememberMe) {
      if (!pin || pin.length < CONFIG.VALIDATION.MIN_PIN_LENGTH) {
        setErrors(prev => ({ ...prev, pin: `Enter a ${CONFIG.VALIDATION.MIN_PIN_LENGTH}+ digit PIN to encrypt your key` }));
        return;
      }
      await encryptAndStore(STORAGE_KEY, apiKey, pin);
      setHasSavedKey(true);
    }

    onLogin({
      apiKey,
      userName: formData.userName.trim(),
      transactionCount: CONFIG.DEFAULTS.TRANSACTION_COUNT
    });
  };

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin || pin.length < CONFIG.VALIDATION.MIN_PIN_LENGTH) {
      setErrors(prev => ({ ...prev, pin: `Enter your PIN (${CONFIG.VALIDATION.MIN_PIN_LENGTH}+ digits)` }));
      return;
    }
    const decrypted = await tryDecrypt(STORAGE_KEY, pin);
    if (!decrypted) {
      setErrors(prev => ({ ...prev, pin: 'Incorrect PIN' }));
      return;
    }
    onLogin({
      apiKey: decrypted,
      userName: formData.userName.trim(),
      transactionCount: CONFIG.DEFAULTS.TRANSACTION_COUNT
    });
  };

  const handleClearSaved = () => {
    clearStored(STORAGE_KEY);
    setHasSavedKey(false);
    setRememberMe(false);
    setPin('');
    setFormData(prev => ({ ...prev, apiKey: '' }));
  };

  const handleDemoLogin = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    onLogin({
      apiKey: DEMO_KEY,
      userName: formData.userName.trim(),
      transactionCount: CONFIG.DEFAULTS.TRANSACTION_COUNT,
    });
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
            {hasSavedKey && (
              <div className="alert alert-info" role="alert">
                A saved API key is available on this device. Unlock with your PIN or enter a new key below.
              </div>
            )}
            <form onSubmit={hasSavedKey ? handleUnlock : handleSubmit}>
              <div className="mb-3">
                <label htmlFor="userName" className="form-label">Your $upID</label>
                <input
                  type="text"
                  className={`form-control ${errors.userName ? 'is-invalid' : ''}`}
                  id="userName"
                  name="userName"
                  value={formData.userName}
                  onChange={handleInputChange}
                  placeholder="(Optional)"
                  required
                />
                {errors.userName && (
                  <div className="invalid-feedback">{errors.userName}</div>
                )}
              </div>

              {!hasSavedKey && (
                <div className="mb-3">
                  <label htmlFor="apiKey" className="form-label">Your up API key</label>
                  <input
                    type="text"
                    className={`form-control ${errors.apiKey ? 'is-invalid' : ''}`}
                    id="apiKey"
                    name="apiKey"
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck={false}
                    value={formData.apiKey}
                    onChange={handleInputChange}
                    placeholder="up:yeah:..."
                    required
                  />
                  {errors.apiKey && (
                    <div className="invalid-feedback">{errors.apiKey}</div>
                  )}
                  <div className="form-text">
                    Get your API key from <a href="https://api.up.com.au/getting_started" target="_blank" rel="noopener noreferrer">this link (opens in new tab)</a>
                  </div>
                </div>
              )}

              {!hasSavedKey && (
                <div className="mb-3">
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="rememberMe"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor="rememberMe">
                      Remember this API key on this device (encrypted with a PIN)
                    </label>
                  </div>
                  
                  {rememberMe && (
                    <div className="alert alert-warning mt-3" role="alert">
                      <h6 className="alert-heading">🔒 Security Notice</h6>
                      
                      <p className="mb-2"><strong>Your API key is encrypted using AES-GCM with PBKDF2 key derivation (100,000 iterations)</strong></p>
                      <ul className="mb-3">
                        <li>Encrypted locally - only your browser can access it</li>
                        <li>Read-only access - API cannot transfer funds or make changes</li>
                        <li>Your PIN for your browser protects the encryption key</li>
                      </ul>
                      
                      <p className="mb-2"><strong>Security tips:</strong></p>
                      <ul className="mb-3">
                        <li>Use a strong PIN (6+ digits)</li>
                        <li>Don't use on shared devices</li>
                        <li>Generate a 48hr only key on the Up app</li>
                      </ul>
                      
                      <p className="mb-0 text-muted small">
                        <strong>Note:</strong> You can revoke access anytime in the Up Bank app.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {(rememberMe || hasSavedKey) && (
                <div className="mb-3">
                  <label htmlFor="pin" className="form-label">PIN (4+ digits)</label>
                  <input
                    type="password"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    className={`form-control ${errors.pin ? 'is-invalid' : ''}`}
                    id="pin"
                    name="pin"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="Enter PIN to encrypt or unlock"
                  />
                  {errors.pin && (
                    <div className="invalid-feedback">{errors.pin}</div>
                  )}
                </div>
              )}

              {/* Transaction count field removed; default set to 50 */}

              {/* Demo: single button placed above Log In */}
              

              <div className="d-grid gap-2">
              {!hasSavedKey && (
                <button type="button" className="btn btn-outline-secondary" onClick={handleDemoLogin}>
                  Try Demo Mode
                </button>
              )}
                <button type="submit" className="btn btn-primary btn-lg">
                  {hasSavedKey ? 'Unlock and Log In' : 'Log In'}
                </button>
                {hasSavedKey && (
                  <button type="button" className="btn btn-outline-danger" onClick={handleClearSaved}>
                    Forget saved API key on this device
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
