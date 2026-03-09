"use client";

import { useEditorStore } from "@/stores/editor-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PLATE_SIZES, PHONE_MODELS, FINISHES } from "@/config/products";
import { Minus, Plus } from "lucide-react";

export function ProductOptions() {
  const {
    category,
    size,
    finish,
    phoneModel,
    quantity,
    whiteInk,
    setProductConfig,
    setQuantity,
    setWhiteInk,
  } = useEditorStore();

  return (
    <div className="space-y-4">
      <label className="text-sm font-medium">Options du produit</label>

      {/* Size selector (metal plates only) */}
      {category === "METAL_PLATE" && (
        <div>
          <p className="text-xs text-muted-foreground mb-2">Format</p>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(PLATE_SIZES) as Array<"A3" | "A4">).map((s) => (
              <button
                key={s}
                onClick={() => setProductConfig({ size: s })}
                className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                  size === s
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-border hover:border-accent/50"
                }`}
              >
                {PLATE_SIZES[s].label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Phone model selector */}
      {category === "PHONE_CASE" && (
        <div>
          <p className="text-xs text-muted-foreground mb-2">Modèle</p>
          <div className="grid grid-cols-1 gap-2">
            {Object.values(PHONE_MODELS).map((model) => (
              <button
                key={model.id}
                onClick={() => setProductConfig({ phoneModel: model.id })}
                className={`p-2.5 rounded-lg border text-sm text-left transition-all flex items-center justify-between ${
                  phoneModel === model.id
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-border hover:border-accent/50"
                }`}
              >
                <span className="font-medium">{model.label}</span>
                <Badge variant="secondary" className="text-[10px]">
                  {model.brand}
                </Badge>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Finish selector */}
      <div>
        <p className="text-xs text-muted-foreground mb-2">Finition</p>
        <div className="grid grid-cols-2 gap-2">
          {FINISHES.map((f) => (
            <button
              key={f.id}
              onClick={() => setProductConfig({ finish: f.id })}
              className={`p-3 rounded-lg border text-center transition-all ${
                finish === f.id
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-border hover:border-accent/50"
              }`}
            >
              <span className="text-sm font-medium block">{f.label}</span>
              <span className="text-[10px] text-muted-foreground">
                {f.description}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* White ink toggle */}
      <div className="flex items-center justify-between p-3 rounded-lg border border-border">
        <div>
          <p className="text-sm font-medium">Encre blanche</p>
          <p className="text-[10px] text-muted-foreground">
            Couche supplémentaire pour couleurs plus vives (+30 MAD)
          </p>
        </div>
        <button
          onClick={() => setWhiteInk(!whiteInk)}
          className={`relative w-11 h-6 rounded-full transition-colors ${
            whiteInk ? "bg-accent" : "bg-secondary"
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
              whiteInk ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      {/* Quantity */}
      <div>
        <p className="text-xs text-muted-foreground mb-2">Quantité</p>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            onClick={() => setQuantity(quantity - 1)}
            disabled={quantity <= 1}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="text-lg font-semibold w-8 text-center">
            {quantity}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            onClick={() => setQuantity(quantity + 1)}
          >
            <Plus className="h-4 w-4" />
          </Button>
          {quantity >= 2 && quantity < 5 && (
            <Badge variant="accent" className="text-[10px]">
              -5%
            </Badge>
          )}
          {quantity >= 5 && quantity < 10 && (
            <Badge variant="accent" className="text-[10px]">
              -10%
            </Badge>
          )}
          {quantity >= 10 && (
            <Badge variant="accent" className="text-[10px]">
              -15%
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
