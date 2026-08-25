import type { AuthState } from "@/lib/auth/actions";

/**
 * Initial state for the sign-in/sign-up forms' useActionState hooks.
 * Deliberately kept out of actions.ts: that file has a "use server"
 * directive, and Next.js only allows async function exports from such
 * files — a plain object export like this one breaks the build.
 */
export const emptyAuthState: AuthState = { error: null, message: null };
