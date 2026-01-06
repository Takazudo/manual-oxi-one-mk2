import Link from 'next/link';
import ctl from '@netlify/classnames-template-literals';

const headerStyles = ctl(`
  fixed top-0 left-0 right-0 z-50
  bg-zd-gray1
  px-hgap-sm
  h-[60px]
  flex items-center justify-between
  shadow-lg shadow-zd-white/5
  font-futura
`);

const titleStyles = ctl(`
  text-lg font-bold
  text-zd-white
  hover:text-zd-primary
  transition-colors
`);

const navLinkStyles = ctl(`
  text-sm
  text-zd-white
  zd-invert-color-link
  no-underline
  flex items-center gap-hgap-xs
  px-[8px] py-[4px]
  -mx-[8px] -my-[4px]
  rounded-xs
`);

const logoStyles = ctl(`
  w-[1.2em] h-[1.2em]
  bg-current
  [mask-image:url('/img/takazudo-logo.svg')]
  [mask-size:contain]
  [mask-repeat:no-repeat]
  [mask-position:center]
`);

export function Header() {
  return (
    <header className={headerStyles}>
      <Link href="/manuals" className={titleStyles}>
        Manual Viewer
      </Link>
      <a
        href="https://takazudomodular.com"
        target="_blank"
        rel="noopener noreferrer"
        className={navLinkStyles}
      >
        <span className={logoStyles} aria-hidden="true" />
        Takazudo Modular
      </a>
    </header>
  );
}
