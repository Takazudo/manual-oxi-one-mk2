import * as React from 'react';
import ctl from '@netlify/classnames-template-literals';

/**
 * Hr component - Horizontal separator
 * Adapted from takazudomodular for manual viewer context
 * Displays a thick horizontal line for section breaks
 */
const Hr: React.FC = () => {
  return (
    <hr
      className={ctl(`
        border-0
        h-[4px]
        bg-zd-white
        my-vgap-md
        lg:my-vgap-lg
      `)}
    />
  );
};

export { Hr };
