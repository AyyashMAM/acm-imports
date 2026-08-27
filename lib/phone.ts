// Normalizes a Sri Lankan phone number (as customers type it: 0771234567,
// +94771234567, or 94771234567) into Notify.lk's required 9471XXXXXXX form.
export function toNotifyLkFormat(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("94")) return digits;
  if (digits.startsWith("0")) return `94${digits.slice(1)}`;
  return `94${digits}`;
}
