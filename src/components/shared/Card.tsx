import React from 'react';

interface CardProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
}

const Card: React.FC<CardProps> = ({ 
  title, 
  subtitle, 
  actions,
  children,
  className = '',
  headerClassName = '',
  bodyClassName = ''
}) => {
  return (
    <div className={`card ${className}`}>
      {(title || subtitle || actions) && (
        <div className={`card-header ${headerClassName}`}>
          <div className="d-flex align-items-center justify-content-between">
            <div>
              {title && <h3 className="mb-0">{title}</h3>}
              {subtitle && <p className="text-muted mb-0">{subtitle}</p>}
            </div>
            {actions && <div>{actions}</div>}
          </div>
        </div>
      )}
      <div className={`card-body ${bodyClassName}`}>
        {children}
      </div>
    </div>
  );
};

export default Card;
