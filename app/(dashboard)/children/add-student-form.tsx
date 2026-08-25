"use client";

import { useActionState } from "react";
import { addStudentAction, type AddStudentState } from "@/lib/students/actions";
import { CLASS_LEVELS } from "@/lib/students/constants";

const initialState: AddStudentState = { error: null, fieldErrors: {} };

export function AddStudentForm() {
  const [state, formAction, pending] = useActionState(addStudentAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-3 rounded border border-neutral-200 p-4">
      <h2 className="text-sm font-semibold">Add a child</h2>

      <label className="flex flex-col gap-1 text-sm">
        Name
        <input
          type="text"
          name="fullName"
          className="rounded border border-neutral-300 px-3 py-2"
        />
        {state.fieldErrors.fullName && (
          <span className="text-xs text-red-600">{state.fieldErrors.fullName}</span>
        )}
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Class
        <select name="classLevel" defaultValue="" className="rounded border border-neutral-300 px-3 py-2">
          <option value="" disabled>
            Choose a class
          </option>
          {CLASS_LEVELS.map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </select>
        {state.fieldErrors.classLevel && (
          <span className="text-xs text-red-600">{state.fieldErrors.classLevel}</span>
        )}
      </label>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded bg-neutral-900 px-4 py-2 text-sm text-white disabled:opacity-50"
      >
        {pending ? "Adding…" : "Add child"}
      </button>
    </form>
  );
}
