"use client";

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import Image from "next/image";
import Moveable from "react-moveable";
import type { FreeformElement } from "@/lib/types/editor";

/* ─── Props ─── */
type Props = {
  elements: FreeformElement[];
  selectedId: string | null;
  editingTextId: string | null;
  onSelect: (id: string | null) => void;
  onStartEditText: (id: string) => void;
  onStopEditText: () => void;
  onUpdateElement: (id: string, updates: Partial<FreeformElement>) => void;
  onUpdateTextContent: (id: string, content: string) => void;
  onDeleteElement: (id: string) => void;
  backgroundColor?: string;
  backgroundGradient?: string;
  canvasAspect?: number; // w/h ratio, default 0.75 (3:4)
  interactive?: boolean;
  className?: string;
};

/* ═══════════════════════════════════════════════════════════════
   MagazineCanvas — Free-form interactive canvas
   ═══════════════════════════════════════════════════════════════ */
export default function MagazineCanvas({
  elements,
  selectedId,
  editingTextId,
  onSelect,
  onStartEditText,
  onStopEditText,
  onUpdateElement,
  onUpdateTextContent,
  onDeleteElement,
  backgroundColor = "#ffffff",
  backgroundGradient,
  canvasAspect = 0.75,
  interactive = true,
  className = "",
}: Props) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 600, height: 800 });

  // Track canvas size for proportional scaling
  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      if (width > 0 && height > 0) setCanvasSize({ width, height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Click on canvas background → deselect
  const handleCanvasClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === canvasRef.current) {
        onSelect(null);
        onStopEditText();
      }
    },
    [onSelect, onStopEditText]
  );

  // Sort by zIndex
  const sorted = useMemo(
    () => [...elements].sort((a, b) => a.zIndex - b.zIndex),
    [elements]
  );

  return (
    <div
      ref={canvasRef}
      className={`relative overflow-hidden select-none ${className}`}
      style={{
        aspectRatio: `${canvasAspect}`,
        background: backgroundGradient || backgroundColor,
        width: "100%",
      }}
      onClick={handleCanvasClick}
    >
      {sorted.map((el) => (
        <CanvasElement
          key={el.id}
          element={el}
          isSelected={selectedId === el.id}
          isEditing={editingTextId === el.id}
          canvasSize={canvasSize}
          interactive={interactive}
          onSelect={onSelect}
          onStartEditText={onStartEditText}
          onUpdateTextContent={onUpdateTextContent}
          onDeleteElement={onDeleteElement}
        />
      ))}

      {/* Moveable for selected element */}
      {interactive && selectedId && !editingTextId && (
        <MoveableWrapper
          selectedId={selectedId}
          elements={elements}
          canvasSize={canvasSize}
          onUpdateElement={onUpdateElement}
        />
      )}
    </div>
  );
}

/* ─── Single element on canvas ─── */
function CanvasElement({
  element,
  isSelected,
  isEditing,
  canvasSize,
  interactive,
  onSelect,
  onStartEditText,
  onUpdateTextContent,
  onDeleteElement,
}: {
  element: FreeformElement;
  isSelected: boolean;
  isEditing: boolean;
  canvasSize: { width: number; height: number };
  interactive: boolean;
  onSelect: (id: string | null) => void;
  onStartEditText: (id: string) => void;
  onUpdateTextContent: (id: string, content: string) => void;
  onDeleteElement: (id: string) => void;
}) {
  const textRef = useRef<HTMLDivElement>(null);
  const fontSize = element.fontSize
    ? (element.fontSize / 100) * canvasSize.height
    : 16;

  // Handle click (select)
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (interactive) onSelect(element.id);
    },
    [interactive, onSelect, element.id]
  );

  // Handle double-click → enter text editing
  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (interactive && element.type === "text") {
        onStartEditText(element.id);
      }
    },
    [interactive, element.type, element.id, onStartEditText]
  );

  // Blur → save text
  const handleBlur = useCallback(() => {
    if (textRef.current) {
      onUpdateTextContent(element.id, textRef.current.innerText);
    }
  }, [element.id, onUpdateTextContent]);

  // Keyboard shortcuts on element
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!interactive) return;
      if (e.key === "Delete" || e.key === "Backspace") {
        if (!isEditing) {
          e.preventDefault();
          onDeleteElement(element.id);
        }
      }
    },
    [interactive, isEditing, element.id, onDeleteElement]
  );

  const baseStyle: React.CSSProperties = {
    position: "absolute",
    left: `${element.x}%`,
    top: `${element.y}%`,
    width: `${element.width}%`,
    height: `${element.height}%`,
    transform: `rotate(${element.rotation}deg)`,
    zIndex: element.zIndex,
    opacity: element.opacity,
    cursor: interactive ? (element.locked ? "default" : "move") : "default",
    outline: isSelected && !isEditing ? "2px solid #3b82f6" : "none",
    outlineOffset: "2px",
  };

  return (
    <div
      className={`magazine-element magazine-el-${element.id}`}
      style={baseStyle}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onKeyDown={handleKeyDown}
      tabIndex={interactive ? 0 : -1}
      data-element-id={element.id}
    >
      {/* ── TEXT ── */}
      {element.type === "text" && (
        <div
          ref={isEditing ? textRef : undefined}
          contentEditable={isEditing}
          suppressContentEditableWarning
          onBlur={isEditing ? handleBlur : undefined}
          className="w-full h-full flex items-start"
          style={{
            fontFamily: element.fontFamily ?? "sans-serif",
            fontSize: `${fontSize}px`,
            fontWeight: element.fontWeight ?? "400",
            fontStyle: element.fontStyle ?? "normal",
            letterSpacing: element.letterSpacing ? `${element.letterSpacing}em` : undefined,
            lineHeight: element.lineHeight ?? 1.2,
            textTransform: element.textTransform ?? "none",
            textAlign: element.textAlign ?? "left",
            color: element.textColor ?? "#000000",
            textShadow: element.textShadow ?? "none",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            justifyContent:
              element.textAlign === "center"
                ? "center"
                : element.textAlign === "right"
                ? "flex-end"
                : "flex-start",
            flexDirection: "column",
            outline: isEditing ? "1px dashed #3b82f6" : "none",
            padding: isEditing ? "2px 4px" : undefined,
            background: element.fillColor ?? "transparent",
            borderRadius: element.borderRadius ? `${element.borderRadius}px` : undefined,
            userSelect: isEditing ? "text" : "none",
            cursor: isEditing ? "text" : undefined,
          }}
        >
          {element.content ?? ""}
        </div>
      )}

      {/* ── IMAGE ── */}
      {element.type === "image" && (
        <div className="w-full h-full relative overflow-hidden" style={{ borderRadius: element.borderRadius ? `${element.borderRadius}px` : undefined }}>
          {element.imageUrl ? (
            <Image
              src={element.imageUrl}
              alt=""
              fill
              className="pointer-events-none"
              style={{
                objectFit: element.objectFit ?? "cover",
                objectPosition: element.objectPosition ?? "center",
              }}
              sizes="600px"
            />
          ) : (
            <div className="w-full h-full bg-gray-200/50 flex items-center justify-center">
              <div className="text-center">
                <svg className="w-8 h-8 text-gray-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
                </svg>
                <p className="text-[10px] text-gray-400 mt-1">Photo</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── SHAPE ── */}
      {element.type === "shape" && (
        <ShapeRenderer element={element} />
      )}

      {/* ── STICKER (emoji / SVG) ── */}
      {element.type === "sticker" && (
        <div className="w-full h-full flex items-center justify-center" style={{ fontSize: `${fontSize}px` }}>
          {element.content ?? "⭐"}
        </div>
      )}
    </div>
  );
}

/* ─── Shape renderer ─── */
function ShapeRenderer({ element }: { element: FreeformElement }) {
  const style: React.CSSProperties = {
    width: "100%",
    height: "100%",
    backgroundColor: element.fillColor ?? "transparent",
    border:
      element.strokeWidth && element.strokeColor
        ? `${element.strokeWidth}px ${element.borderStyle ?? "solid"} ${element.strokeColor}`
        : "none",
    borderRadius:
      element.shapeType === "circle"
        ? "50%"
        : element.borderRadius
        ? `${element.borderRadius}px`
        : undefined,
  };

  if (element.shapeType === "line") {
    return (
      <div className="w-full h-full flex items-center">
        <div
          style={{
            width: "100%",
            height: `${element.strokeWidth ?? 2}px`,
            backgroundColor: element.strokeColor ?? "#000000",
          }}
        />
      </div>
    );
  }

  return <div style={style} />;
}

/* ─── Moveable wrapper for selected element ─── */
function MoveableWrapper({
  selectedId,
  elements,
  canvasSize,
  onUpdateElement,
}: {
  selectedId: string;
  elements: FreeformElement[];
  canvasSize: { width: number; height: number };
  onUpdateElement: (id: string, updates: Partial<FreeformElement>) => void;
}) {
  const element = elements.find((e) => e.id === selectedId);
  if (!element || element.locked) return null;

  const target = `.magazine-el-${selectedId}`;

  return (
    <Moveable
      target={target}
      container={null}
      draggable={true}
      resizable={true}
      rotatable={true}
      snappable={false}
      throttleDrag={0}
      throttleResize={0}
      throttleRotate={0}
      keepRatio={false}
      renderDirections={["nw", "n", "ne", "w", "e", "sw", "s", "se"]}
      rotationPosition="top"
      origin={false}
      padding={{ left: 0, top: 0, right: 0, bottom: 0 }}
      onDrag={({ target: t, left, top }) => {
        const xPct = (left / canvasSize.width) * 100;
        const yPct = (top / canvasSize.height) * 100;
        (t as HTMLElement).style.left = `${xPct}%`;
        (t as HTMLElement).style.top = `${yPct}%`;
      }}
      onDragEnd={({ target: t }) => {
        const el = t as HTMLElement;
        const xPct = (parseFloat(el.style.left) || 0);
        const yPct = (parseFloat(el.style.top) || 0);
        onUpdateElement(selectedId, { x: xPct, y: yPct });
      }}
      onResize={({ target: t, width, height, direction, drag }) => {
        const wPct = (width / canvasSize.width) * 100;
        const hPct = (height / canvasSize.height) * 100;
        (t as HTMLElement).style.width = `${wPct}%`;
        (t as HTMLElement).style.height = `${hPct}%`;
        (t as HTMLElement).style.left = `${(drag.left / canvasSize.width) * 100}%`;
        (t as HTMLElement).style.top = `${(drag.top / canvasSize.height) * 100}%`;
      }}
      onResizeEnd={({ target: t }) => {
        const el = t as HTMLElement;
        onUpdateElement(selectedId, {
          x: parseFloat(el.style.left) || 0,
          y: parseFloat(el.style.top) || 0,
          width: parseFloat(el.style.width) || 10,
          height: parseFloat(el.style.height) || 10,
        });
      }}
      onRotate={({ target: t, transform }) => {
        (t as HTMLElement).style.transform = transform;
      }}
      onRotateEnd={({ target: t }) => {
        const match = (t as HTMLElement).style.transform.match(/rotate\(([-\d.]+)deg\)/);
        const deg = match ? parseFloat(match[1]) : element.rotation;
        onUpdateElement(selectedId, { rotation: deg });
      }}
    />
  );
}
