import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark' | 'outline-primary' | 'outline-secondary' | 'outline-success' | 'outline-danger' | 'outline-warning' | 'outline-info' | 'outline-light' | 'outline-dark';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  loading = false,
  disabled = false,
  onClick,
  type = 'button',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'btn-sm',
    md: '',
    lg: 'btn-lg'
  };

  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      className={`btn btn-${variant} ${sizeClasses[size]} ${className}`}
      onClick={onClick}
      disabled={isDisabled}
    >
      {loading ? (
        <>
          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
          Loading...
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
