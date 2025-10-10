import React from 'react';

interface BadgeProps {
  text: string;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({ 
  text, 
  variant = 'primary', 
  size = 'md',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'badge-sm',
    md: '',
    lg: 'badge-lg'
  };

  return (
    <span className={`badge bg-${variant} ${sizeClasses[size]} ${className}`}>
      {text}
    </span>
  );
};

export default Badge;
