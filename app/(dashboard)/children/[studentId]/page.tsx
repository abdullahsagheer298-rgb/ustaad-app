import { notFound } from "next/navigation";
import Link from "next/link";
import { getStudentById, getMaterialsForStudent } from "@/lib/materials/queries";
import { formatFileSize } from "@/lib/materials/format";
import { UploadMaterialForm } from "./upload-material-form";

export default async function StudentMaterialsPage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId } = await params;

  const student = await getStudentById(studentId);
  if (!student) notFound();

  const materials = await getMaterialsForStudent(studentId);

  const bySubject = new Map<string, typeof materials>();
  for (const material of materials) {
    const list = bySubject.get(material.subject) ?? [];
    list.push(material);
    bySubject.set(material.subject, list);
  }

  return (
    <main className="mx-auto flex max-w-lg flex-col gap-8">
      <div>
        <Link href="/children" className="text-sm text-neutral-500 underline">
          ← My Children
        </Link>
        <h1 className="mt-2 text-xl font-semibold">
          {student.full_name} — {student.class_level}
        </h1>
        <p className="text-sm text-neutral-500">Study material organized by subject.</p>
      </div>

      {bySubject.size === 0 ? (
        <p className="text-sm text-neutral-500">No material uploaded yet.</p>
      ) : (
        <div className="flex flex-col gap-6">
          {[...bySubject.entries()].map(([subject, items]) => (
            <div key={subject}>
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm font-semibold">{subject}</h3>
                <Link
                  href={`/children/${studentId}/chat?subject=${encodeURIComponent(subject)}`}
                  className="text-sm text-neutral-500 underline"
                >
                  Chat about {subject}
                </Link>
              </div>
              <ul className="flex flex-col gap-2">
                {items.map((m) => (
                  <li
                    key={m.id}
                    className="flex items-center justify-between rounded border border-neutral-200 px-4 py-2 text-sm"
                  >
                    <span>{m.file_name}</span>
                    <span className="text-neutral-500">{formatFileSize(m.file_size_bytes)}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      <UploadMaterialForm studentId={studentId} />
    </main>
  );
}
