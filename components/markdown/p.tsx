import * as React from 'react';

interface PProps {
  children?: React.ReactNode;
}

/**
 * Paragraph component for markdown rendering
 * Adapted from takazudomodular for manual viewer context
 */
const P: React.FC<PProps> = ({ children }) => {
  return <p className="text-sm md:text-base pb-vgap-md mt-[-0.3em] text-zd-gray7">{children}</p>;
};

export { P };
