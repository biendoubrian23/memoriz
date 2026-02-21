/* ─────────────────────────────────────────────────────────────
   Type augmentation for Fabric.js v6
   Adds 'name' property to all FabricObject options
   (available at runtime but missing from v6 type definitions)
   ───────────────────────────────────────────────────────────── */

import "fabric";

declare module "fabric" {
  interface FabricObjectProps {
    name?: string;
  }
}
