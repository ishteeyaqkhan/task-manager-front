"use client";

import { UserPlus } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ApiError } from "@/lib/api";
import { validateEmail } from "@/lib/validation";

interface AddMemberFormProps {
  onAdd: (email: string) => Promise<unknown>;
  loading: boolean;
}

/** Adds an already-registered user to the project by email. */
export function AddMemberForm({ onAdd, loading }: AddMemberFormProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | undefined>();

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validation = validateEmail(email);
    setError(validation);
    if (validation) return;

    try {
      await onAdd(email.trim());
      setEmail("");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.fieldErrors.email ?? err.message);
      } else {
        setError("Something went wrong");
      }
    }
  };

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-3 sm:flex-row sm:items-start">
      <Input
        label="Add a member by email"
        type="email"
        autoComplete="off"
        placeholder="teammate@example.com"
        value={email}
        onChange={(event) => {
          setEmail(event.target.value);
          setError(undefined);
        }}
        error={error}
        hint="They need an account already. New members join with the Member role."
        containerClassName="flex-1"
      />
      <Button type="submit" loading={loading} className="sm:mt-6.5">
        <UserPlus className="size-4" aria-hidden="true" />
        Add member
      </Button>
    </form>
  );
}
