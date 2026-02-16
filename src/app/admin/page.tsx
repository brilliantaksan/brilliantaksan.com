import { AdminLoginForm } from '@/components/admin/admin-login-form';

export default async function AdminLoginPage({
  searchParams
}: {
  searchParams?: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  return <AdminLoginForm initialNextPath={params?.next ?? null} />;
}
