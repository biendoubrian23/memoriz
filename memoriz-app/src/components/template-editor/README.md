# Memoriz — Template Editor (Admin — Canva-like)

Éditeur professionnel de templates réservé au super-admin.
Permet de créer visuellement des templates (couvertures + pages intérieures)
qui seront ensuite disponibles pour tous les utilisateurs.

---

## Stack technique

| Couche | Choix | Raison |
|--------|-------|--------|
| Canvas | **Fabric.js 6** | Bibliothèque canvas la plus complète (texte riche, images, formes, groupes, serialisation JSON). C'est ce qu'utilisent les éditeurs type Canva/Crello. |
| Framework | **Next.js (existant)** | Intégré au projet Memoriz, pas besoin de backend séparé |
| Wrapper React | **fabricjs + react hooks** custom | Contrôle total sur le rendu |
| Polices | **Google Fonts API** | 1500+ polices chargées dynamiquement |
| Bibliothèque d'éléments | **SVG packs libres** + Lucide Icons + formes custom | Formes, icônes, cadres, décorations |
| Photos stock | **Unsplash API** (gratuit) | Bibliothèque de photos libres intégrée |
| Détourage image | **@imgly/background-removal** | Suppression du fond côté client (WASM, gratuit, pas d'API tierce) |
| Stockage | **Supabase Storage** | Upload images admin, sauvegarde templates |
| Base de données | **Supabase (existant)** `layout_templates` | Templates sauvegardés en JSON (grid_config) |

---

## Fonctionnalités de l'éditeur

### 1. Canvas principal
- [x] Canvas redimensionnable (format magazine A4 / carré / custom)
- [x] Grille magnétique + guides d'alignement intelligents (snap)
- [x] Zoom (molette + slider + fit-to-screen)
- [x] Pan (drag canvas quand main active)
- [x] Undo / Redo illimité (Ctrl+Z / Ctrl+Y)
- [x] Raccourcis clavier complets (Suppr, Ctrl+C/V/D, flèches)

### 2. Texte
- [x] Ajouter titre / sous-titre / paragraphe
- [x] Édition inline directement sur le canvas
- [x] Choix police (1500+ Google Fonts avec preview)
- [x] Taille de police (slider + input)
- [x] Gras / Italique / Souligné / Barré
- [x] Couleur du texte (color picker complet)
- [x] Alignement (gauche / centre / droite / justifié)
- [x] Espacement lettres (letter-spacing)
- [x] Interligne (line-height)
- [x] Transform (majuscules, minuscules, capitales)
- [x] Ombre portée
- [x] Opacité
- [x] Texte courbé (sur un arc)

### 3. Images
- [x] Upload depuis l'ordinateur (drag & drop)
- [x] Recherche Unsplash intégrée (photos HD gratuites)
- [x] **Détourage automatique** (suppression fond IA côté client)
- [x] Recadrage (crop tool)
- [x] Filtres prédéfinis (N&B, sépia, vintage, vivid...)
- [x] Ajustements (luminosité, contraste, saturation)
- [x] Opacité
- [x] Masques / Clip-path (cercle, étoile, cœur...)
- [x] Bordure arrondie

### 4. Formes & Éléments
- [x] Formes de base : rectangle, cercle, triangle, étoile, losange, flèche
- [x] Lignes & séparateurs (solid, dashed, dotted)
- [x] Cadres décoratifs
- [x] Icônes SVG (bibliothèque Lucide + packs gratuits)
- [x] Stickers / Emojis
- [x] Couleur de remplissage + couleur de bordure
- [x] Épaisseur de bordure
- [x] Coins arrondis
- [x] Ombre portée

### 5. Manipulation d'objets
- [x] Déplacer (drag)
- [x] Redimensionner (poignées)
- [x] Rotation (poignée circulaire)
- [x] Verrouiller position/taille
- [x] Dupliquer (Ctrl+D)
- [x] Supprimer (Delete/Backspace)
- [x] Z-index (monter / descendre / premier plan / arrière-plan)
- [x] Grouper / Dégrouper
- [x] Alignement multiple (aligner gauche/centre/droite/haut/milieu/bas)
- [x] Distribution uniforme

### 6. Arrière-plan
- [x] Couleur unie (color picker)
- [x] Dégradé (linéaire, radial)
- [x] Image de fond (upload ou Unsplash)
- [x] Motifs / Patterns

### 7. Gestion des pages
- [x] Multi-pages (pour templates intérieures)
- [x] Ajouter / Supprimer / Réordonner pages
- [x] Miniatures dans sidebar
- [x] Type de page : couverture, intérieur, dos

### 8. Panneau de propriétés (droite)
- [x] Position X/Y exacte
- [x] Dimensions W/H exactes
- [x] Rotation exacte
- [x] Opacité
- [x] Propriétés spécifiques selon le type d'élément

### 9. Sauvegarde
- [x] Sauvegarder le template dans `layout_templates` (Supabase)
- [x] Associer au thème choisi (magazine, famille, road-trip, mariage, bébé)
- [x] Générer une miniature automatique (canvas → image)
- [x] Le template devient immédiatement visible par tous les utilisateurs

### 10. Export / Preview
- [x] Preview plein écran
- [x] Export PNG haute résolution (pour miniatures)

---

## Structure des fichiers

```
src/
  app/
    admin/
      template-editor/
        page.tsx                    ← Page liste des thèmes (accès super_admin)
        [themeId]/
          page.tsx                  ← Éditeur Fabric.js pour créer un template
  components/
    template-editor/
      CanvasEditor.tsx              ← Composant principal Fabric.js
      EditorToolbar.tsx             ← Barre d'outils supérieure (texte, formes...)
      EditorSidePanel.tsx           ← Panel gauche (éléments, texte, uploads, photos)
      PropertyPanel.tsx             ← Panel droit (propriétés de l'élément sélectionné)
      TextControls.tsx              ← Sous-composant contrôles texte
      ImageControls.tsx             ← Sous-composant contrôles image
      ShapeLibrary.tsx              ← Bibliothèque de formes SVG
      UnsplashPicker.tsx            ← Recherche/sélection photos Unsplash
      BackgroundRemover.tsx         ← Détourage IA
      FontPicker.tsx                ← Sélecteur de polices Google
      ColorPicker.tsx               ← Color picker avancé
      LayersPanel.tsx               ← Gestion des calques/z-index
      PageManager.tsx               ← Gestion multi-pages
      AlignmentGuides.tsx           ← Guides d'alignement magnétiques
  lib/
    template-editor/
      fabric-init.ts                ← Initialisation et config Fabric.js
      canvas-utils.ts               ← Helpers canvas (serialize, deserialize, exportPNG)
      element-presets.ts            ← Formes prédéfinies, cadres, icônes
      font-loader.ts                ← Chargement dynamique Google Fonts
      bg-removal.ts                 ← Wrapper @imgly/background-removal
      filters.ts                    ← Filtres image prédéfinis
      snap-grid.ts                  ← Logique snap + guides d'alignement
      history.ts                    ← Undo/Redo manager
      template-saver.ts             ← Sérialisation → Supabase layout_templates
```

---

## Accès

- **Route** : `/admin/template-editor`
- **Protection** : Middleware vérifie `profile.role === 'super_admin'`
- **Utilisateur autorisé** : Brian Biendou (`clarkybrian@outlook.fr`)
