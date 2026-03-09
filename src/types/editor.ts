export interface EditorState {
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
}

export interface ImageValidationResult {
  valid: boolean;
  quality: "excellent" | "good" | "low";
  width: number;
  height: number;
  message: string;
  dpiEquivalent: number;
}
