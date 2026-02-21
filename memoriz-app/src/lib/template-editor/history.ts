/* ─────────────────────────────────────────────────────────────
   Undo / Redo history manager for Fabric.js canvas
   ───────────────────────────────────────────────────────────── */

import type { Canvas } from "fabric";

const MAX_HISTORY = 50;

export class HistoryManager {
  private undoStack: string[] = [];
  private redoStack: string[] = [];
  private canvas: Canvas;
  private locked = false;

  constructor(canvas: Canvas) {
    this.canvas = canvas;
    // Save initial state
    this.saveState();
  }

  /** Save current state to undo stack */
  saveState() {
    if (this.locked) return;
    const json = JSON.stringify(
      this.canvas.toJSON()
    );
    this.undoStack.push(json);
    if (this.undoStack.length > MAX_HISTORY) {
      this.undoStack.shift();
    }
    // Clear redo on new action
    this.redoStack = [];
  }

  /** Undo last action */
  async undo(): Promise<boolean> {
    if (this.undoStack.length <= 1) return false;
    this.locked = true;

    const current = this.undoStack.pop()!;
    this.redoStack.push(current);

    const prev = this.undoStack[this.undoStack.length - 1];
    await this.canvas.loadFromJSON(prev);
    this.canvas.requestRenderAll();

    this.locked = false;
    return true;
  }

  /** Redo last undone action */
  async redo(): Promise<boolean> {
    if (this.redoStack.length === 0) return false;
    this.locked = true;

    const state = this.redoStack.pop()!;
    this.undoStack.push(state);

    await this.canvas.loadFromJSON(state);
    this.canvas.requestRenderAll();

    this.locked = false;
    return true;
  }

  get canUndo() {
    return this.undoStack.length > 1;
  }

  get canRedo() {
    return this.redoStack.length > 0;
  }

  /** Reset history */
  clear() {
    this.undoStack = [];
    this.redoStack = [];
    this.saveState();
  }
}
