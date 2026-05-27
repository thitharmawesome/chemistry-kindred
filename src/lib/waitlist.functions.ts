import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { sendApplicationEmail } from "./email.server";




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
    await sendApplicationEmail({
      name: data.name,
      email: data.email,
      age: data.age,
      city: data.city,
      instagram: data.instagram,
      linkedin: data.linkedin,
      payload: data.payload,
    });
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
  .inputValidator((input: unknown) =>
    z.object({ path: z.string().min(1).max(500) }).parse(input),
  )
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

    const { error } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: userId, role: "admin" });

    if (error) {
      console.error("claimFirstAdmin error", error);
      return { ok: false as const, error: "Could not grant admin." };
    }
    return { ok: true as const };
  });

