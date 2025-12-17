
import { type ButtonHTMLAttributes, type ReactNode } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';

// Interface pour éviter les conflits avec motion
type MotionButtonProps = Omit<HTMLMotionProps<'button'>, 'children' | 'disabled'>;

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {

  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'neuro';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  loading?: boolean;
  icon?: ReactNode;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  children,
  loading = false,
  icon,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 whitespace-nowrap cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variants = {
    primary: 'bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white focus:ring-primary-500 shadow-soft hover:shadow-elegant',
    secondary: 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 focus:ring-primary-500 shadow-soft hover:shadow-card',
    danger: 'bg-gradient-to-r from-danger-500 to-danger-600 hover:from-danger-600 hover:to-danger-700 text-white focus:ring-danger-500 shadow-soft hover:shadow-elegant',
    success: 'bg-gradient-to-r from-success-500 to-success-600 hover:from-success-600 hover:to-success-700 text-white focus:ring-success-500 shadow-soft hover:shadow-elegant',
    warning: 'bg-gradient-to-r from-warning-500 to-warning-600 hover:from-warning-600 hover:to-warning-700 text-white focus:ring-warning-500 shadow-soft hover:shadow-elegant',
    neuro: 'bg-gray-100 hover:bg-gray-200 text-gray-700 shadow-soft hover:shadow-card focus:ring-primary-500 border border-gray-200'
  };

  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  const isDisabled = disabled || loading;

  return (
    <motion.button
      whileHover={!isDisabled ? { scale: 1.02 } : {}}
      whileTap={!isDisabled ? { scale: 0.98 } : {}}
      className={`
        ${baseClasses}
        ${variants[variant]}
        ${sizes[size]}
        ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      disabled={isDisabled}
      type={props.type || 'button'}
      onClick={props.onClick}
    >
      {loading && (
        <i className="ri-loader-4-line animate-spin mr-2"></i>
      )}
      {!loading && icon && (
        <span className="mr-2">{icon}</span>
      )}
      {children}
    </motion.button>
  );
}
