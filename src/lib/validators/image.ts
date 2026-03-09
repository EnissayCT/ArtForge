import { PLATE_SIZES, PHONE_MODELS, type PhoneModelId } from "@/config/products";
import type { ImageValidationResult } from "@/types/editor";

/**
 * Validate uploaded image dimensions against the target product's print requirements.
 * Returns quality tier based on DPI-equivalent calculation.
 */
export function validateImageForProduct(
  imageWidth: number,
  imageHeight: number,
  productType: "METAL_PLATE" | "PHONE_CASE",
  options: { size?: "A3" | "A4"; phoneModel?: string }
): ImageValidationResult {
  let minWidth: number;
  let minHeight: number;
  let printWidthMm: number;
  let printHeightMm: number;

  if (productType === "METAL_PLATE") {
    const plateSize = options.size || "A4";
    const config = PLATE_SIZES[plateSize];
    minWidth = config.printArea.minPixelWidth;
    minHeight = config.printArea.minPixelHeight;
    printWidthMm = config.printArea.widthMm;
    printHeightMm = config.printArea.heightMm;
  } else {
    const modelId = (options.phoneModel || "iphone-15") as PhoneModelId;
    const config = PHONE_MODELS[modelId];
    minWidth = config.printArea.minPixelWidth;
    minHeight = config.printArea.minPixelHeight;
    printWidthMm = config.printArea.widthMm;
    printHeightMm = config.printArea.heightMm;
  }

  // Calculate DPI-equivalent: use the smaller dimension ratio
  const dpiWidth = (imageWidth / printWidthMm) * 25.4;
  const dpiHeight = (imageHeight / printHeightMm) * 25.4;
  const dpiEquivalent = Math.round(Math.min(dpiWidth, dpiHeight));

  // Allow either orientation (landscape or portrait)
  const fitsNormal = imageWidth >= minWidth && imageHeight >= minHeight;
  const fitsRotated = imageWidth >= minHeight && imageHeight >= minWidth;
  // fitsNormal || fitsRotated used for future print area validation

  let quality: "excellent" | "good" | "low";
  let message: string;

  if (dpiEquivalent >= 300) {
    quality = "excellent";
    message = "Excellente qualité — parfait pour l'impression";
  } else if (dpiEquivalent >= 200) {
    quality = "good";
    message = "Bonne qualité — résultat acceptable";
  } else {
    quality = "low";
    message = `Résolution faible (${dpiEquivalent} DPI) — le résultat risque d'être pixelisé`;
  }

  return {
    valid: dpiEquivalent >= 100, // Reject below 100 DPI
    quality,
    width: imageWidth,
    height: imageHeight,
    message,
    dpiEquivalent,
  };
}

/**
 * Client-side helper: load an image file and get its natural dimensions.
 */
export function getImageDimensions(
  file: File
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Impossible de charger l'image"));
    };
    img.src = url;
  });
}

/** Supported image MIME types */
export const ACCEPTED_IMAGE_TYPES = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
};

/** Max file size: 50MB */
export const MAX_FILE_SIZE = 50 * 1024 * 1024;
