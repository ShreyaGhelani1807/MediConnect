const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.doctorProfile.updateMany({
    data: { verificationStatus: 'approved' }
  });
  console.log(`✅ Approved ${result.count} existing doctors`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());