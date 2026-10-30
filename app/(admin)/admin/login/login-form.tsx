"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { useFormStatus } from "react-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { login, type LoginActionState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? "Signing in..." : "Sign in"}
    </Button>
  );
}

export function LoginForm() {
  const [state, formAction] = useActionState<LoginActionState, FormData>(
    login,
    null,
  );

  // Kegagalan login dari server tampil sebagai notifikasi sonner.
  useEffect(() => {
    if (state?.error) toast.error(state.error);
  }, [state]);

  // React Hook Form di sini HANYA dipakai untuk validasi inline saat blur
  // (UX cepat sebelum submit) — register() dipasang ke input biasa, tapi
  // submit form-nya murni lewat native `action` (Server Action), TIDAK
  // lewat handleSubmit(). Kalau handleSubmit dipasang ke onSubmit, RHF
  // otomatis memanggil preventDefault() dan itu mem-block Server Action
  // sama sekali — makanya tombol terasa "tidak ada reaksi".
  const {
    register,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
  });

  return (
    <form action={formAction} className="mt-6 space-y-4" noValidate>
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          {...register("email")}
        />
        {errors.email && (
          <p className="text-xs text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          {...register("password")}
        />
        {errors.password && (
          <p className="text-xs text-destructive">{errors.password.message}</p>
        )}
      </div>

      <SubmitButton />
    </form>
  );
}