import * as React from 'react';

interface H5Props {
  children?: React.ReactNode;
  id?: string;
}

/**
 * H5 heading component for markdown rendering
 * Adapted from takazudomodular for manual viewer context
 */
const H5: React.FC<H5Props> = ({ children, id }) => {
  return (
    <h5 id={id} className="font-bold pb-vgap-sm text-sm md:text-base text-zd-gray7">
      {children}
    </h5>
  );
};

export { H5 };
