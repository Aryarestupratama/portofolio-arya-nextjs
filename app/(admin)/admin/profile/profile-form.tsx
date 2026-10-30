"use client";

import { useState } from "react";
import { useForm, useWatch, type UseFormRegister, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { profileSchema, type ProfileFormValues } from "@/lib/validations/profile";
import { toDirectImageUrl } from "@/lib/utils/gdrive";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FormActionBar, FormSection } from "@/components/admin/form";
import { useUnsavedChanges } from "@/components/admin/unsaved-changes";
import { updateProfile } from "./actions";

type ProfileRow = Record<string, string | number | null>;

// Kolom nullable di database datang sebagai `null`; schema Zod hanya menerima
// string, jadi dibersihkan dulu sebelum masuk react-hook-form.
function sanitizeDefaultValues(row: ProfileRow): ProfileFormValues {
  const clean: Record<string, string> = {};
  for (const [key, value] of Object.entries(row)) {
    if (key === "id" || key === "created_at" || key === "updated_at") continue;
    clean[key] = value === null || value === undefined ? "" : String(value);
  }
  return clean as ProfileFormValues;
}

type Name = keyof ProfileFormValues;

function RhfField({
  name,
  label,
  hint,
  textarea = false,
  rows = 4,
  placeholder,
  register,
  errors,
}: {
  name: Name;
  label: string;
  hint?: React.ReactNode;
  textarea?: boolean;
  rows?: number;
  placeholder?: string;
  register: UseFormRegister<ProfileFormValues>;
  errors: FieldErrors<ProfileFormValues>;
}) {
  return (
    <Field label={label} htmlFor={name} hint={hint} error={errors[name]?.message as string | undefined} required={name === "name"}>
      {textarea ? (
        <Textarea id={name} rows={rows} placeholder={placeholder} {...register(name)} />
      ) : (
        <Input id={name} placeholder={placeholder} {...register(name)} />
      )}
    </Field>
  );
}

function PhotoPreview({ url }: { url?: string }) {
  const src = toDirectImageUrl(url);
  const [failed, setFailed] = useState<string | null>(null);
  if (!src || failed === src) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt="Photo preview"
      onError={() => setFailed(src)}
      className="mt-1 h-20 w-16 rounded-md border border-line object-cover"
    />
  );
}

export function ProfileForm({ defaultValues }: { defaultValues: ProfileRow }) {
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    setError,
    control,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: sanitizeDefaultValues(defaultValues),
  });

  // Peringatan saat pindah halaman / menutup tab dikelola UnsavedChangesProvider.
  useUnsavedChanges(isDirty);

  async function onSubmit(values: ProfileFormValues) {
    setFormError(null);
    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => formData.set(key, value ?? ""));

    const result = await updateProfile(formData);
    if (result.success) {
      reset(values); // nilai tersimpan jadi baseline baru → dirty = false
      toast.success("Profile saved");
      return;
    }

    const fieldErrors = (result.error ?? {}) as Record<string, string[] | undefined>;
    let first: string | null = null;
    for (const [key, messages] of Object.entries(fieldErrors)) {
      const message = messages?.[0];
      if (!message) continue;
      first ??= message;
      if (key !== "_form") setError(key as Name, { message });
    }
    const message = first ?? "Could not save the profile.";
    setFormError(message);
    toast.error(message);
  }

  const [heroPhoto, aboutPhoto, metaDescription] = useWatch({
    control,
    name: ["hero_photo_url", "about_photo_url", "meta_description"],
  });
  const metaLength = (metaDescription ?? "").length;
  const shared = { register, errors };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <FormSection title="Hero" description="The first thing visitors see on the home page.">
        <RhfField name="name" label="Name" {...shared} />
        <RhfField name="tagline" label="Tagline" hint="The big headline. Keep it short." {...shared} />
        <RhfField name="role" label="Role" placeholder="Web Developer" {...shared} />
        <div>
          <RhfField name="hero_photo_url" label="Hero photo link" hint="Google Drive share link (anyone with the link)." {...shared} />
          <PhotoPreview url={heroPhoto} />
        </div>
      </FormSection>

      <FormSection title="About" description="Shown in the About section and used for the availability line.">
        <RhfField name="about_bio" label="Bio" textarea rows={5} {...shared} />
        <div>
          <RhfField name="about_photo_url" label="Portrait link" hint="Google Drive share link (anyone with the link)." {...shared} />
          <PhotoPreview url={aboutPhoto} />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <RhfField name="location" label="Location" placeholder="Bekasi, Indonesia" {...shared} />
          <RhfField name="availability" label="Availability" placeholder="Open to work" {...shared} />
        </div>
      </FormSection>

      <FormSection title="Contact & links" description="Only links that are filled in are shown publicly.">
        <RhfField name="contact_intro" label="Contact intro" textarea rows={3} {...shared} />
        <RhfField name="contact_email" label="Email" {...shared} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <RhfField name="github_url" label="GitHub URL" {...shared} />
          <RhfField name="linkedin_url" label="LinkedIn URL" {...shared} />
          <RhfField name="dribbble_url" label="Dribbble URL" {...shared} />
          <RhfField name="cv_url" label="CV link" hint="Google Drive share link." {...shared} />
        </div>
      </FormSection>

      <FormSection title="SEO" description="Defaults for the site title and search result description.">
        <RhfField name="site_title" label="Site title" {...shared} />
        <div>
          <RhfField name="meta_description" label="Meta description" textarea rows={3} {...shared} />
          <p className={`mt-1 text-right font-mono text-[11px] ${metaLength > 160 ? "text-amber-600" : "text-ink-soft"}`}>
            {metaLength} / 160
          </p>
        </div>
      </FormSection>

      <FormActionBar
        submitLabel="Save profile"
        cancelHref="/admin/dashboard"
        cancelLabel="Back"
        dirty={isDirty}
        pending={isSubmitting}
        error={formError}
        disableWhenClean
      />
    </form>
  );
}
