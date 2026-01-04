import { redirect } from 'next/navigation';
import { getPagePath } from '@/lib/manual-config';
import { getManifest } from '@/lib/manual-data';

interface PageParams {
  pageNum: string;
}

interface PageProps {
  params: Promise<PageParams>;
}

export async function generateStaticParams() {
  const manifest = getManifest('oxi-one-mk2');
  const params: Array<{ pageNum: string }> = [];

  // Generate pages for all parts listed in the manifest
  for (const partInfo of manifest.parts) {
    for (let i = partInfo.pageRange[0]; i <= partInfo.pageRange[1]; i++) {
      params.push({ pageNum: i.toString() });
    }
  }

  return params;
}

export default async function Page({ params }: PageProps) {
  const resolvedParams = await params;
  const pageNum = Number(resolvedParams.pageNum);

  // Redirect old page route to new manual-specific route
  // Hardcoded to oxi-one-mk2 as this is a legacy redirect
  redirect(getPagePath('oxi-one-mk2', pageNum));
}
