import React, { useEffect, useState } from 'react';
import { ErrorLogger } from '../utils/errorLogger';
import { CONFIG } from '../config/constants';

interface SettingsProps {
  onClose: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onClose }) => {
  const [debugLogos, setDebugLogos] = useState<boolean>(false);
  const [consoleLogTransactions, setConsoleLogTransactions] = useState<boolean>(false);
  const [consoleLogAccounts, setConsoleLogAccounts] = useState<boolean>(false);

  useEffect(() => {
    try {
      const savedLogos = localStorage.getItem(CONFIG.STORAGE.DEBUG_LOGOS);
      setDebugLogos(savedLogos === '1');
      
      const savedConsole = localStorage.getItem(CONFIG.STORAGE.CONSOLE_LOG);
      setConsoleLogTransactions(savedConsole === '1');
      
      const savedAccounts = localStorage.getItem(CONFIG.STORAGE.CONSOLE_ACCOUNTS);
      setConsoleLogAccounts(savedAccounts === '1');
    } catch {}
  }, []);

  const handleToggle = (checked: boolean, setting: 'logos' | 'console' | 'accounts') => {
    if (setting === 'logos') {
      setDebugLogos(checked);
      try { 
        localStorage.setItem(CONFIG.STORAGE.DEBUG_LOGOS, checked ? '1' : '0'); 
      } catch (error) {
        ErrorLogger.logError('Settings.handleToggle', error, { setting: 'logos', checked });
      }
    } else if (setting === 'console') {
      setConsoleLogTransactions(checked);
      try { 
        localStorage.setItem(CONFIG.STORAGE.CONSOLE_LOG, checked ? '1' : '0'); 
      } catch (error) {
        ErrorLogger.logError('Settings.handleToggle', error, { setting: 'console', checked });
      }
    } else if (setting === 'accounts') {
      setConsoleLogAccounts(checked);
      try { 
        localStorage.setItem(CONFIG.STORAGE.CONSOLE_ACCOUNTS, checked ? '1' : '0'); 
      } catch (error) {
        ErrorLogger.logError('Settings.handleToggle', error, { setting: 'accounts', checked });
      }
    }
  };

  return (
    <div className="card mb-4">
      <div className="card-header d-flex align-items-center justify-content-between">
        <h3 className="mb-0">⚙️ Settings</h3>
        <button className="btn btn-outline-secondary" onClick={onClose}>Back</button>
      </div>
      <div className="card-body">
        <div className="form-check form-switch mb-3">
          <input
            className="form-check-input"
            type="checkbox"
            id="settingDebugLogos"
            checked={debugLogos}
            onChange={(e) => handleToggle(e.target.checked, 'logos')}
          />
          <label className="form-check-label" htmlFor="settingDebugLogos">
            Debug logos (show logo/fallback URLs and console logs)
          </label>
        </div>
        
        <div className="form-check form-switch mb-3">
          <input
            className="form-check-input"
            type="checkbox"
            id="settingConsoleLog"
            checked={consoleLogTransactions}
            onChange={(e) => handleToggle(e.target.checked, 'console')}
          />
          <label className="form-check-label" htmlFor="settingConsoleLog">
            Console log transactions (print transaction list to browser console)
          </label>
        </div>
        
        <div className="form-check form-switch">
          <input
            className="form-check-input"
            type="checkbox"
            id="settingConsoleAccounts"
            checked={consoleLogAccounts}
            onChange={(e) => handleToggle(e.target.checked, 'accounts')}
          />
          <label className="form-check-label" htmlFor="settingConsoleAccounts">
            Console log accounts (print account list to browser console)
          </label>
        </div>
      </div>
    </div>
  );
};

export default Settings;


