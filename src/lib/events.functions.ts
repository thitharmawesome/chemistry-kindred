import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase-admin.server";
import { requireAdminAuth as requireAuth } from "@/lib/supabase-auth.server";

// The setup script adds these tables; types.ts doesn't know them yet.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = () => supabaseAdmin as any;

export type PublicEvent = { id: string; starts_at: string };
export type FullEvent = {
  id: string;
  title: string;
  starts_at: string;
  venue_name: string | null;
  venue_address: string | null;
  details: string | null;
  price: string | null;
  ticket_url: string | null;
  published: boolean;
};

async function upcomingPublished(cols: string) {
  const { data, error } = await db()
    .from("events")
    .select(cols)
    .eq("published", true)
    .gte("starts_at", new Date().toISOString())
    .order("starts_at", { ascending: true });
  if (error) {
    console.error("events read error", error);
    return [];
  }
  return data ?? [];
}

async function assertAdmin(userId: string) {
  const { data } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (!data) throw new Error("Forbidden: admin access required.");
}

// Public: date and time only.
export const listPublicEvents = createServerFn({ method: "GET" }).handler(async () => {
  const events = (await upcomingPublished("id, starts_at")) as PublicEvent[];
  return { events };
});

// Signed-in member: full details only once screened.
export const listMemberEvents = createServerFn({ method: "GET" })
  .middleware([requireAuth])
  .handler(async ({ context }) => {
    const { data: u } = await supabaseAdmin.auth.admin.getUserById(context.userId);
    const email = (u?.user?.email ?? "").toLowerCase();
    const { data: s } = email
      ? await db().from("screened_members").select("email").eq("email", email).maybeSingle()
      : { data: null };
    const screened = Boolean(s);
    if (!screened) {
      return { screened, events: (await upcomingPublished("id, starts_at")) as FullEvent[] };
    }
    return {
      screened,
      events: (await upcomingPublished(
        "id, title, starts_at, venue_name, venue_address, details, price, ticket_url, published",
      )) as FullEvent[],
    };
  });

// ---------- Admin ----------
export const adminListEvents = createServerFn({ method: "GET" })
  .middleware([requireAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const [ev, sc] = await Promise.all([
      db().from("events").select("*").order("starts_at", { ascending: false }),
      db().from("screened_members").select("*").order("created_at", { ascending: false }),
    ]);
    if (ev.error || sc.error) {
      console.error(ev.error ?? sc.error);
      throw new Error("Events aren't set up yet. Run the setup script first.");
    }
    return { events: ev.data as FullEvent[], screened: sc.data as { email: string; source: string; created_at: string }[] };
  });

const eventSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().trim().min(1).max(200),
  starts_at: z.string().min(1),
  venue_name: z.string().trim().max(200).nullable().optional(),
  venue_address: z.string().trim().max(300).nullable().optional(),
  details: z.string().trim().max(4000).nullable().optional(),
  price: z.string().trim().max(100).nullable().optional(),
  ticket_url: z.string().trim().url().max(500).nullable().optional().or(z.literal("")),
  published: z.boolean().default(true),
});

export const adminSaveEvent = createServerFn({ method: "POST" })
  .middleware([requireAuth])
  .inputValidator((i: unknown) => eventSchema.parse(i))
  .handler(async ({ context, data }) => {
    await assertAdmin(context.userId);
    const row = { ...data, ticket_url: data.ticket_url || null, starts_at: new Date(data.starts_at).toISOString() };
    const { id, ...rest } = row;
    const res = id ? await db().from("events").update(rest).eq("id", id) : await db().from("events").insert(rest);
    if (res.error) {
      console.error(res.error);
      throw new Error("Could not save event.");
    }
    return { ok: true };
  });

export const adminDeleteEvent = createServerFn({ method: "POST" })
  .middleware([requireAuth])
  .inputValidator((i: unknown) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ context, data }) => {
    await assertAdmin(context.userId);
    const { error } = await db().from("events").delete().eq("id", data.id);
    if (error) throw new Error("Could not delete event.");
    return { ok: true };
  });

export const adminSetScreened = createServerFn({ method: "POST" })
  .middleware([requireAuth])
  .inputValidator((i: unknown) =>
    z.object({ email: z.string().trim().email(), source: z.enum(["call", "preferences"]), screened: z.boolean() }).parse(i),
  )
  .handler(async ({ context, data }) => {
    await assertAdmin(context.userId);
    const email = data.email.toLowerCase();
    const res = data.screened
      ? await db().from("screened_members").upsert({ email, source: data.source })
      : await db().from("screened_members").delete().eq("email", email);
    if (res.error) throw new Error("Could not update screening.");
    return { ok: true };
  });
