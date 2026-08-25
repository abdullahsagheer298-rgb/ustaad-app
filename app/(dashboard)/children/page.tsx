import Link from "next/link";
import { getStudentsForCurrentUser } from "@/lib/students/queries";
import { AddStudentForm } from "./add-student-form";

export default async function ChildrenPage() {
  const students = await getStudentsForCurrentUser();

  return (
    <main className="mx-auto flex max-w-lg flex-col gap-8">
      <div>
        <h1 className="text-xl font-semibold">My Children</h1>
        <p className="text-sm text-neutral-500">
          Add each child once — you&apos;ll pick between them later when assigning subjects and lessons.
        </p>
      </div>

      {students.length === 0 ? (
        <p className="text-sm text-neutral-500">No children added yet.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {students.map((s) => (
            <li key={s.id}>
              <Link
                href={`/children/${s.id}`}
                className="flex items-center justify-between rounded border border-neutral-200 px-4 py-3 hover:border-neutral-400"
              >
                <span className="font-medium">{s.full_name}</span>
                <span className="text-sm text-neutral-500">{s.class_level}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <AddStudentForm />
    </main>
  );
}
