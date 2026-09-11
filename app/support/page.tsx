"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";
import { LanguageSelector } from "@/components/language-selector";
import { t, type LanguageCode, voiceGreeting, voiceLocale } from "@/lib/i18n";

const prompts = ["I feel unsafe right now", "I am being threatened", "Someone is controlling me", "I need professional help"];
type SpeechRecognitionLike = { continuous: boolean; interimResults: boolean; lang: string; onresult: ((event: { resultIndex: number; results: ArrayLike<ArrayLike<{ transcript: string; isFinal?: boolean }>> }) => void) | null; onerror: (() => void) | null; onend: (() => void) | null; start: () => void; stop: () => void };
type SupportResponse = { success: boolean; data?: { sessionId: string; anonymousSession: string; reply: string; followupEligible: boolean }; error?: { message: string } };

export default function SupportPage() {
  const [message, setMessage] = useState("");
  const [started, setStarted] = useState(false);
  const [sessionId, setSessionId] = useState<string>();
  const [anonymousSession, setAnonymousSession] = useState<string>();
  const [reply, setReply] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [voiceListening, setVoiceListening] = useState(false);
  const [attachmentName, setAttachmentName] = useState("");
  const [error, setError] = useState("");
  const [followupEligible, setFollowupEligible] = useState(false);
  const [showFollowup, setShowFollowup] = useState(false);
  const [contactMethod, setContactMethod] = useState<"phone" | "email">("phone");
  const [contactValue, setContactValue] = useState("");
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [language, setLanguage] = useState<LanguageCode>("en");
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const recordedChunks = useRef<Blob[]>([]);
  const recognition = useRef<SpeechRecognitionLike | null>(null);
  const voiceTranscript = useRef("");
  const recordingRecognition = useRef<SpeechRecognitionLike | null>(null);
  const recordingTranscript = useRef("");

  useEffect(() => {
    const updateLanguage = (event: Event) => setLanguage((event as CustomEvent<LanguageCode>).detail);
    const saved = window.localStorage.getItem("my-right-language") as LanguageCode | null;
    if (saved) setLanguage(saved);
    window.addEventListener("my-right-language", updateLanguage);
    return () => window.removeEventListener("my-right-language", updateLanguage);
  }, []);

  async function ensureSession() {
    if (sessionId && anonymousSession) return { sessionId, anonymousSession };
    const response = await fetch("/api/support/session", { method: "POST", headers: anonymousSession ? { "x-anonymous-session": anonymousSession } : undefined });
    const result = await response.json() as { success: boolean; data?: { sessionId: string; anonymousSession: string }; error?: { message: string } };
    if (!response.ok || !result.success || !result.data) throw new Error(result.error?.message ?? "Could not start a support session.");
    setSessionId(result.data.sessionId);
    setAnonymousSession(result.data.anonymousSession);
    return result.data;
  }

  async function send(value = message) {
    if (!value.trim() || isSending) return;
    setMessage(value);
    setStarted(true);
    setError("");
    setReply("");
    setIsSending(true);
    try {
      const response = await fetch("/api/support", { method: "POST", headers: { "Content-Type": "application/json", ...(anonymousSession ? { "x-anonymous-session": anonymousSession } : {}) }, body: JSON.stringify({ message: value, sessionId, language }) });
      const result = await response.json() as SupportResponse;
      if (!response.ok || !result.success || !result.data) throw new Error(result.error?.message ?? "Support is temporarily unavailable.");
      setSessionId(result.data.sessionId);
      setAnonymousSession(result.data.anonymousSession);
      setReply(result.data.reply);
      setFollowupEligible(result.data.followupEligible);
      if (voiceListening && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const spokenReply = new SpeechSynthesisUtterance(result.data.reply);
        spokenReply.lang = voiceLocale(language);
        window.speechSynthesis.speak(spokenReply);
      }
      setMessage("");
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : "Support is temporarily unavailable. Please try again.");
    } finally {
      setIsSending(false);
    }
  }

  async function submitFollowup() {
    if (!sessionId || !anonymousSession || !contactValue.trim()) return;
    setError("");
    const response = await fetch("/api/support/contact", { method: "POST", headers: { "Content-Type": "application/json", "x-anonymous-session": anonymousSession }, body: JSON.stringify({ sessionId, method: contactMethod, value: contactValue, consent: true }) });
    const result = await response.json() as { success: boolean; error?: { message: string } };
    if (!response.ok || !result.success) { setError(result.error?.message ?? "We could not save your follow-up request."); return; }
    setContactSubmitted(true);
  }

  async function uploadFile(file: File) {
    setError("");
    setUploading(true);
    try {
      const session = await ensureSession();
      const body = new FormData();
      body.append("sessionId", session.sessionId);
      body.append("file", file);
      body.append("language", language.split("-")[0]);
      const response = await fetch("/api/support/upload", { method: "POST", headers: { "x-anonymous-session": session.anonymousSession }, body });
      const result = await response.json() as { success: boolean; data?: { attachment: { original_filename: string; transcript?: string } }; error?: { message: string } };
      if (!response.ok || !result.success || !result.data) throw new Error(result.error?.message ?? "Upload failed. Check your connection and try again.");
      setAttachmentName(result.data.attachment.original_filename);
      setStarted(true);
      if (result.data.attachment.transcript) {
        setMessage(result.data.attachment.transcript);
        setAttachmentName("");
      }
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed. Check your connection and try again.");
    } finally {
      setUploading(false);
    }
  }

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      recordedChunks.current = [];
      recordingTranscript.current = "";
      const speechWindow = window as Window & { SpeechRecognition?: new () => SpeechRecognitionLike; webkitSpeechRecognition?: new () => SpeechRecognitionLike };
      const SpeechRecognition = speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const transcriptRecognition = new SpeechRecognition();
        transcriptRecognition.continuous = true;
        transcriptRecognition.interimResults = true;
        transcriptRecognition.lang = voiceLocale(language);
        transcriptRecognition.onresult = (event) => {
          const results = Array.from(event.results).slice(event.resultIndex);
          const finalText = results.filter((result) => result[0]?.isFinal !== false).map((result) => result[0].transcript).join(" ").trim();
          if (finalText) recordingTranscript.current = `${recordingTranscript.current} ${finalText}`.trim();
          const interimText = results.filter((result) => result[0]?.isFinal === false).map((result) => result[0].transcript).join(" ").trim();
          setMessage(`${recordingTranscript.current} ${interimText}`.trim());
        };
        transcriptRecognition.onerror = () => { recordingRecognition.current = null; };
        transcriptRecognition.onend = () => { recordingRecognition.current = null; };
        recordingRecognition.current = transcriptRecognition;
        transcriptRecognition.start();
      }
      const mimeType = ["audio/webm;codecs=opus", "audio/ogg;codecs=opus", "audio/webm"].find((candidate) => MediaRecorder.isTypeSupported(candidate));
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      recorder.ondataavailable = (event) => { if (event.data.size > 0) recordedChunks.current.push(event.data); };
      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        recordingRecognition.current?.stop();
        recordingRecognition.current = null;
        const transcript = recordingTranscript.current.trim();
        if (transcript) {
          setMessage(transcript);
          setStarted(true);
        }
        const type = recorder.mimeType || "audio/webm";
        const extension = type.startsWith("audio/ogg") ? "ogg" : "webm";
        void uploadFile(new File([new Blob(recordedChunks.current, { type })], `voice-note.${extension}`, { type }));
      };
      mediaRecorder.current = recorder;
      recorder.start();
      setRecording(true);
      setError("");
    } catch {
      setError("We could not access your microphone. Check your browser permission and try again.");
    }
  }

  function stopRecording() {
    mediaRecorder.current?.stop();
    setRecording(false);
  }

  function toggleLiveVoice() {
    if (voiceListening) {
      recognition.current?.stop();
      setVoiceListening(false);
      return;
    }
    const speechWindow = window as Window & { SpeechRecognition?: new () => SpeechRecognitionLike; webkitSpeechRecognition?: new () => SpeechRecognitionLike };
    const SpeechRecognition = speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError("Live voice is not supported in this browser. You can record an audio message instead.");
      return;
    }
    const nextRecognition = new SpeechRecognition();
    nextRecognition.continuous = true;
    nextRecognition.interimResults = true;
    nextRecognition.lang = voiceLocale(language);
    voiceTranscript.current = "";
    nextRecognition.onresult = (event) => {
      const results = Array.from(event.results).slice(event.resultIndex);
      const finalText = results.filter((result) => result[0]?.isFinal !== false).map((result) => result[0].transcript).join(" ").trim();
      if (finalText) voiceTranscript.current = `${voiceTranscript.current} ${finalText}`.trim();
      const interimText = results.filter((result) => result[0]?.isFinal === false).map((result) => result[0].transcript).join(" ").trim();
      setMessage(`${voiceTranscript.current} ${interimText}`.trim());
    };
    nextRecognition.onerror = () => { setError("We could not start live voice. Check your microphone permission and try again."); setVoiceListening(false); };
    nextRecognition.onend = () => {
      setVoiceListening(false);
      const transcript = voiceTranscript.current.trim();
      voiceTranscript.current = "";
      if (transcript) void send(transcript);
    };
    recognition.current = nextRecognition;
    nextRecognition.start();
    setVoiceListening(true);
    setError("");
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const greeting = new SpeechSynthesisUtterance(voiceGreeting(language));
      greeting.lang = voiceLocale(language);
      window.speechSynthesis.speak(greeting);
    }
  }

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-4 sm:px-6 lg:px-10">
      <div className="mx-auto flex min-h-[calc(100dvh-2rem)] max-w-6xl flex-col overflow-hidden rounded-[1.75rem] border border-[var(--line)] bg-white shadow-[0_20px_70px_rgba(18,51,42,0.08)]">
        <header className="flex items-center justify-between border-b border-[var(--line)] px-5 py-4 sm:px-8">
          <Link href="/" aria-label="MY RIGHT home"><BrandMark compact /></Link>
          <div className="flex items-center gap-3"><LanguageSelector onChange={setLanguage} /><span className="hidden text-xs text-[var(--ink-muted)] sm:block">{t(language, "privateSession")}</span><a href="/emergency" className="rounded-full bg-[#fff0e5] px-3 py-2 text-xs font-semibold text-[#8e4a2c]">{t(language, "emergency")}</a></div>
        </header>
        <div className="grid flex-1 lg:grid-cols-[0.72fr_1.28fr]">
          <aside className="border-b border-[var(--line)] bg-[#f7faf7] p-6 sm:p-8 lg:border-b-0 lg:border-r">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--accent)]">{t(language, "privateStart")}</p>
            <h1 className="mt-5 text-3xl font-semibold leading-tight tracking-[-0.04em]">{t(language, "question")}</h1>
            <p className="mt-4 text-sm leading-6 text-[var(--ink-muted)]">{t(language, "noRightWords")}</p>
            <div className="mt-8 space-y-2">{prompts.map((prompt) => <button key={prompt} onClick={() => void send(prompt)} className="flex w-full items-center justify-between rounded-xl border border-[var(--line)] bg-white px-4 py-3 text-left text-sm font-medium transition-colors hover:border-[var(--accent)] hover:bg-[var(--accent-soft)]"><span>{prompt}</span><span className="text-[var(--accent)]" aria-hidden="true">→</span></button>)}</div>
            <div className="mt-10 border-t border-[var(--line)] pt-5 text-xs leading-5 text-[var(--ink-muted)]">{t(language, "safetyNote")}</div>
          </aside>
          <section className="flex flex-col p-5 sm:p-8">
            <div className="flex-1">
              <div className="max-w-xl">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--ink-muted)]">{t(language, "support")}</p>
                {!started ? <><h2 className="mt-6 text-2xl font-semibold tracking-[-0.03em]">Take your time. We&apos;re listening.</h2><p className="mt-3 text-sm leading-6 text-[var(--ink-muted)]">This session starts without an account. Before sharing sensitive information, you&apos;ll see how it is handled.</p></> : <div className="mt-8 space-y-4"><div className="ml-auto max-w-md rounded-2xl rounded-br-md bg-[var(--accent)] px-5 py-4 text-sm leading-6 text-white">{attachmentName ? `Attached: ${attachmentName}` : message || "Message sent"}</div>{isSending ? <div className="max-w-md rounded-2xl rounded-bl-md bg-[#f0f5f2] px-5 py-4 text-sm text-[var(--ink-muted)]">Thinking carefully...</div> : reply ? <div className="max-w-md whitespace-pre-wrap rounded-2xl rounded-bl-md bg-[#f0f5f2] px-5 py-4 text-sm leading-6 text-[var(--foreground)]">{reply}</div> : null}{followupEligible && !contactSubmitted && !showFollowup ? <button type="button" onClick={() => setShowFollowup(true)} className="rounded-full border border-[var(--accent)] px-4 py-3 text-sm font-semibold text-[var(--accent-dark)]">Request human follow-up</button> : null}{showFollowup && !contactSubmitted ? <div className="rounded-2xl border border-[var(--line)] bg-[#f7faf7] p-5"><p className="text-sm font-semibold">How should we contact you?</p><p className="mt-2 text-xs leading-5 text-[var(--ink-muted)]">Only share contact details if it is safe for you. You can change your mind before submitting.</p><div className="mt-4 flex gap-2"><button type="button" onClick={() => setContactMethod("phone")} className={`rounded-full px-3 py-2 text-xs font-semibold ${contactMethod === "phone" ? "bg-[var(--accent)] text-white" : "border border-[var(--line)]"}`}>Phone</button><button type="button" onClick={() => setContactMethod("email")} className={`rounded-full px-3 py-2 text-xs font-semibold ${contactMethod === "email" ? "bg-[var(--accent)] text-white" : "border border-[var(--line)]"}`}>Email</button></div><input value={contactValue} onChange={(event) => setContactValue(event.target.value)} type={contactMethod === "email" ? "email" : "tel"} placeholder={contactMethod === "email" ? "you@example.com" : "+233..."} className="mt-3 h-12 w-full rounded-xl border border-[var(--line)] bg-white px-4 text-sm outline-none focus:border-[var(--accent)]" /><button type="button" onClick={() => void submitFollowup()} className="mt-3 rounded-full bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-white">Submit follow-up request</button></div> : null}{contactSubmitted ? <div className="rounded-xl bg-[var(--accent-soft)] px-4 py-3 text-sm font-semibold text-[var(--accent-dark)]">Your follow-up request has been received.</div> : null}{error ? <div className="rounded-xl border border-[#efc6b7] bg-[#fff4ef] px-4 py-3 text-sm text-[#8e4a2c]" role="alert">{error}</div> : null}</div>}
              </div>
            </div>
            <div className="mt-8 border-t border-[var(--line)] pt-5">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <label className="cursor-pointer rounded-full border border-[var(--line)] px-3 py-2 text-xs font-semibold transition-colors hover:border-[var(--accent)] hover:bg-[var(--accent-soft)]"><input type="file" accept="image/jpeg,image/png,image/webp,application/pdf,.doc,.docx,audio/*" className="sr-only" disabled={uploading} onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadFile(file); event.currentTarget.value = ""; }} />{uploading ? "Uploading..." : t(language, "addFile")}</label>
                <button type="button" onClick={recording ? stopRecording : () => void startRecording()} className={`rounded-full border px-3 py-2 text-xs font-semibold transition-colors ${recording ? "recording-pulse border-[#b64c3b] bg-[#fff0e5] text-[#8e4a2c]" : "border-[var(--line)] hover:border-[var(--accent)] hover:bg-[var(--accent-soft)]"}`}>{recording ? t(language, "stopRecording") : t(language, "record")}</button>
                <button type="button" onClick={toggleLiveVoice} className={`rounded-full border px-3 py-2 text-xs font-semibold transition-colors ${voiceListening ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent-dark)]" : "border-[var(--line)] hover:border-[var(--accent)] hover:bg-[var(--accent-soft)]"}`}>{voiceListening ? t(language, "endVoice") : t(language, "liveVoice")}</button>
                {attachmentName ? <span className="text-xs text-[var(--ink-muted)]" aria-live="polite">Ready: {attachmentName}</span> : null}
              </div>
              <div className="flex items-end gap-3">
                <label className="sr-only" htmlFor="support-message">Describe what is happening</label>
                <textarea id="support-message" value={message} onChange={(event) => setMessage(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void send(); } }} placeholder={t(language, "describe")} className="min-h-14 flex-1 resize-none rounded-2xl border border-[var(--line)] bg-[#fbfcfb] px-4 py-4 text-sm outline-none transition-colors placeholder:text-[#84938c] focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent)]/10" />
                <button onClick={() => void send()} disabled={isSending || uploading} className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[var(--accent)] text-xl text-white transition-transform hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-60" aria-label="Send message">↑</button>
              </div>
              <p className="mt-3 text-center text-[11px] text-[var(--ink-muted)]">Audio and files are stored privately with this session. Do not share anything that could put you at greater risk if someone else can see your screen.</p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
