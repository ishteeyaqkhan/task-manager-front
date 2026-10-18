const TOKEN_KEY = "tm_token";

const listeners = new Set<() => void>();

function notify() {
  for (const listener of listeners) listener();
}

// localStorage can throw (private mode, blocked storage), so every access is guarded.

export function getToken(): string | null {
  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string) {
  try {
    window.localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // Storage unavailable: the session will not persist across reloads.
  }
  notify();
}

export function clearToken() {
  try {
    window.localStorage.removeItem(TOKEN_KEY);
  } catch {
    // Nothing to clear.
  }
  notify();
}

/** Subscribe to token changes in this tab and in other tabs. For useSyncExternalStore. */
export function subscribeToken(listener: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === TOKEN_KEY || event.key === null) listener();
  };
  listeners.add(listener);
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}
