import * as React from 'react';

interface CodeProps {
  children?: React.ReactNode;
}

/**
 * Inline code component for markdown rendering
 * Adapted from takazudomodular for manual viewer context
 */
const Code: React.FC<CodeProps> = ({ children }) => {
  return (
    <code className="bg-zd-gray3 text-zd-primary font-mono px-[5px] py-[3px] mx-[3px] rounded">
      {children}
    </code>
  );
};

export { Code };
