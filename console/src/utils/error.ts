export function parseErrorDetail(error: unknown): Record<string, any> | null {
  if (!(error instanceof Error)) return null;
  const msg = error.message;
  const idx = msg.indexOf(" - ");
  if (idx !== -1) {
    try {
      const parsed = JSON.parse(msg.slice(idx + 3));
      return parsed?.detail || parsed;
    } catch {
      // fall through
    }
  }
  try {
    const parsed = JSON.parse(msg);
    if (typeof parsed === "object" && parsed !== null) {
      return parsed?.detail || parsed;
    }
  } catch {
    // not JSON
  }
  return null;
}
