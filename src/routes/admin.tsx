import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { listApplications, claimFirstAdmin, getUploadSignedUrl } from "@/lib/waitlist.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Applications — Vennti" }, { name: "robots", content: "noindex" }],
    links: [
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Work+Sans:wght@300;400;500;600&display=swap",
      },
    ],
  }),
  component: AdminPage,
});

type UploadValue = { path: string; name: string; type: string; size: number };

type Application = {
  id: string;
  created_at: string;
  name: string;
  age: number | null;
  city: string | null;
  email: string;
  pronouns: string | null;
  instagram: string | null;
  linkedin: string | null;
  status: string;
  payload: Record<string, unknown>;
};

function isUploadValue(v: unknown): v is UploadValue {
  return !!v && typeof v === "object" && "path" in (v as Record<string, unknown>) && "name" in (v as Record<string, unknown>);
}

function AdminPage() {
  const navigate = useNavigate();
  const [sessionChecked, setSessionChecked] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const fetchList = useServerFn(listApplications);
  const claim = useServerFn(claimFirstAdmin);
  const [selected, setSelected] = useState<Application | null>(null);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setSignedIn(!!session);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSignedIn(!!data.session);
      setSessionChecked(true);
      if (!data.session) navigate({ to: "/login" });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  const query = useQuery({
    queryKey: ["applications"],
    queryFn: () => fetchList(),
    enabled: sessionChecked && signedIn,
    retry: false,
  });

  const needsAdmin =
    query.error instanceof Error && /admin access required|Forbidden/i.test(query.error.message);

  const onClaim = async () => {
    const res = await claim();
    if (res.ok) {
      toast.success("Admin granted.");
      query.refetch();
    } else {
      toast.error(res.error || "Could not claim admin.");
    }
  };

  const onSignOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/login" });
  };

  const downloadCsv = () => {
    const apps = (query.data?.applications ?? []) as Application[];
    if (apps.length === 0) {
      toast.error("Nothing to export.");
      return;
    }
    // Collect all payload keys across apps
    const baseCols = ["id", "created_at", "name", "email", "age", "city", "pronouns", "instagram", "linkedin", "status"];
    const payloadKeys = new Set<string>();
    apps.forEach((a) => {
      Object.keys(a.payload || {}).forEach((k) => {
        if (!baseCols.includes(k)) payloadKeys.add(k);
      });
    });
    const cols = [...baseCols, ...Array.from(payloadKeys).sort()];

    const escape = (val: unknown) => {
      if (val === null || val === undefined) return "";
      let s: string;
      if (Array.isArray(val)) s = val.join("; ");
      else if (isUploadValue(val)) s = val.name + " (" + val.path + ")";
      else if (typeof val === "object") s = JSON.stringify(val);
      else s = String(val);
      return `"${s.replace(/"/g, '""').replace(/\r?\n/g, " ")}"`;
    };

    const header = cols.join(",");
    const rows = apps.map((a) =>
      cols
        .map((c) => {
          if (c in a && !(c in (a.payload || {}))) return escape((a as unknown as Record<string, unknown>)[c]);
          return escape((a.payload || {})[c]);
        })
        .join(","),
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `waitlist-applications-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!sessionChecked) return null;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b hairline">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 h-16 flex items-center justify-between">
          <Link to="/" className="font-display text-xl tracking-tight">Vennti</Link>
          <div className="flex items-center gap-6 text-[12px] uppercase tracking-[0.18em] text-stone">
            <span className="hidden md:inline">Applications</span>
            <button onClick={onSignOut} className="hover:text-ink transition-colors">Sign out</button>
          </div>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-12 md:py-16">
        <div className="flex items-end justify-between mb-10 gap-6">
          <div>
            <div className="text-[11px] uppercase tracking-[0.28em] text-stone mb-3">The inbox</div>
            <h1 className="font-display text-5xl md:text-6xl leading-[1] tracking-[-0.02em]">
              Waitlist <em className="italic">applications</em>.
            </h1>
          </div>
          <div className="flex items-center gap-4">
            {query.data && (
              <div className="font-mono text-[12px] text-stone uppercase tracking-[0.2em]">
                {query.data.applications.length} total
              </div>
            )}
            {query.data && query.data.applications.length > 0 && (
              <button
                onClick={downloadCsv}
                className="bg-ink text-paper px-5 py-2.5 rounded-full text-[11px] uppercase tracking-[0.2em] hover:bg-ink-soft transition-colors"
              >
                Download CSV
              </button>
            )}
          </div>
        </div>

        {query.isLoading && <p className="text-stone">Loading…</p>}

        {needsAdmin && (
          <div className="border hairline rounded-md p-8 max-w-xl">
            <h2 className="font-display text-3xl mb-3">No admin yet.</h2>
            <p className="text-ink-soft mb-6 font-light">
              You're signed in but don't have admin access. If you're the project owner, claim it
              now. (This only works for the very first admin.)
            </p>
            <button
              onClick={onClaim}
              className="bg-ink text-paper px-6 py-3 rounded-full text-[12px] uppercase tracking-[0.2em] hover:bg-ink-soft transition-colors"
            >
              Claim admin →
            </button>
          </div>
        )}

        {query.data && (
          <div className="border-t hairline">
            {query.data.applications.length === 0 ? (
              <p className="py-16 text-stone text-center">No applications yet.</p>
            ) : (
              query.data.applications.map((app) => (
                <button
                  key={app.id}
                  onClick={() => setSelected(app as Application)}
                  className="w-full border-b hairline py-6 grid grid-cols-12 gap-4 items-center text-left hover:bg-foreground/[0.02] transition-colors px-2"
                >
                  <div className="col-span-12 md:col-span-3">
                    <div className="font-display text-2xl">{app.name}</div>
                    <div className="text-stone text-xs mt-1">{app.email}</div>
                  </div>
                  <div className="col-span-4 md:col-span-2 text-sm text-ink-soft">
                    {app.city || "—"}
                  </div>
                  <div className="col-span-4 md:col-span-1 text-sm text-ink-soft">
                    {app.age ?? "—"}
                  </div>
                  <div className="col-span-4 md:col-span-3 text-sm text-stone font-mono uppercase tracking-[0.15em]">
                    {app.status}
                  </div>
                  <div className="hidden md:block md:col-span-3 text-right text-xs text-stone font-mono">
                    {new Date(app.created_at).toLocaleString()}
                  </div>
                </button>
              ))
            )}
          </div>
        )}

        {query.error && !needsAdmin && (
          <p className="text-destructive mt-6">{(query.error as Error).message}</p>
        )}
      </div>

      {selected && <DetailDrawer app={selected} onClose={() => setSelected(null)} />}
    </main>
  );
}

function DetailDrawer({ app, onClose }: { app: Application; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={onClose} />
      <aside className="relative ml-auto w-full max-w-2xl h-full bg-background border-l hairline overflow-y-auto">
        <div className="sticky top-0 bg-background border-b hairline px-8 py-5 flex items-center justify-between">
          <div className="text-[11px] uppercase tracking-[0.28em] text-stone">Application</div>
          <button onClick={onClose} className="text-stone hover:text-ink text-2xl leading-none">×</button>
        </div>
        <div className="p-8">
          <h2 className="font-display text-4xl tracking-tight mb-2">{app.name}</h2>
          <div className="text-stone text-sm mb-8">
            {app.email} · {app.city || "—"} · {app.age ?? "—"} · {app.pronouns || "—"}
          </div>

          <div className="grid grid-cols-2 gap-6 mb-10 text-sm">
            {app.instagram && (
              <div>
                <div className="text-[10px] uppercase tracking-[0.22em] text-stone mb-1">Instagram</div>
                <div>{app.instagram}</div>
              </div>
            )}
            {app.linkedin && (
              <div>
                <div className="text-[10px] uppercase tracking-[0.22em] text-stone mb-1">LinkedIn</div>
                <div className="break-all">{app.linkedin}</div>
              </div>
            )}
            <div>
              <div className="text-[10px] uppercase tracking-[0.22em] text-stone mb-1">Submitted</div>
              <div>{new Date(app.created_at).toLocaleString()}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.22em] text-stone mb-1">Status</div>
              <div className="font-mono uppercase">{app.status}</div>
            </div>
          </div>

          <div className="border-t hairline pt-8 space-y-8">
            {Object.entries(app.payload || {}).map(([k, v]) => {
              if (["name", "email", "age", "city", "pronouns", "instagram", "linkedin"].includes(k)) return null;
              if (isUploadValue(v)) {
                return (
                  <div key={k}>
                    <div className="text-[10px] uppercase tracking-[0.22em] text-stone mb-2">{k}</div>
                    <MediaPreview upload={v} />
                  </div>
                );
              }
              const display = Array.isArray(v) ? v.join(", ") : typeof v === "string" ? v : JSON.stringify(v);
              if (!display) return null;
              return (
                <div key={k}>
                  <div className="text-[10px] uppercase tracking-[0.22em] text-stone mb-2">{k}</div>
                  <div className="text-ink-soft whitespace-pre-wrap leading-relaxed">{display}</div>
                </div>
              );
            })}
          </div>
        </div>
      </aside>
    </div>
  );
}

function MediaPreview({ upload }: { upload: UploadValue }) {
  const sign = useServerFn(getUploadSignedUrl);
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    sign({ data: { path: upload.path } })
      .then((r) => {
        if (!cancelled) setUrl(r.url);
      })
      .catch((e: Error) => {
        if (!cancelled) setError(e.message);
      });
    return () => {
      cancelled = true;
    };
  }, [upload.path, sign]);

  if (error) return <div className="text-destructive text-sm">{error}</div>;
  if (!url) return <div className="text-stone text-sm">Loading {upload.name}…</div>;

  const kind = upload.type.startsWith("image/")
    ? "image"
    : upload.type.startsWith("video/")
    ? "video"
    : upload.type.startsWith("audio/")
    ? "audio"
    : "file";

  return (
    <div className="space-y-2">
      {kind === "image" && (
        <img src={url} alt={upload.name} className="max-w-full rounded-md border hairline" />
      )}
      {kind === "video" && (
        <video src={url} controls className="max-w-full rounded-md border hairline" />
      )}
      {kind === "audio" && <audio src={url} controls className="w-full" />}
      <div className="flex items-center gap-3 text-xs text-stone">
        <a href={url} download={upload.name} className="underline hover:text-ink">
          Download {upload.name}
        </a>
        <span>·</span>
        <span>{(upload.size / 1024).toFixed(1)} KB</span>
      </div>
    </div>
  );
}
