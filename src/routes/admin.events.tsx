import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  adminListEvents,
  adminSaveEvent,
  adminDeleteEvent,
  adminSetScreened,
  type FullEvent,
} from "@/lib/events.functions";
import { formatEventDate, formatEventTime } from "@/lib/event-format";

export const Route = createFileRoute("/admin/events")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Events — Vennti admin" },
      { name: "robots", content: "noindex" },
      { name: "description", content: "Manage Vennti events and screened members." },
      { property: "og:title", content: "Events — Vennti admin" },
      { property: "og:description", content: "Manage Vennti events and screened members." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminEvents,
});

type Draft = {
  id?: string;
  title: string;
  starts_at: string;
  venue_name: string;
  venue_address: string;
  details: string;
  price: string;
  ticket_url: string;
  published: boolean;
};
const empty: Draft = { title: "Vennti evening", starts_at: "", venue_name: "", venue_address: "", details: "", price: "$25", ticket_url: "", published: true };

function toLocalInput(iso: string) {
  const d = new Date(iso);
  const off = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - off).toISOString().slice(0, 16);
}

const input = "w-full border hairline rounded-lg px-4 py-3 bg-background";

function AdminEvents() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [ready, setReady] = useState(false);
  const list = useServerFn(adminListEvents);
  const save = useServerFn(adminSaveEvent);
  const del = useServerFn(adminDeleteEvent);
  const setScreened = useServerFn(adminSetScreened);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [email, setEmail] = useState("");
  const [source, setSource] = useState<"call" | "preferences">("call");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) navigate({ to: "/login" });
      else setReady(true);
    });
  }, [navigate]);

  const q = useQuery({ queryKey: ["admin-events"], queryFn: () => list(), enabled: ready, retry: false });
  const refresh = () => qc.invalidateQueries({ queryKey: ["admin-events"] });

  const onSave = async () => {
    if (!draft?.starts_at) return toast.error("Add a date and time.");
    try {
      await save({ data: { ...draft, starts_at: new Date(draft.starts_at).toISOString() } });
      toast.success("Event saved.");
      setDraft(null);
      refresh();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const onScreen = async (em: string, screened: boolean, src: "call" | "preferences" = "call") => {
    try {
      await setScreened({ data: { email: em, source: src, screened } });
      setEmail("");
      refresh();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  if (!ready) return null;
  const set = (k: keyof Draft) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setDraft((d) => (d ? { ...d, [k]: e.target.value } : d));

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b hairline">
        <div className="max-w-[1200px] mx-auto px-6 md:px-10 h-16 flex items-center justify-between">
          <Link to="/" className="font-display text-xl tracking-tight">Vennti</Link>
          <div className="flex gap-6 text-[12px] uppercase tracking-[0.18em] text-stone">
            <Link to="/admin" className="hover:text-ink">Applications</Link>
            <span className="text-ink">Events</span>
          </div>
        </div>
      </header>

      <div className="max-w-[1200px] mx-auto px-6 md:px-10 py-12 space-y-20">
        {q.error && <div className="border hairline rounded-2xl p-6 text-ink-soft">{(q.error as Error).message}</div>}

        <section>
          <div className="flex items-end justify-between mb-8">
            <h1 className="font-display text-5xl tracking-[-0.02em]">Events<em className="italic">.</em></h1>
            <button onClick={() => setDraft({ ...empty })} className="bg-ink text-paper px-6 py-3 rounded-full text-[12px] uppercase tracking-[0.2em]">
              New event
            </button>
          </div>

          {draft && (
            <div className="border hairline rounded-2xl p-8 mb-10 grid md:grid-cols-2 gap-4">
              <label className="space-y-2"><span className="text-sm text-stone">Title</span><input className={input} value={draft.title} onChange={set("title")} /></label>
              <label className="space-y-2"><span className="text-sm text-stone">Date and time</span><input type="datetime-local" className={input} value={draft.starts_at} onChange={set("starts_at")} /></label>
              <label className="space-y-2"><span className="text-sm text-stone">Venue name</span><input className={input} value={draft.venue_name} onChange={set("venue_name")} /></label>
              <label className="space-y-2"><span className="text-sm text-stone">Venue address</span><input className={input} value={draft.venue_address} onChange={set("venue_address")} /></label>
              <label className="space-y-2"><span className="text-sm text-stone">Price</span><input className={input} value={draft.price} onChange={set("price")} /></label>
              <label className="space-y-2"><span className="text-sm text-stone">Ticket link</span><input className={input} value={draft.ticket_url} onChange={set("ticket_url")} placeholder="https://" /></label>
              <label className="space-y-2 md:col-span-2"><span className="text-sm text-stone">Details</span><textarea rows={4} className={input} value={draft.details} onChange={set("details")} /></label>
              <label className="flex items-center gap-3"><input type="checkbox" checked={draft.published} onChange={(e) => setDraft({ ...draft, published: e.target.checked })} /> Show on site</label>
              <div className="flex gap-4 justify-end md:col-span-2">
                <button onClick={() => setDraft(null)} className="text-[12px] uppercase tracking-[0.2em] text-stone">Cancel</button>
                <button onClick={onSave} className="bg-ink text-paper px-6 py-3 rounded-full text-[12px] uppercase tracking-[0.2em]">Save</button>
              </div>
            </div>
          )}

          <ul className="border-t hairline">
            {(q.data?.events ?? []).map((e: FullEvent) => (
              <li key={e.id} className="border-b hairline py-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="font-display text-2xl">{e.title}{!e.published && <span className="ml-3 text-sm text-stone">(hidden)</span>}</div>
                  <div className="text-stone text-sm">{formatEventDate(e.starts_at)} · {formatEventTime(e.starts_at)}{e.venue_name ? ` · ${e.venue_name}` : ""}</div>
                </div>
                <div className="flex gap-5 text-[12px] uppercase tracking-[0.2em] text-stone">
                  <button className="hover:text-ink" onClick={() => setDraft({
                    id: e.id, title: e.title, starts_at: toLocalInput(e.starts_at), venue_name: e.venue_name ?? "", venue_address: e.venue_address ?? "",
                    details: e.details ?? "", price: e.price ?? "", ticket_url: e.ticket_url ?? "", published: e.published,
                  })}>Edit</button>
                  <button className="hover:text-ink" onClick={async () => { if (confirm("Delete this event?")) { await del({ data: { id: e.id } }); refresh(); } }}>Delete</button>
                </div>
              </li>
            ))}
            {q.data && q.data.events.length === 0 && <li className="py-6 text-stone">No events yet.</li>}
          </ul>
        </section>

        <section>
          <h2 className="font-display text-4xl mb-3">Screened <em className="italic">members.</em></h2>
          <p className="text-ink-soft font-light mb-8 max-w-[60ch]">
            Members on this list see venue details and ticket links. Add someone after your call or once their partner preferences arrive.
          </p>
          <div className="flex flex-wrap gap-3 mb-8">
            <input className={`${input} max-w-sm`} placeholder="Member's email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <select className={`${input} max-w-[200px]`} value={source} onChange={(e) => setSource(e.target.value as "call" | "preferences")}>
              <option value="call">Had a call</option>
              <option value="preferences">Sent preferences</option>
            </select>
            <button onClick={() => email && onScreen(email, true, source)} className="bg-ink text-paper px-6 py-3 rounded-full text-[12px] uppercase tracking-[0.2em]">Add</button>
          </div>
          <ul className="border-t hairline">
            {(q.data?.screened ?? []).map((s) => (
              <li key={s.email} className="border-b hairline py-4 flex justify-between gap-4">
                <span>{s.email} <span className="text-stone text-sm ml-2">{s.source === "call" ? "Had a call" : "Sent preferences"}</span></span>
                <button className="text-[12px] uppercase tracking-[0.2em] text-stone hover:text-ink" onClick={() => onScreen(s.email, false)}>Remove</button>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
