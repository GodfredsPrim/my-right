import { NextResponse } from "next/server";
import { createHash, randomUUID } from "node:crypto";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { deepSeekProvider } from "@/lib/ai/deepseek";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const allowedMimeTypes = new Set([
  "application/pdf", "image/jpeg", "image/png", "image/webp", "audio/webm", "audio/ogg", "audio/wav", "audio/mpeg",
  "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

function hashSession(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function safeFilename(filename: string): string {
  return filename.normalize("NFKC").replace(/[^a-zA-Z0-9._-]/g, "-").slice(-120) || "upload";
}

async function hasExpectedSignature(file: File): Promise<boolean> {
  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const text = new TextDecoder().decode(bytes);
  const startsWith = (...values: number[]) => values.every((value, index) => bytes[index] === value);
  if (file.type === "application/pdf") return text.startsWith("%PDF");
  if (file.type === "image/jpeg") return startsWith(0xff, 0xd8, 0xff);
  if (file.type === "image/png") return startsWith(0x89, 0x50, 0x4e, 0x47);
  if (file.type === "image/webp") return text.slice(0, 4) === "RIFF" && text.slice(8, 12) === "WEBP";
  if (file.type === "audio/ogg") return text.startsWith("OggS");
  if (file.type === "audio/wav") return text.slice(0, 4) === "RIFF" && text.slice(8, 12) === "WAVE";
  if (file.type === "audio/webm") return startsWith(0x1a, 0x45, 0xdf, 0xa3);
  if (file.type === "audio/mpeg") return text.startsWith("ID3") || startsWith(0xff, 0xfb);
  if (file.type === "application/msword") return startsWith(0xd0, 0xcf, 0x11, 0xe0);
  if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") return startsWith(0x50, 0x4b, 0x03, 0x04);
  return false;
}

export async function POST(request: Request) {
  try {
    const token = request.headers.get("x-anonymous-session");
    if (!token) return NextResponse.json({ success: false, error: { code: "SESSION_REQUIRED", message: "Start a support session before uploading." } }, { status: 400 });
    const formData = await request.formData();
    const sessionId = formData.get("sessionId");
    const file = formData.get("file");
    const language = formData.get("language");
    if (typeof sessionId !== "string" || !(file instanceof File)) return NextResponse.json({ success: false, error: { code: "INVALID_UPLOAD", message: "Choose a file to upload." } }, { status: 400 });
    if (file.size === 0 || file.size > MAX_FILE_SIZE || !allowedMimeTypes.has(file.type) || !(await hasExpectedSignature(file))) return NextResponse.json({ success: false, error: { code: "UNSUPPORTED_FILE", message: "Use a supported image, document, or audio file up to 10 MB." } }, { status: 400 });

    const db = createSupabaseAdminClient();
    const { data: session } = await db.from("support_sessions").select("id, expires_at").eq("id", sessionId).eq("anonymous_session_hash", hashSession(token)).maybeSingle();
    if (!session || new Date(session.expires_at).getTime() <= Date.now()) return NextResponse.json({ success: false, error: { code: "SESSION_NOT_FOUND", message: "This support session has expired." } }, { status: 404 });
    const storagePath = `${sessionId}/${randomUUID()}-${safeFilename(file.name)}`;
    const { error: uploadError } = await db.storage.from("support-attachments").upload(storagePath, file, { contentType: file.type, upsert: false });
    if (uploadError) throw uploadError;
    const { data: attachment, error: attachmentError } = await db.from("support_attachments").insert({ session_id: sessionId, storage_path: storagePath, original_filename: file.name, mime_type: file.type, size_bytes: file.size }).select("id, original_filename, mime_type, size_bytes, processing_status, created_at").single();
    if (attachmentError) {
      await db.storage.from("support-attachments").remove([storagePath]);
      throw attachmentError;
    }
    if (file.type.startsWith("audio/")) {
      await db.from("support_attachments").update({ transcript_status: "processing" }).eq("id", attachment.id);
      try {
        const transcript = await deepSeekProvider.transcribe({ audio: file, language: typeof language === "string" ? language : undefined });
        await db.from("support_attachments").update({ transcript, transcript_status: "ready", processing_status: "ready" }).eq("id", attachment.id);
        return NextResponse.json({ success: true, data: { attachment: { ...attachment, transcript, transcript_status: "ready" } } });
      } catch (transcriptionError) {
        console.error("support_transcription_failed", transcriptionError instanceof Error ? transcriptionError.message : JSON.stringify(transcriptionError));
        await db.from("support_attachments").update({ transcript_status: "failed", processing_status: "failed" }).eq("id", attachment.id);
        return NextResponse.json({ success: true, data: { attachment, transcriptionUnavailable: true } });
      }
    }
    return NextResponse.json({ success: true, data: { attachment } });
  } catch (error) {
    console.error("support_upload_failed", error instanceof Error ? error.message : JSON.stringify(error));
    return NextResponse.json({ success: false, error: { code: "UPLOAD_FAILED", message: "Upload failed. Check your connection and try again." } }, { status: 500 });
  }
}