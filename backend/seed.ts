import { prisma } from './src/config/db';
import { authService } from './src/services/authService';

async function main() {
    // Create a PlacementCell first as it is required for Coordinator
    const placementCell = await prisma.placementCell.create({
        data: {},
    });

    const hashedPassword = await authService.hashPassword('password123');

    const coordinator = await prisma.coordinator.create({
        data: {
            name: 'Test Coordinator',
            email: 'coordinator@test.com',
            password: hashedPassword,
            phoneNo: '1234567890',
            placementCellId: placementCell.id,
        },
    });

    console.log('Created coordinator:', coordinator);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
