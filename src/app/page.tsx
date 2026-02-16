import { HomePage } from '@/components/portfolio/home-page';
import { getSiteContent } from '@/lib/site-content';

export default async function Page() {
  const content = await getSiteContent();
  return <HomePage content={content} />;
}
