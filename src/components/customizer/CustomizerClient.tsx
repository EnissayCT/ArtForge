"use client";

import { useCallback, useRef, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { useEditorStore } from "@/stores/editor-store";
import { useCartStore } from "@/stores/cart-store";
import { calculatePrice, getVariantLabel } from "@/lib/pricing";
import { ImageUploader } from "@/components/customizer/ImageUploader";
import { ProductOptions } from "@/components/customizer/ProductOptions";
import { PriceDisplay } from "@/components/customizer/PriceDisplay";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Check, SlidersHorizontal } from "lucide-react";
import type { Category, FinishKey, SizeKey } from "@/config/pricing";

// Dynamic imports for heavy client-only components
const CanvasEditor = dynamic(
  () =>
    import("@/components/customizer/CanvasEditor").then(
      (mod) => mod.CanvasEditor
    ),
  { ssr: false, loading: () => <CanvasLoading /> }
);

const Preview3D = dynamic(
  () =>
    import("@/components/customizer/Preview3D").then((mod) => mod.Preview3D),
  { ssr: false, loading: () => <PreviewLoading /> }
);

function CanvasLoading() {
  return (
    <div className="flex-1 flex items-center justify-center bg-secondary/30 rounded-lg min-h-[400px]">
      <div className="text-center">
        <div className="h-8 w-8 rounded-full border-2 border-accent border-t-transparent animate-spin mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">Chargement de l&apos;éditeur...</p>
      </div>
    </div>
  );
}

function PreviewLoading() {
  return (
    <div className="aspect-[3/4] rounded-xl border border-border bg-secondary/30 flex items-center justify-center">
      <div className="h-6 w-6 rounded-full border-2 border-accent border-t-transparent animate-spin" />
    </div>
  );
}

// Filter UI component
function ImageFilters({
  onApply,
}: {
  onApply: (filters: {
    brightness?: number;
    contrast?: number;
    saturation?: number;
    blur?: number;
    grayscale?: boolean;
  }) => void;
}) {
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [saturation, setSaturation] = useState(0);
  const [blur, setBlur] = useState(0);
  const [grayscale, setGrayscale] = useState(false);

  const apply = useCallback(() => {
    onApply({ brightness, contrast, saturation, blur, grayscale });
  }, [onApply, brightness, contrast, saturation, blur, grayscale]);

  // Auto-apply on change
  useEffect(() => {
    apply();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brightness, contrast, saturation, blur, grayscale]);

  const reset = () => {
    setBrightness(0);
    setContrast(0);
    setSaturation(0);
    setBlur(0);
    setGrayscale(false);
    onApply({});
  };

  const sliders = [
    { label: "Luminosité", value: brightness, set: setBrightness, min: -0.5, max: 0.5, step: 0.05 },
    { label: "Contraste", value: contrast, set: setContrast, min: -0.5, max: 0.5, step: 0.05 },
    { label: "Saturation", value: saturation, set: setSaturation, min: -1, max: 1, step: 0.1 },
    { label: "Flou", value: blur, set: setBlur, min: 0, max: 1, step: 0.05 },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold flex items-center gap-1.5">
          <SlidersHorizontal className="h-4 w-4 text-accent" />
          Filtres Image
        </h3>
        <button
          onClick={reset}
          className="text-xs text-muted-foreground hover:text-accent transition-colors"
        >
          Réinitialiser
        </button>
      </div>
      {sliders.map((s) => (
        <div key={s.label}>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-muted-foreground">{s.label}</span>
            <span className="text-accent font-mono">{s.value.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min={s.min}
            max={s.max}
            step={s.step}
            value={s.value}
            onChange={(e) => s.set(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-secondary rounded-full appearance-none cursor-pointer accent-orange-500"
          />
        </div>
      ))}
      <label className="flex items-center gap-2 text-xs cursor-pointer">
        <input
          type="checkbox"
          checked={grayscale}
          onChange={(e) => setGrayscale(e.target.checked)}
          className="accent-orange-500"
        />
        <span className="text-muted-foreground">Noir &amp; Blanc</span>
      </label>
    </div>
  );
}

export function CustomizerClient() {
  const searchParams = useSearchParams();
  const addImageRef = useRef<((dataUrl: string) => void) | null>(null);
  const exportPrintRef = useRef<(() => string | null) | null>(null);
  const clearCanvasRef = useRef<(() => void) | null>(null);
  const applyFiltersRef = useRef<
    ((filters: {
      brightness?: number;
      contrast?: number;
      saturation?: number;
      blur?: number;
      grayscale?: boolean;
    }) => void) | null
  >(null);
  const [addedToCart, setAddedToCart] = useState(false);
  const [activeTab, setActiveTab] = useState<"editor" | "preview" | "options">("preview");

  const store = useEditorStore();
  const addToCart = useCartStore((s) => s.addItem);

  // Initialize from URL params
  useEffect(() => {
    const product = searchParams.get("product");
    const sizeParam = searchParams.get("size");
    const phoneParam = searchParams.get("phone");

    if (product === "metal-plate") {
      store.setProductConfig({
        category: "METAL_PLATE",
        size: (sizeParam as "A3" | "A4") || "A4",
      });
    } else if (product === "phone-case") {
      store.setProductConfig({
        category: "PHONE_CASE",
        phoneModel: phoneParam || "iphone-15",
      });
    } else {
      store.setProductConfig({ category: "METAL_PLATE", size: "A4" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-load image from URL param (e.g. clicked from home page)
  const imageParamLoaded = useRef(false);
  useEffect(() => {
    if (imageParamLoaded.current) return;
    const imageUrl = searchParams.get("image");
    if (!imageUrl || !addImageRef.current) return;
    imageParamLoaded.current = true;

    // Fetch through proxy to avoid CORS
    const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(imageUrl)}`;
    fetch(proxyUrl)
      .then((res) => res.blob())
      .then((blob) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const dataUrl = reader.result as string;
          if (addImageRef.current) {
            addImageRef.current(dataUrl);
          }
        };
        reader.readAsDataURL(blob);
      })
      .catch(() => {
        // Silently fail — user can still upload manually
      });
  });

  const handleImageReady = useCallback((dataUrl: string) => {
    if (addImageRef.current) {
      addImageRef.current(dataUrl);
    }
  }, []);

  const handleImageClear = useCallback(() => {
    if (clearCanvasRef.current) {
      clearCanvasRef.current();
    }
  }, []);

  const handleApplyFilters = useCallback(
    (filters: {
      brightness?: number;
      contrast?: number;
      saturation?: number;
      blur?: number;
      grayscale?: boolean;
    }) => {
      if (applyFiltersRef.current) {
        applyFiltersRef.current(filters);
      }
    },
    []
  );

  const handleAddToCart = useCallback(() => {
    if (!store.category) return;

    const price = calculatePrice({
      category: store.category as Category,
      size: (store.category === "METAL_PLATE" ? store.size : undefined) as SizeKey | undefined,
      finish: store.finish as FinishKey,
      whiteInk: store.whiteInk,
      quantity: 1,
    });

    const variantLabel = getVariantLabel({
      size: store.category === "METAL_PLATE" ? store.size : null,
      finish: store.finish,
      phoneModel: store.category === "PHONE_CASE" ? store.phoneModel : null,
    });

    const previewUrl = store.textureDataUrl || "";

    addToCart({
      productId: store.category === "METAL_PLATE" ? "metal-plate" : "phone-case",
      variantId: `${store.category}-${store.size}-${store.finish}-${store.phoneModel || "none"}`,
      productName:
        store.category === "METAL_PLATE" ? "Plaque Métal" : "Coque Téléphone",
      variantLabel,
      previewUrl,
      unitPrice: price.unitPrice,
      quantity: store.quantity,
    });

    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  }, [store, addToCart]);

  return (
    <div className="h-full">
      {/* Mobile Tab Navigation */}
      <div className="md:hidden flex border-b border-border">
        {(["preview", "editor", "options"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 text-sm font-medium text-center transition-colors ${
              activeTab === tab
                ? "text-accent border-b-2 border-accent"
                : "text-muted-foreground"
            }`}
          >
            {tab === "editor" && "Éditeur"}
            {tab === "preview" && "Aperçu 3D"}
            {tab === "options" && "Options"}
          </button>
        ))}
      </div>

      {/* Desktop: Side-by-side layout / Mobile: Tabs */}
      <div className="flex flex-col md:flex-row h-[calc(100vh-4rem)]">
        {/* LEFT — 3D Preview: sticky, fills viewport height */}
        <div
          className={`md:w-[58%] md:block md:sticky md:top-16 md:h-[calc(100vh-4rem)] ${
            activeTab === "preview" ? "block" : "hidden"
          }`}
        >
          <div className="h-full flex flex-col p-4 pb-3">
            <div className="flex-1 min-h-0 rounded-xl border border-border bg-secondary/10 overflow-hidden">
              <Preview3D />
            </div>
            {/* Price + Add to Cart under preview on desktop */}
            <div className="hidden md:flex items-center gap-3 mt-3 pt-3 border-t border-border">
              <div className="flex-1">
                <PriceDisplay />
              </div>
              <Button
                variant="accent"
                size="lg"
                className="text-sm px-6 shrink-0"
                onClick={handleAddToCart}
                disabled={!store.textureDataUrl}
              >
                {addedToCart ? (
                  <>
                    <Check className="h-4 w-4" /> Ajouté !
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-4 w-4" /> Ajouter au panier
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* RIGHT — Editor + Options Panel: independently scrollable */}
        <div
          className={`md:w-[42%] md:block md:h-[calc(100vh-4rem)] md:overflow-y-auto md:border-l md:border-border ${
            activeTab !== "preview" ? "block" : "hidden"
          }`}
        >
          <div className="space-y-4 p-4">
            {/* Upload */}
            <div className={`${activeTab === "options" || activeTab === "editor" ? "block" : "hidden md:block"}`}>
              <ImageUploader onImageReady={handleImageReady} onImageClear={handleImageClear} />
            </div>

            {/* Image Filters */}
            {store.textureDataUrl && (
              <div className={`bg-card border border-border rounded-lg p-3 ${activeTab === "editor" ? "block" : "hidden md:block"}`}>
                <ImageFilters onApply={handleApplyFilters} />
              </div>
            )}

            {/* Canvas Editor — hidden canvas + design controls */}
            <div className={`${activeTab === "editor" ? "block" : "hidden md:block"}`}>
              <CanvasEditor
                onImageAdd={(fn) => {
                  addImageRef.current = fn;
                }}
                onExportPrint={(fn) => {
                  exportPrintRef.current = fn;
                }}
                onClearCanvas={(fn) => {
                  clearCanvasRef.current = fn;
                }}
                onApplyFilters={(fn) => {
                  applyFiltersRef.current = fn;
                }}
              />
            </div>

            {/* Product Options */}
            <div className={`${activeTab === "options" ? "block" : "hidden md:block"}`}>
              <ProductOptions />
            </div>

            {/* Mobile: Price + Cart button */}
            <div className="md:hidden space-y-3">
              <PriceDisplay />
              <Button
                variant="accent"
                size="lg"
                className="w-full text-base"
                onClick={handleAddToCart}
                disabled={!store.textureDataUrl}
              >
                {addedToCart ? (
                  <>
                    <Check className="h-5 w-5" /> Ajouté au panier !
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-5 w-5" /> Ajouter au panier
                  </>
                )}
              </Button>
              {!store.textureDataUrl && (
                <p className="text-xs text-muted-foreground text-center">
                  Uploadez une image pour continuer
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
