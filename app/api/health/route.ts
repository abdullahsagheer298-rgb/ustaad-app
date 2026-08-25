import { NextResponse } from "next/server";

/**
 * Basic health check. Reports whether required environment variables are
 * present — never their values. Useful for confirming a deployment (local
 * or Vercel) is configured correctly before wiring up real features.
 */
export async function GET() {
  const checks = {
    supabaseUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    supabaseAnonKey: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    supabaseServiceRoleKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    aiApiKey: Boolean(process.env.ANTHROPIC_API_KEY),
  };

  const allConfigured = Object.values(checks).every(Boolean);

  return NextResponse.json(
    {
      status: allConfigured ? "ok" : "incomplete_configuration",
      checks,
    },
    { status: allConfigured ? 200 : 200 }
  );
}
