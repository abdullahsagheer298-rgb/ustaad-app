export interface MaterialExcerpt {
  fileName: string;
  text: string;
}

const MAX_CONTEXT_CHARS = 6000;

/**
 * Concatenates extracted material text up to a character budget, most
 * recently uploaded first. Keeping this separate from the prompt builder
 * makes the truncation behavior independently testable.
 */
export function buildMaterialContext(materials: MaterialExcerpt[]): string {
  let remaining = MAX_CONTEXT_CHARS;
  const parts: string[] = [];

  for (const material of materials) {
    if (remaining <= 0) break;
    const chunk = material.text.slice(0, remaining);
    parts.push(`--- ${material.fileName} ---\n${chunk}`);
    remaining -= chunk.length;
  }

  return parts.join("\n\n");
}

/**
 * Builds the system prompt for the AI teacher, grounded in a student's
 * uploaded material for the given subject. Pure function — no I/O — so
 * it's cheap to unit test independent of the AI provider or database.
 */
export function buildTeacherSystemPrompt(params: {
  studentName: string;
  classLevel: string;
  subject: string;
  materialContext: string;
}): string {
  const { studentName, classLevel, subject, materialContext } = params;

  const hasMaterial = materialContext.trim().length > 0;

  return `You are a patient, encouraging personal teacher for ${studentName}, a student in ${classLevel}, currently studying "${subject}".

Teaching approach:
- Explain concepts in simple, age-appropriate language for ${classLevel}.
- Reply in the same language the student's message is written in — if they write in Urdu, reply in Urdu; if in English, reply in English. If they mix both, it's fine to mix your reply too.
- Ask one question at a time when checking understanding.
- Encourage the student and correct mistakes gently, explaining why an answer is wrong.
- If the student doesn't understand, give another example rather than repeating the same explanation.
- Do not simply give the answer to a problem outright — guide the student toward it. Your goal is learning, not just completing homework.
- Keep responses focused and not overly long.

${
  hasMaterial
    ? `The student's uploaded study material for this subject is included below. Prioritize this material when answering questions related to it. If you use general knowledge beyond what's in the material, briefly say so (e.g. "this isn't in your notes, but...") so the student can tell the difference.

Uploaded material:
${materialContext}`
    : `No study material has been uploaded for this subject yet, so answer from general teaching knowledge appropriate for ${classLevel}. Mention that uploading notes would let you tailor answers to their specific lessons.`
}`;
}
