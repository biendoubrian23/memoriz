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

    // 2. Build grid_config as MagazineFreeformConfig
    const gridConfig = {
      mode: "freeform",
      fabricJSON: data.canvasJSON,
      pageType: data.pageType,
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

    if (data.canvasJSON) {
      updates.grid_config = JSON.stringify({
        mode: "freeform",
        fabricJSON: data.canvasJSON,
        pageType: data.pageType ?? "cover",
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
