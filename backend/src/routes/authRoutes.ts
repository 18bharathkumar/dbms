import { Router, type Request, type Response } from 'express';
import { prisma } from '../config/db';
import { authService } from '../services/authService';

const router = Router();

/**
 * @swagger
 * /auth/login/coordinator:
 *   post:
 *     summary: Login as a coordinator
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email 
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     email:
 *                       type: string
 *                     name:
 *                       type: string
 *                     role:
 *                       type: string
 *       400:
 *         description: Email and password are required
 *       401:
 *         description: Invalid email or password
 *       500:
 *         description: Login failed
 */
router.post('/login/coordinator', async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ error: 'Email and password are required' });
            return;
        }

        const coordinator = await prisma.coordinator.findUnique({
            where: { email },
        });

        if (!coordinator || !(await authService.comparePassword(password, coordinator.password))) {
            res.status(401).json({ error: 'Invalid email or password' });
            return;
        }

        const token = authService.generateToken({
            id: coordinator.id,
            email: coordinator.email,
            role: 'coordinator',
        });

        res.json({ token, user: { id: coordinator.id, email: coordinator.email, name: coordinator.name, role: 'coordinator' } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Login failed' });
    }
});

/**
 * @swagger
 * /auth/login/student:
 *   post:
 *     summary: Login as a student
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     email:
 *                       type: string
 *                     name:
 *                       type: string
 *                     role:
 *                       type: string
 *       400:
 *         description: Email and password are required
 *       401:
 *         description: Invalid email or password
 *       500:
 *         description: Login failed
 */
router.post('/login/student', async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ error: 'Email and password are required' });
            return;
        }

        const student = await prisma.student.findUnique({
            where: { email },
        });

        if (!student || !(await authService.comparePassword(password, student.password))) {
            res.status(401).json({ error: 'Invalid email or password' });
            return;
        }

        const token = authService.generateToken({
            id: student.id,
            email: student.email,
            role: 'student',
        });

        res.json({ token, user: { id: student.id, email: student.email, name: student.name, role: 'student' } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Login failed' });
    }
});

export default router;
