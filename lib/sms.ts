import "server-only";
import { toNotifyLkFormat } from "@/lib/phone";

// Fire-and-forget SMS via Notify.lk (https://developer.notify.lk). Never
// throws — an SMS failure must never block an order or any other flow that
// triggers it; failures are logged for the admin to notice separately.
export async function sendSms(to: string, message: string): Promise<void> {
  const userId = process.env.NOTIFY_LK_USER_ID;
  const apiKey = process.env.NOTIFY_LK_API_KEY;
  if (!userId || !apiKey) return;

  const senderId = process.env.NOTIFY_LK_SENDER_ID || "NotifyDEMO";

  try {
    const url = new URL("https://app.notify.lk/api/v1/send");
    url.searchParams.set("user_id", userId);
    url.searchParams.set("api_key", apiKey);
    url.searchParams.set("sender_id", senderId);
    url.searchParams.set("to", toNotifyLkFormat(to));
    url.searchParams.set("message", message);

    const response = await fetch(url.toString());
    const data = await response.json().catch(() => null);
    if (!response.ok || data?.status !== "success") {
      console.error("Notify.lk SMS failed:", response.status, data);
    }
  } catch (error) {
    console.error("Notify.lk SMS request failed:", error);
  }
}
