import * as React from 'react';
import ctl from '@netlify/classnames-template-literals';

interface OlProps {
  children?: React.ReactNode;
}

/**
 * Ordered list component for markdown rendering
 * Adapted from takazudomodular for manual viewer context
 */
const Ol: React.FC<OlProps> = ({ children }) => {
  return (
    <ol
      className={ctl(`
        text-sm md:text-base
        text-zd-gray7
        list-decimal
        flow-root
        ml-hgap-md
        pb-vgap-md
        [&>*+*]:mt-vgap-xs
        [&_ol]:ml-hgap-sm
        [&_ol]:mt-vgap-sm
        [&_ol]:pb-vgap-xs
      `)}
    >
      {children}
    </ol>
  );
};

export { Ol };
