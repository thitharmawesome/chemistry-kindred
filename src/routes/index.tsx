import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { submitApplication } from "@/lib/waitlist.functions";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";



export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Quiet Room — Designed for people tired of modern dating" },
      {
        name: "description",
        content:
          "Curated real-world experiences where intentional singles meet naturally through chemistry, conversation, and AI-guided compatibility.",
      },
      { property: "og:title", content: "Quiet Room — Designed for people tired of modern dating" },
      {
        property: "og:description",
        content: "An invitation-only waitlist for singles who want chemistry over swipes.",
      },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Work+Sans:wght@300;400;500;600&display=swap",
      },
    ],
  }),
  component: Landing,
});

/* ------------------------------ data ------------------------------ */

type UploadValue = { path: string; name: string; type: string; size: number };
type FieldValue = string | string[] | UploadValue | undefined;
type FormState = Record<string, FieldValue>;


const sections = [
  {
    id: "basics",
    eyebrow: "Section 01",
    title: "The simple facts.",
    blurb: "Just the outline. We'll get to the interesting parts shortly.",
    fields: [
      { key: "name", label: "Full name", type: "text", required: true, placeholder: "Eleanor Vance" },
      { key: "age", label: "Age", type: "number", required: true, placeholder: "29" },
      { key: "city", label: "City", type: "text", required: true, placeholder: "Brooklyn, NY" },
      { key: "pronouns", label: "Pronouns (optional)", type: "text", placeholder: "she/her" },
      { key: "status", label: "Relationship status", type: "chips", options: ["Single", "Recently single", "Separated", "Divorced", "It's complicated"] },
      { key: "kids", label: "Kids", type: "chips", options: ["No kids", "Want kids", "Have kids", "Undecided"] },
      { key: "interest", label: "Interested in", type: "chips", multi: true, options: ["Men", "Women", "Non-binary", "Everyone"] },
      { key: "email", label: "Email", type: "email", required: true, placeholder: "you@domain.com" },
      { key: "instagram", label: "Instagram (optional)", type: "text", placeholder: "@handle" },
      { key: "linkedin", label: "LinkedIn (optional)", type: "text", placeholder: "linkedin.com/in/…" },
    ],
  },
  {
    id: "personality",
    eyebrow: "Section 02",
    title: "Personality & lifestyle.",
    blurb: "Write the way you talk. Specifics are far more attractive than polish.",
    fields: [
      { key: "weekend", label: "What does a great weekend look like to you?", type: "textarea" },
      { key: "care", label: "What's something you care deeply about?", type: "textarea" },
      { key: "looking", label: "What type of relationship are you looking for?", type: "chips", options: ["Long-term, marriage-minded", "Long-term, see where it goes", "Partnership, no labels", "Open to surprise"] },
      { key: "comm", label: "Your communication style in relationships", type: "textarea" },
      { key: "energy", label: "What kind of energy are you drawn to?", type: "textarea" },
      { key: "attractive", label: "What makes someone instantly attractive to you?", type: "textarea" },
      { key: "green", label: "A green flag people underestimate", type: "textarea" },
      { key: "social", label: "Your ideal social life as a couple", type: "textarea" },
    ],
  },
  {
    id: "chemistry",
    eyebrow: "Section 03",
    title: "Chemistry signals.",
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
    eyebrow: "Section 04",
    title: "Intentionality.",
    blurb: "We read every answer. This is the filter.",
    fields: [
      { key: "why", label: "Why are you joining this?", type: "textarea" },
      { key: "different", label: "What are you hoping is different here?", type: "textarea" },
      { key: "outside", label: "Open to meeting people outside your \"usual type\"?", type: "chips", options: ["Yes, that's the point", "Yes, with limits", "I have a type and I know it"] },
      { key: "meaningful", label: "Are you genuinely looking for a meaningful relationship?", type: "chips", options: ["Yes, fully", "Yes, but unhurried", "Curious, not certain"] },
    ],
  },
] as const;

/* ------------------------------ ui ------------------------------ */

function Landing() {
  return (
    <main className="min-h-screen bg-background text-foreground antialiased">
      <Nav />
      <Hero />
      <Marquee />
      <Principles />
      <HowItWorks />
      <Application />
      <Footer />
    </main>
  );
}

function Nav() {
  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-background/80 backdrop-blur-md border-b hairline">
      <div className="max-w-[1320px] mx-auto px-6 md:px-12 h-16 flex items-center justify-between">
        <a href="#top" className="font-display text-[1.6rem] leading-none tracking-tight">
          Quiet Room
        </a>
        <nav className="hidden md:flex items-center gap-10 text-[13px] text-muted-foreground tracking-wide">
          <a href="#principles" className="hover:text-foreground transition-colors">Principles</a>
          <a href="#how" className="hover:text-foreground transition-colors">How it works</a>
          <a href="#apply" className="hover:text-foreground transition-colors">Apply</a>
        </nav>
        <a
          href="#apply"
          className="text-[12px] uppercase tracking-[0.18em] px-4 py-2.5 bg-ink text-paper rounded-full hover:opacity-90 transition-opacity"
        >
          Join waitlist
        </a>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section id="top" className="relative pt-36 md:pt-44 pb-24 md:pb-32 border-b hairline">
      <div className="max-w-[1320px] mx-auto px-6 md:px-12">
        <div className="flex items-center gap-3 mb-12 text-[11px] uppercase tracking-[0.28em] text-stone">
          <span className="h-px w-10 bg-foreground/30" />
          <span>Invitation only · Spring cohort 2026</span>
        </div>

        <h1 className="font-display font-normal text-[clamp(3.25rem,10vw,9.5rem)] leading-[0.95] tracking-[-0.025em] max-w-[15ch]">
          Designed for people <em className="italic">tired</em> of modern dating.
        </h1>

        <div className="mt-16 grid md:grid-cols-12 gap-10 items-end">
          <p className="md:col-span-6 md:col-start-1 text-lg md:text-xl text-ink-soft leading-[1.55] max-w-[52ch] font-light">
            Curated real-world experiences where intentional singles meet naturally — through
            chemistry, conversation, and AI-guided compatibility. No swipes. No performance.
            No infinite scroll.
          </p>
          <div className="md:col-span-4 md:col-start-9 flex md:justify-end gap-3">
            <a
              href="#apply"
              className="group inline-flex items-center gap-4 bg-ink text-paper px-7 py-4 rounded-full text-[12px] uppercase tracking-[0.2em] hover:bg-ink-soft transition-colors"
            >
              Join the waitlist
              <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-[1320px] mx-auto px-6 md:px-12 mt-24 md:mt-32">
        <div className="rule mb-10" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-10 gap-x-8">
          {[
            ["~2%", "of applicants accepted"],
            ["4 cities", "NYC · LA · London · CDMX"],
            ["Real rooms", "Dinners, salons, weekends"],
            ["No app", "We do the matching"],
          ].map(([n, l]) => (
            <div key={l}>
              <div className="font-display text-4xl md:text-5xl tracking-tight">{n}</div>
              <div className="mt-3 text-[13px] text-stone">{l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Marquee() {
  const items = ["Chemistry over swipes", "Curated rooms", "Real conversation", "Invitation only", "Quiet luxury", "Intentional only"];
  return (
    <section className="border-b hairline py-10 overflow-hidden">
      <div className="flex gap-16 whitespace-nowrap animate-[scroll_40s_linear_infinite] font-display text-3xl md:text-4xl italic text-ink-soft">
        {[...items, ...items, ...items].map((t, i) => (
          <span key={i} className="flex items-center gap-16">
            <span>{t}</span>
            <span className="text-stone">✦</span>
          </span>
        ))}
      </div>
      <style>{`@keyframes scroll { from { transform: translateX(0); } to { transform: translateX(-33.333%); } }`}</style>
    </section>
  );
}

function Principles() {
  const lines = [
    ["No swipes.", "Attraction is not a deck of cards."],
    ["No performance.", "We do not optimize for the bio."],
    ["No serial daters.", "The filter is the product."],
    ["No content people.", "If you came for the story, please don't."],
  ];
  return (
    <section id="principles" className="border-b hairline py-28 md:py-40">
      <div className="max-w-[1320px] mx-auto px-6 md:px-12 grid md:grid-cols-12 gap-12">
        <div className="md:col-span-4">
          <div className="text-[11px] uppercase tracking-[0.28em] text-stone mb-6">A short manifesto</div>
          <h2 className="font-display text-5xl md:text-6xl leading-[1.02] tracking-[-0.02em]">
            What we <em className="italic">won't</em> do.
          </h2>
        </div>
        <ul className="md:col-span-8 border-t hairline">
          {lines.map(([k, v]) => (
            <li key={k} className="border-b hairline py-8 grid grid-cols-12 items-baseline gap-6">
              <span className="col-span-12 md:col-span-5 font-display text-3xl md:text-4xl">{k}</span>
              <span className="col-span-12 md:col-span-7 text-ink-soft text-base md:text-lg leading-[1.55] font-light">{v}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    ["Apply", "A real application — not a profile. Read by a human within ten days."],
    ["Match", "Our team plus AI-guided compatibility find people you'd actually choose."],
    ["Meet", "A dinner. A salon. A long walk. Always in person. Never a chat thread."],
  ];
  return (
    <section id="how" className="border-b hairline py-28 md:py-36">
      <div className="max-w-[1320px] mx-auto px-6 md:px-12">
        <div className="text-[11px] uppercase tracking-[0.28em] text-stone mb-6">How it works</div>
        <h2 className="font-display text-5xl md:text-6xl leading-[1.02] tracking-[-0.02em] max-w-[18ch]">
          Three steps. Then a real introduction.
        </h2>
        <div className="mt-20 grid md:grid-cols-3 gap-10 md:gap-16">
          {steps.map(([t, d], i) => (
            <div key={t} className="border-t hairline pt-8">
              <div className="font-mono text-[11px] text-stone tracking-[0.2em] mb-6">0{i + 1}</div>
              <h3 className="font-display text-3xl md:text-4xl tracking-tight">{t}</h3>
              <p className="mt-4 text-ink-soft text-base md:text-[17px] leading-[1.55] font-light">{d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ form ------------------------------ */

function Application() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const submit = useServerFn(submitApplication);

  const total = sections.length;
  const current = sections[step];
  const progress = useMemo(() => ((step + 1) / total) * 100, [step, total]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const el = document.getElementById("apply");
      if (el) window.scrollTo({ top: el.offsetTop - 64, behavior: "smooth" });
    }
  }, [step]);

  const set = (k: string, v: FieldValue) => setForm((f) => ({ ...f, [k]: v }));

  const submitForm = async () => {
    const name = String(form.name ?? "").trim();
    const email = String(form.email ?? "").trim();
    if (!name || !email) {
      toast.error("Name and email are required.");
      setStep(0);
      return;
    }
    setSubmitting(true);
    try {
      const ageRaw = String(form.age ?? "").trim();
      const ageNum = ageRaw ? Number(ageRaw) : null;
      const result = await submit({
        data: {
          name,
          email,
          age: ageNum && Number.isFinite(ageNum) ? ageNum : null,
          city: (form.city as string) || null,
          pronouns: (form.pronouns as string) || null,
          instagram: (form.instagram as string) || null,
          linkedin: (form.linkedin as string) || null,
          payload: form as Record<string, unknown>,
        },
      });
      if (result?.ok) {
        setSubmitted(true);
      } else {
        toast.error(result?.error || "Something went wrong. Please try again.");
      }
    } catch (e) {
      console.error(e);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const next = () => {
    if (step < total - 1) setStep(step + 1);
    else void submitForm();
  };
  const back = () => step > 0 && setStep(step - 1);


  return (
    <section id="apply" className="py-28 md:py-36 border-b hairline">
      <div className="max-w-[1100px] mx-auto px-6 md:px-12">
        <div className="flex items-end justify-between mb-12">
          <div>
            <div className="text-[11px] uppercase tracking-[0.28em] text-stone mb-5">The application</div>
            <h2 className="font-display text-5xl md:text-6xl leading-[1] tracking-[-0.02em] max-w-[16ch]">
              Tell us who you <em className="italic">actually</em> are.
            </h2>
          </div>
          {!submitted && (
            <div className="hidden md:block text-right text-[11px] tracking-[0.2em] text-stone font-mono uppercase">
              {String(step + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
            </div>
          )}
        </div>

        {!submitted && (
          <div className="h-px w-full bg-foreground/10 mb-16 overflow-hidden">
            <div
              className="h-full bg-ink transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {submitted ? (
          <Submitted name={(form.name as string) || ""} />
        ) : (
          <div className="grid md:grid-cols-12 gap-12 md:gap-16">
            <aside className="md:col-span-4">
              <ol className="space-y-6 md:sticky md:top-28">
                {sections.map((s, i) => {
                  const state = i < step ? "done" : i === step ? "active" : "todo";
                  return (
                    <li key={s.id} className="flex items-start gap-4">
                      <span
                        className={`mt-1.5 inline-flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-mono ${
                          state === "active"
                            ? "bg-ink text-paper"
                            : state === "done"
                            ? "border border-ink text-ink"
                            : "border hairline text-stone"
                        }`}
                      >
                        {i + 1}
                      </span>
                      <div>
                        <div
                          className={`font-display text-xl leading-tight ${
                            state === "todo" ? "text-stone" : "text-ink"
                          }`}
                        >
                          {s.title}
                        </div>
                        <div className="text-[10px] uppercase tracking-[0.22em] text-stone mt-1">
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
                <div className="text-[11px] uppercase tracking-[0.28em] text-stone mb-3">{current.eyebrow}</div>
                <h3 className="font-display text-4xl md:text-5xl leading-[1.05] tracking-[-0.015em] mb-4">
                  {current.title}
                </h3>
                <p className="text-ink-soft mb-12 max-w-[55ch] font-light text-base md:text-lg leading-[1.55]">
                  {current.blurb}
                </p>

                <div className="space-y-10">
                  {current.fields.map((f) => (
                    <Field key={f.key} field={f} value={form[f.key]} onChange={(v) => set(f.key, v)} />
                  ))}
                </div>

                <div className="mt-16 flex items-center justify-between">
                  <button
                    onClick={back}
                    disabled={step === 0}
                    className="text-[12px] uppercase tracking-[0.2em] text-stone hover:text-ink disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={next}
                    disabled={submitting}
                    className="group inline-flex items-center gap-4 bg-ink text-paper px-7 py-4 rounded-full text-[12px] uppercase tracking-[0.2em] hover:bg-ink-soft transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {step === total - 1 ? (submitting ? "Submitting…" : "Submit application") : "Continue"}
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
  value: FieldValue;
  onChange: (v: FieldValue) => void;
}) {
  const label = (
    <label className="block text-[11px] uppercase tracking-[0.22em] text-stone mb-3 font-body">
      {field.label}
      {"required" in field && field.required && <span className="text-ink ml-1">*</span>}
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
    const arr = Array.isArray(value) ? (value as string[]) : value ? [value as string] : [];
    return (
      <div>
        {label}
        <div className="flex flex-wrap gap-2 mt-1">
          {field.options.map((o) => {
            const active = arr.includes(o);
            return (
              <button
                key={o}
                type="button"
                className="chip"
                data-active={active}
                onClick={() => {
                  if (multi) onChange(active ? arr.filter((x) => x !== o) : [...arr, o]);
                  else onChange(active ? "" : o);
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
    const upload = value && typeof value === "object" && "path" in value ? (value as UploadValue) : null;
    return <UploadField field={field} upload={upload} onChange={onChange} label={label} />;
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

function UploadField({
  field,
  upload,
  onChange,
  label,
}: {
  field: Extract<Field, { type: "upload" }>;
  upload: UploadValue | null;
  onChange: (v: FieldValue) => void;
  label: React.ReactNode;
}) {
  const [busy, setBusy] = useState(false);

  const handleFile = async (file: File) => {
    setBusy(true);
    try {
      const ext = file.name.split(".").pop() || "bin";
      const path = `${field.key}/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage
        .from("waitlist-uploads")
        .upload(path, file, { contentType: file.type, upsert: false });
      if (error) throw error;
      onChange({ path, name: file.name, type: file.type, size: file.size });
    } catch (e) {
      console.error(e);
      toast.error("Upload failed. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      {label}
      <label className="flex items-center gap-4 border hairline border-dashed rounded-md px-5 py-5 cursor-pointer hover:border-ink transition-colors">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone">
          {busy ? "Uploading…" : upload ? "Selected" : "Add file"}
        </span>
        <span className="text-sm text-ink truncate">
          {upload ? upload.name : "Drop a file or click to upload"}
        </span>
        <input
          type="file"
          accept={"accept" in field ? field.accept : undefined}
          className="hidden"
          disabled={busy}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void handleFile(f);
          }}
        />
      </label>
    </div>
  );
}


function Submitted({ name }: { name: string }) {
  return (
    <div className="text-center py-20 animate-in fade-in slide-in-from-bottom-2 duration-700">
      <div className="text-[11px] uppercase tracking-[0.28em] text-stone mb-6">Application received</div>
      <h3 className="font-display text-5xl md:text-7xl leading-[1] tracking-[-0.02em] max-w-[18ch] mx-auto">
        Thank you{name ? `, ${name.split(" ")[0]}` : ""}. <em className="italic">We read every word.</em>
      </h3>
      <p className="text-ink-soft mt-8 max-w-[55ch] mx-auto text-lg leading-[1.55] font-light">
        You'll hear from a real person within ten days. If your cohort matches, we'll invite you
        to a first room — a dinner, a salon, or a long walk. Until then: stay off the apps.
      </p>
      <div className="mt-12 font-mono text-[11px] uppercase tracking-[0.25em] text-stone">
        — The Quiet Room
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="py-16">
      <div className="max-w-[1320px] mx-auto px-6 md:px-12">
        <div className="font-display text-[clamp(3rem,12vw,9rem)] leading-[0.9] tracking-[-0.025em]">
          Quiet Room<span className="italic">.</span>
        </div>
        <div className="mt-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 text-[12px] uppercase tracking-[0.2em] text-stone font-mono">
          <a href="mailto:hello@quietroom.co" className="hover:text-ink transition-colors">hello@quietroom.co</a>
          <div className="flex gap-8">
            <a href="#" className="hover:text-ink transition-colors">Instagram</a>
            <a href="#" className="hover:text-ink transition-colors">Privacy</a>
            <a href="#" className="hover:text-ink transition-colors">Terms</a>
          </div>
          <span>© 2026</span>
        </div>
      </div>
    </footer>
  );
}
