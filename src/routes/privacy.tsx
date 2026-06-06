import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Vennti" },
      { name: "description", content: "How Vennti collects, uses, and protects your information." },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background text-foreground antialiased">
      <div className="max-w-[820px] mx-auto px-6 md:px-12 py-24 md:py-32">
        <Link to="/" className="font-mono text-[11px] uppercase tracking-[0.25em] text-stone hover:text-ink transition-colors">
          ← Back
        </Link>
        <h1 className="font-display text-5xl md:text-6xl leading-[1.02] tracking-[-0.02em] mt-10">
          Privacy Policy
        </h1>
        <p className="text-[11px] uppercase tracking-[0.28em] text-stone mt-4">Last updated: June 2026</p>

        <div className="prose mt-12 space-y-8 text-ink-soft font-light leading-[1.7] text-base md:text-[17px]">
          <section>
            <h2 className="font-display text-2xl text-ink mb-3">Overview</h2>
            <p>
              Vennti ("we", "us") respects your privacy. This policy explains what information we
              collect when you apply to our events, how we use it, and the choices you have.
            </p>
          </section>
          <section>
            <h2 className="font-display text-2xl text-ink mb-3">Information we collect</h2>
            <p>
              When you submit an application, we collect the information you provide — including
              your name, age, city, contact details, photos, optional video clips, and social
              links. We also collect basic technical information (such as device and browser
              data) needed to operate the site.
            </p>
          </section>
          <section>
            <h2 className="font-display text-2xl text-ink mb-3">How we use your information</h2>
            <p>
              We use your information to evaluate your application, communicate with you about
              events, and curate guest lists. We do not sell your personal information.
            </p>
          </section>
          <section>
            <h2 className="font-display text-2xl text-ink mb-3">Sharing</h2>
            <p>
              We share limited information only with service providers that help us run Vennti
              (such as hosting and email delivery), and when required by law.
            </p>
          </section>
          <section>
            <h2 className="font-display text-2xl text-ink mb-3">Your choices</h2>
            <p>
              You can request access, correction, or deletion of your information at any time by
              emailing <a href="mailto:hello@vennti.co" className="text-ink underline">hello@vennti.co</a>.
            </p>
          </section>
          <section>
            <h2 className="font-display text-2xl text-ink mb-3">Contact</h2>
            <p>
              Questions? Reach us at <a href="mailto:hello@vennti.co" className="text-ink underline">hello@vennti.co</a>.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
