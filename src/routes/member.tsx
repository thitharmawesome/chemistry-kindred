import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { listMemberEvents } from "@/lib/events.functions";
import { formatEventDate, formatEventTime } from "@/lib/event-format";
import { EventDateList } from "./events";

export const CALENDLY_URL = "https://calendly.com/reemath/30min";
export const PREFERENCES_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSfk2rLsK6-9IF_pd7hh8Ed8f-qTC2UqVgsZR7rq86E-VVDgog/viewform?usp=sharing&ouid=103948783085124379366";

export const Route = createFileRoute("/member")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Your Vennti — Members" },
      { name: "robots", content: "noindex" },
      { name: "description", content: "Book a call, share your partner preferences and see your Vennti events." },
      { property: "og:title", content: "Your Vennti — Members" },
      { property: "og:description", content: "Book a call, share your partner preferences and see your Vennti events." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MemberPage,
});

function MemberPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        navigate({ to: "/account", replace: true });
        return;
      }
      setUser(data.user);
      setLoading(false);
    });
  }, [navigate]);

  const markPreferences = async () => {
    const { data, error } = await supabase.auth.updateUser({ data: { preferences_submitted: true } });
    if (error) return toast.error("Could not save. Please try again.");
    setUser(data.user);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  };

  if (loading || !user) {
    return <main className="min-h-screen bg-background" />;
  }

  const hasPreferences = user.user_metadata?.preferences_submitted === true;

  return (
    <main className="min-h-screen bg-background text-foreground px-6 md:px-12 py-10">
      <div className="max-w-[1000px] mx-auto">
        <header className="flex items-center justify-between mb-20">
          <Link to="/" className="font-display text-3xl tracking-tight">Vennti</Link>
          <button onClick={signOut} className="text-[12px] uppercase tracking-[0.2em] text-stone hover:text-ink transition-colors">
            Sign out
          </button>
        </header>

        {hasPreferences ? (
          <section>
            <div className="text-[11px] uppercase tracking-[0.28em] text-stone mb-5">Your events</div>
            <h1 className="font-display text-5xl md:text-6xl leading-[1] tracking-[-0.02em] mb-8">
              Upcoming <em className="italic">events.</em>
            </h1>
            <MemberEvents />
          </section>
        ) : (
          <section>
            <div className="text-[11px] uppercase tracking-[0.28em] text-stone mb-5">Welcome</div>
            <h1 className="font-display text-5xl md:text-6xl leading-[1] tracking-[-0.02em] mb-6 max-w-[18ch]">
              Let's get to <em className="italic">know you.</em>
            </h1>
            <p className="text-ink-soft font-light text-lg leading-[1.55] max-w-[55ch] mb-14">
              Choose how you'd like to connect with us.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="border hairline rounded-2xl p-10 flex flex-col">
                <div className="text-[11px] uppercase tracking-[0.28em] text-stone mb-4">Option one</div>
                <h2 className="font-display text-3xl mb-4">Book a call</h2>
                <p className="text-ink-soft font-light leading-[1.55] mb-8 flex-1">
                  A short 30-minute call to learn about you and what you're looking for in a partner.
                </p>
                <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer" className="self-start bg-ink text-paper px-7 py-4 rounded-full text-[12px] uppercase tracking-[0.2em] hover:bg-ink-soft transition-colors">
                  Book a call →
                </a>
              </div>
              <div className="border hairline rounded-2xl p-10 flex flex-col">
                <div className="text-[11px] uppercase tracking-[0.28em] text-stone mb-4">Option two</div>
                <h2 className="font-display text-3xl mb-4">Share your partner preferences</h2>
                <p className="text-ink-soft font-light leading-[1.55] mb-8 flex-1">
                  Tell us what matters to you in a partner. Once you've sent it, come back and let us know.
                </p>
                <div className="flex flex-col gap-4 items-start">
                  <a href={PREFERENCES_URL} target="_blank" rel="noopener noreferrer" className="bg-ink text-paper px-7 py-4 rounded-full text-[12px] uppercase tracking-[0.2em] hover:bg-ink-soft transition-colors">
                    Open the form →
                  </a>
                  <button onClick={markPreferences} className="text-[12px] uppercase tracking-[0.2em] text-stone hover:text-ink transition-colors">
                    I've submitted my preferences →
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

function MemberEvents() {
  const fetchEvents = useServerFn(listMemberEvents);
  const q = useQuery({ queryKey: ["member-events"], queryFn: () => fetchEvents(), retry: false });
  if (q.isLoading) return <div className="text-stone">Loading…</div>;
  if (q.error || !q.data) return <div className="text-stone">Events couldn't load right now.</div>;
  const { screened, events } = q.data;
  if (!screened) {
    return (
      <div className="space-y-10">
        <p className="text-ink-soft font-light text-lg leading-[1.55] max-w-[55ch]">
          Venue details and tickets unlock once we've had our call or received your partner preferences.
        </p>
        <EventDateList events={events} />
        <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer" className="inline-block text-[12px] uppercase tracking-[0.2em] text-stone hover:text-ink transition-colors">
          Book a call →
        </a>
      </div>
    );
  }
  if (events.length === 0) return <EventDateList events={[]} />;
  return (
    <ul className="space-y-6">
      {events.map((e) => (
        <li key={e.id} className="border hairline rounded-2xl p-8 md:p-10">
          <div className="text-[11px] uppercase tracking-[0.28em] text-stone mb-3">
            {formatEventDate(e.starts_at)} · {formatEventTime(e.starts_at)}
          </div>
          <h2 className="font-display text-3xl md:text-4xl mb-2">{e.title}</h2>
          {e.venue_name && <div className="text-lg">{e.venue_name}</div>}
          {e.venue_address && <div className="text-stone">{e.venue_address}</div>}
          {e.details && <p className="text-ink-soft font-light leading-[1.55] mt-5 max-w-[60ch] whitespace-pre-line">{e.details}</p>}
          <div className="flex flex-wrap items-center gap-6 mt-8">
            {e.ticket_url && (
              <a href={e.ticket_url} target="_blank" rel="noopener noreferrer" className="bg-ink text-paper px-7 py-4 rounded-full text-[12px] uppercase tracking-[0.2em] hover:bg-ink-soft transition-colors">
                Get tickets →
              </a>
            )}
            {e.price && <span className="text-stone">{e.price}</span>}
          </div>
        </li>
      ))}
    </ul>
  );
}
