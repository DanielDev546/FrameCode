import { Resend } from "resend";
import { RESEND_API_KEY } from "$env/static/private";

const resend = new Resend(RESEND_API_KEY);

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  return resend.emails.send({
    from: "FrameCode <onboarding@resend.dev>",
    to,
    subject,
    html,
  });
}
