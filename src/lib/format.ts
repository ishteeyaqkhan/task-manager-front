const DAY_MS = 24 * 60 * 60 * 1000;

const shortDate = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
const shortDateWithYear = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

/** Due dates are calendar dates stored at UTC midnight; read them as UTC. */
function utcDay(date: Date): number {
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

function localToday(now: Date): number {
  return Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
}

export type DueState = "overdue" | "soon" | "normal";

/** overdue: before today; soon: today through 2 days from now; otherwise normal. */
export function getDueState(dueDate: string, now: Date = new Date()): DueState {
  const daysLeft = Math.round((utcDay(new Date(dueDate)) - localToday(now)) / DAY_MS);
  if (daysLeft < 0) return "overdue";
  if (daysLeft <= 2) return "soon";
  return "normal";
}

export function formatDueDate(dueDate: string, now: Date = new Date()): string {
  const date = new Date(dueDate);
  return date.getUTCFullYear() === now.getFullYear() ? shortDate.format(date) : shortDateWithYear.format(date);
}

/** Value for <input type="date"> from an ISO date string. */
export function toDateInputValue(dueDate: string | null): string {
  return dueDate ? dueDate.slice(0, 10) : "";
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase() || "?";
}
