import * as React from 'react';

interface EmProps {
  children?: React.ReactNode;
}

/**
 * Emphasis/italic text component for markdown rendering
 * Adapted from takazudomodular for manual viewer context
 */
const Em: React.FC<EmProps> = ({ children }) => {
  return <em className="italic">{children}</em>;
};

export { Em };
