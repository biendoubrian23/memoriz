import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://ebfcvxnguuwztvwhzwha.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImViZmN2eG5ndXV3enR2d2h6d2hhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTU0Njc3NSwiZXhwIjoyMDg3MTIyNzc1fQ.nusnZZvuPq5ibsUlMo-cfwV1wJknB5xCtYPVyWC3yF8";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const layouts = [
    // --- 2 PHOTOS ---
    {
        id: "2-diagonal",
        name: "2 photos diagonales",
        photo_count: 2,
        category: "standard",
        display_order: 13,
        grid_config: JSON.stringify([
            { x: 2, y: 2, w: 47, h: 47 },
            { x: 51, y: 51, w: 47, h: 47 },
            { x: 51, y: 2, w: 47, h: 47, type: "text" }, // Optional text area logically
        ])
    },
    {
        id: "2-tall",
        name: "2 photos colonnes (1/3 - 2/3)",
        photo_count: 2,
        category: "standard",
        display_order: 14,
        grid_config: JSON.stringify([
            { x: 2, y: 2, w: 31, h: 96 },
            { x: 35, y: 2, w: 63, h: 96 }
        ])
    },

    // --- 3 PHOTOS ---
    {
        id: "3-left-big",
        name: "1 grande gauche + 2 petites",
        photo_count: 3,
        category: "standard",
        display_order: 15,
        grid_config: JSON.stringify([
            { x: 2, y: 2, w: 63, h: 96 },
            { x: 67, y: 2, w: 31, h: 47 },
            { x: 67, y: 51, w: 31, h: 47 }
        ])
    },
    {
        id: "3-top-wide",
        name: "1 large haut + 2 petites bas",
        photo_count: 3,
        category: "standard",
        display_order: 16,
        grid_config: JSON.stringify([
            { x: 2, y: 2, w: 96, h: 55 },
            { x: 2, y: 59, w: 47, h: 39 },
            { x: 51, y: 59, w: 47, h: 39 }
        ])
    },
    {
        id: "3-bottom-wide",
        name: "2 petites haut + 1 large bas",
        photo_count: 3,
        category: "standard",
        display_order: 17,
        grid_config: JSON.stringify([
            { x: 2, y: 2, w: 47, h: 39 },
            { x: 51, y: 2, w: 47, h: 39 },
            { x: 2, y: 43, w: 96, h: 55 }
        ])
    },
    {
        id: "3-vertical-stripes",
        name: "3 colonnes",
        photo_count: 3,
        category: "standard",
        display_order: 18,
        grid_config: JSON.stringify([
            { x: 2, y: 2, w: 31, h: 96 },
            { x: 35, y: 2, w: 31, h: 96 },
            { x: 68, y: 2, w: 30, h: 96 }
        ])
    },
    {
        id: "3-horizontal-stripes",
        name: "3 bandes",
        photo_count: 3,
        category: "standard",
        display_order: 19,
        grid_config: JSON.stringify([
            { x: 2, y: 2, w: 96, h: 31 },
            { x: 2, y: 35, w: 96, h: 30 },
            { x: 2, y: 67, w: 96, h: 31 }
        ])
    },

    // --- 4 PHOTOS ---
    {
        id: "4-center-focus",
        name: "1 centre + 3 côtés",
        photo_count: 4,
        category: "standard",
        display_order: 23,
        grid_config: JSON.stringify([
            { x: 35, y: 2, w: 63, h: 63 },
            { x: 2, y: 2, w: 31, h: 31 },
            { x: 2, y: 35, w: 31, h: 30 },
            { x: 2, y: 67, w: 31, h: 31 }
        ])
    },
    {
        id: "4-staggered",
        name: "4 photos asymétriques",
        photo_count: 4,
        category: "standard",
        display_order: 24,
        grid_config: JSON.stringify([
            { x: 2, y: 2, w: 47, h: 63 },
            { x: 51, y: 2, w: 47, h: 31 },
            { x: 2, y: 67, w: 47, h: 31 },
            { x: 51, y: 35, w: 47, h: 63 }
        ])
    },
    {
        id: "4-header-row",
        name: "1 large en-tête + 3 colonnes",
        photo_count: 4,
        category: "standard",
        display_order: 25,
        grid_config: JSON.stringify([
            { x: 2, y: 2, w: 96, h: 31 },
            { x: 2, y: 35, w: 31, h: 63 },
            { x: 35, y: 35, w: 31, h: 63 },
            { x: 68, y: 35, w: 30, h: 63 }
        ])
    },

    // --- 5 PHOTOS ---
    {
        id: "5-grid-mixed",
        name: "5 photos (2 haut, 3 bas)",
        photo_count: 5,
        category: "standard",
        display_order: 26,
        grid_config: JSON.stringify([
            { x: 2, y: 2, w: 47, h: 47 },
            { x: 51, y: 2, w: 47, h: 47 },
            { x: 2, y: 51, w: 31, h: 47 },
            { x: 35, y: 51, w: 31, h: 47 },
            { x: 68, y: 51, w: 30, h: 47 }
        ])
    },
    {
        id: "5-grid-mixed-alt",
        name: "5 photos (3 haut, 2 bas)",
        photo_count: 5,
        category: "standard",
        display_order: 27,
        grid_config: JSON.stringify([
            { x: 2, y: 2, w: 31, h: 47 },
            { x: 35, y: 2, w: 31, h: 47 },
            { x: 68, y: 2, w: 30, h: 47 },
            { x: 2, y: 51, w: 47, h: 47 },
            { x: 51, y: 51, w: 47, h: 47 }
        ])
    },
    {
        id: "5-cinema",
        name: "Mosaïque cinéma",
        photo_count: 5,
        category: "standard",
        display_order: 28,
        grid_config: JSON.stringify([
            { x: 2, y: 2, w: 63, h: 63 },
            { x: 67, y: 2, w: 31, h: 31 },
            { x: 67, y: 35, w: 31, h: 30 },
            { x: 2, y: 67, w: 63, h: 31 },
            { x: 67, y: 67, w: 31, h: 31 }
        ])
    },
    {
        id: "5-tall-columns",
        name: "5 colonnes",
        photo_count: 5,
        category: "standard",
        display_order: 29,
        grid_config: JSON.stringify([
            { x: 2, y: 2, w: 18, h: 96 },
            { x: 21, y: 2, w: 18, h: 96 },
            { x: 40, y: 2, w: 19, h: 96 },
            { x: 61, y: 2, w: 18, h: 96 },
            { x: 80, y: 2, w: 18, h: 96 }
        ])
    },

    // --- 6 PHOTOS ---
    {
        id: "6-collage",
        name: "Collage asymétrique 6",
        photo_count: 6,
        category: "standard",
        display_order: 32,
        grid_config: JSON.stringify([
            { x: 2, y: 2, w: 47, h: 63 },
            { x: 51, y: 2, w: 47, h: 31 },
            { x: 51, y: 35, w: 47, h: 30 },
            { x: 2, y: 67, w: 31, h: 31 },
            { x: 35, y: 67, w: 31, h: 31 },
            { x: 68, y: 67, w: 30, h: 31 }
        ])
    },
    {
        id: "7-grid-polaroïd",
        name: "Grille de 7",
        photo_count: 7,
        category: "standard",
        display_order: 33,
        grid_config: JSON.stringify([
            { x: 2, y: 2, w: 23, h: 47 },
            { x: 27, y: 2, w: 23, h: 47 },
            { x: 51, y: 2, w: 47, h: 47 },
            { x: 2, y: 51, w: 47, h: 47 },
            { x: 51, y: 51, w: 23, h: 47 },
            { x: 76, y: 51, w: 22, h: 47 }
        ])
    },

    // --- 8 PHOTOS ---
    {
        id: "8-classic-grid",
        name: "8 photos symétriques",
        photo_count: 8,
        category: "standard",
        display_order: 35,
        grid_config: JSON.stringify([
            { x: 2, y: 2, w: 47, h: 22 },
            { x: 51, y: 2, w: 47, h: 22 },
            { x: 2, y: 26, w: 47, h: 22 },
            { x: 51, y: 26, w: 47, h: 22 },
            { x: 2, y: 50, w: 47, h: 23 },
            { x: 51, y: 50, w: 47, h: 23 },
            { x: 2, y: 75, w: 47, h: 23 },
            { x: 51, y: 75, w: 47, h: 23 }
        ])
    },

    // --- Mises en pages 'MIXED' (photos + espaces non remplis) ---
    {
        id: "mixed-polaroid-3",
        name: "3 Polaroïds flottants",
        photo_count: 3,
        category: "mixed",
        display_order: 5,
        grid_config: JSON.stringify([
            { x: 10, y: 10, w: 35, h: 35 },
            { x: 55, y: 25, w: 35, h: 35 },
            { x: 25, y: 55, w: 35, h: 35 }
        ])
    },
    {
        id: "mixed-central-band",
        name: "Bande centrale 4 photos",
        photo_count: 4,
        category: "mixed",
        display_order: 6,
        grid_config: JSON.stringify([
            { x: 2, y: 30, w: 23, h: 40 },
            { x: 27, y: 30, w: 23, h: 40 },
            { x: 52, y: 30, w: 23, h: 40 },
            { x: 77, y: 30, w: 21, h: 40 }
        ])
    },
    {
        id: "mixed-checkerboard",
        name: "Damier 4 photos",
        photo_count: 4,
        category: "mixed",
        display_order: 7,
        grid_config: JSON.stringify([
            { x: 2, y: 2, w: 47, h: 47 },
            { x: 51, y: 51, w: 47, h: 47 }
        ])
    }
];

async function run() {
    console.log("Upserting 20 new layouts into the layout_templates table...");

    for (const layout of layouts) {
        const { error } = await supabase.from("layout_templates").upsert([layout], { onConflict: "id" });
        if (error) {
            console.error("Error upserting layout " + layout.id + ":", error);
        } else {
            console.log("Successfully upserted", layout.id);
        }
    }

    console.log("Done!");
}

run();
