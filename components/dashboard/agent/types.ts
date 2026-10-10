export type BusinessCategory =
  | "Dental Clinic"
  | "Real Estate"
  | "Restaurant & Hospitality"
  | "Healthcare & Medical"
  | "Legal Practice"
  | "Salon & Wellness"
  | "Automotive Services"
  | "Home Services & Contracting"
  | "Custom / Other";

export type PrimaryLanguage =
  | "English (US)"
  | "English (UK)"
  | "Spanish (US/LATAM)"
  | "Spanish (Spain)"
  | "French"
  | "German"
  | "Portuguese (Brazil)"
  | "Hindi"
  | "Italian"
  | "Japanese";

export interface VoiceOption {
  id: string;
  name: string;
  category: "ElevenLabs" | "OpenAI" | "Deepgram";
  label: string;
  tagline: string;
  gender: "Female" | "Male" | "Neutral";
  accent: string;
  previewSampleText: string;
  recommendedFor: string;
}

export interface PromptTemplate {
  id: string;
  name: string;
  category: BusinessCategory | "General";
  description: string;
  badge: string;
  systemPrompt: string;
  suggestedGreeting: string;
  sampleQuestions: string[];
}

export interface AgentConfig {
  // Business Details
  businessName: string;
  businessCategory: BusinessCategory;
  primaryLanguage: PrimaryLanguage;
  businessPhone: string;
  officeHours: string;
  businessAddress: string;
  greetingMessage: string;

  // Persona & Behavior
  agentName: string;
  systemPrompt: string;
  selectedTemplateId: string;
  conversationTone: "friendly" | "professional" | "direct" | "empathic";
  interruptionSensitivity: "low" | "balanced" | "high";
  verbosity: "concise" | "balanced" | "detailed";
  latencyMode: "ultra_low" | "balanced" | "high_reasoning";
  transferKeywords: string;

  // Voice Selection
  selectedVoiceId: string;
  voiceStability: number;
  clarityBoost: number;
  speakingRate: number;
  ambientNoise: "none" | "office" | "clinic";

  // Tools & Integrations
  calendarBookingEnabled: boolean;
  faqKnowledgeEnabled: boolean;
  callRecordingEnabled: boolean;
  smsFollowUpEnabled: boolean;
}

export type CallState = "idle" | "connecting" | "ringing" | "connected" | "ended";

export interface TranscriptMessage {
  id: string;
  sender: "agent" | "caller" | "system";
  text: string;
  timestamp: string;
}
