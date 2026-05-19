import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
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
        href: "https://fonts.googleapis.com/css2?family=Syne:wght@500;600;700;800&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap",
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
    eyebrow: "The application",
    title: "A few questions.",
    blurb: "Just the outline. A real person reads every answer.",
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
] as const;


/* ------------------------------ ui ------------------------------ */

function Landing() {
  return (
    <main className="min-h-screen bg-background text-foreground antialiased">
      <Nav />
      <Hero />
      <HowItWorks />
      <Application />
      <Footer />
    </main>
  );
}

function Nav() {
  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-background/70 backdrop-blur-xl border-b hairline">
      <div className="max-w-[1320px] mx-auto px-6 md:px-10 h-16 flex items-center justify-between">
        <a href="#top" className="font-display text-[1.5rem] leading-none">
          Quiet<span className="text-amber">.</span>Room
        </a>
        <nav className="hidden md:flex items-center gap-10 text-[13px] text-muted-foreground tracking-wide">
          <a href="#how" className="hover:text-foreground transition-colors">How it works</a>
          <a href="#apply" className="hover:text-foreground transition-colors">Apply</a>
        </nav>
        <a
          href="#apply"
          className="text-[12px] font-semibold uppercase tracking-[0.14em] px-5 py-2.5 bg-amber text-ink rounded-full hover:scale-105 transition-transform"
        >
          Join waitlist
        </a>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section id="top" className="relative pt-28 md:pt-32 pb-12 md:pb-16">
      <div className="max-w-[1320px] mx-auto px-6 md:px-10">
        {/* Bento grid hero */}
        <div className="grid grid-cols-12 gap-3 md:gap-4 auto-rows-[minmax(110px,auto)]">
          {/* Eyebrow tile */}
          <div className="col-span-12 md:col-span-4 bento p-6 flex items-center gap-3">
            <span className="h-2 w-2 rounded-full bg-amber animate-pulse" />
            <span className="text-[11px] uppercase tracking-[0.22em] text-stone font-semibold">
              Invitation only · Now applying
            </span>
          </div>

          {/* Big amber CTA tile */}
          <a
            href="#apply"
            className="col-span-12 md:col-span-8 bento-amber p-6 md:p-8 flex items-center justify-between group glow-amber"
          >
            <span className="font-display text-2xl md:text-3xl leading-tight">
              Apply to the next cohort →
            </span>
            <span className="text-[11px] uppercase tracking-[0.2em] font-semibold opacity-70 hidden md:block">
              ~10 day reply
            </span>
          </a>

          {/* Headline tile (full width) */}
          <div className="col-span-12 bento p-7 md:p-12">
            <h1 className="font-display text-[clamp(2.5rem,8.5vw,7.5rem)] leading-[0.95] tracking-[-0.03em] max-w-[14ch]">
              Dating, but <span className="text-amber italic">designed</span> for humans.
            </h1>
            <p className="mt-8 md:mt-10 text-lg md:text-xl text-ink-soft leading-[1.55] max-w-[58ch] font-light">
              Curated real-world social experiences for singles seeking meaningful relationships,
              powered by AI and human intelligence.
            </p>
          </div>

          {/* Stat tiles */}
          <div className="col-span-6 md:col-span-3 bento-teal p-6 flex flex-col justify-between min-h-[150px]">
            <div className="font-display text-5xl md:text-6xl">~2%</div>
            <div className="text-[11px] uppercase tracking-[0.18em] font-semibold opacity-75">
              Accepted
            </div>
          </div>
          <div className="col-span-6 md:col-span-3 bento-coral p-6 flex flex-col justify-between min-h-[150px]">
            <div className="font-display text-5xl md:text-6xl">4</div>
            <div className="text-[11px] uppercase tracking-[0.18em] font-semibold opacity-75">
              Cities live
            </div>
          </div>
          <div className="col-span-12 md:col-span-6 bento-plum p-6 md:p-7 flex flex-col justify-between min-h-[150px]">
            <div className="font-display text-2xl md:text-3xl leading-tight">
              Real rooms. Real chemistry. No swipe-fatigue.
            </div>
            <div className="text-[11px] uppercase tracking-[0.18em] font-semibold opacity-75 mt-4">
              The Quiet Room manifesto
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


function HowItWorks() {
  const steps = [
    { n: "01", t: "Apply", d: "A real application — not a profile. Read by a human within ten days.", cls: "bento" },
    { n: "02", t: "Match", d: "Our team plus AI-guided compatibility find people you'd actually choose.", cls: "bento-amber" },
    { n: "03", t: "Meet", d: "A dinner. A salon. A long walk. Always in person. Never a chat thread.", cls: "bento" },
  ];
  return (
    <section id="how" className="py-20 md:py-28">
      <div className="max-w-[1320px] mx-auto px-6 md:px-10">
        <div className="flex items-end justify-between flex-wrap gap-6 mb-12">
          <div>
            <div className="text-[11px] uppercase tracking-[0.22em] text-amber font-semibold mb-4">
              How it works
            </div>
            <h2 className="font-display text-4xl md:text-6xl leading-[1.02] tracking-[-0.02em] max-w-[18ch]">
              Three steps. Then a real <span className="italic text-amber">introduction.</span>
            </h2>
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {steps.map((s) => (
            <div key={s.n} className={`${s.cls} p-7 md:p-8 min-h-[260px] flex flex-col justify-between`}>
              <div className="font-mono text-xs tracking-[0.2em] opacity-60">{s.n}</div>
              <div>
                <h3 className="font-display text-3xl md:text-4xl">{s.t}</h3>
                <p className="mt-4 text-base md:text-[17px] leading-[1.55] font-light opacity-85">
                  {s.d}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ form ------------------------------ */

function Application() {
  const [form, setForm] = useState<FormState>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const submit = useServerFn(submitApplication);

  const current = sections[0];

  const set = (k: string, v: FieldValue) => setForm((f) => ({ ...f, [k]: v }));

  const submitForm = async () => {
    const name = String(form.name ?? "").trim();
    const email = String(form.email ?? "").trim();
    if (!name || !email) {
      toast.error("Name and email are required.");
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




  return (
    <section id="apply" className="py-20 md:py-28 scroll-mt-20">
      <div className="max-w-[1320px] mx-auto px-6 md:px-10">
        <div className="bento p-7 md:p-14 max-w-[920px] mx-auto">
          <div className="mb-12">
            <div className="text-[11px] uppercase tracking-[0.22em] text-amber font-semibold mb-4">
              The application
            </div>
            <h2 className="font-display text-4xl md:text-6xl leading-[1] tracking-[-0.02em] max-w-[16ch]">
              Tell us who you <span className="italic text-amber">actually</span> are.
            </h2>
            <p className="text-ink-soft mt-6 max-w-[55ch] font-light text-base md:text-lg leading-[1.55]">
              {current.blurb}
            </p>
          </div>

          {submitted ? (
            <Submitted name={(form.name as string) || ""} />
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="grid md:grid-cols-2 gap-6">
                {current.fields.map((f) => (
                  <div key={f.key} className={f.type === "chips" && f.multi ? "md:col-span-2" : ""}>
                    <Field field={f} value={form[f.key]} onChange={(v) => set(f.key, v)} />
                  </div>
                ))}
              </div>

              <div className="mt-12 flex items-center justify-end">
                <button
                  onClick={() => void submitForm()}
                  disabled={submitting}
                  className="group inline-flex items-center gap-4 bg-amber text-ink px-7 py-4 rounded-full text-[12px] font-semibold uppercase tracking-[0.18em] hover:scale-105 transition-transform disabled:opacity-60 disabled:cursor-not-allowed glow-amber"
                >
                  {submitting ? "Submitting…" : "Submit application"}
                  <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}


type Field = {
  key: string;
  label: string;
  type: string;
  required?: boolean;
  placeholder?: string;
  options?: readonly string[];
  multi?: boolean;
  accept?: string;
};


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
    <label className="block text-[11px] uppercase tracking-[0.18em] text-stone mb-2 font-semibold">
      {field.label}
      {"required" in field && field.required && <span className="text-amber ml-1">*</span>}
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
          {(field.options ?? []).map((o) => {
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
  field: Field;
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
    <div className="text-center py-16 animate-in fade-in slide-in-from-bottom-2 duration-700">
      <div className="inline-block bento-amber px-5 py-2 text-[11px] uppercase tracking-[0.2em] font-semibold mb-8">
        Application received
      </div>
      <h3 className="font-display text-4xl md:text-6xl leading-[1.02] tracking-[-0.02em] max-w-[18ch] mx-auto">
        Thank you{name ? `, ${name.split(" ")[0]}` : ""}.{" "}
        <span className="italic text-amber">We read every word.</span>
      </h3>
      <p className="text-ink-soft mt-8 max-w-[55ch] mx-auto text-lg leading-[1.55] font-light">
        You'll hear from a real person within ten days. If your cohort matches, we'll invite you
        to a first room — a dinner, a salon, or a long walk. Until then: stay off the apps.
      </p>
      <div className="mt-10 font-mono text-[11px] uppercase tracking-[0.22em] text-stone">
        — The Quiet Room
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="pt-8 pb-12">
      <div className="max-w-[1320px] mx-auto px-6 md:px-10">
        <div className="bento p-8 md:p-12">
          <div className="font-display text-[clamp(2.5rem,10vw,7rem)] leading-[0.9] tracking-[-0.03em]">
            Quiet<span className="text-amber">.</span>Room
          </div>
          <div className="mt-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 text-[12px] uppercase tracking-[0.16em] text-stone font-mono">
            <a href="mailto:hello@quietroom.co" className="hover:text-amber transition-colors">hello@quietroom.co</a>
            <div className="flex gap-8">
              <a href="#" className="hover:text-amber transition-colors">Instagram</a>
              <a href="#" className="hover:text-amber transition-colors">Privacy</a>
              <a href="#" className="hover:text-amber transition-colors">Terms</a>
            </div>
            <span>© 2026</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
