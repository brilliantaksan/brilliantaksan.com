import type { Metadata } from 'next';
import { Manrope } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { NavbarDock } from '@/components/portfolio/navbar-dock';
import { getSiteContent } from '@/lib/site-content';

const manrope = Manrope({ subsets: ['latin'], variable: '--font-body' });

export async function generateMetadata(): Promise<Metadata> {
  const siteContent = await getSiteContent();

  return {
    title: siteContent.meta.title,
    description: siteContent.meta.description,
    metadataBase: new URL(siteContent.meta.url),
    openGraph: {
      title: siteContent.meta.title,
      description: siteContent.meta.description,
      images: [siteContent.meta.seoImage],
      type: 'website'
    },
    twitter: {
      card: 'summary_large_image',
      title: siteContent.meta.title,
      description: siteContent.meta.description,
      images: [siteContent.meta.seoImage]
    }
  };
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const siteContent = await getSiteContent();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${manrope.variable} min-h-screen bg-background text-foreground antialiased`}>
        <ThemeProvider>
          <div className="relative min-h-screen overflow-x-hidden">
            <div className="relative mx-auto w-full max-w-[940px] px-5 pb-28 pt-6 sm:px-6 md:pt-10">{children}</div>
            <NavbarDock socials={siteContent.socials} />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
