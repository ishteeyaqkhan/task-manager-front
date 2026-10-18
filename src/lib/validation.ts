// Client-side rules mirroring the backend Zod schemas. Each returns an error message or undefined.

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(value: string): string | undefined {
  const email = value.trim();
  if (!email) return "Email is required";
  if (!EMAIL_PATTERN.test(email)) return "Enter a valid email address";
  return undefined;
}

export function validateNewPassword(value: string): string | undefined {
  if (!value) return "Password is required";
  if (value.length < 8) return "Password must be at least 8 characters";
  if (value.length > 72) return "Password must be at most 72 characters";
  return undefined;
}

export function validateRequired(value: string, label: string): string | undefined {
  return value ? undefined : `${label} is required`;
}

export function validateText(value: string, label: string, { min = 0, max }: { min?: number; max: number }) {
  const text = value.trim();
  if (min > 0 && text.length < min) return `${label} is required`;
  if (text.length > max) return `${label} must be at most ${max} characters`;
  return undefined;
}

/** Drops undefined entries so `Object.keys(errors).length` reflects real errors. */
export function compactErrors<T extends Record<string, string | undefined>>(errors: T): Partial<Record<keyof T, string>> {
  return Object.fromEntries(Object.entries(errors).filter(([, message]) => message)) as Partial<Record<keyof T, string>>;
}

/** Only allow same-origin relative paths as post-login redirects. */
export function safeRedirectPath(value: string | null, fallback = "/projects"): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return fallback;
  return value;
}
