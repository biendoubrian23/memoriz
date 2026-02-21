/* ─────────────────────────────────────────────────────────────
   Background removal wrapper (client-side WASM)
   Uses @imgly/background-removal
   ───────────────────────────────────────────────────────────── */

import { removeBackground, type Config } from "@imgly/background-removal";

export type RemovalProgress = {
  status: "loading" | "processing" | "done" | "error";
  progress: number; // 0-1
  message: string;
};

/**
 * Remove background from an image blob.
 * Returns a new Blob with transparent background.
 */
export async function removeImageBackground(
  imageBlob: Blob,
  onProgress?: (p: RemovalProgress) => void
): Promise<Blob> {
  onProgress?.({
    status: "loading",
    progress: 0,
    message: "Chargement du modèle IA...",
  });

  const config: Config = {
    output: {
      format: "image/png",
      quality: 1,
    },
    progress: (key: string, current: number, total: number) => {
      const progress = total > 0 ? current / total : 0;
      onProgress?.({
        status: "processing",
        progress,
        message:
          key === "compute:inference"
            ? "Détourage en cours..."
            : "Préparation...",
      });
    },
  };

  try {
    const result = await removeBackground(imageBlob, config);
    onProgress?.({
      status: "done",
      progress: 1,
      message: "Détourage terminé !",
    });
    return result;
  } catch (error) {
    onProgress?.({
      status: "error",
      progress: 0,
      message: "Erreur lors du détourage",
    });
    throw error;
  }
}

/**
 * Convert a File or data URL to Blob for background removal
 */
export function dataURLToBlob(dataURL: string): Blob {
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
