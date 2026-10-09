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
| **📞 Call Activity Feed** | Tabular view of recent inbound calls with caller phone, duration, outcome badges (Booked / Inquiry / Missed), and one-click transcript access |
| **📅 Appointment Widget** | Upcoming appointments sidebar showing customer name, phone, and time slot at a glance |
| **🤖 Agent Configuration** | Tune your AI receptionist's persona, LLM engine, voice synthesis model, and knowledge base |
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
│       ├── calls/page.tsx          # Call logs
│       ├── appointments/page.tsx   # Appointment management
│       ├── agent-setup/page.tsx    # AI agent configuration
│       ├── analytics/page.tsx      # Analytics & ROI
│       ├── phone-numbers/page.tsx  # Telephony / number management
│       └── settings/page.tsx       # Account & preferences
├── components/
│   └── dashboard/
│       ├── dashboard-shell.tsx     # Sidebar + Header + content wrapper
│       ├── sidebar.tsx             # Navigation sidebar with live status
│       └── header.tsx              # Top bar with org switcher & profile
├── public/                         # Static assets
├── next.config.ts                  # Next.js + Turbopack configuration
├── tailwind.config.ts              # Tailwind CSS configuration
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

### Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server with Turbopack HMR |
| `npm run build` | Create optimized production build |
| `npm run start` | Serve production build |
| `npm run lint` | Run ESLint checks |

## 🗺 Roadmap

- [ ] Backend API integration (call logs, appointments, analytics)
- [ ] Real-time WebSocket call activity stream
- [ ] Voice call simulator with live transcript
- [ ] Calendar integration (Google Calendar, Cal.com)
- [ ] Authentication & role-based access control
- [ ] Stripe billing & usage metering
- [ ] Twilio / SIP trunk integration
- [ ] Multi-language voice agent support

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
