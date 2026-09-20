import { supabase } from "@/integrations/supabase/client";

/** Decode locally, orient using the browser, and bound both dimensions before upload. */
export async function prepareStudioImage(file: File): Promise<File> {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type))
    throw new Error("Choose a JPG, PNG or WebP image.");
  if (file.size > 20 * 1024 * 1024)
    throw new Error("Please choose an image smaller than 20 MB.");
  const bitmap = await createImageBitmap(file);
  try {
    const ratio = Math.min(1, 1920 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * ratio);
    canvas.height = Math.round(bitmap.height * ratio);
    const context = canvas.getContext("2d");
    if (!context)
      throw new Error(
        "Your browser couldn’t prepare this image. Please try another browser.",
      );
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/webp", 0.84),
    );
    if (!blob)
      throw new Error("We couldn’t read this image. Please try another photo.");
    return new File([blob], "wedding-photo.webp", { type: "image/webp" });
  } finally {
    bitmap.close();
  }
}

export async function uploadStudioMedia(
  weddingId: string,
  file: File,
): Promise<string> {
  const video = file.type.startsWith("video/");
  if (
    video &&
    (!["video/mp4", "video/webm"].includes(file.type) ||
      file.size > 20 * 1024 * 1024)
  )
    throw new Error("Choose an MP4 or WebM video smaller than 20 MB.");
  const prepared = video ? file : await prepareStudioImage(file);
  const extension = video
    ? file.type === "video/mp4"
      ? "mp4"
      : "webm"
    : "webp";
  // Unique paths: replacing an image in an unsaved draft must not overwrite the live image.
  const path = `${weddingId}/studio/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage
    .from("wedding-media")
    .upload(path, prepared, {
      contentType: prepared.type,
      cacheControl: "31536000",
      upsert: false,
    });
  if (error) throw error;
  return supabase.storage.from("wedding-media").getPublicUrl(path).data
    .publicUrl;
}
