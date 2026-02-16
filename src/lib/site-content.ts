import { unstable_noStore as noStore } from 'next/cache';
import { readSiteContent } from '@/lib/content-store';
import type { SiteContent } from '@/lib/types';

export async function getSiteContent(): Promise<SiteContent> {
  noStore();
  return readSiteContent();
}
