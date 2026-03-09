"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import * as fabric from "fabric";
import { useEditorStore } from "@/stores/editor-store";
import { PLATE_SIZES, PHONE_MODELS, type PhoneModelId } from "@/config/products";

// Debounce helper
function debounce<T extends (...args: unknown[]) => void>(fn: T, ms: number) {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

export function useCanvasEditor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);

  const {
    category,
    size,
    phoneModel,
    setCanvasReady,
    setSelectedObject,
    setTextureDataUrl,
    pushUndo,
  } = useEditorStore();

  // Get canvas dimensions — fill the container fully
  const getCanvasDimensions = useCallback(() => {
    const container = containerRef.current;
    if (!container) return { width: 500, height: 600 };

    const containerWidth = container.clientWidth || 500;
    const containerHeight = container.clientHeight || 600;

    let aspectRatio: number;

    if (category === "PHONE_CASE" && phoneModel) {
      const model = PHONE_MODELS[phoneModel as PhoneModelId];
      aspectRatio = model?.aspectRatio || 0.48;
    } else {
      const plateSize = PLATE_SIZES[size || "A4"];
      aspectRatio = plateSize.aspectRatio;
    }

    // Fit within container keeping aspect ratio
    let width = containerWidth;
    let height = width / aspectRatio;

    if (height > containerHeight) {
      height = containerHeight;
      width = height * aspectRatio;
    }

    return { width: Math.round(width), height: Math.round(height) };
  }, [category, size, phoneModel]);

  // Export texture for 3D preview — higher quality
  const exportTexture = useCallback(() => {
    if (!fabricRef.current) return;
    const canvas = fabricRef.current;

    // Temporarily hide safe zone for clean export
    const objects = canvas.getObjects();
    const safeZone = objects.find(
      (obj) => (obj as fabric.FabricObject & { isSafeZone?: boolean }).isSafeZone
    );
    if (safeZone) safeZone.visible = false;

    const dataUrl = canvas.toDataURL({
      format: "png",
      multiplier: 3, // Higher quality for 3D preview
      quality: 1,
    });

    if (safeZone) safeZone.visible = true;
    canvas.renderAll();

    setTextureDataUrl(dataUrl);
  }, [setTextureDataUrl]);

  // Debounced export
  const debouncedExport = useCallback(
    () => debounce(() => exportTexture(), 100)(),
    [exportTexture]
  );

  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current || fabricRef.current) return;

    const { width, height } = getCanvasDimensions();

    const canvas = new fabric.Canvas(canvasRef.current, {
      width,
      height,
      backgroundColor: "#ffffff",
      selection: true,
      preserveObjectStacking: true,
    });

    fabricRef.current = canvas;

    // Draw safe zone — subtle and clear
    const margin = Math.min(width, height) * 0.03;
    const safeZone = new fabric.Rect({
      left: margin,
      top: margin,
      width: width - margin * 2,
      height: height - margin * 2,
      fill: "transparent",
      stroke: "rgba(249,115,22,0.35)",
      strokeWidth: 1.5,
      strokeDashArray: [8, 4],
      selectable: false,
      evented: false,
      excludeFromExport: true,
    });
    // @ts-expect-error - custom property for identification
    safeZone.isSafeZone = true;
    canvas.add(safeZone);

    // Event listeners
    canvas.on("selection:created", (e) => {
      const obj = e.selected?.[0];
      if (obj) {
        setSelectedObject((obj as fabric.FabricObject & { id?: string }).id || null);
      }
    });

    canvas.on("selection:updated", (e) => {
      const obj = e.selected?.[0];
      if (obj) {
        setSelectedObject((obj as fabric.FabricObject & { id?: string }).id || null);
      }
    });

    canvas.on("selection:cleared", () => {
      setSelectedObject(null);
    });

    canvas.on("object:modified", () => {
      saveState();
      debouncedExport();
    });

    canvas.on("object:added", () => {
      debouncedExport();
    });

    // Save initial state
    const saveState = () => {
      const json = JSON.stringify(canvas.toJSON());
      pushUndo(json);
    };
    saveState();

    setCanvasReady(true);
    setIsReady(true);

    return () => {
      canvas.dispose();
      fabricRef.current = null;
      setCanvasReady(false);
      setIsReady(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Resize canvas when product config changes
  useEffect(() => {
    if (!fabricRef.current || !isReady) return;
    const { width, height } = getCanvasDimensions();
    fabricRef.current.setDimensions({ width, height });

    // Update safe zone
    const objects = fabricRef.current.getObjects();
    const safeZone = objects.find(
      (obj) => (obj as fabric.FabricObject & { isSafeZone?: boolean }).isSafeZone
    );
    if (safeZone) {
      const margin = Math.min(width, height) * 0.03;
      safeZone.set({
        left: margin,
        top: margin,
        width: width - margin * 2,
        height: height - margin * 2,
      });
    }

    fabricRef.current.renderAll();
    debouncedExport();
  }, [category, size, phoneModel, getCanvasDimensions, isReady, debouncedExport]);

  // Add image to canvas
  const addImage = useCallback(
    (dataUrl: string) => {
      if (!fabricRef.current) return;

      const canvas = fabricRef.current;
      const canvasWidth = canvas.getWidth();
      const canvasHeight = canvas.getHeight();

      // Remove any existing images first (one at a time for now)
      const existingImages = canvas.getObjects().filter(
        (obj) => obj.type === "image" || (obj as fabric.FabricObject & { id?: string }).id?.startsWith("img-")
      );
      existingImages.forEach((img) => canvas.remove(img));

      fabric.FabricImage.fromURL(dataUrl).then((img) => {
        // Scale to fill the canvas
        const scaleW = canvasWidth / (img.width || 1);
        const scaleH = canvasHeight / (img.height || 1);
        const scale = Math.max(scaleW, scaleH); // cover, not contain

        img.set({
          scaleX: scale,
          scaleY: scale,
          left: canvasWidth / 2,
          top: canvasHeight / 2,
          originX: "center",
          originY: "center",
          cornerColor: "#f97316",
          cornerStyle: "circle",
          cornerSize: 10,
          transparentCorners: false,
          borderColor: "#f97316",
        });

        // Assign unique id
        (img as fabric.FabricObject & { id?: string }).id = `img-${Date.now()}`;
        canvas.add(img);
        // Move safe zone on top
        const objects = canvas.getObjects();
        const sz = objects.find(
          (obj) => (obj as fabric.FabricObject & { isSafeZone?: boolean }).isSafeZone
        );
        if (sz) canvas.bringObjectToFront(sz);

        canvas.setActiveObject(img);
        canvas.renderAll();

        const json = JSON.stringify(canvas.toJSON());
        pushUndo(json);
        exportTexture();
      });
    },
    [pushUndo, exportTexture]
  );

  // Remove ALL images from canvas (for clear/reset)
  const clearCanvas = useCallback(() => {
    if (!fabricRef.current) return;
    const canvas = fabricRef.current;
    const images = canvas.getObjects().filter(
      (obj) => (obj as fabric.FabricObject & { id?: string }).id?.startsWith("img-")
    );
    images.forEach((img) => canvas.remove(img));
    canvas.discardActiveObject();
    canvas.renderAll();
    setSelectedObject(null);
    useEditorStore.getState().setTextureDataUrl(null);
    const json = JSON.stringify(canvas.toJSON());
    pushUndo(json);
  }, [pushUndo, setSelectedObject]);

  // Remove selected object
  const removeSelected = useCallback(() => {
    if (!fabricRef.current) return;
    const active = fabricRef.current.getActiveObject();
    if (active && !(active as fabric.FabricObject & { isSafeZone?: boolean }).isSafeZone) {
      fabricRef.current.remove(active);
      fabricRef.current.renderAll();
      const json = JSON.stringify(fabricRef.current.toJSON());
      pushUndo(json);
      exportTexture();
    }
  }, [pushUndo, exportTexture]);

  // Center selected object
  const centerSelected = useCallback(() => {
    if (!fabricRef.current) return;
    const active = fabricRef.current.getActiveObject();
    if (active) {
      const canvasWidth = fabricRef.current.getWidth();
      const canvasHeight = fabricRef.current.getHeight();
      active.set({
        left: canvasWidth / 2,
        top: canvasHeight / 2,
        originX: "center",
        originY: "center",
      });
      active.setCoords();
      fabricRef.current.renderAll();
      const json = JSON.stringify(fabricRef.current.toJSON());
      pushUndo(json);
      exportTexture();
    }
  }, [pushUndo, exportTexture]);

  // Flip operations
  const flipHorizontal = useCallback(() => {
    if (!fabricRef.current) return;
    const active = fabricRef.current.getActiveObject();
    if (active) {
      active.set({ flipX: !active.flipX });
      fabricRef.current.renderAll();
      const json = JSON.stringify(fabricRef.current.toJSON());
      pushUndo(json);
      exportTexture();
    }
  }, [pushUndo, exportTexture]);

  const flipVertical = useCallback(() => {
    if (!fabricRef.current) return;
    const active = fabricRef.current.getActiveObject();
    if (active) {
      active.set({ flipY: !active.flipY });
      fabricRef.current.renderAll();
      const json = JSON.stringify(fabricRef.current.toJSON());
      pushUndo(json);
      exportTexture();
    }
  }, [pushUndo, exportTexture]);

  // Rotation
  const setRotation = useCallback(
    (degrees: number) => {
      if (!fabricRef.current) return;
      const active = fabricRef.current.getActiveObject();
      if (active) {
        active.set({ angle: degrees });
        fabricRef.current.renderAll();
        const json = JSON.stringify(fabricRef.current.toJSON());
        pushUndo(json);
        exportTexture();
      }
    },
    [pushUndo, exportTexture]
  );

  // Scale
  const setScale = useCallback(
    (scale: number) => {
      if (!fabricRef.current) return;
      const active = fabricRef.current.getActiveObject();
      if (active) {
        active.set({ scaleX: scale, scaleY: scale });
        active.setCoords();
        fabricRef.current.renderAll();
        const json = JSON.stringify(fabricRef.current.toJSON());
        pushUndo(json);
        exportTexture();
      }
    },
    [pushUndo, exportTexture]
  );

  // Opacity
  const setOpacity = useCallback(
    (opacity: number) => {
      if (!fabricRef.current) return;
      const active = fabricRef.current.getActiveObject();
      if (active) {
        active.set({ opacity });
        fabricRef.current.renderAll();
        exportTexture();
      }
    },
    [exportTexture]
  );

  // Undo
  const performUndo = useCallback(() => {
    const json = useEditorStore.getState().undo();
    if (json && fabricRef.current) {
      fabricRef.current.loadFromJSON(json).then(() => {
        fabricRef.current?.renderAll();
        exportTexture();
      });
    }
  }, [exportTexture]);

  // Redo
  const performRedo = useCallback(() => {
    const json = useEditorStore.getState().redo();
    if (json && fabricRef.current) {
      fabricRef.current.loadFromJSON(json).then(() => {
        fabricRef.current?.renderAll();
        exportTexture();
      });
    }
  }, [exportTexture]);

  // Zoom
  const zoomIn = useCallback(() => {
    if (!fabricRef.current) return;
    const zoom = fabricRef.current.getZoom() * 1.1;
    fabricRef.current.setZoom(Math.min(zoom, 5));
    useEditorStore.getState().setZoom(zoom);
  }, []);

  const zoomOut = useCallback(() => {
    if (!fabricRef.current) return;
    const zoom = fabricRef.current.getZoom() * 0.9;
    fabricRef.current.setZoom(Math.max(zoom, 0.2));
    useEditorStore.getState().setZoom(zoom);
  }, []);

  const zoomReset = useCallback(() => {
    if (!fabricRef.current) return;
    fabricRef.current.setZoom(1);
    useEditorStore.getState().setZoom(1);
  }, []);

  // Export high-res for print
  const exportPrintFile = useCallback(() => {
    if (!fabricRef.current) return null;
    return fabricRef.current.toDataURL({
      format: "png",
      multiplier: 4,
    });
  }, []);

  // Apply image filters to the active image
  const applyFilters = useCallback(
    (filters: {
      brightness?: number;
      contrast?: number;
      saturation?: number;
      blur?: number;
      grayscale?: boolean;
    }) => {
      if (!fabricRef.current) return;
      const active = fabricRef.current.getActiveObject();
      if (!active || !(active instanceof fabric.FabricImage)) return;

      const img = active as fabric.FabricImage;
      const filterList: InstanceType<typeof fabric.filters.BaseFilter>[] = [];

      if (filters.brightness !== undefined && filters.brightness !== 0) {
        filterList.push(new fabric.filters.Brightness({ brightness: filters.brightness }));
      }
      if (filters.contrast !== undefined && filters.contrast !== 0) {
        filterList.push(new fabric.filters.Contrast({ contrast: filters.contrast }));
      }
      if (filters.saturation !== undefined && filters.saturation !== 0) {
        filterList.push(new fabric.filters.Saturation({ saturation: filters.saturation }));
      }
      if (filters.blur !== undefined && filters.blur > 0) {
        filterList.push(new fabric.filters.Blur({ blur: filters.blur }));
      }
      if (filters.grayscale) {
        filterList.push(new fabric.filters.Grayscale());
      }

      img.filters = filterList;
      img.applyFilters();
      fabricRef.current.renderAll();
      debouncedExport();
    },
    [debouncedExport]
  );

  // Get current active object info
  const getActiveObjectInfo = useCallback(() => {
    if (!fabricRef.current) return null;
    const obj = fabricRef.current.getActiveObject();
    if (!obj) return null;
    return {
      angle: Math.round(obj.angle || 0),
      scaleX: obj.scaleX || 1,
      scaleY: obj.scaleY || 1,
      opacity: obj.opacity ?? 1,
      flipX: obj.flipX || false,
      flipY: obj.flipY || false,
    };
  }, []);

  return {
    canvasRef,
    containerRef,
    fabricRef,
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
    exportTexture,
    exportPrintFile,
    getActiveObjectInfo,
  };
}
