import { createMimeMessage } from "mimetext";
// @ts-ignore - cloudflare:workers provides bindings at runtime
import { env as cfEnv } from "cloudflare:workers";
// @ts-ignore - cloudflare:email is provided by the Workers runtime
import { EmailMessage } from "cloudflare:email";

export async function sendApplicationEmail(data: {
  name: string;
  email: string;
  age: number | null | undefined;
  city: string | null | undefined;
  instagram: string | null | undefined;
  linkedin: string | null | undefined;
  payload: Record<string, unknown>;
}) {
  try {
    const msg = createMimeMessage();
    msg.setSender({ name: "Vennti", addr: "applications@vennti.co" });
    msg.setRecipient("reema@vennti.co");
    msg.setSubject(`New application — ${data.name}`);
    msg.addMessage({
      contentType: "text/plain",
      data: `New application from ${data.name}\n\nEmail: ${data.email}\nAge: ${data.age ?? "—"}\nCity: ${data.city ?? "—"}\nInstagram: ${data.instagram ?? "—"}\nLinkedIn: ${data.linkedin ?? "—"}\n\nPayload:\n${JSON.stringify(data.payload, null, 2)}`,
    });
    const message = new EmailMessage(
      "applications@vennti.co",
      "reema@vennti.co",
      msg.asRaw(),
    );
    await (cfEnv as any).SEND_EMAIL.send(message);
  } catch (e) {
    console.error("Email send failed:", e);
  }
}
