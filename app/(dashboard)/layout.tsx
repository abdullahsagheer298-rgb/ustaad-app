import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOutAction } from "@/lib/auth/actions";

/**
 * Guards every route nested under (dashboard). Server-side check on every
 * request — not just relying on the client never showing a link, since
 * that's not a real security boundary (RLS is the real boundary; this is
 * just the UX layer that keeps a signed-out parent from seeing an empty
 * dashboard instead of a login prompt).
 */
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between border-b border-neutral-200 px-6 py-3">
        <span className="font-semibold">Ustaad</span>
        <form action={signOutAction}>
          <button type="submit" className="text-sm text-neutral-500 underline">
            Sign out
          </button>
        </form>
      </header>
      <div className="px-6 py-8">{children}</div>
    </div>
  );
}
