import React from 'react';

interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

const FormField: React.FC<FormFieldProps> = ({ 
  label, 
  error, 
  required = false,
  children,
  className = ''
}) => {
  return (
    <div className={`mb-3 ${className}`}>
      <label className="form-label">
        {label}
        {required && <span className="text-danger ms-1">*</span>}
      </label>
      {children}
      {error && (
        <div className="invalid-feedback d-block">{error}</div>
      )}
    </div>
  );
};

export default FormField;
