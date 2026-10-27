// Turns "0801 234 5678", "+234 801 234 5678" or "2348012345678" into
// "2348012345678", the form WhatsApp links need. Returns null if it isn't a
// valid Nigerian mobile number.
export function toWhatsAppNumber(input: string): string | null {
  const digits = input.replace(/[\s\-()+]/g, "");
  if (/^0\d{10}$/.test(digits)) return "234" + digits.slice(1);
  if (/^234\d{10}$/.test(digits)) return digits;
  return null;
}

export function whatsappLink(number: string, message: string) {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}