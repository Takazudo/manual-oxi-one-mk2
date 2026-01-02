import * as React from 'react';

interface H6Props {
  children?: React.ReactNode;
  id?: string;
}

/**
 * H6 heading component for markdown rendering
 * Adapted from takazudomodular for manual viewer context
 */
const H6: React.FC<H6Props> = ({ children, id }) => {
  return (
    <h6 id={id} className="font-bold pb-vgap-sm text-sm text-zd-gray7">
      {children}
    </h6>
  );
};

export { H6 };
