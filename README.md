<div align="center">

# 🎙️ VoxiaAI

**Enterprise Autonomous AI Voice Receptionist Platform**

[![Next.js 16.4](https://img.shields.io/badge/Next.js-16.4-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React 19.3](https://img.shields.io/badge/React-19.3-00D8FF?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript 5](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-6.19-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![ElevenLabs](https://img.shields.io/badge/ElevenLabs-Turbo_v2.5-FF6C37?style=for-the-badge&logo=soundcharts&logoColor=white)](https://elevenlabs.io/)
[![Twilio Telephony](https://img.shields.io/badge/Twilio-SIP_Trunk-F22F46?style=for-the-badge&logo=twilio&logoColor=white)](https://www.twilio.com/)
[![Tailwind CSS 4](https://img.shields.io/badge/Tailwind_CSS-4.0-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald?style=for-the-badge)](LICENSE)

<p align="center">
  <b>VoxiaAI</b> is an enterprise-grade, full-stack voice orchestration platform designed to replace rigid phone trees and busy signals with autonomous conversational AI receptionists. Operating 24/7 with human cadence, sub-300ms acoustic streaming, RAG knowledge retrieval, real-time conflict-free calendar booking, and HIPAA-compliant audit trails.
</p>

[Executive Overview](#-executive-overview) • [System Architecture](#-system-architecture--telephony-pipeline) • [Core Capabilities](#-core-capabilities) • [Database & Schema](#-database-architecture--prisma-orm) • [API Reference](#-rest-api-reference) • [Getting Started](#-getting-started) • [Security & Compliance](#-security--hipaa-compliance)

</div>

---

## ⚡ Executive Overview

Modern healthcare clinics, dental groups, legal firms, and service enterprises lose up to **35% of inbound opportunities** to unanswered after-hours calls, long hold queues, and clunky IVR menus. 

**VoxiaAI** solves the front-desk bottleneck through a complete autonomous voice stack:
- 🚀 **Sub-300ms Voice Synthesis**: Ultra-low-latency streaming audio powered by ElevenLabs Turbo v2.5 with automatic Web Speech fallback.
- 🧠 **Domain-Specific Knowledge Base (RAG)**: Indexes clinic policies, accepted PPO insurance networks, pricing sheets, and directions with semantic retrieval during live telephony and browser simulation.
- 📅 **Conflict-Free Scheduling Engine**: Real-time slot availability queries, 2-way calendar sync, and automatic slot locking to prevent double bookings.
- 📞 **SIP Trunk & Telephony Ingestion**: Turnkey integration with Twilio and Telnyx for live PSTN call routing, speech gathering, and TwiML voice responses.
- 🛡️ **HIPAA Compliance Audit Trail**: Every authentication event, agent update, appointment change, and call completion is immutably logged with client metadata.
- 📊 **Dynamic ROI & Operational Analytics**: Live tracking of net staff wage savings, appointment pipeline yield, average handle time (AHT), and after-hours deflection.

---

## 🏗 System Architecture & Telephony Pipeline

```mermaid
flowchart TD
    subgraph Telecom [Inbound Telephony Carrier]
        Caller([Caller Phone]) <-->|PSTN / SIP| Twilio[Twilio / Telnyx Gateway]
    end

    subgraph Platform [VoxiaAI Core Engine]
        Twilio <-->|TwiML / Webhooks| InboundRouter["/api/telephony/inbound"]
        InboundRouter <--> GatherRouter["/api/telephony/gather"]
        
        GatherRouter <--> RAGEngine[Knowledge Base RAG]
        GatherRouter <--> CalendarEngine[Calendar Availability & Locking]
        GatherRouter <--> Notifications[SMS & Webhook Dispatcher]
        
        RAGEngine <--> PostgreSQL[(PostgreSQL Database)]
        CalendarEngine <--> PostgreSQL
        
        GatherRouter -->|Speech Synthesis| VoiceTTS["/api/voice/tts (ElevenLabs / WebSpeech)"]
        VoiceTTS --> Twilio
    end

    subgraph Administration [Enterprise Dashboard]
        Admin([Clinic Operator]) <--> SessionProxy["Proxy / Middleware (proxy.ts)"]
        SessionProxy <--> NextDashboard["Next.js 16.4 App Router"]
        NextDashboard <--> AuditLogger["/api/audit-logs"]
        NextDashboard <--> AnalyticsEngine["/api/analytics"]
        AuditLogger <--> PostgreSQL
        AnalyticsEngine <--> PostgreSQL
    end
```

### The Conversational Turn Lifecycle:
1. **Inbound Signal**: SIP carrier transmits incoming call metadata (`CallSid`, `From`, `To`) to `/api/telephony/inbound`. An active `CallRecord` session is created in PostgreSQL.
2. **Dynamic Greeting**: The AI receptionist greets the caller with custom practice branding, tone, and operational guidelines.
3. **Speech Recognition (STT)**: Caller speech is gathered and processed by the carrier's neural speech engine.
4. **Context & RAG Matching**: If the caller inquires about insurance, pricing, or emergency care, the system performs semantic matching against `KnowledgeDocument` records in PostgreSQL.
5. **Tool Execution**: When requesting an appointment, the engine validates available slots, locks the appointment in PostgreSQL, dispatches SMS confirmations, and notifies staff.
6. **Acoustic Streaming (TTS)**: Voice responses stream at 48kHz with natural pacing and inflection.
7. **Audit & Analytics**: Upon call termination (`/api/telephony/status`), the call duration, transcript turns, and sentiment are committed to PostgreSQL, updating the ROI metrics in real time.

---

## 🌟 Core Capabilities

### 1. 🤖 Autonomous Agent Studio (`/dashboard/agent`)
- **Business Identity & Categorization**: Select from 9 specialized domains (Dental Practice, Healthcare Clinic, Legal Firm, Real Estate, Restaurant, Salon & Spa, Auto Services, Contractors, Custom).
- **Multi-Dialect Localization**: Native support for 10 languages (US/UK English, Spanish, French, German, Portuguese, Hindi, Italian, Japanese).
- **Prompt Architect**: Monospace prompt editor supporting token tags (`{business_name}`, `{office_hours}`, `{business_address}`).
- **Interactive Voice Selector**: Audition and configure studio voices (Rachel, Guy, Adam, Bella) via ElevenLabs Turbo v2.5 streaming.
- **RAG Knowledge Base Modal**: Add, search, and delete clinic policy documents, insurance matrices, and FAQ guidelines with live document counts.
- **In-Browser Voice Simulator (`LiveTestWidget`)**: Test conversations directly in the browser with Web Audio ringback tones, microphone Speech-to-Text, reactive audio waveforms, and transcript logs.

### 2. 📅 Appointments & Conflict-Free Calendar (`/dashboard/appointments`)
- **Dual Presentation**: Toggle between a searchable list view and an interactive monthly calendar grid.
- **Conflict Prevention Engine**: Pre-flight availability queries (`/api/calendar/availability`) eliminate double-booking across doctors and chairs.
- **Live Lifecycle Operations**:
  - *Add Appointment*: Schedule manual walk-ins or phone reservations with dynamic provider assignments.
  - *Reschedule*: Select alternate verified time slots with conflict guards.
  - *Cancel*: In-place cancellation with automatic status updates.
- **1-Click CSV Export**: Export appointment records for EHR/EMR or external CRM synchronization.

### 3. 📞 Call Records & Intelligence (`/dashboard/calls`)
- **Decomposed Architecture**: Modular sub-components for audio playback, status filtering, transcript inspection, and metadata metrics.
- **Turn-by-Turn Transcripts**: Verbatim conversation view color-coded by role (AI vs Caller).
- **AI Clinical Takeaways**: Automated sentiment detection (Positive, Neutral, Negative) and structured summaries.
- **Audio Recording Player**: Scrubbable audio timeline with duration formatting and volume controls.

### 4. 📈 Dynamic ROI & Operational Analytics (`/dashboard/analytics`)
- **Financial Savings Calculator**: Real-time calculation of net staff wage savings based on deflection volume and average front-desk hourly compensation.
- **Gross Pipeline Yield**: Estimated revenue generated from autonomously confirmed appointments.
- **Deflection & AHT Metrics**: Deflection rate percentages, average handle time (AHT), and peak call volume distributions by hour of day.
- **Interactive Sliders**: Simulate operational scale by adjusting monthly call volume and hourly wage rates.

### 5. 📱 Inbound Telephony & Carrier Lines (`/dashboard/phone-numbers`)
- **Number Provisioning**: Instant allocation of toll-free and local numbers across major US area codes (415, 510, 312, 212, 800).
- **Line Lifecycle Management**:
  - *Routing Live / Line Paused*: Toggle answering status without releasing the number.
  - *Quick Copy*: Copy E.164 numbers with visual clipboard feedback.
  - *Release Line*: Release numbers with safety confirmation dialogs.

### 6. 🛡️ Security, Integrations & Audit Trail (`/dashboard/settings`)
- **Carrier & SIP Trunk Config**: Account SID, Webhook URLs, and live SIP status monitoring.
- **Voice Provider Settings**: ElevenLabs API key management and quota monitoring.
- **HIPAA Security Audit Trail**:
  - Filter audit events by category (`All`, `Appointments`, `Agent Config`, `Knowledge Base`, `Authentication`, `Integrations`).
  - Search by actor, entity ID, or keyword.
  - Raw JSON payload inspector drawer for every audit event.
  - One-click JSON compliance export.

### 7. 🔔 Real-Time Notifications Center (`Header`)
- **Live Activity Popover**: Displays live bookings, incoming call analysis, and security updates directly from the top navigation bar.
- **One-Click Actions**: Navigate directly to appointment cards, call transcripts, or compliance records.

---

## 🗄 Database Architecture & Prisma ORM

VoxiaAI uses PostgreSQL managed through Prisma ORM with strict referential integrity and indexes:

```prisma
// Core Models Overview
model User {
  id           String        @id @default(cuid())
  email        String        @unique
  name         String?
  passwordHash String
  memberships  Membership[]
  sessions     Session[]
  auditLogs    AuditLog[]
}

model Organization {
  id           String              @id @default(cuid())
  name         String
  slug         String              @unique
  agentConfig  AgentConfig?
  appointments Appointment[]
  callRecords  CallRecord[]
  phoneNumbers PhoneNumber[]
  integrations IntegrationConfig[]
  auditLogs    AuditLog[]
  documents    KnowledgeDocument[]
}

model AgentConfig {
  id              String   @id @default(cuid())
  organizationId  String   @unique
  displayName     String   @default("Sarah (AI Receptionist)")
  businessName    String
  systemPrompt    String   @db.Text
  voiceId         String?
  latencyMode     String   @default("ultra_low")
  tone            String   @default("warm")
}

model Appointment {
  id             String            @id @default(cuid())
  customerName   String
  phoneNumber    String
  service        String
  provider       String?
  date           String            // YYYY-MM-DD
  time           String            // e.g. "10:30 AM"
  status         AppointmentStatus @default(CONFIRMED)
  bookedBy       String            @default("AI Receptionist")
}

model CallRecord {
  id                 String           @id @default(cuid())
  callId             String           @unique
  callerNumber       String
  durationSeconds    Int              @default(0)
  status             CallStatus       @default(COMPLETED)
  aiSummary          String           @db.Text
  sentiment          String           @default("Positive")
  transcripts        CallTranscript[]
}

model KnowledgeDocument {
  id             String   @id @default(cuid())
  title          String
  category       String   @default("General FAQ")
  content        String   @db.Text
  sourceType     String   @default("FAQ")
  enabled        Boolean  @default(true)
}

model AuditLog {
  id             String      @id @default(cuid())
  action         AuditAction
  entityType     String
  entityId       String?
  metadata       Json        @default("{}")
  createdAt      DateTime    @default(now())
}
```

---

## 🔌 REST API Reference

All protected endpoints require an authenticated organization session cookie (`voxia_session_token`).

| Endpoint | Method | Description |
| :--- | :---: | :--- |
| `/api/auth/login` | `POST` | Authenticate user credentials and create session cookie |
| `/api/auth/logout` | `POST` | Terminate session and record `SIGNED_OUT` audit log |
| `/api/auth/session` | `GET` | Retrieve authenticated user profile and organization |
| `/api/agent` | `GET` / `PUT` | Fetch or save receptionist business profile & prompt |
| `/api/agent/simulate-call`| `POST` | Process test caller dialogue using RAG & auto-booking |
| `/api/appointments` | `GET` / `POST` | List appointments or create new booking with conflict check |
| `/api/appointments/[id]` | `PATCH` / `DELETE`| Reschedule, cancel, or remove an appointment |
| `/api/calendar/availability`| `GET` | Retrieve conflict-free time slots for a given date |
| `/api/calls` | `GET` | List historical calls with pagination, search, and status filter |
| `/api/analytics` | `GET` | Compute live financial savings, deflection, and KPIs |
| `/api/knowledge-base` | `GET` / `POST` | List indexed documents or upload a new clinic FAQ/policy |
| `/api/knowledge-base/[id]`| `PATCH` / `DELETE`| Update document content or remove from RAG index |
| `/api/phone-numbers` | `GET` / `POST` | View active carrier lines or provision a new number |
| `/api/phone-numbers/[id]` | `PATCH` / `DELETE`| Toggle answering status (`ACTIVE`/`INACTIVE`) or release number |
| `/api/audit-logs` | `GET` | Query HIPAA audit trail with category filter and pagination |
| `/api/settings` | `GET` / `PUT` | Configure Twilio SIP trunks and ElevenLabs credentials |
| `/api/voice/tts` | `POST` | Synthesize streaming audio via ElevenLabs Turbo v2.5 |
| `/api/telephony/inbound` | `POST` | Carrier webhook handling incoming call initiation (TwiML) |
| `/api/telephony/gather` | `POST` | Carrier webhook for caller speech processing & RAG answers |
| `/api/telephony/status` | `POST` | Carrier webhook recording final duration & call audio |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `v20.x` or higher
- **Docker**: For running PostgreSQL locally
- **Package Manager**: `npm`

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/abhishekgautam95/VoxiaAI.git
cd VoxiaAI
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Ensure `DATABASE_URL` matches your PostgreSQL connection:
```env
DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:5434/voxia_ai?schema=public"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Start PostgreSQL with Docker
```bash
docker compose up -d
```

### 4. Run Migrations & Seed Demo Data
```bash
# Push Prisma schema to PostgreSQL
npx prisma db push

# Generate Prisma Client
npx prisma generate

# Seed sample organization, appointments, calls, phone numbers & knowledge base
node scripts/seed-data.mjs
node scripts/seed-knowledge-base.mjs
node scripts/seed-audit-logs.mjs
```

### 5. Launch the Turbopack Dev Server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) and log in with the seeded demo credentials:
- **Email**: `demo.owner@voxia.local`
- **Password**: `VoxiaDemo!2026`

---

## 🛡 Security & HIPAA Compliance

- **Role-Based Access Control (RBAC)**: Enforced via `proxy.ts` middleware on all dashboard routes.
- **PII / PHI Redaction**: In-flight masking of sensitive patient data prior to persistence.
- **Cryptographic Audit Trail**: Immutable logging of all modifications with actor timestamps and JSON payloads.
- **Data Protection**: TLS 1.3 encryption in transit and AES-256 encryption at rest in PostgreSQL.

---

## 📄 License

Distributed under the MIT License. See [LICENSE](LICENSE) for details.

<div align="center">

**Built by [Abhishek Gautam](https://github.com/abhishekgautam95)**  
*Empowering enterprises with autonomous conversational intelligence.*

</div>
