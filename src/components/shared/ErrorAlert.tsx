import React from 'react';

interface ErrorAlertProps {
  message: string;
  type?: 'danger' | 'warning' | 'info';
  onDismiss?: () => void;
  className?: string;
}

const ErrorAlert: React.FC<ErrorAlertProps> = ({ 
  message, 
  type = 'danger', 
  onDismiss,
  className = ''
}) => {
  const alertClass = `alert alert-${type}`;
  const dismissibleClass = onDismiss ? 'alert-dismissible' : '';

  return (
    <div className={`${alertClass} ${dismissibleClass} ${className}`} role="alert">
      <strong>Error:</strong> {message}
      {onDismiss && (
        <button
          type="button"
          className="btn-close"
          onClick={onDismiss}
          aria-label="Close"
        />
      )}
    </div>
  );
};

export default ErrorAlert;
