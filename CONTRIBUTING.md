# Contributing to VoxiaAI 🎙️

Thank you for your interest in contributing to **VoxiaAI**! We welcome contributions from developers, designers, voice engineers, and documentation writers to help build the open-source standard for autonomous conversational AI receptionists.

---

## 📜 Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md). Please treat all contributors with respect, empathy, and professional courtesy.

---

## 🛠️ Development Setup

### Prerequisites
- **Node.js**: `>= 20.0.0`
- **Docker & Docker Compose**: For local PostgreSQL database
- **Git**
- **npm** (recommended) or **pnpm**

### Quickstart Guide
1. **Fork the repository** on GitHub.
2. **Clone your fork locally**:
   ```bash
   git clone https://github.com/<your-username>/VoxiaAI.git
   cd VoxiaAI
   ```
3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/abhishekgautam95/VoxiaAI.git
   ```
4. **Install dependencies**:
   ```bash
   npm install
   ```
5. **Set up local environment**:
   ```bash
   cp .env.example .env
   ```
6. **Spin up local PostgreSQL database**:
   ```bash
   docker compose up -d
   ```
7. **Initialize Prisma schema & seed demo data**:
   ```bash
   npx prisma db push
   npx prisma generate
   node scripts/seed-data.mjs
   node scripts/seed-knowledge-base.mjs
   node scripts/seed-audit-logs.mjs
   ```
8. **Start development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) and log in with:
   - Email: `demo.owner@voxia.local`
   - Password: `VoxiaDemo!2026`

---

## 🌿 Git & Branching Strategy

1. Create a feature or bugfix branch off `main`:
   ```bash
   git checkout -b feat/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```
2. Keep branches small and focused on a single change.
3. Use Conventional Commits formatting:
   - `feat:` new user-facing functionality
   - `fix:` bug fixes
   - `docs:` documentation improvements
   - `style:` code styling or formatting changes
   - `refactor:` code restructuring without changing functionality
   - `perf:` performance enhancements
   - `test:` adding or improving tests
   - `chore:` maintenance tasks or dependency updates

---

## 🧪 Quality Checks & Pre-Commit Verification

Before opening a pull request, verify that your code builds cleanly and satisfies TypeScript checks:

```bash
# 1. Type check
npx tsc --noEmit

# 2. Production build verification
npm run build
```

PRs with failing TypeScript checks or build errors will not be merged.

---

## 🚀 Submitting a Pull Request (PR)

1. Push your branch to your GitHub fork:
   ```bash
   git push origin feat/your-feature-name
   ```
2. Open a Pull Request against the `main` branch of `abhishekgautam95/VoxiaAI`.
3. Fill out the [Pull Request Template](.github/PULL_REQUEST_TEMPLATE.md) completely:
   - Describe the purpose and context of the changes.
   - Attach screenshots or recordings for UI changes.
   - List any breaking changes or configuration additions.
4. Request reviews from the maintainers and address any feedback promptly.

---

## 💡 Ideas for Contributions

- 🌐 Additional localization languages and regional voice presets.
- 🔗 Direct EMR/EHR adapters (Epic, Cerner, Dentrix, AthenaHealth).
- 🎙️ Local open-weight STT/TTS engine support (Whisper, Piper, Kokoro).
- 📱 WhatsApp and SMS automated follow-up integrations.
- 🧪 Automated integration and end-to-end test suites.

Thank you for helping make VoxiaAI better! 🎉
