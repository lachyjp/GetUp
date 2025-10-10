import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  text, 
  variant = 'primary',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'spinner-border-sm',
    md: '',
    lg: 'spinner-border-lg'
  };

  const variantClasses = {
    primary: 'text-primary',
    secondary: 'text-secondary',
    success: 'text-success',
    danger: 'text-danger',
    warning: 'text-warning',
    info: 'text-info'
  };

  return (
    <div className={`text-center py-4 ${className}`}>
      <div className={`spinner-border ${sizeClasses[size]} ${variantClasses[variant]}`} role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      {text && <p className="mt-2">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
