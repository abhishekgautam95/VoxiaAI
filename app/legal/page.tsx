import Link from "next/link";
import { ShieldCheck, FileText, Lock, ArrowLeft, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "HIPAA BAA, Terms of Service & Healthcare Privacy | VoxiaAI",
  description:
    "Enterprise healthcare compliance documentation, Business Associate Agreement (BAA), Terms of Service, and PHI Data Retention Policy.",
};

export default function LegalCompliancePage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 relative overflow-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-[420px] w-[720px] rounded-full bg-cyan-500/10 blur-[130px]" />
      </div>

      <header className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-20">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 text-white shadow-lg shadow-cyan-500/20">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-sm font-extrabold tracking-tight text-white">
                VoxiaAI Healthcare Trust &amp; Legal Center
              </h1>
              <p className="text-[11px] text-zinc-400">
                45 C.F.R. Parts 160 &amp; 164 HIPAA Security &amp; Privacy Compliance
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800/80 bg-zinc-900/60 px-3 py-1.5 text-xs font-semibold text-zinc-300 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] hover:border-cyan-500/30 hover:text-white focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Home
            </Link>
            <Link
              href="/dashboard/settings"
              className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-400/30 bg-cyan-400 px-3.5 py-1.5 text-xs font-bold text-zinc-950 shadow-md shadow-cyan-500/10 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] hover:bg-cyan-300 focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-12 space-y-12">
        {/* Compliance Badges */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-emerald-500/30 bg-zinc-900/60 p-5">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold tracking-wide">
              <CheckCircle2 className="h-4 w-4" />
              <span>HIPAA BAA Counter-Signed</span>
            </div>
            <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
              Full statutory Business Associate Agreement coverage for Covered Entities under 45 CFR § 164.504(e).
            </p>
          </div>
          <div className="rounded-xl border border-cyan-500/30 bg-zinc-900/60 p-5">
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold tracking-wide">
              <Lock className="h-4 w-4" />
              <span>Zero Model Training on PHI</span>
            </div>
            <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
              Patient audio streams and call transcripts are strictly isolated per tenant and never used to train foundation models.
            </p>
          </div>
          <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-5">
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold tracking-wide">
              <FileText className="h-4 w-4" />
              <span>256-Bit AES + TLS 1.3</span>
            </div>
            <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
              Immutable SHA-256 audit logging across all appointment modifications, call recordings, and RBAC actions.
            </p>
          </div>
        </div>

        {/* Section 1: BAA */}
        <section
          id="baa"
          className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-6 sm:p-8 space-y-4"
        >
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                Agreement 01
              </span>
              <h2 className="text-lg font-bold tracking-wide text-zinc-100 mt-0.5">
                HIPAA Business Associate Agreement (BAA)
              </h2>
            </div>
            <span className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold text-emerald-400">
              Effective Upon Provisioning
            </span>
          </div>

          <div className="space-y-3 text-xs sm:text-sm leading-relaxed text-zinc-400">
            <p>
              This Business Associate Agreement (&ldquo;BAA&rdquo;) supplements the VoxiaAI Master SaaS Terms of Service between <strong className="text-zinc-100">VoxiaAI, Inc.</strong> (&ldquo;Business Associate&rdquo;) and the subscribing medical or dental practice (&ldquo;Covered Entity&rdquo;).
            </p>
            <p>
              <strong className="text-zinc-100">1. Permitted Uses &amp; Disclosures:</strong> Business Associate shall not use or disclose Protected Health Information (&ldquo;PHI&rdquo;) other than as permitted or required to provide autonomous voice reception, conflict-free appointment scheduling, calendar synchronization, and transactional SMS confirmations on behalf of Covered Entity.
            </p>
            <p>
              <strong className="text-zinc-100">2. Prohibition on AI Foundation Model Training:</strong> Business Associate expressly warrants that Covered Entity&apos;s PHI, voice recordings, and transcripts shall never be used to train, fine-tune, or improve public or shared foundation models.
            </p>
            <p>
              <strong className="text-zinc-100">3. Technical &amp; Administrative Safeguards (45 C.F.R. § 164.312):</strong> Business Associate maintains AES-256 encryption at rest, TLS 1.3 encryption in transit, strict multi-tenant organization scoping, role-based access control (OWNER, ADMIN, OPERATOR, ANALYST), and immutable audit logging.
            </p>
            <p>
              <strong className="text-zinc-100">4. Breach Notification (45 C.F.R. § 164.410):</strong> Business Associate shall notify Covered Entity in writing without unreasonable delay and in no case later than <strong className="text-zinc-100">seventy-two (72) hours</strong> after discovery of any Breach of Unsecured PHI.
            </p>
          </div>
        </section>

        {/* Section 2: Terms of Service & Medical Disclaimer */}
        <section
          id="terms"
          className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-6 sm:p-8 space-y-4"
        >
          <div className="border-b border-zinc-800/80 pb-4">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
              Agreement 02
            </span>
            <h2 className="text-lg font-bold tracking-wide text-zinc-100 mt-0.5">
              Master SaaS Terms of Service &amp; Clinical Emergency Disclaimer
            </h2>
          </div>

          <div className="rounded-lg border border-amber-500/30 bg-amber-950/20 p-4 text-xs text-amber-400 leading-relaxed">
            <strong>911 EMERGENCY MEDICAL DISCLAIMER:</strong> VOXIAAI IS AN ADMINISTRATIVE APPOINTMENT SCHEDULING AND RECEPTION SYSTEM AND DOES NOT PROVIDE MEDICAL ADVICE, CLINICAL DIAGNOSIS, OR EMERGENCY TRIAGE. IF A CALLER EXPERIENCES CHEST PAIN, SEVERE BLEEDING, SHORTNESS OF BREATH, OR ANY MEDICAL EMERGENCY, VOXIAAI INSTRUCTS THE CALLER TO HANG UP AND DIAL 911 IMMEDIATELY OR ESCALATES TO THE CLINIC&apos;S DESIGNATED EMERGENCY LINE.
          </div>

          <div className="space-y-3 text-xs sm:text-sm leading-relaxed text-zinc-400">
            <p>
              <strong className="text-zinc-100">1. Two-Party Call Recording &amp; TCPA Compliance:</strong> Covered Entity acknowledges that VoxiaAI provides automated voice greetings capable of announcing call recording disclosures for two-party consent jurisdictions (e.g., CA, FL, PA, IL, WA). Transactional appointment confirmation SMS messages include mandatory opt-out handling (Reply CANCEL or STOP).
            </p>
            <p>
              <strong className="text-zinc-100">2. Subscription Tiers &amp; Usage Metering:</strong> Subscriptions are billed monthly in advance via Stripe ($199/mo Clinic Starter, $499/mo Practice Pro, $999/mo Multi-Location Enterprise). Unused monthly voice minutes do not roll over; overage minutes are metered at the applicable tier rate.
            </p>
          </div>
        </section>

        {/* Section 3: Privacy Policy */}
        <section
          id="privacy"
          className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-6 sm:p-8 space-y-4"
        >
          <div className="border-b border-zinc-800/80 pb-4">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
              Agreement 03
            </span>
            <h2 className="text-lg font-bold tracking-wide text-zinc-100 mt-0.5">
              Healthcare Privacy &amp; Data Retention Policy
            </h2>
          </div>

          <div className="space-y-3 text-xs sm:text-sm leading-relaxed text-zinc-400">
            <p>
              <strong className="text-zinc-100">1. Tenant Data Isolation:</strong> Every practice organization is logically isolated in PostgreSQL via mandatory <code>organizationId</code> relational boundaries and verified <code>HttpOnly</code> session tokens.
            </p>
            <p>
              <strong className="text-zinc-100">2. Zero Third-Party Data Monetization:</strong> VoxiaAI never sells, rents, or shares patient phone numbers, appointment histories, or clinical inquiries with advertisers or data brokers.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
