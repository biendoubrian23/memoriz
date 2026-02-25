/* ─────────────────────────────────────────────────────────────
   Template saver — serialize canvas to Supabase layout_templates
   ───────────────────────────────────────────────────────────── */

import type { Canvas } from "fabric";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export type TemplateSaveData = {
  /** Template name */
  name: string;
  /** Theme category: magazine, famille, road-trip, mariage, bebe */
  category: string;
  /** Fabric.js canvas JSON */
  canvasJSON: string;
  /** Thumbnail data URL (PNG) */
  thumbnailDataURL: string;
  /** Page type: cover, interior, back */
  pageType: "cover" | "interior" | "back";
  /** Number of photos in the template */
  photoCount: number;
  /** Canvas width in px (for aspect ratio) */
  canvasWidth?: number;
  /** Canvas height in px (for aspect ratio) */
  canvasHeight?: number;
  /** Whether template is published (visible to all users) */
  isPublished?: boolean;
};

/**
 * Save a template to Supabase layout_templates table
 */
export async function saveTemplate(
  data: TemplateSaveData
): Promise<{ id: string } | { error: string }> {
  try {
    // 1. Upload thumbnail to storage
    const thumbnailBlob = dataURLToBlob(data.thumbnailDataURL);
    const thumbnailPath = `templates/${data.category}/${Date.now()}_thumb.png`;

    const { error: uploadError } = await supabase.storage
      .from("images")
      .upload(thumbnailPath, thumbnailBlob, {
        contentType: "image/png",
        upsert: true,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      // Continue without thumbnail
    }

    const { data: urlData } = supabase.storage
      .from("images")
      .getPublicUrl(thumbnailPath);

    const thumbnailUrl = uploadError ? null : urlData.publicUrl;

    // 2. Build grid_config as FabricFreeformConfig
    const gridConfig = {
      mode: "freeform",
      fabricJSON: data.canvasJSON,
      pageType: data.pageType,
      ...(data.canvasWidth ? { width: data.canvasWidth } : {}),
      ...(data.canvasHeight ? { height: data.canvasHeight } : {}),
    };

    // 3. Generate a unique template ID
    const templateId = `tpl-${data.category}-${Date.now()}`;

    // 4. Insert into layout_templates
    const { data: inserted, error: insertError } = await supabase
      .from("layout_templates")
      .insert({
        id: templateId,
        name: data.name,
        photo_count: data.photoCount,
        grid_config: JSON.stringify(gridConfig),
        category: data.category,
        display_order: 9900 + Math.floor(Math.random() * 100),
        thumbnail_url: thumbnailUrl,
        is_published: data.isPublished ?? false,
      })
      .select("id")
      .single();

    if (insertError) {
      return { error: insertError.message };
    }

    return { id: inserted.id };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Erreur inconnue" };
  }
}

/**
 * Update an existing template
 */
export async function updateTemplate(
  templateId: string,
  data: Partial<TemplateSaveData>
): Promise<{ success: boolean; error?: string }> {
  try {
    const updates: Record<string, unknown> = {};

    if (data.name) updates.name = data.name;
    if (data.category) updates.category = data.category;
    if (data.photoCount !== undefined) updates.photo_count = data.photoCount;
    if (data.isPublished !== undefined) updates.is_published = data.isPublished;

    if (data.canvasJSON) {
      updates.grid_config = JSON.stringify({
        mode: "freeform",
        fabricJSON: data.canvasJSON,
        pageType: data.pageType ?? "cover",
        ...(data.canvasWidth ? { width: data.canvasWidth } : {}),
        ...(data.canvasHeight ? { height: data.canvasHeight } : {}),
      });
    }

    if (data.thumbnailDataURL) {
      const thumbnailBlob = dataURLToBlob(data.thumbnailDataURL);
      const thumbnailPath = `templates/${data.category ?? "misc"}/${templateId}_thumb.png`;

      await supabase.storage
        .from("images")
        .upload(thumbnailPath, thumbnailBlob, {
          contentType: "image/png",
          upsert: true,
        });

      const { data: urlData } = supabase.storage
        .from("images")
        .getPublicUrl(thumbnailPath);
      updates.thumbnail_url = urlData.publicUrl;
    }

    const { error } = await supabase
      .from("layout_templates")
      .update(updates)
      .eq("id", templateId);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Erreur inconnue",
    };
  }
}

/**
 * Publish (or unpublish) a template — toggles is_published
 */
export async function publishTemplate(
  templateId: string,
  publish: boolean
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from("layout_templates")
    .update({ is_published: publish })
    .eq("id", templateId);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

/**
 * Save per-page Fabric.js canvas JSON (user customisations)
 * If a thumbnail data URL is provided, uploads it to Storage
 * and saves the public URL in fabric_thumbnail column.
 */
export async function savePageFabricJSON(
  pageId: string,
  fabricJSON: string,
  thumbnailDataURL?: string
): Promise<{ success: boolean; error?: string }> {
  let thumbnailUrl: string | undefined;

  // Upload thumbnail to storage if provided
  if (thumbnailDataURL) {
    try {
      const blob = dataURLToBlob(thumbnailDataURL);
      const path = `page-thumbnails/${pageId}_${Date.now()}.png`;
      const { error: upErr } = await supabase.storage
        .from("images")
        .upload(path, blob, { contentType: "image/png", upsert: true });
      if (!upErr) {
        const { data: urlData } = supabase.storage.from("images").getPublicUrl(path);
        thumbnailUrl = urlData.publicUrl;
      }
    } catch {
      // Silently continue without thumbnail
    }
  }

  // Try saving with fabric_thumbnail column
  const updates: Record<string, unknown> = { fabric_json: fabricJSON };
  if (thumbnailUrl) updates.fabric_thumbnail = thumbnailUrl;

  const { error } = await supabase
    .from("project_pages")
    .update(updates)
    .eq("id", pageId);

  // Fallback: if fabric_thumbnail column doesn't exist yet, save just fabric_json
  if (error && error.message?.includes("fabric_thumbnail")) {
    const { error: fallbackErr } = await supabase
      .from("project_pages")
      .update({ fabric_json: fabricJSON })
      .eq("id", pageId);
    if (fallbackErr) return { success: false, error: fallbackErr.message };
    return { success: true };
  }

  if (error) return { success: false, error: error.message };
  return { success: true };
}

/**
 * Generate a canvas thumbnail
 */
export function generateThumbnail(
  canvas: Canvas,
  maxWidth = 400
): string {
  const scale = maxWidth / canvas.getWidth();
  return canvas.toDataURL({
    format: "png",
    quality: 0.9,
    multiplier: scale,
  });
}

/** Helper: data URL to Blob */
function dataURLToBlob(dataURL: string): Blob {
  const arr = dataURL.split(",");
  const mimeMatch = arr[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : "image/png";
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}
