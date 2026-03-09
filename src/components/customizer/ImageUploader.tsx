"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, AlertTriangle, CheckCircle, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  validateImageForProduct,
  getImageDimensions,
  ACCEPTED_IMAGE_TYPES,
  MAX_FILE_SIZE,
} from "@/lib/validators/image";
import { useEditorStore } from "@/stores/editor-store";
import type { ImageValidationResult } from "@/types/editor";

interface ImageUploaderProps {
  onImageReady: (dataUrl: string) => void;
  onImageClear?: () => void;
}

export function ImageUploader({ onImageReady, onImageClear }: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [validation, setValidation] = useState<ImageValidationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { category, size, phoneModel } = useEditorStore();

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      setError(null);
      setLoading(true);

      try {
        // Check file size
        if (file.size > MAX_FILE_SIZE) {
          setError("Le fichier est trop volumineux (max 50 Mo)");
          setLoading(false);
          return;
        }

        // Get image dimensions
        const { width, height } = await getImageDimensions(file);

        // Validate for product
        const result = validateImageForProduct(
          width,
          height,
          category || "METAL_PLATE",
          { size, phoneModel: phoneModel || undefined }
        );

        setValidation(result);

        if (!result.valid) {
          setError(
            "Résolution trop faible pour une impression de qualité. Veuillez utiliser une image plus grande."
          );
          setLoading(false);
          return;
        }

        // Create data URL for canvas
        const reader = new FileReader();
        reader.onload = (e) => {
          const dataUrl = e.target?.result as string;
          setPreview(dataUrl);
          onImageReady(dataUrl);
          useEditorStore.getState().setUploadedImage(dataUrl, result.quality);
        };
        reader.readAsDataURL(file);
      } catch (err) {
        setError("Erreur lors du chargement de l'image");
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [category, size, phoneModel, onImageReady]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_IMAGE_TYPES,
    maxFiles: 1,
    multiple: false,
  });

  const clearImage = () => {
    setPreview(null);
    setValidation(null);
    setError(null);
    useEditorStore.getState().setUploadedImage(null, null);
    // Also clear the canvas and 3D preview
    if (onImageClear) onImageClear();
  };

  const qualityConfig = {
    excellent: {
      label: "Excellente",
      variant: "success" as const,
      icon: CheckCircle,
    },
    good: {
      label: "Bonne",
      variant: "accent" as const,
      icon: CheckCircle,
    },
    low: {
      label: "Faible",
      variant: "destructive" as const,
      icon: AlertTriangle,
    },
  };

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium">Votre image</label>

      {!preview ? (
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all
            ${isDragActive ? "border-accent bg-accent/5" : "border-border hover:border-accent/50 hover:bg-secondary/50"}
          `}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-3">
            {loading ? (
              <div className="h-10 w-10 rounded-full border-2 border-accent border-t-transparent animate-spin" />
            ) : (
              <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
                <Upload className="h-6 w-6 text-accent" />
              </div>
            )}
            <div>
              <p className="text-sm font-medium">
                {isDragActive
                  ? "Déposez votre image ici"
                  : "Glissez-déposez ou cliquez pour choisir"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                JPG, PNG, WebP — max 50 Mo
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative rounded-xl border border-border overflow-hidden">
          <div className="aspect-video bg-secondary flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Aperçu"
              className="max-w-full max-h-full object-contain"
            />
          </div>
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8"
            onClick={clearImage}
          >
            <X className="h-4 w-4" />
          </Button>

          {validation && (
            <div className="p-3 flex items-center gap-2 bg-secondary/50">
              {(() => {
                const config = qualityConfig[validation.quality];
                const Icon = config.icon;
                return (
                  <>
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="text-xs">{validation.message}</span>
                    <Badge variant={config.variant} className="ml-auto text-[10px]">
                      {config.label} ({validation.dpiEquivalent} DPI)
                    </Badge>
                  </>
                );
              })()}
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-destructive text-sm">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="bg-secondary/50 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <ImageIcon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
          <div className="text-xs text-muted-foreground">
            <p className="font-medium mb-1">Recommandations :</p>
            <ul className="list-disc list-inside space-y-0.5">
              <li>Résolution min. 300 DPI pour une qualité optimale</li>
              <li>Formats acceptés : JPG, PNG, WebP</li>
              <li>Utilisez des images en haute résolution</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
