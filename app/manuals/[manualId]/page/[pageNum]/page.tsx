import { notFound } from 'next/navigation';
import { getManualPage, getTotalPages, pageExists, getManifest } from '@/lib/manual-data';
import { isValidManual, getAvailableManuals } from '@/lib/manual-registry';
import { PageViewer } from '@/components/page-viewer';

interface PageParams {
  manualId: string;
  pageNum: string;
}

interface PageProps {
  params: Promise<PageParams>;
}

export async function generateStaticParams() {
  const manuals = getAvailableManuals();
  const params: Array<{ manualId: string; pageNum: string }> = [];

  // Generate pages for all manuals
  for (const manualId of manuals) {
    const manifest = getManifest(manualId);

    // Generate pages for all parts listed in the manifest
    for (const partInfo of manifest.parts) {
      for (let i = partInfo.pageRange[0]; i <= partInfo.pageRange[1]; i++) {
        params.push({
          manualId,
          pageNum: i.toString(),
        });
      }
    }
  }

  return params;
}

export async function generateMetadata({ params }: PageProps) {
  const resolvedParams = await params;
  const { manualId, pageNum: pageNumStr } = resolvedParams;
  const pageNum = Number(pageNumStr);

  // Validate manual ID
  if (!isValidManual(manualId)) {
    return {
      title: 'Manual Not Found',
    };
  }

  const manifest = getManifest(manualId);

  // Validate page number is a positive integer
  if (!Number.isInteger(pageNum) || pageNum < 1) {
    return {
      title: `Page Not Found - ${manifest.title}`,
    };
  }

  const page = getManualPage(manualId, pageNum);

  if (!page) {
    return {
      title: `Page Not Found - ${manifest.title}`,
    };
  }

  return {
    title: `${page.title} (Page ${pageNum}) - ${manifest.title}`,
    description: `${manifest.title} - Page ${pageNum}: ${page.title}`,
  };
}

export default async function Page({ params }: PageProps) {
  const resolvedParams = await params;
  const { manualId, pageNum: pageNumStr } = resolvedParams;
  const pageNum = Number(pageNumStr);

  // Validate manual ID
  if (!isValidManual(manualId)) {
    notFound();
  }

  // Validate page number is a positive integer
  if (!Number.isInteger(pageNum) || pageNum < 1 || !pageExists(manualId, pageNum)) {
    notFound();
  }

  const page = getManualPage(manualId, pageNum);
  const totalPages = getTotalPages(manualId);

  if (!page) {
    notFound();
  }

  return (
    <PageViewer page={page} currentPage={pageNum} totalPages={totalPages} manualId={manualId} />
  );
}
