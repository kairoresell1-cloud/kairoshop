const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const categories = ["Elettronica", "Gaming", "Accessori", "Smartphone"];
  for (const name of categories) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name, slug: name.toLowerCase() },
    });
  }
  console.log("Categorie create.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
