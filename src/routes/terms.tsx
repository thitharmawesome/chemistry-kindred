import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — Vennti" },
      { name: "description", content: "The terms that govern your use of Vennti." },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <main className="min-h-screen bg-background text-foreground antialiased">
      <div className="max-w-[820px] mx-auto px-6 md:px-12 py-24 md:py-32">
        <Link to="/" className="font-mono text-[11px] uppercase tracking-[0.25em] text-stone hover:text-ink transition-colors">
          ← Back
        </Link>
        <h1 className="font-display text-5xl md:text-6xl leading-[1.02] tracking-[-0.02em] mt-10">
          Terms of Service
        </h1>
        <p className="text-[11px] uppercase tracking-[0.28em] text-stone mt-4">Last updated: June 2026</p>

        <div className="prose mt-12 space-y-8 text-ink-soft font-light leading-[1.7] text-base md:text-[17px]">
          <section>
            <h2 className="font-display text-2xl text-ink mb-3">Acceptance</h2>
            <p>
              By using Vennti or submitting an application, you agree to these terms. If you do
              not agree, please do not use the service.
            </p>
          </section>
          <section>
            <h2 className="font-display text-2xl text-ink mb-3">Eligibility</h2>
            <p>
              You must be at least 21 years old to apply. You agree to provide accurate
              information and to represent yourself honestly.
            </p>
          </section>
          <section>
            <h2 className="font-display text-2xl text-ink mb-3">Applications and events</h2>
            <p>
              Submitting an application does not guarantee an invitation. Event invitations are
              curated at our discretion. Tickets, when offered, are subject to the terms
              communicated at the time of invitation.
            </p>
          </section>
          <section>
            <h2 className="font-display text-2xl text-ink mb-3">User content</h2>
            <p>
              You retain ownership of the photos, videos, and other content you submit. You grant
              Vennti a limited license to use that content solely to operate the application and
              matchmaking process.
            </p>
          </section>
          <section>
            <h2 className="font-display text-2xl text-ink mb-3">Conduct</h2>
            <p>
              Treat other guests and our team with respect. We reserve the right to decline or
              revoke invitations for any reason, including conduct that is unsafe or
              inappropriate.
            </p>
          </section>
          <section>
            <h2 className="font-display text-2xl text-ink mb-3">Disclaimers</h2>
            <p>
              Vennti is provided "as is" without warranties of any kind. We are not responsible
              for the actions of other applicants or guests.
            </p>
          </section>
          <section>
            <h2 className="font-display text-2xl text-ink mb-3">Contact</h2>
            <p>
              Questions about these terms? Email <a href="mailto:hello@vennti.co" className="text-ink underline">hello@vennti.co</a>.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
