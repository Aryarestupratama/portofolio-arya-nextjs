"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { projectSchema } from "@/lib/validations/projects";
import {
  insertProject,
  updateProject,
  deleteProject,
  addProjectImage,
  deleteProjectImage,
} from "@/lib/supabase/mutations/projects";
import { uploadProjectImage } from "@/lib/supabase/storage";

export type ProjectActionState = { error?: string } | null;

// Error dari Supabase (storage & Postgrest) tidak selalu instance `Error`
// bawaan JS — kadang berupa object biasa dengan properti `message`. Kalau
// cuma cek `e instanceof Error`, pesan aslinya bisa "hilang" dan ketutup
// fallback generik. Helper ini menggali message dari bentuk apa pun.
function extractErrorMessage(e: unknown, fallback: string): string {
  if (e instanceof Error) return e.message;
  if (typeof e === "object" && e !== null && "message" in e) {
    const msg = (e as { message: unknown }).message;
    if (typeof msg === "string" && msg.length > 0) return msg;
  }
  return fallback;
}

function readProjectFormData(formData: FormData) {
  return projectSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    detail: formData.get("detail"),
    category: formData.get("category"),
    tahun: formData.get("tahun"),
    role: formData.get("role"),
    timeline: formData.get("timeline"),
    client: formData.get("client"),
    problem: formData.get("problem"),
    approach: formData.get("approach"),
    outcome: formData.get("outcome"),
    demo_url: formData.get("demo_url"),
    github_url: formData.get("github_url"),
    is_featured: formData.get("is_featured") === "on",
    status: formData.get("status"),
    metrics_raw: formData.get("metrics_raw"),
    skill_ids: formData.getAll("skill_ids"),
  });
}

function revalidatePublicProjectPaths(slug?: string) {
  // "layout" = listing + semua detail (navigasi "next project" di tiap
  // detail ikut berubah kalau ada project baru/dihapus).
  revalidatePath("/projects", "layout");
  revalidatePath("/");
  revalidatePath("/sitemap.xml");
  if (slug) revalidatePath(`/projects/${slug}`);
}

export async function createProjectAction(
  _prevState: ProjectActionState,
  formData: FormData,
): Promise<ProjectActionState> {
  const parsed = readProjectFormData(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }

  const thumbnailFile = formData.get("thumbnail");
  if (!(thumbnailFile instanceof File) || thumbnailFile.size === 0) {
    return { error: "Thumbnail wajib diupload." };
  }

  const supabase = await createClient();

  let thumbnailPath: string;
  let newId: number;

  try {
    thumbnailPath = await uploadProjectImage(
      supabase,
      thumbnailFile,
      "thumbnails",
    );
    newId = await insertProject(supabase, parsed.data, thumbnailPath);
  } catch (e) {
    return {
      error: extractErrorMessage(e, "Gagal menyimpan project."),
    };
  }

  revalidatePublicProjectPaths();
  revalidatePath("/admin/projects");
  redirect(`/admin/projects/${newId}/edit`);
}

export async function updateProjectAction(
  id: number,
  slug: string,
  _prevState: ProjectActionState,
  formData: FormData,
): Promise<ProjectActionState> {
  const parsed = readProjectFormData(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }

  const supabase = await createClient();
  const thumbnailFile = formData.get("thumbnail");

  try {
    let thumbnailPath: string | undefined;
    if (thumbnailFile instanceof File && thumbnailFile.size > 0) {
      thumbnailPath = await uploadProjectImage(
        supabase,
        thumbnailFile,
        "thumbnails",
      );
    }
    await updateProject(supabase, id, parsed.data, thumbnailPath);
  } catch (e) {
    return {
      error: extractErrorMessage(e, "Gagal menyimpan project."),
    };
  }

  revalidatePublicProjectPaths(slug);
  revalidatePath("/admin/projects");
  revalidatePath(`/admin/projects/${id}/edit`);
  return null;
}

export async function deleteProjectAction(id: number, slug: string) {
  const supabase = await createClient();
  await deleteProject(supabase, id);
  revalidatePublicProjectPaths(slug);
  revalidatePath("/admin/projects");
}

export async function addProjectImageAction(
  projectId: number,
  slug: string,
  formData: FormData,
) {
  const file = formData.get("image");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Pilih file gambar terlebih dahulu." };
  }

  const supabase = await createClient();

  try {
    const path = await uploadProjectImage(supabase, file, "gallery");
    await addProjectImage(supabase, projectId, path);
  } catch (e) {
    return {
      error: extractErrorMessage(e, "Gagal upload gambar."),
    };
  }

  revalidatePath(`/admin/projects/${projectId}/edit`);
  revalidatePath(`/projects/${slug}`);
  return { error: undefined };
}

export async function deleteProjectImageAction(
  imageId: number,
  projectId: number,
  slug: string,
) {
  const supabase = await createClient();
  await deleteProjectImage(supabase, imageId);
  revalidatePath(`/admin/projects/${projectId}/edit`);
  revalidatePath(`/projects/${slug}`);
}