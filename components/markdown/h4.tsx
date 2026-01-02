import * as React from 'react';

interface H4Props {
  children?: React.ReactNode;
  id?: string;
}

/**
 * H4 heading component for markdown rendering
 * Adapted from takazudomodular for manual viewer context
 */
const H4: React.FC<H4Props> = ({ children, id }) => {
  return (
    <h4 id={id} className="font-bold pb-vgap-sm text-sm md:text-lg text-zd-gray7">
      {children}
    </h4>
  );
};

export { H4 };
