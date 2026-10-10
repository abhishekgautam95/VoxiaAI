import {
  BusinessCategory,
  PrimaryLanguage,
  VoiceOption,
  PromptTemplate,
  AgentConfig,
} from "./types";

export const BUSINESS_CATEGORIES: { id: BusinessCategory; label: string; icon: string; desc: string }[] = [
  { id: "Dental Clinic", label: "Dental Clinic", icon: "🦷", desc: "Appointments, cleanings, tooth pain triage & insurance" },
  { id: "Real Estate", label: "Real Estate Agency", icon: "🏡", desc: "Property listings, buyer qualification & private showings" },
  { id: "Restaurant & Hospitality", label: "Restaurant & Dining", icon: "🍽️", desc: "Table reservations, party bookings, menus & dietary info" },
  { id: "Healthcare & Medical", label: "Healthcare & Clinic", icon: "🩺", desc: "Patient intake, doctor consultations & prescription queries" },
  { id: "Legal Practice", label: "Legal Practice / Law Firm", icon: "⚖️", desc: "Client case intake, consultation scheduling & confidentiality" },
  { id: "Salon & Wellness", label: "Salon & Spa / Wellness", icon: "✂️", desc: "Stylist bookings, beauty treatments & spa packages" },
  { id: "Automotive Services", label: "Automotive & Dealership", icon: "🚗", desc: "Service appointments, test drives & repair status" },
  { id: "Home Services & Contracting", label: "Home Services / Contractor", icon: "🔨", desc: "Estimates, HVAC, plumbing, urgent dispatch & quotes" },
  { id: "Custom / Other", label: "Custom / Other Industry", icon: "✨", desc: "Tailored to your specific enterprise workflow" },
];

export const PRIMARY_LANGUAGES: { id: PrimaryLanguage; label: string; code: string; flag: string }[] = [
  { id: "English (US)", label: "English (United States)", code: "en-US", flag: "🇺🇸" },
  { id: "English (UK)", label: "English (United Kingdom)", code: "en-GB", flag: "🇬🇧" },
  { id: "Spanish (US/LATAM)", label: "Spanish (US & Latin America)", code: "es-US", flag: "🇲🇽" },
  { id: "Spanish (Spain)", label: "Spanish (Castilian)", code: "es-ES", flag: "🇪🇸" },
  { id: "French", label: "French (Standard)", code: "fr-FR", flag: "🇫🇷" },
  { id: "German", label: "German (Hochdeutsch)", code: "de-DE", flag: "🇩🇪" },
  { id: "Portuguese (Brazil)", label: "Portuguese (Brazil)", code: "pt-BR", flag: "🇧🇷" },
  { id: "Hindi", label: "Hindi (India)", code: "hi-IN", flag: "🇮🇳" },
  { id: "Italian", label: "Italian (Standard)", code: "it-IT", flag: "🇮🇹" },
  { id: "Japanese", label: "Japanese (Nihongo)", code: "ja-JP", flag: "🇯🇵" },
];

export const ELEVENLABS_VOICES: VoiceOption[] = [
  {
    id: "rachel-natural",
    name: "Rachel",
    category: "ElevenLabs",
    label: "Rachel - Natural",
    tagline: "Calm, welcoming, and warm tone with crystal-clear articulation",
    gender: "Female",
    accent: "American (General)",
    previewSampleText: "Hello! Thank you for calling. My name is Rachel, your AI receptionist. How can I assist you today?",
    recommendedFor: "Dental clinics, medical practices, hospitality & wellness",
  },
  {
    id: "guy-professional",
    name: "Guy",
    category: "ElevenLabs",
    label: "Guy - Professional",
    tagline: "Authoritative, crisp, confident, and highly articulate business voice",
    gender: "Male",
    accent: "American (Corporate)",
    previewSampleText: "Good day. You've reached our automated front desk. I am Guy. How may I direct your call or schedule your appointment?",
    recommendedFor: "Law firms, real estate agencies, financial & executive offices",
  },
  {
    id: "adam-confident",
    name: "Adam",
    category: "ElevenLabs",
    label: "Adam - Confident & Warm",
    tagline: "Deep, soothing baritone voice with reassurance and gravitas",
    gender: "Male",
    accent: "American (Midwestern)",
    previewSampleText: "Hi there, thank you for reaching out to us. I can help you schedule a visit or answer questions regarding our services.",
    recommendedFor: "Automotive dealerships, construction, concierge & VIP lines",
  },
  {
    id: "bella-expressive",
    name: "Bella",
    category: "ElevenLabs",
    label: "Bella - Expressive & Friendly",
    tagline: "Energetic, bright, upbeat and engaging conversational style",
    gender: "Female",
    accent: "American (Modern)",
    previewSampleText: "Hi! Welcome! I'd love to help you book your next appointment or answer any quick questions you have.",
    recommendedFor: "Salons, modern cafes, boutique fitness & retail support",
  },
  {
    id: "antoni-polished",
    name: "Antoni",
    category: "ElevenLabs",
    label: "Antoni - Polished Corporate",
    tagline: "Sophisticated, smooth, and balanced executive tone",
    gender: "Male",
    accent: "American (Neutral)",
    previewSampleText: "Hello and welcome. I am your automated client representative. Please let me know how I can be of service today.",
    recommendedFor: "B2B SaaS, enterprise consulting, legal and financial services",
  },
  {
    id: "nicole-empathetic",
    name: "Nicole",
    category: "ElevenLabs",
    label: "Nicole - Empathetic Care",
    tagline: "Soft-spoken, gentle, patient and deeply reassuring bedside manner",
    gender: "Female",
    accent: "American (Gentle)",
    previewSampleText: "Hello, you've reached our care team. Please take your time, and tell me how I can best support you today.",
    recommendedFor: "Mental health clinics, veterinary hospitals, triage & therapy",
  },
  {
    id: "freya-british",
    name: "Freya",
    category: "ElevenLabs",
    label: "Freya - Sophisticated British",
    tagline: "Prestigious British received pronunciation, polished and refined",
    gender: "Female",
    accent: "British (RP)",
    previewSampleText: "Good day. Thank you for telephoning. I would be delighted to arrange your booking or assist with your inquiry.",
    recommendedFor: "Luxury real estate, high-end hospitality & private clubs",
  },
  {
    id: "charlie-conversational",
    name: "Charlie",
    category: "ElevenLabs",
    label: "Charlie - Casual & Approachable",
    tagline: "Relaxed, friendly Australian delivery, ideal for approachable brands",
    gender: "Male",
    accent: "Australian",
    previewSampleText: "G'day! Thanks for calling through. How's your day going, and what can I help you sort out today?",
    recommendedFor: "Modern tech companies, trade contractors & casual dining",
  },
];

export const PROMPT_TEMPLATES: PromptTemplate[] = [
  {
    id: "template-appointment-booking",
    name: "Appointment Booking Routine",
    category: "Dental Clinic",
    badge: "Most Popular",
    description: "Designed for clinics, medical offices, and service firms to book new appointments, verify caller details, and handle rescheduling seamlessly.",
    suggestedGreeting: "Thank you for calling {business_name}! My name is {agent_name}. Are you looking to schedule an appointment, or do you have a question about our services today?",
    sampleQuestions: [
      "I'd like to book a routine cleaning this Thursday afternoon.",
      "What insurances do you guys take?",
      "Can I reschedule my appointment from Tuesday?",
      "Where are you located and what are your hours?",
    ],
    systemPrompt: `You are {agent_name}, the professional and warm AI voice receptionist for {business_name}, a premier {business_category}.
Your primary goal is to provide exceptional phone service, answer inquiries, and schedule or reschedule appointments smoothly.

Key Instructions:
1. GREETING & TONE: Greet callers warmly, speak in a natural conversational rhythm in {primary_language}. Keep spoken responses concise (1 to 2 sentences per turn) because callers are listening over phone audio.
2. APPOINTMENT BOOKING WORKFLOW:
   - Ask if the caller is a new patient or returning patient.
   - Inquire about their primary reason for visiting (e.g., routine examination, cleaning, acute pain, or consultation).
   - Offer 2 to 3 available time slots within operating hours ({office_hours}).
   - Collect and confirm: Full Name, Callback Phone Number, and Preferred Date/Time.
   - Always repeat the appointment summary back to the caller for verbal confirmation.
3. OFFICE POLICIES & HOURS:
   - Operating Hours: {office_hours}
   - Address: {business_address}
   - In-network insurance plans and standard payment options should be confirmed politely.
4. GUARDRAILS:
   - If the caller describes severe emergency symptoms, advise them to dial 911 or visit the nearest emergency facility immediately.
   - If the caller asks to speak to a live human or front-desk staff member, transfer the call immediately using the call transfer tool without hesitation.
   - Never provide definitive medical or legal diagnosis; always frame guidance as appointment scheduling with the doctor or specialist.`,
  },
  {
    id: "template-customer-support",
    name: "Customer Support Routine",
    category: "General",
    badge: "Core Workflow",
    description: "Optimized for triage, handling inquiries, troubleshooting common issues, order/account tracking, and escalations.",
    suggestedGreeting: "Thanks for calling {business_name} support! My name is {agent_name}. How can I assist you with your account or order today?",
    sampleQuestions: [
      "I need to check the status of my order from last week.",
      "My bill looks incorrect, who can I talk to?",
      "Can I speak with a supervisor right now?",
      "What is your return and refund policy?",
    ],
    systemPrompt: `You are {agent_name}, an expert and empathetic customer support voice agent for {business_name}.
Your mission is to understand caller issues quickly, provide clear answers, and resolve concerns on the first call whenever possible.

Core Principles:
1. ACTIVE LISTENING & EMPATHY: Acknowledge caller concerns with genuine warmth and patience in {primary_language}. Never interrupt or sound robotic.
2. ISSUE RESOLUTION STEPS:
   - Ask for the caller's account identifier, order number, or registered phone number.
   - Confirm details before proceeding.
   - Consult internal business knowledge to provide accurate answers regarding policies, operating hours ({office_hours}), and services.
   - Provide clear, actionable instructions in bite-sized spoken steps.
3. DE-ESCALATION & TRANSFERS:
   - If the caller expresses frustration or requests a manager, acknowledge their feeling respectfully: "I completely understand your frustration, and I want to make sure this is resolved for you immediately."
   - Immediately route the call to a tier-2 specialist or human supervisor when requested.
4. CALL WRAP-UP:
   - Ask: "Is there anything else I can assist you with today before we wrap up?"
   - Thank them sincerely for choosing {business_name}.`,
  },
  {
    id: "template-real-estate",
    name: "Real Estate Inquiries & Tour Scheduler",
    category: "Real Estate",
    badge: "High Conversion",
    description: "Qualify prospective buyers and tenants, capture property preferences (budget, bedrooms, location), and book private showings.",
    suggestedGreeting: "Hello! Thank you for calling {business_name}. I'm {agent_name}. Are you inquiring about a specific property listing or looking to schedule a private viewing?",
    sampleQuestions: [
      "I'm calling about the 3-bedroom listing on Oak Avenue.",
      "Are you available for a showing this Saturday at 11 AM?",
      "What is the listing price and HOA fee?",
      "I want to sell my home, do you provide valuations?",
    ],
    systemPrompt: `You are {agent_name}, the charismatic and knowledgeable voice coordinator for {business_name}, a top-tier {business_category}.
Your objective is to qualify caller interest, provide accurate property highlights, and book private tour showings or listing consultations with licensed agents.

Key Procedures:
1. PROPERTY IDENTIFICATION: Ask which address or MLS listing ID they are inquiring about.
2. BUYER/RENTER QUALIFICATION:
   - Inquire whether they are looking to buy, sell, or lease.
   - Inquire about their target timeline (immediate, next 30 days, or browsing) and budget range.
   - If inquiring about a tour, suggest two available showing windows within {office_hours}.
3. LEAD CAPTURE:
   - Accurately gather caller's Full Name, Cell Phone, and Email address.
   - Send confirmation that the designated listing agent will follow up with full property disclosures.
4. PROFESSIONALISM: Maintain an upbeat, courteous, and trustworthy tone in {primary_language}. Never give speculation on unverified structural or financial items.`,
  },
  {
    id: "template-restaurant",
    name: "Restaurant Reservations & Dining Inquiries",
    category: "Restaurant & Hospitality",
    badge: "Hospitality",
    description: "Manage table bookings, group dinners, special dietary requirements, parking, and general dining inquiries.",
    suggestedGreeting: "Good evening and thank you for calling {business_name}! My name is {agent_name}. Would you like to reserve a table or can I help with our menu and hours?",
    sampleQuestions: [
      "Can I reserve a table for 4 this Friday at 7:30 PM?",
      "Do you have gluten-free and vegan options on the menu?",
      "Is valet parking available at your location?",
      "Do you take private dining bookings for 15 people?",
    ],
    systemPrompt: `You are {agent_name}, the gracious maître d' and voice receptionist for {business_name}, a premier {business_category}.
Your focus is to welcome diners with genuine warmth, manage table reservations effortlessly, and answer dining questions.

Reservation Flow:
1. PARTY DETAILS: Ask for date, preferred seating time, and total party size.
2. DIETARY & PREFERENCES: Inquire if anyone in the party has allergies, dietary restrictions, or is celebrating a special occasion (birthday, anniversary).
3. CONTACT DETAILS: Collect guest name and confirmation cell phone for reservation SMS reminders.
4. POLICIES:
   - Operating Hours: {office_hours}
   - Address: {business_address}
   - Inform guests of the 15-minute grace period policy. For parties over 6, note large-party deposit policies.
5. TONE: Warm, welcoming, upscale, and articulate in {primary_language}.`,
  },
  {
    id: "template-after-hours",
    name: "After-Hours Urgent Triage Routine",
    category: "Healthcare & Medical",
    badge: "24/7 Coverage",
    description: "Handles off-hours phone traffic, triages urgent vs non-urgent caller needs, and alerts on-call emergency personnel when appropriate.",
    suggestedGreeting: "Thank you for calling {business_name} after-hours support. My name is {agent_name}. If this is a life-threatening medical emergency, please hang up and dial 911 immediately. How may I assist you tonight?",
    sampleQuestions: [
      "I had oral surgery today and the bleeding won't stop.",
      "I just want to leave a message for the billing department in the morning.",
      "Can I schedule an appointment for next week?",
      "Is there an on-call doctor available right now?",
    ],
    systemPrompt: `You are {agent_name}, the after-hours emergency triage assistant for {business_name}.
Our office is currently closed (Normal Hours: {office_hours}). Your mission is to triage callers and determine if their inquiry requires immediate on-call staff dispatch or can be scheduled for normal business hours.

Protocol:
1. URGENCY ASSESSMENT:
   - If acute pain, severe emergency, or immediate danger: Instruct caller to hang up and call 911 or report to the nearest emergency room.
   - If urgent clinical issue requiring on-call practitioner: Capture caller full name, callback phone number, current symptoms, and trigger emergency on-call SMS paging.
   - If routine (billing, routine appointment, office hours inquiry): Offer to record a voice message or schedule a return call when the front desk opens at {office_hours}.
2. CALM & COMPASSIONATE: Speak with composure, clarity, and authority in {primary_language}. Never leave callers uncertain of next steps.`,
  },
];

export const DEFAULT_AGENT_CONFIG: AgentConfig = {
  // Business Details
  businessName: "Apex Health & Dental Studio",
  businessCategory: "Dental Clinic",
  primaryLanguage: "English (US)",
  businessPhone: "+1 (415) 800-4291",
  officeHours: "Mon-Fri 8:00 AM - 6:00 PM, Sat 9:00 AM - 2:00 PM PST",
  businessAddress: "450 Sutter St, Suite 1400, San Francisco, CA 94108",
  greetingMessage: "Thank you for calling Apex Health & Dental! My name is Sarah. Are you looking to schedule an appointment, or do you have a question about our services today?",

  // Persona & Behavior
  agentName: "Sarah (Front Desk Coordinator)",
  systemPrompt: PROMPT_TEMPLATES[0].systemPrompt,
  selectedTemplateId: "template-appointment-booking",
  conversationTone: "friendly",
  interruptionSensitivity: "balanced",
  verbosity: "concise",
  latencyMode: "ultra_low",
  transferKeywords: "human, agent, receptionist, representative, speak to someone, operator, emergency",

  // Voice Selection
  selectedVoiceId: "rachel-natural",
  voiceStability: 0.72,
  clarityBoost: 0.85,
  speakingRate: 1.0,
  ambientNoise: "none",

  // Tools & Integrations
  calendarBookingEnabled: true,
  faqKnowledgeEnabled: true,
  callRecordingEnabled: true,
  smsFollowUpEnabled: true,
};
