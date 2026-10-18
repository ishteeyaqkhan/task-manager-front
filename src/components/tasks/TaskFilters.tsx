"use client";

import { Search, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Spinner } from "@/components/ui/Spinner";
import { PRIORITIES, PRIORITY_LABELS, type Member, type Priority } from "@/types";

const SEARCH_DEBOUNCE_MS = 300;
const priorityOptions = PRIORITIES.map((value) => ({ value, label: PRIORITY_LABELS[value] }));

interface TaskFiltersProps {
  search: string;
  priority: Priority | undefined;
  assigneeId: string | undefined;
  /** Project members, for the assignee filter. */
  members: Member[];
  /** True when members failed to load; disables the assignee filter. */
  membersUnavailable?: boolean;
  /** Shows a small spinner while a new filter result loads. */
  updating?: boolean;
}

/** Search (debounced), priority and assignee filters, stored in the URL query string. */
export function TaskFilters({
  search,
  priority,
  assigneeId,
  members,
  membersUnavailable = false,
  updating = false,
}: TaskFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [searchInput, setSearchInput] = useState(search);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  // Reads the live URL so a pending debounced search never overwrites a newer priority change.
  const setParams = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(window.location.search);
    for (const [key, value] of Object.entries(updates)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const onSearchChange = (value: string) => {
    setSearchInput(value);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setParams({ search: value.trim() || undefined }), SEARCH_DEBOUNCE_MS);
  };

  const clear = () => {
    window.clearTimeout(timer.current);
    setSearchInput("");
    setParams({ search: undefined, priority: undefined, assigneeId: undefined });
  };

  const hasFilters = Boolean(search || priority || assigneeId || searchInput);
  const assigneeOptions = members.map((member) => ({ value: member.userId, label: member.user.name }));

  return (
    <div role="search" className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
      <div className="relative sm:w-72">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 z-10 size-4 -translate-y-1/2 text-text-secondary"
          aria-hidden="true"
        />
        <Input
          type="search"
          aria-label="Search tasks by title"
          placeholder="Search tasks..."
          value={searchInput}
          onChange={(event) => onSearchChange(event.target.value)}
          className="pl-9"
          maxLength={200}
        />
      </div>
      <Select
        aria-label="Filter by priority"
        placeholder="All priorities"
        options={priorityOptions}
        value={priority ?? ""}
        onChange={(event) => setParams({ priority: event.target.value || undefined })}
        containerClassName="sm:w-44"
      />
      <Select
        aria-label="Filter by assignee"
        placeholder={membersUnavailable ? "Assignees unavailable" : "All assignees"}
        disabled={membersUnavailable}
        options={assigneeOptions}
        value={assigneeId ?? ""}
        onChange={(event) => setParams({ assigneeId: event.target.value || undefined })}
        containerClassName="sm:w-48"
      />
      {(hasFilters || updating) && (
        <div className="flex h-10 items-center gap-2">
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clear}>
              <X className="size-4" aria-hidden="true" />
              Clear filters
            </Button>
          )}
          {updating && <Spinner size="sm" className="text-primary" label="Updating results" />}
        </div>
      )}
    </div>
  );
}
