"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileSchema, type ProfileFormValues } from "@/lib/validations/profile";
import { updateProfile } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

type ProfileRow = Record<string, string | number | null>;

// Kolom nullable di database (semua kecuali `name`) bisa datang sebagai
// `null` dari Supabase kalau belum pernah diisi. Zod schema kita cuma
// terima `string | undefined`, bukan `null` — jadi perlu dibersihkan
// dulu sebelum dikasih ke react-hook-form, kalau tidak field yang masih
// kosong bikin validasi gagal walau yang diedit cuma field lain.
function sanitizeDefaultValues(row: ProfileRow): ProfileFormValues {
  const clean: Record<string, string> = {};
  for (const [key, value] of Object.entries(row)) {
    if (key === "id" || key === "created_at" || key === "updated_at") continue;
    clean[key] = value === null || value === undefined ? "" : String(value);
  }
  return clean as ProfileFormValues;
}

export function ProfileForm({ defaultValues }: { defaultValues: ProfileRow }) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: sanitizeDefaultValues(defaultValues),
  });

  async function onSubmit(values: ProfileFormValues) {
    setSaving(true);
    setSaved(false);

    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      formData.set(key, value ?? "");
    });

    const result = await updateProfile(formData);
    setSaving(false);

    if (result.success) {
      setSaved(true);
    }
  }

  const Field = ({
    name,
    label,
    textarea = false,
  }: {
    name: keyof ProfileFormValues;
    label: string;
    textarea?: boolean;
  }) => (
    <div className="space-y-1.5">
      <Label htmlFor={name}>{label}</Label>
      {textarea ? (
        <Textarea id={name} {...register(name)} rows={4} />
      ) : (
        <Input id={name} {...register(name)} />
      )}
      {errors[name] && (
        <p className="text-xs text-destructive">{errors[name]?.message}</p>
      )}
    </div>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <section className="space-y-4">
        <h2 className="font-mono text-xs uppercase text-ink-soft">Hero</h2>
        <Field name="name" label="Nama" />
        <Field name="tagline" label="Tagline (di bawah nama)" />
        <Field name="role" label="Role (contoh: Web Developer)" />
        <Field name="hero_photo_url" label="Link foto hero (Google Drive)" />
      </section>

      <section className="space-y-4">
        <h2 className="font-mono text-xs uppercase text-ink-soft">About</h2>
        <Field name="about_bio" label="Bio" textarea />
        <Field name="about_photo_url" label="Link foto (Google Drive)" />
        <Field name="location" label="Lokasi" />
        <Field name="availability" label="Status (contoh: Open to work)" />
      </section>

      <section className="space-y-4">
        <h2 className="font-mono text-xs uppercase text-ink-soft">Contact</h2>
        <Field name="contact_intro" label="Intro singkat" textarea />
        <Field name="contact_email" label="Email" />
        <Field name="github_url" label="GitHub URL" />
        <Field name="linkedin_url" label="LinkedIn URL" />
        <Field name="dribbble_url" label="Dribbble URL" />
        <Field name="cv_url" label="Link CV (Google Drive)" />
      </section>

      <section className="space-y-4">
        <h2 className="font-mono text-xs uppercase text-ink-soft">SEO</h2>
        <Field name="site_title" label="Site title default" />
        <Field name="meta_description" label="Meta description default" textarea />
      </section>

      <div className="flex items-center gap-3 border-t border-line pt-6">
        <Button type="submit" disabled={saving}>
          {saving ? "Menyimpan..." : "Simpan"}
        </Button>
        {saved && (
          <span className="text-sm text-emerald-600">Tersimpan ✓</span>
        )}
      </div>
    </form>
  );
}