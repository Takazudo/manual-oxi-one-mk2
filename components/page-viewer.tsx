'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import ctl from '@netlify/classnames-template-literals';
import type { ManualPage } from '@/lib/types/manual';
import { MarkdownRenderer } from './markdown-renderer';
import { PageNavigation } from './page-navigation';
import { KeyboardNavigation } from './keyboard-navigation';
import { withBasePath } from '@/lib/asset-url';

const containerStyles = ctl(`
  flex flex-col lg:flex-row
  h-screen
  pt-[60px]
`);

const columnStyles = ctl(`
  flex-1
  overflow-y-scroll
  min-h-0
`);

const imageColumnStyles = ctl(`
  ${columnStyles}
  flex flex-col items-center
  bg-zd-white
`);

const contentColumnStyles = ctl(`
  ${columnStyles}
  px-hgap-sm
`);

const imageWrapperStyles = ctl(`
  relative w-full
  min-h-[400px]
`);

const loaderWrapperStyles = ctl(`
  absolute
  top-1/2 left-1/2
  transform -translate-x-1/2 -translate-y-1/2
  z-10
`);

const navigationWrapperStyles = ctl(`
  sticky top-0 z-10
  mb-vgap-md
  bg-zd-gray2
  pt-vgap-sm
`);

const pageTitleStyles = ctl(`
  text-xl font-bold
  text-zd-white
  mb-vgap-sm
  pb-vgap-sm
`);

interface PageViewerProps {
  page: ManualPage;
  currentPage: number;
  totalPages: number;
}

export function PageViewer({ page, currentPage, totalPages }: PageViewerProps) {
  const [isLoading, setIsLoading] = useState(true);

  // Reset loading state when page changes
  useEffect(() => {
    setIsLoading(true);
  }, [currentPage]);

  return (
    <>
      <KeyboardNavigation currentPage={currentPage} totalPages={totalPages} />
      <div className={containerStyles}>
        {/* Left Column: PDF Image */}
        <div className={imageColumnStyles}>
          <div className={imageWrapperStyles}>
            {isLoading && (
              <div className={loaderWrapperStyles}>
                <div className="page-image-loader" />
              </div>
            )}
            <Image
              src={withBasePath(page.image)}
              alt={`Page ${currentPage}: ${page.title}`}
              width={1200}
              height={1600}
              className={`w-full h-auto ${!isLoading ? 'page-image-fade-in' : 'opacity-0'}`}
              priority={currentPage === 1}
              onLoad={() => setIsLoading(false)}
            />
          </div>
        </div>

        {/* Right Column: Translation */}
        <div className={contentColumnStyles}>
          <div className={navigationWrapperStyles}>
            <PageNavigation currentPage={currentPage} totalPages={totalPages} />
          </div>

          <div className={pageTitleStyles}>
            {page.title}
            {page.sectionName && (
              <span className="text-sm text-zd-gray6 ml-hgap-sm">({page.sectionName})</span>
            )}
          </div>

          {page.hasContent ? (
            <MarkdownRenderer content={page.translation} />
          ) : (
            <p className="text-zd-gray6 italic">このページには翻訳がありません</p>
          )}
        </div>
      </div>
    </>
  );
}
