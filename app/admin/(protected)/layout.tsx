import { requireAdminSession } from "@/lib/admin/auth";
import { AdminSidebar } from "@/components/admin/sidebar";
import { signOutAdmin } from "./actions";

export default async function AdminProtectedLayout({
  children,
}: LayoutProps<"/admin">) {
  await requireAdminSession();

  return (
    <div className="flex min-h-screen bg-zinc-50 print:bg-white sm:flex-row">
      <AdminSidebar signOutAction={signOutAdmin} />
      <main className="min-w-0 flex-1 px-4 py-6 sm:px-8 sm:py-8">{children}</main>
    </div>
  );
}
