"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FormError } from "@/components/ui/FormError";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { useLogin } from "@/hooks/useAuth";
import { ApiError } from "@/lib/api";
import { compactErrors, validateEmail, validateRequired } from "@/lib/validation";

type Fields = "email" | "password";

export default function LoginPage() {
  const login = useLogin();
  const next = useSearchParams().get("next");
  const [values, setValues] = useState<Record<Fields, string>>({ email: "", password: "" });
  const [errors, setErrors] = useState<Partial<Record<Fields, string>>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const update = (field: Fields, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setFormError(null);
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validation = compactErrors({
      email: validateEmail(values.email),
      password: validateRequired(values.password, "Password"),
    });
    setErrors(validation);
    setFormError(null);
    if (Object.keys(validation).length > 0) return;

    login.mutate(
      { email: values.email.trim(), password: values.password },
      {
        onError: (error) => {
          if (error instanceof ApiError && error.status === 400) {
            setErrors(error.fieldErrors);
          } else {
            setFormError(error.message);
          }
        },
      },
    );
  };

  return (
    <Card padding="lg" shadow>
      <h1 className="text-2xl font-semibold">Log in</h1>
      <p className="mt-1 text-sm text-text-secondary">Welcome back. Log in to manage your tasks.</p>

      <form onSubmit={onSubmit} noValidate className="mt-6 grid gap-4">
        <FormError message={formError} />
        <Input
          label="Email"
          type="email"
          name="email"
          autoComplete="email"
          value={values.email}
          onChange={(event) => update("email", event.target.value)}
          error={errors.email}
          required
        />
        <PasswordInput
          label="Password"
          name="password"
          autoComplete="current-password"
          value={values.password}
          onChange={(event) => update("password", event.target.value)}
          error={errors.password}
          required
        />
        <Button type="submit" loading={login.isPending} className="mt-2 w-full">
          Log in
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-text-secondary">
        New here?{" "}
        <Link
          href={next ? `/register?next=${encodeURIComponent(next)}` : "/register"}
          className="font-medium text-primary hover:text-primary-hover hover:underline rounded-sm focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          Create an account
        </Link>
      </p>
    </Card>
  );
}
