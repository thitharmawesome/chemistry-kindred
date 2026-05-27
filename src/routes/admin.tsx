import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import * as XLSX from "xlsx";
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
  return (
    !!v &&
    typeof v === "object" &&
    "path" in (v as Record<string, unknown>) &&
    "name" in (v as Record<string, unknown>)
  );
}

function collectUploads(v: unknown): UploadValue[] {
  if (isUploadValue(v)) return [v];
  if (Array.isArray(v)) return v.flatMap(collectUploads);
  return [];
}

const BASE_COLS = [
  "created_at",
  "name",
  "email",
  "age",
  "city",
  "pronouns",
  "instagram",
  "linkedin",
  "status",
] as const;

function AdminPage() {
  const navigate = useNavigate();
  const [sessionChecked, setSessionChecked] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const fetchList = useServerFn(listApplications);
  const claim = useServerFn(claimFirstAdmin);
  const sign = useServerFn(getUploadSignedUrl);
  const [selected, setSelected] = useState<Application | null>(null);
  const [downloading, setDownloading] = useState(false);

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

  const apps = (query.data?.applications ?? []) as Application[];

  const payloadKeys = useMemo(() => {
    const keys = new Set<string>();
    apps.forEach((a) => {
      Object.keys(a.payload || {}).forEach((k) => {
        if (!(BASE_COLS as readonly string[]).includes(k)) keys.add(k);
      });
    });
    return Array.from(keys).sort();
  }, [apps]);

  const columns = useMemo(() => [...BASE_COLS, ...payloadKeys], [payloadKeys]);

  const cellValue = (app: Application, col: string): unknown => {
    if ((BASE_COLS as readonly string[]).includes(col)) {
      return (app as unknown as Record<string, unknown>)[col];
    }
    return (app.payload || {})[col];
  };

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

  const downloadExcel = async () => {
    if (apps.length === 0) {
      toast.error("Nothing to export.");
      return;
    }
    setDownloading(true);
    try {
      // Pre-sign every upload across all rows in one pass (dedup by path).
      const uniquePaths = new Set<string>();
      apps.forEach((a) =>
        Object.values(a.payload || {}).forEach((v) =>
          collectUploads(v).forEach((u) => uniquePaths.add(u.path)),
        ),
      );
      const urlMap = new Map<string, string>();
      await Promise.all(
        Array.from(uniquePaths).map(async (path) => {
          try {
            const { url } = await sign({ data: { path } });
            urlMap.set(path, url);
          } catch {
            // leave missing — formatCell will fall back to path
          }
        }),
      );

      const formatCell = (val: unknown): string => {
        if (val === null || val === undefined) return "";
        const uploads = collectUploads(val);
        if (uploads.length > 0) {
          return uploads
            .map((u) => `${u.name}: ${urlMap.get(u.path) ?? u.path}`)
            .join("\n");
        }
        if (Array.isArray(val)) return val.join("; ");
        if (typeof val === "object") return JSON.stringify(val);
        return String(val);
      };

      const rows = apps.map((a) => {
        const row: Record<string, string> = {};
        columns.forEach((c) => {
          row[c] = formatCell(cellValue(a, c));
        });
        return row;
      });

      const ws = XLSX.utils.json_to_sheet(rows, { header: [...columns] });
      // Auto width-ish: cap at 60 chars
      ws["!cols"] = columns.map((c) => ({
        wch: Math.min(
          60,
          Math.max(c.length, ...rows.map((r) => (r[c] ? r[c].split("\n")[0].length : 0))) + 2,
        ),
      }));
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Applications");
      XLSX.writeFile(wb, `vennti-applications-${new Date().toISOString().slice(0, 10)}.xlsx`);
    } finally {
      setDownloading(false);
    }
  };

  if (!sessionChecked) return null;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b hairline">
        <div className="max-w-[1600px] mx-auto px-6 md:px-10 h-16 flex items-center justify-between">
          <Link to="/" className="font-display text-xl tracking-tight">
            Vennti
          </Link>
          <div className="flex items-center gap-6 text-[12px] uppercase tracking-[0.18em] text-stone">
            <span className="hidden md:inline">Applications</span>
            <button onClick={onSignOut} className="hover:text-ink transition-colors">
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto px-6 md:px-10 py-12 md:py-16">
        <div className="flex items-end justify-between mb-10 gap-6 flex-wrap">
          <div>
            <div className="text-[11px] uppercase tracking-[0.28em] text-stone mb-3">The inbox</div>
            <h1 className="font-display text-5xl md:text-6xl leading-[1] tracking-[-0.02em]">
              Waitlist <em className="italic">applications</em>.
            </h1>
          </div>
          <div className="flex items-center gap-4">
            {query.data && (
              <div className="font-mono text-[12px] text-stone uppercase tracking-[0.2em]">
                {apps.length} total
              </div>
            )}
            {apps.length > 0 && (
              <button
                onClick={downloadExcel}
                disabled={downloading}
                className="bg-ink text-paper px-5 py-2.5 rounded-full text-[11px] uppercase tracking-[0.2em] hover:bg-ink-soft transition-colors disabled:opacity-50"
              >
                {downloading ? "Preparing…" : "Download Excel"}
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

        {query.data && apps.length === 0 && (
          <p className="py-16 text-stone text-center border-t hairline">No applications yet.</p>
        )}

        {query.data && apps.length > 0 && (
          <div className="border hairline rounded-md overflow-auto max-h-[75vh]">
            <table className="w-full text-sm border-collapse">
              <thead className="sticky top-0 bg-background z-10">
                <tr className="border-b hairline">
                  {columns.map((c) => (
                    <th
                      key={c}
                      className="text-left text-[10px] uppercase tracking-[0.18em] text-stone font-medium px-4 py-3 whitespace-nowrap"
                    >
                      {c.replace(/_/g, " ")}
                    </th>
                  ))}
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {apps.map((app) => (
                  <tr
                    key={app.id}
                    className="border-b hairline hover:bg-foreground/[0.02] transition-colors align-top"
                  >
                    {columns.map((c) => (
                      <td key={c} className="px-4 py-3 max-w-[280px]">
                        <CellRenderer value={cellValue(app, c)} column={c} />
                      </td>
                    ))}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <button
                        onClick={() => setSelected(app)}
                        className="text-[11px] uppercase tracking-[0.18em] underline hover:text-ink-soft"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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

function CellRenderer({ value, column }: { value: unknown; column: string }) {
  if (value === null || value === undefined || value === "") {
    return <span className="text-stone">—</span>;
  }
  const uploads = collectUploads(value);
  if (uploads.length > 0) {
    return (
      <div className="flex flex-col gap-1">
        {uploads.map((u, i) => (
          <UploadLink key={u.path + i} upload={u} />
        ))}
      </div>
    );
  }
  if (column === "created_at" && typeof value === "string") {
    return <span className="whitespace-nowrap text-ink-soft">{new Date(value).toLocaleString()}</span>;
  }
  if (column === "linkedin" || column === "instagram") {
    const s = String(value);
    const href = s.startsWith("http") ? s : column === "instagram" ? `https://instagram.com/${s.replace(/^@/, "")}` : s;
    return (
      <a href={href} target="_blank" rel="noreferrer" className="underline break-all hover:text-ink-soft">
        {s}
      </a>
    );
  }
  if (Array.isArray(value)) {
    return <span className="whitespace-pre-wrap">{value.join(", ")}</span>;
  }
  if (typeof value === "object") {
    return <span className="font-mono text-xs">{JSON.stringify(value)}</span>;
  }
  return <span className="whitespace-pre-wrap break-words">{String(value)}</span>;
}

function UploadLink({ upload }: { upload: UploadValue }) {
  const sign = useServerFn(getUploadSignedUrl);
  const [loading, setLoading] = useState(false);

  const open = async () => {
    setLoading(true);
    try {
      const { url } = await sign({ data: { path: upload.path } });
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={open}
      disabled={loading}
      className="text-left underline hover:text-ink-soft break-all disabled:opacity-50"
      title={upload.path}
    >
      {loading ? "Opening…" : upload.name}
    </button>
  );
}

function DetailDrawer({ app, onClose }: { app: Application; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={onClose} />
      <aside className="relative ml-auto w-full max-w-2xl h-full bg-background border-l hairline overflow-y-auto">
        <div className="sticky top-0 bg-background border-b hairline px-8 py-5 flex items-center justify-between">
          <div className="text-[11px] uppercase tracking-[0.28em] text-stone">Application</div>
          <button onClick={onClose} className="text-stone hover:text-ink text-2xl leading-none">
            ×
          </button>
        </div>
        <div className="p-8">
          <h2 className="font-display text-4xl tracking-tight mb-2">{app.name}</h2>
          <div className="text-stone text-sm mb-8">
            {app.email} · {app.city || "—"} · {app.age ?? "—"} · {app.pronouns || "—"}
          </div>

          <div className="border-t hairline pt-8 space-y-8">
            {Object.entries(app.payload || {}).map(([k, v]) => {
              if (["name", "email", "age", "city", "pronouns", "instagram", "linkedin"].includes(k))
                return null;
              if (isUploadValue(v)) {
                return (
                  <div key={k}>
                    <div className="text-[10px] uppercase tracking-[0.22em] text-stone mb-2">{k}</div>
                    <MediaPreview upload={v} />
                  </div>
                );
              }
              if (Array.isArray(v) && v.every(isUploadValue)) {
                return (
                  <div key={k}>
                    <div className="text-[10px] uppercase tracking-[0.22em] text-stone mb-2">{k}</div>
                    <div className="space-y-4">
                      {v.map((u, i) => (
                        <MediaPreview key={i} upload={u as UploadValue} />
                      ))}
                    </div>
                  </div>
                );
              }
              const display = Array.isArray(v)
                ? v.join(", ")
                : typeof v === "string"
                  ? v
                  : JSON.stringify(v);
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
        <a href={url} target="_blank" rel="noreferrer">
          <img src={url} alt={upload.name} className="max-w-full rounded-md border hairline" />
        </a>
      )}
      {kind === "video" && (
        <video src={url} controls className="max-w-full rounded-md border hairline" />
      )}
      {kind === "audio" && <audio src={url} controls className="w-full" />}
      <div className="flex items-center gap-3 text-xs text-stone">
        <a href={url} target="_blank" rel="noreferrer" className="underline hover:text-ink">
          Open link
        </a>
        <span>·</span>
        <a href={url} download={upload.name} className="underline hover:text-ink">
          Download {upload.name}
        </a>
        <span>·</span>
        <span>{(upload.size / 1024).toFixed(1)} KB</span>
      </div>
    </div>
  );
}
