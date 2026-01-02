import * as React from 'react';
import ctl from '@netlify/classnames-template-literals';

type TableProps = React.TableHTMLAttributes<HTMLTableElement>;

/**
 * Table component for markdown rendering with GFM support
 * Adapted from takazudomodular for manual viewer context
 * Provides responsive typography and horizontal scrolling for wide tables
 */
export const Table: React.FC<TableProps> = ({ className, ...props }) => {
  const tableClassName = ctl(`
    border-collapse
    text-xs md:text-sm lg:text-base
    leading-snug
    [&_th]:border [&_th]:border-zd-white
    [&_th]:px-hgap-xs [&_th]:py-vgap-xs
    [&_th]:text-zd-white [&_th]:font-bold
    [&_td]:border [&_td]:border-zd-gray6
    [&_td]:px-hgap-xs [&_td]:py-vgap-xs
    [&_td]:text-zd-gray7
    md:[&_th]:px-hgap-sm md:[&_th]:py-vgap-sm
    md:[&_td]:px-hgap-sm md:[&_td]:py-vgap-sm
    ${className || ''}
  `);

  return (
    <div
      className="overflow-x-auto mb-vgap-md"
      role="region"
      aria-label="Scrollable table"
      tabIndex={0}
    >
      <table className={tableClassName} {...props} />
    </div>
  );
};
