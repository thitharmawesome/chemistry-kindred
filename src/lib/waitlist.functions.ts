import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getCloudflareContext } from "@cloudflare/vite-plugin";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

function buildPlainTextEmail(data: {
  name: string;
  email: string;
  age: number | null | undefined;
  city: string | null | undefined;
  instagram: string | null | undefined;
  linkedin: string | null | undefined;
  payload: Record<string, unknown>;
}): string {
  const lines = [
    "New application from " + data.name,
    "",
    "Name: " + data.name,
    "Email: " + data.email,
    "Age: " + (data.age ?? "—"),
    "City: " + (data.city ?? "—"),
    "Instagram: " + (data.instagram ?? "—"),
    "",
  ];
  for (const [k, v] of Object.entries(data.payload)) {
    if (["name", "email", "age", "city", "instagram", "linkedin", "pronouns"].includes(k)) continue;
    const display = Array.isArray(v) ? v.join(", ") : String(v ?? "");
    if (display) lines.push(k + ": " + display);
  }
  return lines.join("\n");
}

async function sendApplicationEmail(data: {
  name: string;
  email: string;
  age: number | null | undefined;
  city: string | null | undefined;
  instagram: string | null | undefined;
  linkedin: string | null | undefined;
  payload: Record<string, unknown>;
}) {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const emailBinding = (env as Record<string, unknown>).SEND_EMAIL;
    if (!emailBinding) {
      console.log("SEND_EMAIL binding not available");
      return;
    }
    const subject = "New application — " + data.name;
    const body = buildPlainTextEmail(data);
    const raw = [
      "From: Vennti <applications@vennti.co>",
      "To: reema@vennti.co",
      "Subject: " + subject,
      "MIME-Version: 1.0",
      "Content-Type: text/plain; charset=utf-8",
      "",
      body,
    ].join("\r\n");
    const EmailMsg = (globalThis as any).EmailMessage;
    const message = new EmailMsg("applications@vennti.co", "reema@vennti.co", raw);
    await (emailBinding as { send: (m: unknown) => Promise<void> }).send(message);
  } catch (e) {
    console.error("Email send failed:", e);
  }
}

const submitSchema = z.object({
  name: z.string().trim().min(1).max(200),
  age: z.coerce.number().int().min(13).max(120).optional().nullable(),
  city: z.string().trim().max(200).optional().nullable(),
  email: z.string().trim().email().max(320),
  pronouns: z.string().trim().max(80).optional().nullable(),
  instagram: z.string().trim().max(120).optional().nullable(),
  linkedin: z.string().trim().max(300).optional().nullable(),
  payload: z.record(z.string(), z.any()).default({}),
});

export const submitApplication = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => submitSchema.parse(input))
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin.from("waitlist_applications").insert({
      name: data.name,
      age: data.age ?? null,
      city: data.city ?? null,
      email: data.email,
      pronouns: data.pronouns ?? null,
      instagram: data.instagram ?? null,
      linkedin: data.linkedin ?? null,
      payload: data.payload,
    });
    if (error) {
      console.error("submitApplication error", error);
      return { ok: false as const, error: "Could not save application." };
    }
    await sendApplicationEmail(data);
    return { ok: true as const };
  });

export const listApplications = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;
    const { data: roleRow } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    if (!roleRow) {
      throw new Error("Forbidden: admin access required.");
    }
    const { data, error } = await supabaseAdmin
      .from("waitlist_applications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) {
      console.error("listApplications error", error);
      throw new Error("Could not load applications.");
    }
    return { applications: data ?? [] };
  });

export const getUploadSignedUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ path: z.string().min(1).max(500) }).parse(input))
  .handler(async ({ context, data }) => {
    const { userId } = context;
    const { data: roleRow } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    if (!roleRow) throw new Error("Forbidden: admin access required.");
    const { data: signed, error } = await supabaseAdmin.storage
      .from("waitlist-uploads")
      .createSignedUrl(data.path, 60 * 60);
    if (error || !signed) throw new Error("Could not sign URL.");
    return { url: signed.signedUrl };
  });

export const claimFirstAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;
    const { count, error: countError } = await supabaseAdmin
      .from("user_roles")
      .select("id", { count: "exact", head: true })
      .eq("role", "admin");
    if (countError) throw new Error("Could not check admin status.");
    if ((count ?? 0) > 0) {
      return { ok: false as const, error: "Admin already claimed." };
    }
    const { error } = await supabaseAdmin.from("user_roles").insert({ user_id: userId, role: "admin" });
    if (error) {
      console.error("claimFirstAdmin error", error);
      return { ok: false as const, error: "Could not grant admin." };
    }
    return { ok: true as const };
  });
