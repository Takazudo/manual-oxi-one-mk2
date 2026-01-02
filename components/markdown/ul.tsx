import * as React from 'react';
import ctl from '@netlify/classnames-template-literals';

interface UlProps {
  children?: React.ReactNode;
}

/**
 * Unordered list component for markdown rendering
 * Adapted from takazudomodular for manual viewer context
 */
const Ul: React.FC<UlProps> = ({ children }) => {
  return (
    <ul
      className={ctl(`
        text-sm md:text-base
        text-zd-gray7
        list-disc
        flow-root
        pl-hgap-md
        pb-vgap-md
        mt-[-0.3em]
        [&>*+*]:mt-vgap-xs
        [&_ul]:ml-0
        [&_ul]:mt-vgap-sm
        [&_ul]:pb-vgap-xs
      `)}
    >
      {children}
    </ul>
  );
};

export { Ul };
