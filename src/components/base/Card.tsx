
import { type ReactNode } from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg';
  // Certains composants (ex: Leaflet) ont besoin d’un conteneur stable au 1er render.
  // Si true (défaut), on anime via framer-motion.
  animate?: boolean;
}

export default function Card({ 
  children, 
  className = '', 
  hover = true,
  padding = 'md',
  animate = true,
}: CardProps) {
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  const classes = `
    bg-white dark:bg-gray-800 
    rounded-2xl 
    border border-gray-200/50 dark:border-gray-700/50
    shadow-card
    ${hover ? 'hover:shadow-card-hover transition-all duration-300' : ''}
    ${paddingClasses[padding]}
    ${className}
  `;

  if (!animate) {
    return (
      <div className={classes}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={classes}
    >
      {children}
    </motion.div>
  );
}
