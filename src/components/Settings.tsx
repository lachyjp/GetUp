import React, { useEffect, useState } from 'react';

interface SettingsProps {
  onClose: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onClose }) => {
  const [debugLogos, setDebugLogos] = useState<boolean>(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('txnDebugLogos');
      setDebugLogos(saved === '1');
    } catch {}
  }, []);

  const handleToggle = (checked: boolean) => {
    setDebugLogos(checked);
    try { localStorage.setItem('txnDebugLogos', checked ? '1' : '0'); } catch {}
  };

  return (
    <div className="card mb-4">
      <div className="card-header d-flex align-items-center justify-content-between">
        <h3 className="mb-0">⚙️ Settings</h3>
        <button className="btn btn-outline-secondary" onClick={onClose}>Back</button>
      </div>
      <div className="card-body">
        <div className="form-check form-switch">
          <input
            className="form-check-input"
            type="checkbox"
            id="settingDebugLogos"
            checked={debugLogos}
            onChange={(e) => handleToggle(e.target.checked)}
          />
          <label className="form-check-label" htmlFor="settingDebugLogos">
            Debug logos (show logo/fallback URLs and console logs)
          </label>
        </div>
      </div>
    </div>
  );
};

export default Settings;


