import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clear existing data
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.design.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  // Create admin user
  await prisma.user.create({
    data: {
      email: "admin@artforge.ma",
      name: "Admin",
      role: "ADMIN",
    },
  });

  // Create Metal Plate product
  const metalPlate = await prisma.product.create({
    data: {
      slug: "metal-plate",
      name: "Metal Plate",
      description:
        "Premium UV-printed aluminum plates with stunning detail and durability. Perfect for wall art, gifts, or professional displays.",
      category: "METAL_PLATE",
      basePrice: 150,
      images: ["/images/products/metal-plate-1.jpg", "/images/products/metal-plate-2.jpg"],
      templateUrl: "/templates/metal-plate.png",
      variants: {
        create: [
          { size: "A4", finish: "MATTE", priceModifier: 0, sku: "MP-A4-MATTE" },
          { size: "A4", finish: "GLOSS", priceModifier: 20, sku: "MP-A4-GLOSS" },
          { size: "A3", finish: "MATTE", priceModifier: 70, sku: "MP-A3-MATTE" },
          { size: "A3", finish: "GLOSS", priceModifier: 90, sku: "MP-A3-GLOSS" },
        ],
      },
    },
  });

  // Create Phone Case product
  const phoneCase = await prisma.product.create({
    data: {
      slug: "phone-case",
      name: "Phone Case",
      description:
        "Custom UV-printed phone cases with vivid colors and scratch-resistant finish. Available for iPhone and Samsung models.",
      category: "PHONE_CASE",
      basePrice: 120,
      images: ["/images/products/phone-case-1.jpg", "/images/products/phone-case-2.jpg"],
      templateUrl: "/templates/phone-case.png",
      variants: {
        create: [
          { phoneModel: "iphone-14", finish: "MATTE", priceModifier: 0, sku: "PC-IP14-MATTE" },
          { phoneModel: "iphone-14", finish: "GLOSS", priceModifier: 20, sku: "PC-IP14-GLOSS" },
          { phoneModel: "iphone-15", finish: "MATTE", priceModifier: 0, sku: "PC-IP15-MATTE" },
          { phoneModel: "iphone-15", finish: "GLOSS", priceModifier: 20, sku: "PC-IP15-GLOSS" },
          { phoneModel: "iphone-16", finish: "MATTE", priceModifier: 0, sku: "PC-IP16-MATTE" },
          { phoneModel: "iphone-16", finish: "GLOSS", priceModifier: 20, sku: "PC-IP16-GLOSS" },
          { phoneModel: "samsung-s23", finish: "MATTE", priceModifier: 0, sku: "PC-SS23-MATTE" },
          { phoneModel: "samsung-s23", finish: "GLOSS", priceModifier: 20, sku: "PC-SS23-GLOSS" },
          { phoneModel: "samsung-s24", finish: "MATTE", priceModifier: 0, sku: "PC-SS24-MATTE" },
          { phoneModel: "samsung-s24", finish: "GLOSS", priceModifier: 20, sku: "PC-SS24-GLOSS" },
        ],
      },
    },
  });

  // Create example designs
  const exampleDesigns = [
    {
      name: "Moroccan Zellige Pattern",
      previewUrl: "/images/examples/zellige-pattern.jpg",
      productId: metalPlate.id,
      isExample: true,
    },
    {
      name: "Atlas Mountains Sunset",
      previewUrl: "/images/examples/atlas-sunset.jpg",
      productId: metalPlate.id,
      isExample: true,
    },
    {
      name: "Marrakech Medina",
      previewUrl: "/images/examples/marrakech-medina.jpg",
      productId: metalPlate.id,
      isExample: true,
    },
    {
      name: "Abstract Geometric",
      previewUrl: "/images/examples/abstract-geometric.jpg",
      productId: metalPlate.id,
      isExample: true,
    },
    {
      name: "Floral Mandala",
      previewUrl: "/images/examples/floral-mandala.jpg",
      productId: phoneCase.id,
      isExample: true,
    },
    {
      name: "Neon Galaxy",
      previewUrl: "/images/examples/neon-galaxy.jpg",
      productId: phoneCase.id,
      isExample: true,
    },
    {
      name: "Moroccan Calligraphy",
      previewUrl: "/images/examples/moroccan-calligraphy.jpg",
      productId: phoneCase.id,
      isExample: true,
    },
    {
      name: "Sahara Dunes",
      previewUrl: "/images/examples/sahara-dunes.jpg",
      productId: metalPlate.id,
      isExample: true,
    },
  ];

  for (const design of exampleDesigns) {
    await prisma.design.create({ data: design });
  }

  console.log("✅ Seeding complete!");
  console.log(`   - 1 admin user`);
  console.log(`   - 2 products (Metal Plate, Phone Case)`);
  console.log(`   - 14 product variants`);
  console.log(`   - ${exampleDesigns.length} example designs`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
