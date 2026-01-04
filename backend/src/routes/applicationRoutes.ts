import { Router, type Response } from 'express';
import { applicationService } from '../services/applicationService';
import { coordinatorAuth, type AuthRequest } from '../middleware/auth';
import { ApplicationStatus } from '@prisma/client';

const router = Router();

/**
 * @swagger
 * /applications/job-role/{jobRoleId}/oa-list:
 *   post:
 *     summary: Release OA list and announce OA date
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobRoleId
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
 *               - studentIds
 *               - oaDate
 *             properties:
 *               studentIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *               oaDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: OA list released
 */
router.post('/job-role/:jobRoleId/oa-list', coordinatorAuth, async (req: AuthRequest, res: Response) => {
    try {
        const { jobRoleId } = req.params;
        if (!jobRoleId) throw new Error('jobRoleId is required');
        const { studentIds, oaDate } = req.body;
        const result = await applicationService.releaseOAList(parseInt(jobRoleId), studentIds, new Date(oaDate));
        res.json(result);
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /applications/job-role/{jobRoleId}/interview-list:
 *   post:
 *     summary: Release Interview list and announce Interview date
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobRoleId
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
 *               - studentIds
 *               - interviewDate
 *             properties:
 *               studentIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *               interviewDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Interview list released
 */
router.post('/job-role/:jobRoleId/interview-list', coordinatorAuth, async (req: AuthRequest, res: Response) => {
    try {
        const { jobRoleId } = req.params;
        if (!jobRoleId) throw new Error('jobRoleId is required');
        const { studentIds, interviewDate } = req.body;
        const result = await applicationService.releaseInterviewList(parseInt(jobRoleId), studentIds, new Date(interviewDate));
        res.json(result);
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /applications/job-role/{jobRoleId}/final-results:
 *   post:
 *     summary: Release Final results and update placement status
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobRoleId
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
 *               - selectedStudentIds
 *             properties:
 *               selectedStudentIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *     responses:
 *       200:
 *         description: Final results released
 */
router.post('/job-role/:jobRoleId/final-results', coordinatorAuth, async (req: AuthRequest, res: Response) => {
    try {
        const { jobRoleId } = req.params;
        if (!jobRoleId) throw new Error('jobRoleId is required');
        const { selectedStudentIds } = req.body;
        const result = await applicationService.releaseFinalResults(parseInt(jobRoleId), selectedStudentIds);
        res.json(result);
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /applications/job-role/{jobRoleId}:
 *   get:
 *     summary: Get applications for a job role based on recruitment stage
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobRoleId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         required: true
 *         schema:
 *           type: string
 *           enum: [applied, selected_for_oa, selected_for_interview, offered]
 *     responses:
 *       200:
 *         description: List of applications
 *       400:
 *         description: Stage not yet reached or invalid status
 */
router.get('/job-role/:jobRoleId', coordinatorAuth, async (req: AuthRequest, res: Response) => {
    try {
        const { jobRoleId } = req.params;
        if (!jobRoleId) throw new Error('jobRoleId is required');
        const { status } = req.query;

        if (!status) {
            res.status(400).json({ error: 'status query parameter is required (applied, selected_for_oa, selected_for_interview, offered)' });
            return;
        }

        const applications = await applicationService.getApplicationsByJobRole(
            parseInt(jobRoleId),
            status as string
        );
        res.json(applications);
    } catch (error: any) {
        console.error(error);
        res.status(400).json({ error: error.message });
    }
});

export default router;
