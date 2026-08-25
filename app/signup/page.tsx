"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signUpAction } from "@/lib/auth/actions";
import { emptyAuthState } from "@/lib/auth/state";

export default function SignupPage() {
  const [state, formAction, pending] = useActionState(signUpAction, emptyAuthState);

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4">
      <h1 className="mb-1 text-2xl font-semibold">Create your account</h1>
      <p className="mb-6 text-sm text-neutral-500">Ustaad — parent account</p>

      {state.message ? (
        <div className="rounded border border-green-300 bg-green-50 p-4 text-sm text-green-800">
          {state.message}
        </div>
      ) : (
        <form action={formAction} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm">
            Your name
            <input
              type="text"
              name="fullName"
              autoComplete="name"
              className="rounded border border-neutral-300 px-3 py-2"
            />
          </label>
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
              minLength={8}
              autoComplete="new-password"
              className="rounded border border-neutral-300 px-3 py-2"
            />
            <span className="text-xs text-neutral-400">At least 8 characters.</span>
          </label>

          {state.error && <p className="text-sm text-red-600">{state.error}</p>}

          <button
            type="submit"
            disabled={pending}
            className="rounded bg-neutral-900 px-4 py-2 text-white disabled:opacity-50"
          >
            {pending ? "Creating account…" : "Create account"}
          </button>
        </form>
      )}

      <p className="mt-6 text-sm text-neutral-500">
        Already have an account?{" "}
        <Link href="/login" className="underline">
          Sign in
        </Link>
      </p>
    </main>
  );
}
