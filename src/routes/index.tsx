import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Quiet Room — Dating for the intentionally tired" },
      {
        name: "description",
        content:
          "Curated real-world experiences where intentional singles meet naturally through chemistry, conversation, and AI-guided compatibility.",
      },
      { property: "og:title", content: "Quiet Room — Designed for people tired of modern dating" },
      {
        property: "og:description",
        content:
          "An invitation-only waitlist for singles who want chemistry over swipes.",
      },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@300;400;500;600&display=swap",
      },
    ],
  }),
  component: Landing,
});

/* ------------------------------ data ------------------------------ */

type FormState = Record<string, string | string[]>;

const sections = [
  {
    id: "basics",
    eyebrow: "01 — Basics",
    title: "The simple facts.",
    blurb: "Just the outline. We'll get to the interesting parts shortly.",
    fields: [
      { key: "name", label: "Full name", type: "text", required: true, placeholder: "Eleanor Vance" },
      { key: "age", label: "Age", type: "number", required: true, placeholder: "29" },
      { key: "city", label: "City", type: "text", required: true, placeholder: "Brooklyn, NY" },
      { key: "pronouns", label: "Pronouns (optional)", type: "text", placeholder: "she/her" },
      {
        key: "status",
        label: "Relationship status",
        type: "chips",
        options: ["Single", "Recently single", "Separated", "Divorced", "It's complicated"],
      },
      { key: "kids", label: "Kids", type: "chips", options: ["No kids", "Want kids", "Have kids", "Undecided"] },
      {
        key: "interest",
        label: "Interested in",
        type: "chips",
        multi: true,
        options: ["Men", "Women", "Non-binary", "Everyone"],
      },
      { key: "email", label: "Email", type: "email", required: true, placeholder: "you@domain.com" },
      { key: "instagram", label: "Instagram (optional)", type: "text", placeholder: "@handle" },
      { key: "linkedin", label: "LinkedIn (optional)", type: "text", placeholder: "linkedin.com/in/…" },
    ],
  },
  {
    id: "personality",
    eyebrow: "02 — Personality & Lifestyle",
    title: "Where the texture begins.",
    blurb: "Write the way you talk. Specifics are far more attractive than polish.",
    fields: [
      { key: "weekend", label: "What does a great weekend look like to you?", type: "textarea" },
      { key: "care", label: "What's something you care deeply about?", type: "textarea" },
      {
        key: "looking",
        label: "What type of relationship are you looking for?",
        type: "chips",
        options: ["Long-term, marriage-minded", "Long-term, see where it goes", "Partnership, no labels", "Open to surprise"],
      },
      { key: "comm", label: "Your communication style in relationships", type: "textarea" },
      { key: "energy", label: "What kind of energy are you drawn to?", type: "textarea" },
      { key: "attractive", label: "What makes someone instantly attractive to you?", type: "textarea" },
      { key: "green", label: "A green flag people underestimate", type: "textarea" },
      { key: "social", label: "Your ideal social life as a couple", type: "textarea" },
    ],
  },
  {
    id: "chemistry",
    eyebrow: "03 — Chemistry Signals",
    title: "The interesting part.",
    blurb: "These shape your chemistry archetype. There are no wrong answers — only honest ones.",
    fields: [
      { key: "crushes", label: "Top 3 celebrity crushes — and why", type: "textarea", placeholder: "1. …\n2. …\n3. …" },
      { key: "controversial", label: "Your most controversial (harmless) opinion", type: "textarea" },
      { key: "thrive", label: "A social setting where you thrive", type: "textarea" },
      { key: "first", label: "Describe your ideal first interaction with someone", type: "textarea" },
      { key: "voice", label: "Voice note (optional)", type: "upload", accept: "audio/*" },
      { key: "video", label: "Short intro video (optional)", type: "upload", accept: "video/*" },
    ],
  },
  {
    id: "intent",
    eyebrow: "04 — Intentionality",
    title: "Why are you really here?",
    blurb: "We read every answer. This is the filter.",
    fields: [
      { key: "why", label: "Why are you joining this?", type: "textarea" },
      { key: "different", label: "What are you hoping is different here?", type: "textarea" },
      {
        key: "outside",
        label: "Open to meeting people outside your \"usual type\"?",
        type: "chips",
        options: ["Yes, that's the point", "Yes, with limits", "I have a type and I know it"],
      },
      {
        key: "meaningful",
        label: "Are you genuinely looking for a meaningful relationship?",
        type: "chips",
        options: ["Yes, fully", "Yes, but unhurried", "Curious, not certain"],
      },
    ],
  },
] as const;

/* ------------------------------ ui ------------------------------ */

function Landing() {
  return (
    <main className="min-h-screen bg-background text-foreground antialiased">
      <Nav />
      <Hero />
      <Manifesto />
      <Application />
      <Footer />
    </main>
  );
}

function Nav() {
  return (
    <header className="fixed top-0 inset-x-0 z-50 backdrop-blur-md bg-background/60 border-b hairline">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 h-16 flex items-center justify-between">
        <a href="#top" className="font-display text-xl tracking-tight">
          Quiet<span className="italic text-accent">Room</span>
        </a>
        <div className="hidden md:flex items-center gap-10 text-sm text-muted-foreground">
          <a href="#manifesto" className="hover:text-foreground transition-colors">Manifesto</a>
          <a href="#apply" className="hover:text-foreground transition-colors">Apply</a>
        </div>
        <a
          href="#apply"
          className="text-sm px-4 py-2 border hairline rounded-full hover:bg-cream hover:text-ink transition-colors"
        >
          Join waitlist
        </a>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section id="top" className="relative overflow-hidden grain pt-32 md:pt-44 pb-28 md:pb-40">
      <div className="absolute inset-0 ember-gradient pointer-events-none" />
      <div className="relative max-w-[1400px] mx-auto px-6 md:px-10">
        <div className="flex items-center gap-3 mb-10 text-xs uppercase tracking-[0.25em] text-muted-foreground">
          <span className="h-px w-10 bg-foreground/30" />
          <span>Invitation only · Spring cohort 2026</span>
        </div>

        <h1 className="font-display text-[clamp(3rem,9vw,8.5rem)] leading-[0.95] tracking-[-0.02em] max-w-[14ch]">
          Designed for people <em className="italic text-accent">tired</em> of modern dating.
        </h1>

        <div className="mt-12 grid md:grid-cols-12 gap-10 items-end">
          <p className="md:col-span-7 text-lg md:text-xl text-muted-foreground leading-relaxed max-w-[58ch]">
            Curated real-world experiences where intentional singles meet naturally — through
            chemistry, conversation, and AI-guided compatibility. No swipes. No performance.
            No infinite scroll.
          </p>
          <div className="md:col-span-5 flex md:justify-end">
            <a
              href="#apply"
              className="group inline-flex items-center gap-4 bg-cream text-ink px-7 py-4 rounded-full text-sm uppercase tracking-[0.18em] hover:bg-accent transition-colors"
            >
              Join the waitlist
              <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
            </a>
          </div>
        </div>

        <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-6 border-t hairline pt-8 text-sm">
          {[
            ["~2%", "of applicants accepted"],
            ["4 cities", "NYC · LA · London · Mexico City"],
            ["Real rooms", "Dinners, salons, weekends"],
            ["No app", "We do the matching"],
          ].map(([n, l]) => (
            <div key={l}>
              <div className="font-display text-3xl md:text-4xl">{n}</div>
              <div className="mt-2 text-muted-foreground">{l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Manifesto() {
  const lines = [
    ["No swipes.", "Attraction is not a deck of cards."],
    ["No performance.", "We do not optimize for the bio."],
    ["No serial daters.", "The filter is the product."],
    ["No content people.", "If you came for the story, please don't."],
  ];
  return (
    <section id="manifesto" className="border-t hairline py-28 md:py-40">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 grid md:grid-cols-12 gap-12">
        <div className="md:col-span-4">
          <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-6">A short manifesto</div>
          <h2 className="font-display text-5xl md:text-6xl leading-[1.02] tracking-[-0.02em]">
            What we <em className="italic text-accent">won't</em> do.
          </h2>
        </div>
        <ul className="md:col-span-8 divide-y hairline border-y hairline">
          {lines.map(([k, v]) => (
            <li key={k} className="py-7 grid grid-cols-12 items-baseline gap-6">
              <span className="col-span-5 md:col-span-4 font-display text-3xl md:text-4xl">{k}</span>
              <span className="col-span-7 md:col-span-8 text-muted-foreground text-lg leading-relaxed">{v}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ------------------------------ form ------------------------------ */

function Application() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>({});
  const [submitted, setSubmitted] = useState(false);

  const total = sections.length;
  const current = sections[step];
  const progress = useMemo(() => ((step + 1) / total) * 100, [step, total]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: document.getElementById("apply")?.offsetTop ?? 0, behavior: "smooth" });
    }
  }, [step]);

  const set = (k: string, v: string | string[]) => setForm((f) => ({ ...f, [k]: v }));

  const next = () => (step < total - 1 ? setStep(step + 1) : setSubmitted(true));
  const back = () => step > 0 && setStep(step - 1);

  return (
    <section id="apply" className="border-t hairline py-28 md:py-36 relative">
      <div className="max-w-[1100px] mx-auto px-6 md:px-10">
        <div className="flex items-end justify-between mb-12">
          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-4">
              The application
            </div>
            <h2 className="font-display text-5xl md:text-6xl leading-[1] tracking-[-0.02em]">
              Tell us who you <em className="italic text-accent">actually</em> are.
            </h2>
          </div>
          {!submitted && (
            <div className="hidden md:block text-right text-sm text-muted-foreground font-mono">
              {String(step + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
            </div>
          )}
        </div>

        {!submitted && (
          <div className="h-px w-full bg-foreground/10 mb-16 overflow-hidden">
            <div
              className="h-full bg-accent transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {submitted ? (
          <Submitted name={(form.name as string) || ""} />
        ) : (
          <div className="grid md:grid-cols-12 gap-12">
            <aside className="md:col-span-4">
              <ol className="space-y-5">
                {sections.map((s, i) => {
                  const state = i < step ? "done" : i === step ? "active" : "todo";
                  return (
                    <li key={s.id} className="flex items-start gap-4">
                      <span
                        className={`mt-1 inline-flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-mono ${
                          state === "active"
                            ? "bg-accent text-ink"
                            : state === "done"
                            ? "bg-cream text-ink"
                            : "border hairline text-muted-foreground"
                        }`}
                      >
                        {i + 1}
                      </span>
                      <div>
                        <div
                          className={`font-display text-xl leading-tight ${
                            state === "todo" ? "text-muted-foreground" : "text-foreground"
                          }`}
                        >
                          {s.title}
                        </div>
                        <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mt-1">
                          {s.eyebrow}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </aside>

            <div className="md:col-span-8">
              <div key={current.id} className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="text-xs uppercase tracking-[0.25em] text-accent mb-3">{current.eyebrow}</div>
                <h3 className="font-display text-4xl md:text-5xl leading-[1.05] tracking-[-0.01em] mb-3">
                  {current.title}
                </h3>
                <p className="text-muted-foreground mb-12 max-w-[55ch]">{current.blurb}</p>

                <div className="space-y-10">
                  {current.fields.map((f) => (
                    <Field key={f.key} field={f} value={form[f.key]} onChange={(v) => set(f.key, v)} />
                  ))}
                </div>

                <div className="mt-16 flex items-center justify-between">
                  <button
                    onClick={back}
                    disabled={step === 0}
                    className="text-sm text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={next}
                    className="group inline-flex items-center gap-4 bg-cream text-ink px-7 py-4 rounded-full text-sm uppercase tracking-[0.18em] hover:bg-accent transition-colors"
                  >
                    {step === total - 1 ? "Submit application" : "Continue"}
                    <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

type Field = (typeof sections)[number]["fields"][number];

function Field({
  field,
  value,
  onChange,
}: {
  field: Field;
  value: string | string[] | undefined;
  onChange: (v: string | string[]) => void;
}) {
  const label = (
    <label className="block text-sm text-muted-foreground mb-2 font-body">
      {field.label}
      {"required" in field && field.required && <span className="text-accent ml-1">*</span>}
    </label>
  );

  if (field.type === "textarea") {
    return (
      <div>
        {label}
        <textarea
          className="input-field"
          rows={3}
          placeholder={"placeholder" in field ? field.placeholder : "Take your time…"}
          value={(value as string) || ""}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    );
  }

  if (field.type === "chips") {
    const multi = "multi" in field && field.multi;
    const arr = Array.isArray(value) ? value : value ? [value as string] : [];
    return (
      <div>
        {label}
        <div className="flex flex-wrap gap-2 mt-2">
          {field.options.map((o) => {
            const active = arr.includes(o);
            return (
              <button
                key={o}
                type="button"
                className="chip"
                data-active={active}
                onClick={() => {
                  if (multi) {
                    onChange(active ? arr.filter((x) => x !== o) : [...arr, o]);
                  } else {
                    onChange(active ? "" : o);
                  }
                }}
              >
                {o}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (field.type === "upload") {
    return (
      <div>
        {label}
        <label className="flex items-center gap-4 border hairline border-dashed rounded-md px-5 py-5 cursor-pointer hover:border-foreground/40 transition-colors">
          <span className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
            {value ? "Selected" : "Add file"}
          </span>
          <span className="text-sm text-foreground/80 truncate">
            {value ? (value as string) : "Drop a file or click to upload"}
          </span>
          <input
            type="file"
            accept={"accept" in field ? field.accept : undefined}
            className="hidden"
            onChange={(e) => onChange(e.target.files?.[0]?.name || "")}
          />
        </label>
      </div>
    );
  }

  return (
    <div>
      {label}
      <input
        type={field.type}
        className="input-field"
        placeholder={"placeholder" in field ? field.placeholder : ""}
        value={(value as string) || ""}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function Submitted({ name }: { name: string }) {
  return (
    <div className="text-center py-20 animate-in fade-in slide-in-from-bottom-2 duration-700">
      <div className="text-xs uppercase tracking-[0.25em] text-accent mb-6">Application received</div>
      <h3 className="font-display text-5xl md:text-7xl leading-[1] tracking-[-0.02em] max-w-[18ch] mx-auto">
        Thank you{name ? `, ${name.split(" ")[0]}` : ""}. We read every word.
      </h3>
      <p className="text-muted-foreground mt-8 max-w-[55ch] mx-auto text-lg leading-relaxed">
        You'll hear from a real person within ten days. If your cohort matches, we'll invite you
        to a first room — a dinner, a salon, or a long walk. Until then: stay off the apps.
      </p>
      <div className="mt-12 font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">
        — The Quiet Room
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="border-t hairline py-12">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 text-sm text-muted-foreground">
        <div className="font-display text-2xl text-foreground">
          Quiet<span className="italic text-accent">Room</span>
        </div>
        <div className="flex gap-8 font-mono text-xs uppercase tracking-[0.2em]">
          <a href="mailto:hello@quietroom.co" className="hover:text-foreground">hello@quietroom.co</a>
          <span>© 2026</span>
        </div>
      </div>
    </footer>
  );
}
