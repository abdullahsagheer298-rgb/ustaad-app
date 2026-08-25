"use client";

import { useActionState, useRef } from "react";
import { uploadMaterialAction, type UploadMaterialState } from "@/lib/materials/actions";

const initialState: UploadMaterialState = { error: null, fieldErrors: {} };

export function UploadMaterialForm({ studentId }: { studentId: string }) {
  const [state, formAction, pending] = useActionState(uploadMaterialAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        await formAction(formData);
        formRef.current?.reset();
      }}
      className="flex flex-col gap-3 rounded border border-neutral-200 p-4"
    >
      <h2 className="text-sm font-semibold">Upload material</h2>
      <input type="hidden" name="studentId" value={studentId} />

      <label className="flex flex-col gap-1 text-sm">
        Subject
        <input
          type="text"
          name="subject"
          placeholder="e.g. Fractions, Photosynthesis"
          className="rounded border border-neutral-300 px-3 py-2"
        />
        {state.fieldErrors.subject && (
          <span className="text-xs text-red-600">{state.fieldErrors.subject}</span>
        )}
      </label>

      <label className="flex flex-col gap-1 text-sm">
        File
        <input
          type="file"
          name="file"
          accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
          className="rounded border border-neutral-300 px-3 py-2"
        />
        <span className="text-xs text-neutral-400">
          PDF, Word, text, or image. Up to 20 MB.
        </span>
        {state.fieldErrors.file && (
          <span className="text-xs text-red-600">{state.fieldErrors.file}</span>
        )}
      </label>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded bg-neutral-900 px-4 py-2 text-sm text-white disabled:opacity-50"
      >
        {pending ? "Uploading…" : "Upload"}
      </button>
    </form>
  );
}
