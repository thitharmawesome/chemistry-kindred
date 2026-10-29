import { formatEventDate, formatEventTime } from "@/lib/event-format";

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
