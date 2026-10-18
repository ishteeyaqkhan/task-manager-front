"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FormError } from "@/components/ui/FormError";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { SlowRequestNotice } from "@/components/ui/SlowRequestNotice";
import { useRegister } from "@/hooks/useAuth";
import { ApiError } from "@/lib/api";
import { compactErrors, validateEmail, validateNewPassword, validateText } from "@/lib/validation";

type Fields = "name" | "email" | "password";

export default function RegisterPage() {
  const register = useRegister();
  const next = useSearchParams().get("next");
  const [values, setValues] = useState<Record<Fields, string>>({ name: "", email: "", password: "" });
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
      name: validateText(values.name, "Name", { min: 1, max: 100 }),
      email: validateEmail(values.email),
      password: validateNewPassword(values.password),
    });
    setErrors(validation);
    setFormError(null);
    if (Object.keys(validation).length > 0) return;

    register.mutate(
      { name: values.name.trim(), email: values.email.trim(), password: values.password },
      {
        onError: (error) => {
          if (error instanceof ApiError && error.status === 409) {
            setErrors({ email: error.message });
          } else if (error instanceof ApiError && error.status === 400) {
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
      <h1 className="text-2xl font-semibold">Create your account</h1>
      <p className="mt-1 text-sm text-text-secondary">You&apos;ll get a Personal project to start with.</p>

      <form onSubmit={onSubmit} noValidate className="mt-6">
        <fieldset disabled={register.isPending} className="grid min-w-0 gap-4">
          <FormError message={formError} />
          {register.isPending && <SlowRequestNotice />}
          <Input
            label="Name"
            name="name"
            autoComplete="name"
            value={values.name}
            onChange={(event) => update("name", event.target.value)}
            error={errors.name}
            maxLength={100}
            required
          />
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
            autoComplete="new-password"
            value={values.password}
            onChange={(event) => update("password", event.target.value)}
            error={errors.password}
            hint="At least 8 characters."
            required
          />
          <Button type="submit" loading={register.isPending} className="mt-2 w-full">
            {register.isPending ? "Creating account…" : "Create account"}
          </Button>
        </fieldset>
      </form>

      <p className="mt-6 text-center text-sm text-text-secondary">
        Already have an account?{" "}
        <Link
          href={next ? `/login?next=${encodeURIComponent(next)}` : "/login"}
          className="font-medium text-primary hover:text-primary-hover hover:underline rounded-sm focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          Log in
        </Link>
      </p>
    </Card>
  );
}
