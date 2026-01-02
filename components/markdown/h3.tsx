import * as React from 'react';
import ctl from '@netlify/classnames-template-literals';

interface H3Props {
  children?: React.ReactNode;
  id?: string;
}

/**
 * H3 heading component for markdown rendering
 * Adapted from takazudomodular for manual viewer context
 */
const H3: React.FC<H3Props> = ({ children, id }) => {
  return (
    <h3
      id={id}
      className={ctl(`
        text-sm sm:text-lg
        pt-vgap-md
        pb-vgap-md
        font-bold
        text-zd-white
      `)}
    >
      <span className="flow-root">
        <span className="block relative group">
          <span
            className={ctl(`
              block mb-vgap-sm h-1px
              bg-linear-to-r from-zd-white to-zd-black
            `)}
          ></span>
          {children}
          {id && (
            <span
              className={ctl(`
                inline-block w-0 h-0
                relative align-bottom
              `)}
            >
              <a
                href={`#${id}`}
                aria-hidden="true"
                className={ctl(`
                  font-bold hidden no-underline text-zd-primary
                  absolute left-0 bottom-0
                  px-[.4em]
                  group-hover:block
                `)}
              >
                #
              </a>
            </span>
          )}
        </span>
      </span>
    </h3>
  );
};

export { H3 };
