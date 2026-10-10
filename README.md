<div align="center">

# 🎙️ VoxiaAI

### AI-Powered Voice Receptionist Platform

[![Next.js](https://img.shields.io/badge/Next.js-16.4-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

An autonomous AI voice receptionist that answers inbound calls, books appointments, resolves inquiries, and manages your front desk — 24/7, with sub-500ms latency.

[Getting Started](#-getting-started) · [Features](#-features) · [Tech Stack](#-tech-stack) · [Project Structure](#-project-structure) · [Roadmap](#-roadmap)

</div>

---

## ✨ Features

| Feature | Description |
|---|---|
| **📊 Real-Time Dashboard** | Live KPI cards — total calls, minutes used, appointments booked, conversion rate — with trend indicators |
| **📞 Call Activity Feed & Logs** | Tabular view of inbound calls with caller phone, duration, outcome badges (Booked / Inquiry / Missed), and slide-over transcript drawer |
| **📅 Appointments Management** | Dual **List View** & **Calendar View** with status filters, top stats bar, quick reschedule & cancellation actions |
| **📥 CSV Export & Manual Booking** | 1-click export of patient visits to CSV and modal dialog to manually add appointments with time slot selection |
| **🤖 AI Agent Configuration** | Tabbed editor for business details, system prompt with industry routines, and ElevenLabs voice engine |
| **🎙️ Live Web Call Test Widget** | Browser audio simulator with authentic telephone ringing tone, speech synthesis, animated audio waveform, and mic speech input |
| **🏢 Multi-Org Switcher** | Manage multiple businesses/clinics from a single dashboard with per-org phone lines |
| **📱 Responsive Layout** | Fully responsive sidebar + header shell with mobile hamburger menu and collapsible navigation |
| **🔔 Live Status Indicators** | Real-time agent status (Live/Offline), SIP health, and voice-minute usage tracking |

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 16.4](https://nextjs.org/) (App Router, Turbopack) |
| **UI Library** | [React 19.3](https://react.dev/) |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS 4](https://tailwindcss.com/) with `@tailwindcss/turbopack` |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Fonts** | [Geist Sans & Geist Mono](https://vercel.com/font) via `next/font` |
| **Audio & Speech** | Web Audio API (dial tone synthesis) & Web Speech API (`SpeechSynthesis` & `webkitSpeechRecognition`) |

## 📂 Project Structure

```
VoxiaAI/
├── app/
│   ├── layout.tsx                  # Root layout (fonts, global styles)
│   ├── page.tsx                    # Landing → redirects to /dashboard
│   ├── globals.css                 # Tailwind imports + dark theme vars
│   └── dashboard/
│       ├── layout.tsx              # Dashboard shell wrapper
│       ├── page.tsx                # Overview (metrics, calls, appointments)
│       ├── calls/page.tsx          # Call logs & transcript drawer
│       ├── appointments/page.tsx   # Appointment management (List & Calendar view)
│       ├── agent/page.tsx          # AI agent configuration & live web call test
│       ├── analytics/page.tsx      # Analytics & ROI
│       ├── phone-numbers/page.tsx  # Telephony / number management
│       └── settings/page.tsx       # Account & telephony preferences
├── components/
│   └── dashboard/
│       ├── dashboard-shell.tsx     # Sidebar + Header + content wrapper
│       ├── sidebar.tsx             # Navigation sidebar with live status
│       ├── header.tsx              # Top bar with org switcher & profile
│       ├── agent/                  # AI Agent Configuration components
│       │   ├── business-details-tab.tsx  # Business identity & category form
│       │   ├── system-prompt-tab.tsx     # Monospace editor & pre-made routines
│       │   ├── voice-settings-tab.tsx    # ElevenLabs voice library & previews
│       │   ├── tools-tab.tsx             # Calendar tools & HIPAA compliance
│       │   ├── live-test-widget.tsx      # Web audio call simulator & waveform
│       │   ├── types.ts                  # Agent configuration TypeScript interfaces
│       │   └── data.ts                   # Routines, categories & voice catalog
│       └── appointments/           # Appointments components
│           ├── appointments-table.tsx    # Filterable data table with quick actions
│           ├── calendar-view.tsx         # Monthly interactive calendar grid
│           ├── add-appointment-modal.tsx # Manual visit booking dialog
│           ├── reschedule-modal.tsx      # Quick date/time reschedule modal
│           ├── types.ts                  # Appointment data models
│           └── mock-data.ts              # Clinic services & schedule seed data
├── public/                         # Static assets
├── next.config.ts                  # Next.js + Turbopack configuration
├── tsconfig.json                   # TypeScript config
└── package.json
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18.17
- **npm**, **yarn**, **pnpm**, or **bun**

### Installation

```bash
# Clone the repository
git clone https://github.com/abhishekgautam95/VoxiaAI.git
cd VoxiaAI

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll be redirected to the dashboard automatically.

### Key Pages to Explore

- 📊 **Dashboard Overview**: [http://localhost:3000/dashboard](http://localhost:3000/dashboard)
- 🤖 **AI Agent Setup**: [http://localhost:3000/dashboard/agent](http://localhost:3000/dashboard/agent)
- 📅 **Appointments Schedule**: [http://localhost:3000/dashboard/appointments](http://localhost:3000/dashboard/appointments)
- 📞 **Call Logs**: [http://localhost:3000/dashboard/calls](http://localhost:3000/dashboard/calls)

### Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server with Turbopack HMR |
| `npm run build` | Create optimized production build |
| `npm run start` | Serve production build |
| `npm run lint` | Run ESLint checks |

## 🗺 Roadmap

- [x] Voice call simulator with live audio, transcript & animated waveform
- [x] Multi-language voice agent support (10 locales)
- [x] Pre-made prompt routines (Appointment Booking, Customer Care, Real Estate, etc.)
- [x] Appointments management with List View, Monthly Calendar View, and CSV export
- [x] Reschedule & Cancel quick actions with automated modal workflows
- [ ] Backend API integration (call logs, appointments, analytics)
- [ ] Real-time WebSocket call activity stream
- [ ] Live Calendar sync (Google Calendar OAuth, Cal.com webhooks)
- [ ] Authentication & role-based access control (RBAC)
- [ ] Stripe billing & usage metering
- [ ] Twilio / Telnyx SIP trunk integration

## 🤝 Contributing

Contributions are welcome! Please open an issue first to discuss what you'd like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is private and proprietary. All rights reserved.

---

<div align="center">

**Built with ❤️ by [Abhishek Gautam](https://github.com/abhishekgautam95)**

</div>
