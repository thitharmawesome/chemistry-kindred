import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { listPublicEvents, type PublicEvent } from "@/lib/events.functions";
import { formatEventDate, formatEventTime } from "@/lib/event-format";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { title: "Upcoming events — Vennti" },
      { name: "description", content: "See the dates of upcoming Vennti evenings. Apply to get invited." },
      { property: "og:title", content: "Upcoming events — Vennti" },
      { property: "og:description", content: "See the dates of upcoming Vennti evenings. Apply to get invited." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  loader: () => listPublicEvents(),
  component: EventsPage,
});

function EventsPage() {
  const { events } = Route.useLoaderData() as { events: PublicEvent[] };
  const [signedIn, setSignedIn] = useState(false);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSignedIn(Boolean(data.session)));
  }, []);

  return (
    <main className="min-h-screen bg-background text-foreground px-6 md:px-12 py-10">
      <div className="max-w-[1000px] mx-auto">
        <header className="flex items-center justify-between mb-20">
          <Link to="/" className="font-display text-3xl tracking-tight">Vennti</Link>
          <Link to={signedIn ? "/member" : "/account"} className="text-[12px] uppercase tracking-[0.2em] text-stone hover:text-ink transition-colors">
            {signedIn ? "My account" : "Log in"}
          </Link>
        </header>
        <div className="text-[11px] uppercase tracking-[0.28em] text-stone mb-5">Upcoming</div>
        <h1 className="font-display text-5xl md:text-6xl leading-[1] tracking-[-0.02em] mb-6">
          Upcoming <em className="italic">evenings.</em>
        </h1>
        <p className="text-ink-soft font-light text-lg leading-[1.55] max-w-[55ch] mb-14">
          Venue details and tickets are shared with members once we've gotten to know them.
        </p>
        <EventDateList events={events} />
        <div className="mt-14 flex flex-wrap gap-4">
          <Link to="/" hash="apply" className="bg-ink text-paper px-7 py-4 rounded-full text-[12px] uppercase tracking-[0.2em] hover:bg-ink-soft transition-colors">
            Apply for the next event →
          </Link>
        </div>
      </div>
    </main>
  );
}

export function EventDateList({ events }: { events: { id: string; starts_at: string }[] }) {
  if (events.length === 0) {
    return (
      <div className="border hairline rounded-2xl p-10 text-ink-soft font-light text-lg">
        New dates are coming soon.
      </div>
    );
  }
  return (
    <ul className="border-t hairline">
      {events.map((e) => (
        <li key={e.id} className="border-b hairline py-8 flex flex-wrap items-baseline justify-between gap-4">
          <span className="font-display text-3xl">{formatEventDate(e.starts_at)}</span>
          <span className="text-[12px] uppercase tracking-[0.2em] text-stone">{formatEventTime(e.starts_at)}</span>
        </li>
      ))}
    </ul>
  );
}
