import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [{ title: "Admin — Sway" }, { name: "robots", content: "noindex" }],
    links: [
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Work+Sans:wght@300;400;500;600&display=swap",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/admin` },
        });
        if (error) throw error;
        toast.success("Account created. Signing you in…");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      navigate({ to: "/admin" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Authentication failed.";
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <Link to="/" className="font-display text-3xl tracking-tight inline-block mb-10">
          Sway
        </Link>
        <div className="text-[11px] uppercase tracking-[0.28em] text-stone mb-4">Admin access</div>
        <h1 className="font-display text-5xl leading-[1] tracking-[-0.02em] mb-10">
          {mode === "signin" ? "Sign in." : "Create admin."}
        </h1>

        <form onSubmit={onSubmit} className="space-y-8">
          <div>
            <label className="block text-[11px] uppercase tracking-[0.22em] text-stone mb-3">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="you@domain.com"
            />
          </div>
          <div>
            <label className="block text-[11px] uppercase tracking-[0.22em] text-stone mb-3">Password</label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              placeholder="At least 8 characters"
            />
          </div>
          <button
            type="submit"
            disabled={busy}
            className="w-full bg-ink text-paper px-7 py-4 rounded-full text-[12px] uppercase tracking-[0.2em] hover:bg-ink-soft transition-colors disabled:opacity-60"
          >
            {busy ? "Please wait…" : mode === "signin" ? "Sign in →" : "Create account →"}
          </button>
        </form>

        <button
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="mt-8 text-[12px] uppercase tracking-[0.2em] text-stone hover:text-ink transition-colors"
        >
          {mode === "signin" ? "Need an account? Create one →" : "Have an account? Sign in →"}
        </button>
      </div>
    </main>
  );
}
