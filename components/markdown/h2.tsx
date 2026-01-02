import * as React from 'react';
import ctl from '@netlify/classnames-template-literals';

interface H2Props {
  children?: React.ReactNode;
  id?: string;
}

/**
 * H2 heading component for markdown rendering
 * Adapted from takazudomodular for manual viewer context
 */
const H2: React.FC<H2Props> = ({ children, id }) => {
  return (
    <h2
      id={id}
      className={ctl(`
        group
        pt-vgap-sm md:pt-vgap-md
        text-base md:text-lg lg:text-xl
        pb-vgap-sm lg:pb-vgap-md
        font-bold
        text-zd-white
        clear-both
      `)}
    >
      <span className="block border-t-1 border-zd-white">
        <span
          className={ctl(`
            inline-block border-t-8 border-zd-white
            pt-vgap-sm mt-[-1px]
            min-w-[30%]
          `)}
        >
          <span className="block relative">
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
                    font-bold hidden no-underline text-zd-white
                    text-sm sm:text-base md:text-xl
                    hover:text-zd-gray7
                    group-hover:block
                    absolute left-0 bottom-0
                    px-[.4em]
                  `)}
                >
                  #
                </a>
              </span>
            )}
          </span>
        </span>
      </span>
    </h2>
  );
};

export { H2 };
