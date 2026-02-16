import { unstable_noStore as noStore } from 'next/cache';
import { readSiteContent } from '@/lib/content-store';
import type { SiteContent } from '@/lib/types';
import bundledSiteContent from '../../content/site.json';

const fallbackSiteContent = bundledSiteContent as SiteContent;

export async function getSiteContent(): Promise<SiteContent> {
  noStore();
  try {
    return await readSiteContent();
  } catch (error) {
    console.error('Failed to load runtime site content. Falling back to bundled content.', error);
    return fallbackSiteContent;
  }
}
