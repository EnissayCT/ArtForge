import { create } from "zustand";

interface EditorStore {
  /* Product configuration */
  productId: string | null;
  category: "METAL_PLATE" | "PHONE_CASE" | null;
  size: "A3" | "A4";
  finish: "MATTE" | "GLOSS";
  phoneModel: string | null;
  quantity: number;
  whiteInk: boolean;

  /* Canvas state */
  canvasReady: boolean;
  selectedObjectId: string | null;
  textureDataUrl: string | null;
  zoom: number;

  /* Undo/Redo */
  undoStack: string[];
  redoStack: string[];

  /* Upload */
  uploadedImageUrl: string | null;
  uploadQuality: "excellent" | "good" | "low" | null;

  /* Actions */
  setProductConfig: (config: {
    productId?: string;
    category?: "METAL_PLATE" | "PHONE_CASE";
    size?: "A3" | "A4";
    finish?: "MATTE" | "GLOSS";
    phoneModel?: string | null;
  }) => void;
  setQuantity: (qty: number) => void;
  setWhiteInk: (enabled: boolean) => void;
  setCanvasReady: (ready: boolean) => void;
  setSelectedObject: (id: string | null) => void;
  setTextureDataUrl: (url: string | null) => void;
  setZoom: (zoom: number) => void;
  pushUndo: (json: string) => void;
  undo: () => string | undefined;
  redo: () => string | undefined;
  setUploadedImage: (url: string | null, quality: "excellent" | "good" | "low" | null) => void;
  reset: () => void;
}

const initialState = {
  productId: null,
  category: null as "METAL_PLATE" | "PHONE_CASE" | null,
  size: "A4" as const,
  finish: "MATTE" as const,
  phoneModel: null,
  quantity: 1,
  whiteInk: false,
  canvasReady: false,
  selectedObjectId: null,
  textureDataUrl: null,
  zoom: 1,
  undoStack: [] as string[],
  redoStack: [] as string[],
  uploadedImageUrl: null,
  uploadQuality: null as "excellent" | "good" | "low" | null,
};

export const useEditorStore = create<EditorStore>((set, get) => ({
  ...initialState,

  setProductConfig: (config) =>
    set((state) => ({
      ...state,
      ...config,
    })),

  setQuantity: (qty) => set({ quantity: Math.max(1, qty) }),

  setWhiteInk: (enabled) => set({ whiteInk: enabled }),

  setCanvasReady: (ready) => set({ canvasReady: ready }),

  setSelectedObject: (id) => set({ selectedObjectId: id }),

  setTextureDataUrl: (url) => set({ textureDataUrl: url }),

  setZoom: (zoom) => set({ zoom: Math.max(0.1, Math.min(5, zoom)) }),

  pushUndo: (json) =>
    set((state) => ({
      undoStack: [...state.undoStack.slice(-49), json],
      redoStack: [],
    })),

  undo: () => {
    const { undoStack, redoStack } = get();
    if (undoStack.length < 2) return undefined;
    const current = undoStack[undoStack.length - 1];
    const previous = undoStack[undoStack.length - 2];
    set({
      undoStack: undoStack.slice(0, -1),
      redoStack: [...redoStack, current],
    });
    return previous;
  },

  redo: () => {
    const { undoStack, redoStack } = get();
    if (redoStack.length === 0) return undefined;
    const next = redoStack[redoStack.length - 1];
    set({
      undoStack: [...undoStack, next],
      redoStack: redoStack.slice(0, -1),
    });
    return next;
  },

  setUploadedImage: (url, quality) =>
    set({ uploadedImageUrl: url, uploadQuality: quality }),

  reset: () => set(initialState),
}));
