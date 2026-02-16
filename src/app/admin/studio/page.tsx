import { LogoutButton } from '@/components/admin/logout-button';
import { MediaUploader } from '@/components/admin/media-uploader';

export default function AdminStudioPage() {
  return (
    <main className="mx-auto w-full max-w-6xl space-y-5 px-5 py-8 sm:px-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Content Studio</h1>
          <p className="text-sm text-muted-foreground">
            Protected admin area. Edit content via Decap CMS and upload media to Supabase.
          </p>
        </div>
        <LogoutButton />
      </header>

      <MediaUploader />

      <section className="overflow-hidden rounded-2xl border border-border bg-background shadow-sm">
        <iframe src="/admin/index.html" title="Decap CMS Content Studio" className="h-[85vh] w-full" />
      </section>
    </main>
  );
}
