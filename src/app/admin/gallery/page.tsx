"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Paintbrush } from "lucide-react";

const GALLERY_ITEMS = [
  { id: "1", title: "Coucher de soleil Sahara", category: "METAL_PLATE", active: true },
  { id: "2", title: "Calligraphie Arabe", category: "METAL_PLATE", active: true },
  { id: "3", title: "Zellige Marocain", category: "PHONE_CASE", active: true },
  { id: "4", title: "Portrait Pop Art", category: "METAL_PLATE", active: false },
  { id: "5", title: "Jardin Majorelle", category: "PHONE_CASE", active: true },
  { id: "6", title: "Typographie Moderne", category: "METAL_PLATE", active: true },
];

export default function AdminGalleryPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Galerie</h1>
          <p className="text-sm text-muted-foreground">
            Gérez les exemples affichés dans la galerie publique
          </p>
        </div>
        <Button variant="accent" size="sm">
          <Plus className="h-4 w-4" />
          Ajouter
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {GALLERY_ITEMS.map((item) => (
          <div
            key={item.id}
            className="border border-border rounded-xl overflow-hidden bg-card"
          >
            <div className="aspect-[4/3] bg-gradient-to-br from-accent/10 via-secondary to-primary/5 flex items-center justify-center">
              <Paintbrush className="h-8 w-8 text-accent/30" />
            </div>
            <div className="p-3">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-sm">{item.title}</h3>
                <Badge
                  variant={item.active ? "success" : "secondary"}
                  className="text-[10px]"
                >
                  {item.active ? "Actif" : "Masqué"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {item.category === "METAL_PLATE"
                  ? "Plaque Métal"
                  : "Coque Téléphone"}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
