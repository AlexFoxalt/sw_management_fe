export function formatDateTime(isoString) {
  if (!isoString) return "";
  try {
    const d = new Date(isoString);
    if (isNaN(d)) return isoString;
    return d.toLocaleString();
  } catch (_) {
    return isoString;
  }
}

export function classNames(...parts) {
  return parts.filter(Boolean).join(" ");
}
