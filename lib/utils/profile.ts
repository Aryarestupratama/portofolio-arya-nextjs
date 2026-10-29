// Field profile yang sebaiknya terisi supaya halaman publik terlihat lengkap.
// Dipakai di dashboard (needs attention) dan halaman edit profile.
export const PROFILE_FIELDS: { key: string; label: string }[] = [
  { key: "tagline", label: "tagline" },
  { key: "about_bio", label: "about bio" },
  { key: "about_photo_url", label: "about photo" },
  { key: "cv_url", label: "CV link" },
  { key: "contact_email", label: "contact email" },
  { key: "github_url", label: "GitHub" },
  { key: "linkedin_url", label: "LinkedIn" },
];

export function missingProfileFields(
  profile: Record<string, unknown> | null | undefined,
): string[] {
  return PROFILE_FIELDS.filter((f) => !String(profile?.[f.key] ?? "").trim()).map(
    (f) => f.label,
  );
}
