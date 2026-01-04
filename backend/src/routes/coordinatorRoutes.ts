import { Router, type Response } from 'express';
import { prisma } from '../config/db';
import { coordinatorAuth, type AuthRequest } from '../middleware/auth';
import { authService } from '../services/authService';

const router = Router();

/**
 * @swagger
 * /coordinators:
 *   post:
 *     summary: Create a new coordinator
 *     tags: [Coordinators]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - phoneNo
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               phoneNo:
 *                 type: string
 *     responses:
 *       201:
 *         description: Coordinator created
 *       400:
 *         description: All fields are required or Coordinator already exists
 *       404:
 *         description: Current coordinator not found
 *       500:
 *         description: Failed to create coordinator
 */
router.post('/', coordinatorAuth, async (req: AuthRequest, res: Response) => {
    try {
        const { name, email, password, phoneNo } = req.body;

        if (!name || !email || !password || !phoneNo) {
            res.status(400).json({ error: 'All fields are required' });
            return;
        }

        // Check if coordinator already exists
        const existing = await prisma.coordinator.findUnique({ where: { email } });
        if (existing) {
            res.status(400).json({ error: 'Coordinator already exists' });
            return;
        }

        // Get the placement cell ID from the current coordinator
        const currentCoordinator = await prisma.coordinator.findUnique({
            where: { id: req.user?.id },
        });

        if (!currentCoordinator) {
            res.status(404).json({ error: 'Current coordinator not found' });
            return;
        }

        const hashedPassword = await authService.hashPassword(password);

        const newCoordinator = await prisma.coordinator.create({
            data: {
                name,
                email,
                password: hashedPassword,
                phoneNo,
                placementCellId: currentCoordinator.placementCellId,
            },
        });

        const { password: _, ...result } = newCoordinator;
        res.status(201).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create coordinator' });
    }
});

/**
 * @swagger
 * /coordinators:
 *   get:
 *     summary: List all coordinators
 *     tags: [Coordinators]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of coordinators
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   name:
 *                     type: string
 *                   email:
 *                     type: string
 *       500:
 *         description: Failed to fetch coordinators
 */
router.get('/', async (req: AuthRequest, res: Response) => {
    try {
        const coordinators = await prisma.coordinator.findMany({
            select: {
                id: true,
                name: true,
                email: true,
            },
        });
        res.json(coordinators);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch coordinators' });
    }
});

export default router;
