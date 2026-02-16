import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { LogoutButton } from '@/components/admin/logout-button';
import { ContentEditor } from '@/components/admin/content-editor';
import { ADMIN_SESSION_COOKIE_NAME, verifyAdminSessionToken } from '@/lib/admin-session';

export const runtime = 'nodejs';

export default async function AdminStudioPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifyAdminSessionToken(token) : null;

  if (!session) {
    redirect('/admin');
  }

  return (
    <main className="mx-auto w-full max-w-6xl space-y-5 px-5 py-8 sm:px-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Content Studio</h1>
          <p className="text-sm text-muted-foreground">
            Edit your home page directly like a profile editor. Upload media inline for each section and save in one click.
          </p>
        </div>
        <LogoutButton />
      </header>

      <ContentEditor />
    </main>
  );
}
