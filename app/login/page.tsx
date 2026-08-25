"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signInAction } from "@/lib/auth/actions";
import { emptyAuthState } from "@/lib/auth/state";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(signInAction, emptyAuthState);

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4">
      <h1 className="mb-1 text-2xl font-semibold">Sign in</h1>
      <p className="mb-6 text-sm text-neutral-500">Ustaad — parent account</p>

      <form action={formAction} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm">
          Email
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            className="rounded border border-neutral-300 px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Password
          <input
            type="password"
            name="password"
            required
            autoComplete="current-password"
            className="rounded border border-neutral-300 px-3 py-2"
          />
        </label>

        {state.error && <p className="text-sm text-red-600">{state.error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="rounded bg-neutral-900 px-4 py-2 text-white disabled:opacity-50"
        >
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="mt-6 text-sm text-neutral-500">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="underline">
          Create one
        </Link>
      </p>
    </main>
  );
}
