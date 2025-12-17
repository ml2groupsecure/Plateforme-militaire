
import { type InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: string;
  variant?: 'default' | 'neuro';
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  icon,
  variant = 'neuro',
  className = '',
  ...props
}, ref) => {
  const variants = {
    default: 'border border-neuro-300 focus:border-primary-500 focus:ring-primary-500 bg-white',
    neuro: 'border-0 bg-neuro-100 shadow-neuro-inset focus:shadow-neuro-inset focus:ring-2 focus:ring-primary-500'
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-neuro-700 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <i className={`${icon} text-neuro-400 text-sm`}></i>
          </div>
        )}
        <input
          ref={ref}
          className={`
            w-full rounded-xl px-4 py-3 text-sm transition-all duration-200
            placeholder-neuro-400 text-neuro-900
            focus:outline-none focus:ring-2 focus:ring-offset-0
            ${variants[variant]}
            ${icon ? 'pl-10' : ''}
            ${error ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-danger-600">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
