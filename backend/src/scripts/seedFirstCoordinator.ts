import { prisma } from '../config/db';
import { authService } from '../services/authService';

async function main() {
    const email = process.argv[2];
    const password = process.argv[3];
    const name = process.argv[4] || 'Admin Coordinator';
    const phoneNo = process.argv[5] || '0000000000';

    if (!email || !password) {
        console.error('Usage: bun src/scripts/seedFirstCoordinator.ts <email> <password> [name] [phoneNo]');
        process.exit(1);
    }

    try {
        // Ensure a placement cell exists
        let placementCell = await prisma.placementCell.findFirst();
        if (!placementCell) {
            placementCell = await prisma.placementCell.create({ data: {} });
            console.log('Created new PlacementCell');
        }

        const hashedPassword = await authService.hashPassword(password);

        const coordinator = await prisma.coordinator.create({
            data: {
                email,
                password: hashedPassword,
                name,
                phoneNo,
                placementCellId: placementCell.id,
            },
        });

        console.log('Coordinator created successfully:', coordinator.email);
    } catch (error) {
        console.error('Error seeding coordinator:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
