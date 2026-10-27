import { createFileRoute, Link } from "@tanstack/react-router";

const title = "Refund Policy — Vennti";
const description = "Vennti’s policy for event ticket refunds, transfers, cancellations, and refund requests.";

export const Route = createFileRoute("/refund-policy")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: RefundPolicyPage,
});

function RefundPolicyPage() {
  return (
    <main className="min-h-screen bg-background text-foreground antialiased">
      <div className="max-w-[820px] mx-auto px-6 md:px-12 py-24 md:py-32">
        <Link to="/" className="font-mono text-[11px] uppercase tracking-[0.25em] text-stone hover:text-ink transition-colors">
          ← Back
        </Link>
        <h1 className="font-display text-5xl md:text-6xl leading-[1.02] mt-10">Refund Policy</h1>
        <div className="mt-12 space-y-8 text-ink-soft font-light leading-[1.7] text-base md:text-[17px]">
          <p>We want every Vennti event to be worth your time. Here’s how refunds work.</p>
          <section>
            <h2 className="font-display text-2xl text-ink mb-3">Event Tickets</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>More than 7 days before the event: full refund</li>
              <li>2 to 7 days before the event: credit toward a future Vennti event, valid for 6 months</li>
              <li>Less than 48 hours before the event, or no-shows: no refund or credit</li>
            </ul>
            <p className="mt-4">Because our events are curated and gender-balanced, late cancellations leave seats we often can’t fill. Thanks for understanding.</p>
          </section>
          <section>
            <h2 className="font-display text-2xl text-ink mb-3">Transfers</h2>
            <p>Can’t make it? You may transfer your ticket to a friend up to 48 hours before the event, as long as they complete our screening and are approved. Email us with their name and contact info.</p>
          </section>
          <section>
            <h2 className="font-display text-2xl text-ink mb-3">If Vennti Cancels or Reschedules</h2>
            <p>If we cancel an event, you’ll receive a full refund. If we reschedule, you can choose a full refund or keep your spot for the new date.</p>
          </section>
          <section>
            <h2 className="font-display text-2xl text-ink mb-3">Application and Screening</h2>
            <p>Approval to attend is at Vennti’s discretion. If your application isn’t approved after you’ve paid, you’ll receive a full refund.</p>
          </section>
          <section>
            <h2 className="font-display text-2xl text-ink mb-3">Event Conduct</h2>
            <p>Members removed from an event for violating our community guidelines are not eligible for a refund.</p>
          </section>
          <section>
            <h2 className="font-display text-2xl text-ink mb-3">How to Request a Refund</h2>
            <p>Email <a href="mailto:hello@vennti.co" className="text-ink underline">hello@vennti.co</a> with your name, the event date, and the email you used to purchase. Approved refunds are issued to your original payment method within 5 to 10 business days.</p>
          </section>
        </div>
      </div>
    </main>
  );
}