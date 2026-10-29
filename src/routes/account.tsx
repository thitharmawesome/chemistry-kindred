import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const searchSchema = z.object({
  mode: z.enum(["signin", "signup"]).optional(),
  email: z.string().optional(),
});

export const Route = createFileRoute("/account")({
  validateSearch: (s) => searchSchema.parse(s),
  head: () => ({
    meta: [
      { title: "Sign in or create an account — Vennti" },
      { name: "description", content: "Sign in to Vennti to book a call, share your preferences and see upcoming events." },
      { property: "og:title", content: "Sign in or create an account — Vennti" },
      { property: "og:description", content: "Sign in to Vennti to book a call, share your preferences and see upcoming events." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AccountPage,
});

function AccountPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">(search.mode ?? "signin");
  const [email, setEmail] = useState(search.email ?? "");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/member", replace: true });
    });
  }, [navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/member` },
        });
        if (error) throw error;
        if (!data.session) {
          setCheckEmail(true);
          return;
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      navigate({ to: "/member" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <Link to="/" className="font-display text-3xl tracking-tight inline-block mb-10">
          Vennti
        </Link>
        {checkEmail ? (
          <>
            <h1 className="font-display text-5xl leading-[1] tracking-[-0.02em] mb-6">Check your email.</h1>
            <p className="text-ink-soft font-light text-lg leading-[1.55]">
              We sent a link to <span className="text-foreground">{email}</span>. Click it to confirm your
              account and you'll be brought right back here.
            </p>
          </>
        ) : (
          <>
            <div className="text-[11px] uppercase tracking-[0.28em] text-stone mb-4">Members</div>
            <h1 className="font-display text-5xl leading-[1] tracking-[-0.02em] mb-10">
              {mode === "signin" ? "Welcome back." : <>Create your <em className="italic">account.</em></>}
            </h1>
            <form onSubmit={onSubmit} className="space-y-8">
              <div>
                <label className="block text-[11px] uppercase tracking-[0.22em] text-stone mb-3">Email</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" placeholder="you@domain.com" />
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-[0.22em] text-stone mb-3">Password</label>
                <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" placeholder="At least 8 characters" />
              </div>
              <button type="submit" disabled={busy} className="w-full bg-ink text-paper px-7 py-4 rounded-full text-[12px] uppercase tracking-[0.2em] hover:bg-ink-soft transition-colors disabled:opacity-60">
                {busy ? "Please wait…" : mode === "signin" ? "Sign in →" : "Create account →"}
              </button>
            </form>
            <button onClick={() => setMode(mode === "signin" ? "signup" : "signin")} className="mt-8 text-[12px] uppercase tracking-[0.2em] text-stone hover:text-ink transition-colors">
              {mode === "signin" ? "New here? Create an account →" : "Have an account? Sign in →"}
            </button>
          </>
        )}
      </div>
    </main>
  );
}
