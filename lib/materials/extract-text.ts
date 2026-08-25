import "server-only";

/**
 * Extracts plain text from a study material file for use as AI teaching
 * context. Returns null when the file type has no text representation
 * (e.g. images — no OCR yet) or when extraction fails; callers should
 * treat null as "no extracted content" rather than an error.
 *
 * This is the only file that should import pdf-parse or mammoth —
 * callers work with plain text, not parser-specific APIs.
 */
export async function extractText(buffer: Buffer, fileType: string): Promise<string | null> {
  try {
    if (fileType === "application/pdf") {
      const { PDFParse } = await import("pdf-parse");
      const parser = new PDFParse({ data: new Uint8Array(buffer) });
      const result = await parser.getText();
      await parser.destroy();
      return result.text.trim() || null;
    }

    if (
      fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      const mammoth = await import("mammoth");
      const result = await mammoth.extractRawText({ buffer });
      return result.value.trim() || null;
    }

    if (fileType === "text/plain") {
      return buffer.toString("utf-8").trim() || null;
    }

    // application/msword (old .doc) and images: no extractor available yet.
    return null;
  } catch {
    // A corrupt or unusual file should degrade to "no content", not break
    // the upload — the file itself still gets stored either way.
    return null;
  }
}
