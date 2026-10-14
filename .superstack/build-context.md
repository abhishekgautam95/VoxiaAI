---
project: VoxiaAI
review:
  security_score: F
  quality_score: C
  ready_for_mainnet: false
  findings:
    - severity: critical
      category: authorization
      description: Organization switching can grant a logged-in user membership and OWNER access to arbitrary organizations.
      fix: Require an existing membership before switching; move organization creation to an owner-only flow.
    - severity: critical
      category: authorization
      description: Team invitation accepts any role and has no server-side role check.
      fix: Require OWNER or ADMIN membership and prevent non-owner privilege escalation.
    - severity: high
      category: telephony-security
      description: Twilio inbound, gather, status, and SMS endpoints do not validate provider signatures.
      fix: Validate X-Twilio-Signature against the exact public URL and reject invalid requests.
    - severity: high
      category: scheduling
      description: Appointment conflict checks and inserts are separate operations, so concurrent requests can double-book a slot.
      fix: Add a database-enforced booking key or serializable transaction with retry handling.
    - severity: high
      category: authorization
      description: getSession does not confirm the active organization membership is still present.
      fix: Join or separately verify Membership in every session lookup and invalidate stale sessions.
    - severity: high
      category: telephony-security
      description: Telephony routing trusts caller-controlled organization identifiers and falls back to a default organization.
      fix: Resolve organization only from a verified phone-number mapping and signed provider context.
    - severity: high
      category: data-integrity
      description: SMS appointment lookup is global by phone number and can update the newest appointment belonging to another organization.
      fix: Scope the lookup to the verified destination number/organization and require a signed message context.
    - severity: medium
      category: correctness
      description: Analytics reports fabricated baseline counts and revenue instead of only persisted measurements.
      fix: Compute metrics from stored calls and appointments, and label estimates separately.
    - severity: medium
      category: reliability
      description: Invalid phone provisioning payloads are silently replaced with defaults, and SMS can report success without delivery.
      fix: Return 400 for invalid input and return an explicit simulated/unconfigured delivery state.
    - severity: medium
      category: output-safety
      description: User-controlled speech, greetings, and transfer destinations are interpolated into TwiML without XML escaping or phone validation.
      fix: Escape XML values and validate E.164 destinations before generating TwiML.
    - severity: medium
      category: secret-handling
      description: Integration settings return a deterministic API-key-shaped value and PUT replaces the full Twilio config.
      fix: Never synthesize credentials; return masked state and merge validated fields without deleting stored secrets.
    - severity: low
      category: testing
      description: The only tests cover pure scheduling/parser helpers; API authorization and telephony trust boundaries are untested.
      fix: Add route tests for tenant isolation, role checks, signatures, races, and invalid payloads.
---
