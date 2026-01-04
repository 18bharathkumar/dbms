import { Router, type Response } from 'express';
import { studentService } from '../services/studentService';
import { coordinatorAuth, studentAuth, type AuthRequest } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * /students:
 *   post:
 *     summary: Register a new student
 *     tags: [Students]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - departmentId
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               departmentId:
 *                 type: integer
 *               outputYear:
 *                 type: integer
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Student registered successfully
 *       500:
 *         description: Internal server error
 */
router.post('/', async (req: AuthRequest, res: Response) => {
    try {
        const student = await studentService.create(req.body);
        res.status(201).json(student);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create student' });
    }
});

/**
 * @swagger
 * /students/me:
 *   get:
 *     summary: Get current student info
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Student info
 *       401:
 *         description: Unauthorized
 */
router.get('/me', studentAuth, async (req: AuthRequest, res: Response) => {
    try {
        const student = await studentService.findById(req.user!.id);
        res.json(student);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch student info' });
    }
});

/**
 * @swagger
 * /students/me/profile:
 *   get:
 *     summary: Get current student profile and account info
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Student profile and account details
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Student not found
 */
router.get('/me/profile', studentAuth, async (req: AuthRequest, res: Response) => {
    try {
        const student = await studentService.findById(req.user!.id);
        if (!student) {
            res.status(404).json({ error: 'Student not found' });
            return;
        }

        res.json(student);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

/**
 * @swagger
 * /students/me/profile:
 *   post:
 *     summary: Complete/Update current student profile (Partial updates supported)
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               phoneNo:
 *                 type: string
 *               address:
 *                 type: string
 *               cgpa:
 *                 type: number
 *               marks10:
 *                 type: integer
 *               marks12:
 *                 type: integer
 *               resume:
 *                 type: string
 *               photo:
 *                 type: string
 *                 description: URL or base64 string of the student photo
 *     responses:
 *       200:
 *         description: Profile updated
 */
router.post('/me/profile', studentAuth, async (req: AuthRequest, res: Response) => {
    try {
        const { name, ...profileData } = req.body;

        console.log("profileData", profileData);

        // If name is provided, update it on the student record
        if (name) {
            await studentService.update(req.user!.id, { name });
        }

        // Only upsert if there's actual profile data
        if (Object.keys(profileData).length > 0) {
            const profile = await studentService.upsertProfile(req.user!.id, profileData);
            console.log("profile", profile);
            res.json({ message: 'Profile updated successfully', profile });
        } else {
            res.json({ message: 'Name updated successfully' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

/**
 * @swagger
 * /students:
 *   get:
 *     summary: Get all students
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of students
 *       403:
 *         description: Forbidden
 */
router.get('/', coordinatorAuth, async (req: AuthRequest, res: Response) => {
    try {
        const students = await studentService.findAll();
        res.json(students);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch students' });
    }
});

/**
 * @swagger
 * /students/filter:
 *   get:
 *     summary: Get students by output year and department (Coordinator only)
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: outputYear
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: departmentId
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of filtered students
 *       403:
 *         description: Forbidden
 */
router.get('/filter', coordinatorAuth, async (req: AuthRequest, res: Response) => {
    try {
        const { outputYear, departmentId } = req.query;
        if (!outputYear) {
            res.status(400).json({ error: 'outputYear is required' });
            return;
        }
        const students = await studentService.findByOutputYearAndDept(
            parseInt(outputYear as string),
            departmentId ? parseInt(departmentId as string) : undefined
        );
        res.json(students);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch filtered students' });
    }
});

/**
 * @swagger
 * /students/{id}:
 *   get:
 *     summary: Get student by ID (Coordinator only)
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Student details
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Student not found
 */
router.get('/:id', async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        if (!id) {
            res.status(400).json({ error: 'ID is required' });
            return;
        }
        const student = await studentService.findById(parseInt(id));
        if (!student) {
            res.status(404).json({ error: 'Student not found' });
            return;
        }
        res.json(student);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch student' });
    }
});


/**
 * @swagger
 * /students/{id}:
 *   delete:
 *     summary: Delete student
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Student deleted
 */
router.delete('/:id', coordinatorAuth, async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        if (!id) {
            res.status(400).json({ error: 'ID is required' });
            return;
        }
        await studentService.delete(parseInt(id));
        res.json({ message: 'Student deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete student' });
    }
});

/**
 * @swagger
 * /students/{id}/profile:
 *   get:
 *     summary: Get student profile by ID (Coordinator only)
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Student profile
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Profile not found
 */
router.get('/:id/profile', coordinatorAuth, async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        if (!id) {
            res.status(400).json({ error: 'ID is required' });
            return;
        }
        const profile = await studentService.getProfile(parseInt(id));
        if (!profile) {
            res.status(404).json({ error: 'Profile not found' });
            return;
        }
        res.json(profile);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

/**
 * @swagger
 * /students/{id}/profile:
 *   post:
 *     summary: Create or update student profile by ID (Coordinator only, Partial updates supported)
 *     tags: [Students]
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
 *             properties:
 *               phoneNo:
 *                 type: string
 *               address:
 *                 type: string
 *               cgpa:
 *                 type: number
 *               marks10:
 *                 type: integer
 *               marks12:
 *                 type: integer
 *               resume:
 *                 type: string
 *               photo:
 *                 type: string
 *                 description: URL or base64 string of the student photo
 *     responses:
 *       200:
 *         description: Profile updated
 *       403:
 *         description: Forbidden
 */
router.post('/:id/profile', coordinatorAuth, async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        if (!id) {
            res.status(400).json({ error: 'ID is required' });
            return;
        }
        const profile = await studentService.upsertProfile(parseInt(id), req.body);
        res.json(profile);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

import { applicationService } from '../services/applicationService';

// ... existing code ...

/**
 * @swagger
 * /students/applications:
 *   post:
 *     summary: Apply for a job role
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - jobRoleId
 *             properties:
 *               jobRoleId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Application submitted
 *       400:
 *         description: Application rules violated or already applied
 */
router.post('/applications', studentAuth, async (req: AuthRequest, res: Response) => {
    try {
        const { jobRoleId } = req.body;
        const application = await applicationService.apply(req.user!.id, jobRoleId);
        res.status(201).json(application);
    } catch (error: any) {
        console.error(error);
        res.status(400).json({ error: error.message });
    }
});

/**
 * @swagger
 * /students/me/applications:
 *   get:
 *     summary: Get current student's applications
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of applications
 */
router.get('/me/applications', studentAuth, async (req: AuthRequest, res: Response) => {
    try {
        const applications = await applicationService.getStudentApplications(req.user!.id);
        res.json(applications);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch applications' });
    }
});

export default router;
