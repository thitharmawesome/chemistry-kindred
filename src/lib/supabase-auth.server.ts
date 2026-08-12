// Auth middleware that verifies the caller's token against the SAME Supabase
// project the browser client uses (VITE_* values are inlined at build time).
// This avoids "Unauthorized: Invalid token" when the deploy environment's
// server-side SUPABASE_URL points at a different project than the client bundle.
import { createMiddleware } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

function resolveConfig() {
  const url =
    (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_SUPABASE_URL ||
    process.env.SUPABASE_URL;
  const key =
    (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    throw new Error("Supabase is not configured on the server.");
  }
  return { url, key };
}

export const requireAdminAuth = createMiddleware({ type: "function" }).server(async ({ next }) => {
  const { url, key } = resolveConfig();
  const request = getRequest();
  const authHeader = request?.headers?.get("authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    throw new Error("Unauthorized: please sign in again.");
  }
  const token = authHeader.slice("Bearer ".length).trim();
  if (!token) throw new Error("Unauthorized: please sign in again.");

  const supabase = createClient<Database>(url, key, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });

  // getUser validates the token against the auth server directly (works with
  // both legacy HS256 and new asymmetric signing keys).
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user?.id) {
    throw new Error("Unauthorized: session expired, sign in again.");
  }

  return next({
    context: { supabase, userId: data.user.id, claims: { sub: data.user.id } },
  });
});
