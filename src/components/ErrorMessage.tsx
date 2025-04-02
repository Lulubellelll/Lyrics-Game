import React, { useEffect } from 'react';
import styles from '../styles/components/ErrorMessage.module.css';

interface ErrorMessageProps {
  message: string;
  onClear: () => void;
  duration?: number;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onClear, duration = 5000 }) => {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClear();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [message, onClear, duration]);

  if (!message) return null;

  return (
    <div className={styles.error}>
      {message}
    </div>
  );
};

export default ErrorMessage; 