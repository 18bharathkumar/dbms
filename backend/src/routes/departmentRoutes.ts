import { Router, type Response } from 'express';
import { departmentService } from '../services/departmentService';
import { coordinatorAuth, type AuthRequest } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * /departments:
 *   post:
 *     summary: Create a new department
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - deptName
 *             properties:
 *               deptName:
 *                 type: string
 *     responses:
 *       201:
 *         description: Department created
 *       400:
 *         description: Department name is required
 *       403:
 *         description: Forbidden - Coordinator access required
 *       500:
 *         description: Failed to create department
 */
router.post('/', coordinatorAuth, async (req: AuthRequest, res: Response) => {
    try {
        const { deptName } = req.body;
        if (!deptName) {
            res.status(400).json({ error: 'Department name is required' });
            return;
        }

        const department = await departmentService.create(deptName);
        res.status(201).json(department);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create department' });
    }
});

/**
 * @swagger
 * /departments:
 *   get:
 *     summary: List all departments
 *     tags: [Departments]
 *     responses:
 *       200:
 *         description: List of departments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   deptName:
 *                     type: string
 *       500:
 *         description: Failed to fetch departments
 */
router.get('/', async (req, res: Response) => {
    try {
        const departments = await departmentService.findAll();
        res.json(departments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch departments' });
    }
});

/**
 * @swagger
 * /departments/stats:
 *   get:
 *     summary: Get statistics for all departments (total students and placed students)
 *     tags: [Departments]
 *     parameters:
 *       - in: query
 *         name: outputYear
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Department statistics
 */
router.get('/stats', async (req, res: Response) => {
    try {
        const { outputYear } = req.query;
        const stats = await departmentService.getDepartmentStats(
            outputYear ? parseInt(outputYear as string) : undefined
        );
        res.json(stats);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch department stats' });
    }
});

/**
 * @swagger
 * /departments/{id}/students:
 *   get:
 *     summary: Get all students of a department
 *     tags: [Departments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of students in the department
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
 *                   isSpoc:
 *                     type: boolean
 *                   placeStatus:
 *                     type: string
 *                   departmentId:
 *                     type: integer
 *       404:
 *         description: Department not found
 *       500:
 *         description: Failed to fetch students
 */
router.get('/:id/students', async (req, res: Response) => {
    try {
        const { id } = req.params;
        const department = await departmentService.findById(parseInt(id));
        if (!department) {
            res.status(404).json({ error: 'Department not found' });
            return;
        }

        const students = await departmentService.findStudentsByDepartmentId(parseInt(id));
        res.json(students);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch students' });
    }
});

export default router;
