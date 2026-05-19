import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { submitApplication } from "@/lib/waitlist.functions";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";



export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sway — Designed for people tired of modern dating" },
      {
        name: "description",
        content:
          "Curated real-world experiences where intentional singles meet naturally through chemistry, conversation, and AI-guided compatibility.",
      },
      { property: "og:title", content: "Sway — Designed for people tired of modern dating" },
      {
        property: "og:description",
        content: "Apply for a curated real-world experience. Matched by people who actually read your application.",
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
type FieldValue = string | string[] | UploadValue | UploadValue[] | undefined;
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
      { key: "sex", label: "Sex", type: "chips", required: true, options: ["Female", "Male", "Intersex", "Prefer not to say"] },
      { key: "status", label: "Relationship status", type: "chips", options: ["Single", "Recently single", "Separated", "Divorced", "It's complicated"] },
      { key: "kids", label: "Kids", type: "chips", options: ["No kids", "Want kids", "Have kids", "Undecided"] },
      { key: "interest", label: "Interested in", type: "chips", multi: true, options: ["Men", "Women", "Non-binary", "Everyone"] },
      { key: "looking_for", label: "Looking for", type: "chips", required: true, options: ["Serious relationship", "Marriage"] },
      { key: "photos", label: "Photos (a few recent, unfiltered)", type: "uploads", accept: "image/*" },
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
      <Manifesto />
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
          Sway
        </a>
        <nav className="hidden md:flex items-center gap-10 text-[13px] text-muted-foreground tracking-wide">
          <a href="#how" className="hover:text-foreground transition-colors">How it works</a>
          <a href="#apply" className="hover:text-foreground transition-colors">Apply</a>
        </nav>
        <a
          href="#apply"
          className="text-[12px] uppercase tracking-[0.18em] px-4 py-2.5 bg-ink text-paper rounded-full hover:opacity-90 transition-opacity"
        >
          Apply for the next event
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
          <span>Carefully Curated</span>
        </div>

        <h1 className="font-display font-normal text-[clamp(3.25rem,10vw,9.5rem)] leading-[0.95] tracking-[-0.025em] max-w-[15ch]">
          Designed for people <em className="italic">tired</em> of modern dating.
        </h1>

        <div className="mt-16 grid md:grid-cols-12 gap-10 items-end">
          <p className="md:col-span-6 md:col-start-1 text-lg md:text-xl text-ink-soft leading-[1.55] max-w-[52ch] font-light">
            Designed to feel more like a great night out than modern dating. No swiping. No endless messaging. Just real people, and the chance to meet in real life.
          </p>
          <div className="md:col-span-4 md:col-start-9 flex md:justify-end gap-3">
            <a
              href="#apply"
              className="group inline-flex items-center gap-4 bg-ink text-paper px-7 py-4 rounded-full text-[12px] uppercase tracking-[0.2em] hover:bg-ink-soft transition-colors"
            >
              Apply for the next event
              <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}


function Manifesto() {
  return (
    <section className="border-b hairline py-28 md:py-36">
      <div className="max-w-[1320px] mx-auto px-6 md:px-12">
        <div className="text-[11px] uppercase tracking-[0.28em] text-stone mb-6">Our approach</div>
        <p className="font-display text-3xl md:text-5xl leading-[1.15] tracking-[-0.02em] max-w-[26ch] text-ink">
          Not a traditional singles event.
        </p>
        <p className="mt-10 text-ink-soft text-lg md:text-xl leading-[1.55] font-light max-w-[52ch]">
          Selected guests are encouraged to invite friends, helping create a more natural social atmosphere.
        </p>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    ["Apply", "Submit your application — not a profile. Read by a real person in 72 hours."],
    ["Meet us", "If you're selected, we'll reach out to learn more about who you are and what you're looking for."],
    ["Get invited", "Receive an invitation to a night out with friends with the opportunity to meet a match based on who's attending and what we've learned about you."],
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
          pronouns: null,
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
    <section id="apply" className="py-28 md:py-36 border-b hairline scroll-mt-20">
      <div className="max-w-[820px] mx-auto px-6 md:px-12">
        <div className="mb-14">
          <div className="text-[11px] uppercase tracking-[0.28em] text-stone mb-5">The application</div>
          <h2 className="font-display text-5xl md:text-6xl leading-[1] tracking-[-0.02em] max-w-[16ch]">
            Tell us who you <em className="italic">actually</em> are.
          </h2>
          <p className="text-ink-soft mt-6 max-w-[55ch] font-light text-base md:text-lg leading-[1.55]">
            {current.blurb}
          </p>
        </div>

        {submitted ? (
          <Submitted name={(form.name as string) || ""} />
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="space-y-10">
              {current.fields.map((f) => (
                <Field key={f.key} field={f} value={form[f.key]} onChange={(v) => set(f.key, v)} />
              ))}
            </div>

            <div className="mt-16 flex items-center justify-end">
              <button
                onClick={() => void submitForm()}
                disabled={submitting}
                className="group inline-flex items-center gap-4 bg-ink text-paper px-7 py-4 rounded-full text-[12px] uppercase tracking-[0.2em] hover:bg-ink-soft transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? "Submitting…" : "Submit application"}
                <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
              </button>
            </div>
          </div>
        )}
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
    const upload = value && typeof value === "object" && !Array.isArray(value) && "path" in value ? (value as UploadValue) : null;
    return <UploadField field={field} upload={upload} onChange={onChange} label={label} />;
  }

  if (field.type === "uploads") {
    const uploads = Array.isArray(value) && value.length && typeof value[0] === "object" ? (value as UploadValue[]) : [];
    return <MultiUploadField field={field} uploads={uploads} onChange={onChange} label={label} />;
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

function MultiUploadField({
  field,
  uploads,
  onChange,
  label,
}: {
  field: Field;
  uploads: UploadValue[];
  onChange: (v: FieldValue) => void;
  label: React.ReactNode;
}) {
  const [busy, setBusy] = useState(false);

  const handleFiles = async (files: FileList) => {
    setBusy(true);
    try {
      const next: UploadValue[] = [...uploads];
      for (const file of Array.from(files)) {
        const ext = file.name.split(".").pop() || "bin";
        const path = `${field.key}/${crypto.randomUUID()}.${ext}`;
        const { error } = await supabase.storage
          .from("waitlist-uploads")
          .upload(path, file, { contentType: file.type, upsert: false });
        if (error) throw error;
        next.push({ path, name: file.name, type: file.type, size: file.size });
      }
      onChange(next);
    } catch (e) {
      console.error(e);
      toast.error("Upload failed. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const remove = (path: string) => {
    onChange(uploads.filter((u) => u.path !== path));
  };

  return (
    <div>
      {label}
      <label className="flex items-center gap-4 border hairline border-dashed rounded-md px-5 py-5 cursor-pointer hover:border-ink transition-colors">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone">
          {busy ? "Uploading…" : "Add photos"}
        </span>
        <span className="text-sm text-ink-soft truncate">
          {uploads.length ? `${uploads.length} photo${uploads.length === 1 ? "" : "s"} added — click to add more` : "Drop photos or click to upload"}
        </span>
        <input
          type="file"
          multiple
          accept={"accept" in field ? field.accept : undefined}
          className="hidden"
          disabled={busy}
          onChange={(e) => {
            if (e.target.files?.length) void handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </label>
      {uploads.length > 0 && (
        <ul className="mt-3 space-y-1">
          {uploads.map((u) => (
            <li key={u.path} className="flex items-center justify-between text-sm text-ink">
              <span className="truncate">{u.name}</span>
              <button
                type="button"
                onClick={() => remove(u.path)}
                className="ml-3 font-mono text-[10px] uppercase tracking-[0.2em] text-stone hover:text-ink transition-colors"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
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
        You'll hear from a real person within ten days. If it feels right, we'll meet to learn more —
        then invite you to a curated experience with people chosen for you.
      </p>
      <div className="mt-12 font-mono text-[11px] uppercase tracking-[0.25em] text-stone">
        — Sway
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="py-16">
      <div className="max-w-[1320px] mx-auto px-6 md:px-12">
        <div className="font-display text-[clamp(3rem,12vw,9rem)] leading-[0.9] tracking-[-0.025em]">
          Sway<span className="italic">.</span>
        </div>
        <div className="mt-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 text-[12px] uppercase tracking-[0.2em] text-stone font-mono">
          <a href="mailto:hello@sway.co" className="hover:text-ink transition-colors">hello@sway.co</a>
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
