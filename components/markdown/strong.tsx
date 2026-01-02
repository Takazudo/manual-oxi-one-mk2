import * as React from 'react';

interface StrongProps {
  children?: React.ReactNode;
}

/**
 * Strong/bold text component for markdown rendering
 * Adapted from takazudomodular for manual viewer context
 */
const Strong: React.FC<StrongProps> = ({ children }) => {
  return <strong className="text-zd-white font-bold">{children}</strong>;
};

export { Strong };
