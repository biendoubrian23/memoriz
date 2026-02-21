/* ─────────────────────────────────────────────────────────────
   Image filters — predefined filter presets for Fabric.js
   ───────────────────────────────────────────────────────────── */

import * as fabric from "fabric";

export type FilterPreset = {
  id: string;
  name: string;
  apply: (image: fabric.FabricImage) => void;
};

export const FILTER_PRESETS: FilterPreset[] = [
  {
    id: "none",
    name: "Original",
    apply: (img) => {
      img.filters = [];
      img.applyFilters();
    },
  },
  {
    id: "grayscale",
    name: "Noir & Blanc",
    apply: (img) => {
      img.filters = [new fabric.filters.Grayscale()];
      img.applyFilters();
    },
  },
  {
    id: "sepia",
    name: "Sépia",
    apply: (img) => {
      img.filters = [
        new fabric.filters.Grayscale(),
        new fabric.filters.Brightness({ brightness: 0.05 }),
        new fabric.filters.HueRotation({ rotation: 0.05 }),
      ];
      img.applyFilters();
    },
  },
  {
    id: "vivid",
    name: "Vivid",
    apply: (img) => {
      img.filters = [
        new fabric.filters.Saturation({ saturation: 0.4 }),
        new fabric.filters.Contrast({ contrast: 0.1 }),
      ];
      img.applyFilters();
    },
  },
  {
    id: "warm",
    name: "Chaud",
    apply: (img) => {
      img.filters = [
        new fabric.filters.Brightness({ brightness: 0.05 }),
        new fabric.filters.HueRotation({ rotation: 0.02 }),
      ];
      img.applyFilters();
    },
  },
  {
    id: "cool",
    name: "Froid",
    apply: (img) => {
      img.filters = [
        new fabric.filters.Brightness({ brightness: -0.02 }),
        new fabric.filters.HueRotation({ rotation: -0.04 }),
        new fabric.filters.Saturation({ saturation: -0.15 }),
      ];
      img.applyFilters();
    },
  },
  {
    id: "high-contrast",
    name: "Contraste +",
    apply: (img) => {
      img.filters = [
        new fabric.filters.Contrast({ contrast: 0.25 }),
      ];
      img.applyFilters();
    },
  },
  {
    id: "vintage",
    name: "Vintage",
    apply: (img) => {
      img.filters = [
        new fabric.filters.Brightness({ brightness: 0.05 }),
        new fabric.filters.Saturation({ saturation: -0.3 }),
        new fabric.filters.Contrast({ contrast: 0.1 }),
      ];
      img.applyFilters();
    },
  },
  {
    id: "bright",
    name: "Lumineux",
    apply: (img) => {
      img.filters = [
        new fabric.filters.Brightness({ brightness: 0.15 }),
      ];
      img.applyFilters();
    },
  },
  {
    id: "dark",
    name: "Sombre",
    apply: (img) => {
      img.filters = [
        new fabric.filters.Brightness({ brightness: -0.15 }),
        new fabric.filters.Contrast({ contrast: 0.05 }),
      ];
      img.applyFilters();
    },
  },
  {
    id: "blur",
    name: "Flou",
    apply: (img) => {
      img.filters = [
        new fabric.filters.Blur({ blur: 0.1 }),
      ];
      img.applyFilters();
    },
  },
];

/** Apply brightness/contrast/saturation adjustments */
export function applyAdjustments(
  img: fabric.FabricImage,
  adjustments: {
    brightness?: number; // -1 to 1
    contrast?: number;   // -1 to 1
    saturation?: number; // -1 to 1
  }
) {
  const filters: fabric.filters.BaseFilter<string, Record<string, unknown>>[] = [];

  if (adjustments.brightness !== undefined && adjustments.brightness !== 0) {
    filters.push(new fabric.filters.Brightness({ brightness: adjustments.brightness }));
  }
  if (adjustments.contrast !== undefined && adjustments.contrast !== 0) {
    filters.push(new fabric.filters.Contrast({ contrast: adjustments.contrast }));
  }
  if (adjustments.saturation !== undefined && adjustments.saturation !== 0) {
    filters.push(new fabric.filters.Saturation({ saturation: adjustments.saturation }));
  }

  img.filters = filters;
  img.applyFilters();
}
