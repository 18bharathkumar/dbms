import { Router, type Response } from 'express';
import { academicYearService } from '../services/academicYearService';
import { coordinatorAuth, type AuthRequest } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * /academic-years:
 *   post:
 *     summary: Create an academic year
 *     tags: [Academic Years]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - year
 *             properties:
 *               year:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Academic year created
 *       400:
 *         description: Year is required
 *       500:
 *         description: Failed to create academic year
 */
router.post('/', coordinatorAuth, async (req: AuthRequest, res: Response) => {
    try {
        const { year } = req.body;
        if (!year) {
            res.status(400).json({ error: 'Year is required' });
            return;
        }

        const academicYear = await academicYearService.create(parseInt(year as string));
        res.status(201).json(academicYear);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create academic year' });
    }
});

/**
 * @swagger
 * /academic-years:
 *   get:
 *     summary: List all academic years
 *     tags: [Academic Years]
 *     responses:
 *       200:
 *         description: List of academic years
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   year:
 *                     type: integer
 *       500:
 *         description: Failed to fetch academic years
 */
router.get('/', async (req, _res: Response) => {
    try {
        const academicYears = await academicYearService.findAll();
        _res.json(academicYears);
    } catch (error) {
        console.error(error);
        _res.status(500).json({ error: 'Failed to fetch academic years' });
    }
});

/**
 * @swagger
 * /academic-years/{id}:
 *   get:
 *     summary: Get an academic year by ID
 *     tags: [Academic Years]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Academic year found
 *       400:
 *         description: Id is required
 *       404:
 *         description: Academic year not found
 *       500:
 *         description: Failed to fetch academic year
 */
router.get('/:id', async (req, res: Response) => {
    try {
        const { id } = req.params;
        if (!id) {
            res.status(400).json({ error: 'Id is required' });
            return;
        }
        const academicYear = await academicYearService.findById(parseInt(id));

        if (!academicYear) {
            res.status(404).json({ error: 'Academic year not found' });
            return;
        }

        res.json(academicYear);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch academic year' });
    }
});

/**
 * @swagger
 * /academic-years/{id}:
 *   put:
 *     summary: Update an academic year
 *     tags: [Academic Years]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - year
 *             properties:
 *               year:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Academic year updated
 *       400:
 *         description: Year and id are required
 *       500:
 *         description: Failed to update academic year
 */
router.put('/:id', coordinatorAuth, async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { year } = req.body;

        if (!year || !id) {
            res.status(400).json({ error: 'Year and id are required' });
            return;
        }

        const academicYear = await academicYearService.update(parseInt(id), parseInt(year as string));
        res.json(academicYear);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update academic year' });
    }
});

export default router;
