import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getStudentById } from "@/lib/materials/queries";
import { getChatMessages } from "@/lib/chat/queries";
import { ChatPanel } from "./chat-panel";

export default async function ChatPage({
  params,
  searchParams,
}: {
  params: Promise<{ studentId: string }>;
  searchParams: Promise<{ subject?: string }>;
}) {
  const { studentId } = await params;
  const { subject } = await searchParams;

  if (!subject) redirect(`/children/${studentId}`);

  const student = await getStudentById(studentId);
  if (!student) notFound();

  const messages = await getChatMessages(studentId, subject);

  return (
    <main className="mx-auto flex max-w-lg flex-col gap-6">
      <div>
        <Link href={`/children/${studentId}`} className="text-sm text-neutral-500 underline">
          ← {student.full_name}
        </Link>
        <h1 className="mt-2 text-xl font-semibold">{subject}</h1>
        <p className="text-sm text-neutral-500">
          Chatting as {student.full_name}&apos;s teacher — {student.class_level}.
        </p>
      </div>

      <ChatPanel studentId={studentId} subject={subject} initialMessages={messages} />
    </main>
  );
}
