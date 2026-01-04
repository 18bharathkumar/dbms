import { prisma } from '../config/db';

async function main() {
    console.log('Updating existing JobRoles to have a default applicationDeadline using raw SQL...');
    const count = await prisma.$executeRaw`
    UPDATE "JobRole" 
    SET "applicationDeadline" = NOW() 
    WHERE "applicationDeadline" IS NULL
  `;
    console.log(`Updated ${count} rows.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
