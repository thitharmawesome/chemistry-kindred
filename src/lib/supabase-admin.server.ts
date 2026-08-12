// Service-role client pinned to the project in src/lib/supabase-config.ts.
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { SUPABASE_URL } from "@/lib/supabase-config";

function create() {
  const key =
    process.env["VENNTI_SUPABASE_SERVICE_ROLE_KEY"] || process.env["SUPABASE_SERVICE_ROLE_KEY"];
  if (!key) {
    throw new Error("Missing VENNTI_SUPABASE_SERVICE_ROLE_KEY.");
  }
  return createClient<Database>(SUPABASE_URL, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
}

let _client: ReturnType<typeof create> | undefined;

export const supabaseAdmin = new Proxy({} as ReturnType<typeof create>, {
  get(_, prop, receiver) {
    if (!_client) _client = create();
    return Reflect.get(_client, prop, receiver);
  },
});
