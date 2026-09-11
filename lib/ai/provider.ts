import type { SafetyAssessment } from "@/types/domain";

export type AIMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

export type AIProvider = {
  generateResponse(input: { messages: AIMessage[]; resources: string[] }): Promise<string>;
  assessSafety(input: { messages: AIMessage[] }): Promise<SafetyAssessment>;
  transcribe(input: { audio: Blob; language?: string }): Promise<string>;
  embed(input: { text: string }): Promise<number[]>;
};

export function sanitizeForAI(value: string): string {
  return value.replace(/\b(?:phone|email|address|name)\s*:\s*[^\n]+/gi, "[redacted]").trim();
}