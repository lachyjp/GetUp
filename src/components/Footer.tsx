import React from 'react';

const Footer: React.FC = () => {
  // Get build date/time - this will be set at build time
  const buildDate = process.env.REACT_APP_BUILD_DATE || new Date().toISOString();
  
  // Convert to AEDT (Australian Eastern Daylight Time)
  const formatBuildDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-AU', {
      timeZone: 'Australia/Sydney',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short'
    });
  };

  return (
    <footer className="footer">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-md-6">
            <a 
              href="https://github.com/lachyjp/GetUp" 
              target="_blank" 
              rel="noopener noreferrer"
              className="footer-link"
            >
              <i className="fab fa-github me-1"></i>
              View on GitHub
            </a>
          </div>
          <div className="col-md-6 text-md-end">
            <small className="text-muted">
              Built: {formatBuildDate(buildDate)}
            </small>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
