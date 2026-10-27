import { createFileRoute, Link } from "@tanstack/react-router";

const TITLE = "Law Enforcement Guidelines — Vennti";
const DESC = "How Vennti responds to requests for member information from law enforcement and government agencies.";

export const Route = createFileRoute("/law-enforcement")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "https://chemistry-kindred.lovable.app/law-enforcement" },
    ],
    links: [{ rel: "canonical", href: "https://chemistry-kindred.lovable.app/law-enforcement" }],
  }),
  component: LawEnforcementPage,
});

const Mail = () => (
  <a href="mailto:hello@vennti.co" className="text-ink underline">hello@vennti.co</a>
);

function LawEnforcementPage() {
  return (
    <main className="min-h-screen bg-background text-foreground antialiased">
      <div className="max-w-[820px] mx-auto px-6 md:px-12 py-24 md:py-32">
        <Link to="/" className="font-mono text-[11px] uppercase tracking-[0.25em] text-stone hover:text-ink transition-colors">
          ← Back
        </Link>
        <h1 className="font-display text-5xl md:text-6xl leading-[1.02] tracking-[-0.02em] mt-10">
          Law Enforcement Guidelines
        </h1>

        <div className="mt-12 space-y-8 text-ink-soft font-light leading-[1.7] text-base md:text-[17px]">
          <p>
            Vennti hosts in-person social and matchmaking events for singles. These guidelines
            explain how we respond to requests for member information from law enforcement and
            government agencies.
          </p>
          <section>
            <h2 className="font-display text-2xl text-ink mb-3">How to submit a request</h2>
            <p>Send requests to <Mail />. Please include:</p>
            <ul className="list-disc pl-6 mt-3 space-y-1">
              <li>Your name, agency, badge or ID number, and official contact information</li>
              <li>The legal process authorizing the request</li>
              <li>The specific member(s) involved, identified by name, email, or phone number</li>
              <li>The specific information requested and the relevant date range</li>
            </ul>
            <p className="mt-4">
              Requests must come from an official government email address. We do not accept
              requests through social media, event staff, or our general support channels.
            </p>
          </section>
          <section>
            <h2 className="font-display text-2xl text-ink mb-3">Legal process required</h2>
            <p>
              We disclose member information only in response to valid legal process, such as a
              subpoena, court order, or search warrant, issued under applicable law. We review each
              request and may push back on requests that are overly broad, unclear, or not legally
              valid.
            </p>
          </section>
          <section>
            <h2 className="font-display text-2xl text-ink mb-3">Information we may have</h2>
            <p>Depending on a member's activity, we may hold:</p>
            <ul className="list-disc pl-6 mt-3 space-y-1">
              <li>Name, email address, and phone number</li>
              <li>Application and screening responses</li>
              <li>Event registration and attendance records</li>
              <li>Payment transaction records (card details are processed and held by our payment provider, not by Vennti)</li>
              <li>Messages exchanged with our team</li>
            </ul>
          </section>
          <section>
            <h2 className="font-display text-2xl text-ink mb-3">Emergency requests</h2>
            <p>
              If there is a good-faith belief that an emergency involves imminent risk of death or
              serious physical injury, we may disclose information without legal process. Emergency
              requests should be sent to <Mail /> with "EMERGENCY" in the subject line and a
              description of the situation.
            </p>
          </section>
          <section>
            <h2 className="font-display text-2xl text-ink mb-3">Member notification</h2>
            <p>
              Our policy is to notify members of requests for their information before disclosure,
              unless we are legally prohibited from doing so or the request involves an emergency
              or risk of harm.
            </p>
          </section>
          <section>
            <h2 className="font-display text-2xl text-ink mb-3">Preservation requests</h2>
            <p>
              We will honor valid requests to preserve specific records for up to 90 days while
              formal legal process is obtained.
            </p>
          </section>
          <section>
            <h2 className="font-display text-2xl text-ink mb-3">Member safety</h2>
            <p>
              If you are a Vennti member and have a safety concern about someone you met through
              our events, please contact us at <Mail /> and, if you are in danger, contact local
              police or call 911.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
