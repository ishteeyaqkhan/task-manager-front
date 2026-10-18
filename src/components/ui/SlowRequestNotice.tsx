"use client";

import { useEffect, useState } from "react";
import { Spinner } from "./Spinner";

interface SlowRequestNoticeProps {
  /** How long to wait before showing the notice. */
  delayMs?: number;
}

/**
 * Explains a slow request (e.g. the free Render instance waking up).
 * Mount it only while the request is pending so the timer restarts each time.
 */
export function SlowRequestNotice({ delayMs = 5000 }: SlowRequestNoticeProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(true), delayMs);
    return () => window.clearTimeout(timer);
  }, [delayMs]);

  if (!visible) return null;
  return (
    <div
      role="status"
      className="flex items-start gap-2 rounded-md border border-primary-light bg-primary-subtle p-3 text-sm text-primary-dark"
    >
      <Spinner size="sm" label="" className="mt-0.5" />
      <p>The server is waking up. This can take up to a minute on the first request.</p>
    </div>
  );
}
