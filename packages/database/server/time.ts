export function generateTimestamp() {
  return new Date()
    .toISOString()
    .replace(/[-:.]/g, "")
    .replace(/\//g, "_")
    .substring(0, 20);
}
