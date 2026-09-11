import type { AIMessage, AIProvider } from "./provider";
import type { SafetyAssessment } from "@/types/domain";

const safetyFallback: SafetyAssessment = {
  immediateDanger: false,
  potentialRisk: "none",
  childSafetyConcern: false,
  violenceConcern: false,
  coercionConcern: false,
  harassmentConcern: false,
  selfHarmConcern: false,
  professionalSupportRecommended: false,
  emergencyPathwayRecommended: false,
  confidence: 0,
  rationale: "No assessment was available.",
};

function config() {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) throw new Error("DEEPSEEK_API_KEY is not configured");
  return {
    apiKey,
    baseUrl: process.env.DEEPSEEK_BASE_URL ?? "https://api.deepseek.com/v1",
    model: process.env.DEEPSEEK_MODEL ?? "deepseek-v4",
  };
}

async function complete(messages: AIMessage[], json = false): Promise<string> {
  const { apiKey, baseUrl, model } = config();
  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model, messages, temperature: 0.2, ...(json ? { response_format: { type: "json_object" } } : {}) }),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`AI provider request failed with status ${response.status}`);
  const payload = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
  const content = payload.choices?.[0]?.message?.content;
  if (!content) throw new Error("AI provider returned an empty response");
  return content;
}

const policy = "You are a careful support assistant for MY RIGHT in Ghana. You are not a lawyer, doctor, police officer, therapist, or emergency service. Do not diagnose, determine guilt, invent laws or resources, pressure disclosure, or tell someone to confront a dangerous person. Acknowledge, ask about immediate safety when relevant, and provide options. Use only verified resources supplied by the application. This is a guided intake: ask exactly one short, gentle question per response, never a list of questions. Ask only for the next missing detail. Do not ask for a phone number or email. Do not suggest human follow-up until the user has shared enough context about what is happening, immediate safety, and the kind of help they want. The user must choose whether to request human follow-up.";

export const deepSeekProvider: AIProvider = {
  async generateResponse({ messages, resources }) {
    return complete([
      { role: "system", content: `${policy}\nVerified resources:\n${resources.join("\n") || "None available."}` },
      ...messages,
    ]);
  },
  async assessSafety({ messages }) {
    try {
      const raw = await complete([
        { role: "system", content: `${policy}\nReturn JSON only with exactly these keys: immediateDanger, potentialRisk (none|low|medium|high|urgent), childSafetyConcern, violenceConcern, coercionConcern, harassmentConcern, selfHarmConcern, professionalSupportRecommended, emergencyPathwayRecommended, confidence (0 to 1), rationale. This is an AI signal, not a professional determination.` },
        ...messages,
      ], true);
      return { ...safetyFallback, ...JSON.parse(raw) } as SafetyAssessment;
    } catch {
      return safetyFallback;
    }
  },
  async transcribe({ audio, language }) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("Audio transcription is not configured");
    const body = new FormData();
    body.append("file", new File([audio], "voice-note.webm", { type: audio.type || "audio/webm" }));
    body.append("model", process.env.OPENAI_TRANSCRIPTION_MODEL ?? "whisper-1");
    if (language) body.append("language", language);
    const response = await fetch("https://api.openai.com/v1/audio/transcriptions", { method: "POST", headers: { Authorization: `Bearer ${apiKey}` }, body, cache: "no-store" });
    if (!response.ok) throw new Error(`Audio transcription failed with status ${response.status}`);
    const payload = await response.json() as { text?: string };
    if (!payload.text?.trim()) throw new Error("Audio transcription returned no speech");
    return payload.text.trim();
  },
  async embed() { throw new Error("Embeddings are not configured"); },
};