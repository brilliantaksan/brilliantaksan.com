import { HomePage } from '@/components/portfolio/home-page';
import { siteContent } from '@/lib/site-content';

export default function Page() {
  return <HomePage content={siteContent} />;
}
