"use client";

import { useState } from "react";
import { useCanvasEditor } from "@/hooks/useCanvasEditor";
import { DesignControls } from "./DesignControls";
import { useEditorStore } from "@/stores/editor-store";
import {
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  ChevronDown,
  ChevronUp,
  Move,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface CanvasEditorProps {
  onImageAdd: (addFn: (dataUrl: string) => void) => void;
  onExportPrint: (exportFn: () => string | null) => void;
  onClearCanvas: (clearFn: () => void) => void;
  onApplyFilters: (filterFn: (filters: {
    brightness?: number;
    contrast?: number;
    saturation?: number;
    blur?: number;
    grayscale?: boolean;
  }) => void) => void;
}

export function CanvasEditor({ onImageAdd, onExportPrint, onClearCanvas, onApplyFilters }: CanvasEditorProps) {
  const {
    canvasRef,
    containerRef,
    isReady,
    addImage,
    clearCanvas,
    removeSelected,
    centerSelected,
    flipHorizontal,
    flipVertical,
    setRotation,
    setScale,
    setOpacity,
    applyFilters,
    performUndo,
    performRedo,
    zoomIn,
    zoomOut,
    zoomReset,
    exportPrintFile,
    getActiveObjectInfo,
  } = useCanvasEditor();

  const selectedObjectId = useEditorStore((s) => s.selectedObjectId);
  const undoStack = useEditorStore((s) => s.undoStack);
  const redoStack = useEditorStore((s) => s.redoStack);
  const zoom = useEditorStore((s) => s.zoom);
  const textureDataUrl = useEditorStore((s) => s.textureDataUrl);
  const [canvasExpanded, setCanvasExpanded] = useState(false);

  // Expose functions to parent
  if (isReady) {
    onImageAdd(addImage);
    onExportPrint(exportPrintFile);
    onClearCanvas(clearCanvas);
    onApplyFilters(applyFilters);
  }

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Header — Collapsible trigger for canvas preview */}
      <button
        onClick={() => setCanvasExpanded(!canvasExpanded)}
        className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-secondary/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Move className="h-4 w-4 text-accent" />
          <span className="text-sm font-semibold">Positionnement du Design</span>
          {textureDataUrl && (
            <span className="text-[10px] bg-accent/10 text-accent px-1.5 py-0.5 rounded-full">
              Cliquez pour ajuster
            </span>
          )}
        </div>
        {canvasExpanded ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {/* canvas preview area — always rendered for fabric.js init, hidden via CSS when collapsed */}
      <div className={canvasExpanded ? "border-t border-border" : "h-0 overflow-hidden"}>
          {/* Mini toolbar */}
          <div className="flex items-center justify-between px-2 py-1.5 bg-secondary/30 border-b border-border">
            <div className="flex items-center gap-0.5">
              <Button
                variant="ghost"
                size="icon"
                onClick={performUndo}
                disabled={undoStack.length < 2}
                title="Annuler"
                className="h-7 w-7"
              >
                <Undo2 className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={performRedo}
                disabled={redoStack.length === 0}
                title="Rétablir"
                className="h-7 w-7"
              >
                <Redo2 className="h-3.5 w-3.5" />
              </Button>
            </div>

            <div className="flex items-center gap-0.5">
              <Button variant="ghost" size="icon" onClick={zoomOut} className="h-7 w-7">
                <ZoomOut className="h-3.5 w-3.5" />
              </Button>
              <button
                onClick={zoomReset}
                className="text-[10px] text-muted-foreground hover:text-foreground min-w-[2.5rem] text-center"
              >
                {Math.round(zoom * 100)}%
              </button>
              <Button variant="ghost" size="icon" onClick={zoomIn} className="h-7 w-7">
                <ZoomIn className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={zoomReset} className="h-7 w-7">
                <Maximize2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Canvas Area */}
          <div
            ref={containerRef}
            className="relative h-[280px] flex items-center justify-center bg-zinc-100 dark:bg-zinc-900 overflow-hidden"
          >
            <div className="relative shadow-lg rounded-sm overflow-hidden">
              <canvas ref={canvasRef} />
            </div>
            {!isReady && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                <div className="h-6 w-6 rounded-full border-2 border-accent border-t-transparent animate-spin" />
              </div>
            )}
          </div>

          <p className="text-[10px] text-muted-foreground text-center py-1.5 bg-secondary/20 border-t border-border">
            Déplacez et redimensionnez votre image directement sur le canevas
          </p>
      </div>

      {/* Design Controls (visible when an object is selected) */}
      {selectedObjectId && (
        <div className="border-t border-border">
          <DesignControls
            onRemove={removeSelected}
            onCenter={centerSelected}
            onFlipH={flipHorizontal}
            onFlipV={flipVertical}
            onRotate={setRotation}
            onScale={setScale}
            onOpacity={setOpacity}
            getActiveInfo={getActiveObjectInfo}
          />
        </div>
      )}
    </div>
  );
}
