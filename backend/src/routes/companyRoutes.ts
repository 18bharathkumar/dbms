import { Router, type Response } from 'express';
import { companyService } from '../services/companyService';
import { coordinatorAuth, type AuthRequest } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * /companies:
 *   post:
 *     summary: Create a new company (Coordinator only)
 *     tags: [Companies]
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
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Company created
 *       403:
 *         description: Forbidden
 */
router.post('/', coordinatorAuth, async (req: AuthRequest, res: Response) => {
    try {
        const company = await companyService.createCompany(req.body);
        res.status(201).json(company);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create company' });
    }
});

/**
 * @swagger
 * /companies:
 *   get:
 *     summary: Get all companies
 *     tags: [Companies]
 *     responses:
 *       200:
 *         description: List of companies
 */
router.get('/', async (req, res) => {
    try {
        const companies = await companyService.findAllCompanies();
        res.json(companies);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch companies' });
    }
});

router.patch('/:id', coordinatorAuth, async (req: AuthRequest, res: Response) => {
    try {
        const id = parseInt(req.params.id as string);
        const company = await companyService.updateCompany(id, req.body);
        res.json(company);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update company' });
    }
});

router.delete('/:id', coordinatorAuth, async (req: AuthRequest, res: Response) => {
    try {
        const id = parseInt(req.params.id as string);
        await companyService.deleteCompany(id);
        res.status(204).send();
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete company' });
    }
});

/**
 * @swagger
 * /companies/visits:
 *   post:
 *     summary: Schedule a company visit with job roles (Coordinator only)
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - visitDate
 *               - companyId
 *               - jobRoles
 *             properties:
 *               visitDate:
 *                 type: string
 *                 format: date-time
 *               companyId:
 *                 type: integer
 *               jobRoles:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - title
 *                     - package
 *                     - packageDetails
 *                     - cgpaCutoff
 *                     - slab
 *                   properties:
 *                     title:
 *                       type: string
 *                     package:
 *                       type: number
 *                     packageDetails:
 *                       type: string
 *                     cgpaCutoff:
 *                       type: number
 *                     slab:
 *                       type: string
 *     responses:
 *       201:
 *         description: Company visit scheduled
 *       403:
 *         description: Forbidden
 */
router.post('/visits', coordinatorAuth, async (req: AuthRequest, res: Response) => {
    try {
        const visit = await companyService.createCompanyVisit(req.body);
        res.status(201).json(visit);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to schedule visit' });
    }
});

/**
 * @swagger
 * /companies/visits:
 *   get:
 *     summary: Get all company visits
 *     tags: [Companies]
 *     responses:
 *       200:
 *         description: List of company visits
 */
router.get('/visits', async (req, res) => {
    try {
        const visits = await companyService.findAllVisits();
        res.json(visits);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch visits' });
    }
});

/**
 * @swagger
 * /companies/visits/{id}:
 *   patch:
 *     summary: Update a company visit (Coordinator only)
 *     tags: [Companies]
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
 *               visitDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Company visit updated
 *       403:
 *         description: Forbidden
 */
router.patch('/visits/:id', coordinatorAuth, async (req: AuthRequest, res: Response) => {
    try {
        const id = parseInt(req.params.id as string);
        console.log("req.body", req.body);
        const visit = await companyService.updateCompanyVisit(id, req.body);
        res.json(visit);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update visit' });
    }
});

router.delete('/visits/:id', coordinatorAuth, async (req: AuthRequest, res: Response) => {
    try {
        const id = parseInt(req.params.id as string);
        await companyService.deleteCompanyVisit(id);
        res.status(204).send();
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete visit' });
    }
});

/**
 * @swagger
 * /companies/visits/{visitId}/job-roles:
 *   post:
 *     summary: Add a job role to a specific visit (Coordinator only)
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: visitId
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
 *               - title
 *               - package
 *               - packageDetails
 *               - cgpaCutoff
 *               - slab
 *             properties:
 *               title:
 *                 type: string
 *               package:
 *                 type: number
 *               packageDetails:
 *                 type: string
 *               cgpaCutoff:
 *                 type: number
 *               slab:
 *                 type: string
 *     responses:
 *       201:
 *         description: Job role added
 *       404:
 *         description: Visit not found
 *       403:
 *         description: Forbidden
 */
router.post('/visits/:visitId/job-roles', coordinatorAuth, async (req: AuthRequest, res: Response) => {
    try {
        const visitId = parseInt(req.params.visitId as string);
        const jobRole = await companyService.addJobRole(visitId, req.body);
        res.status(201).json(jobRole);
    } catch (error: any) {
        console.error(error);
        if (error.message === 'Visit not found') {
            res.status(404).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Failed to add job role' });
        }
    }
});

/**
 * @swagger
 * /companies/job-roles/{id}:
 *   patch:
 *     summary: Update a job role (Coordinator only)
 *     tags: [Companies]
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
 *               title:
 *                 type: string
 *               package:
 *                 type: number
 *               packageDetails:
 *                 type: string
 *               cgpaCutoff:
 *                 type: number
 *               slab:
 *                 type: string
 *     responses:
 *       200:
 *         description: Job role updated
 *       403:
 *         description: Forbidden
 */
router.patch('/job-roles/:id', coordinatorAuth, async (req: AuthRequest, res: Response) => {
    try {
        const id = parseInt(req.params.id as string);
        const jobRole = await companyService.updateJobRole(id, req.body);
        res.json(jobRole);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update job role' });
    }
});

router.delete('/job-roles/:id', coordinatorAuth, async (req: AuthRequest, res: Response) => {
    try {
        const id = parseInt(req.params.id as string);
        await companyService.deleteJobRole(id);
        res.status(204).send();
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete job role' });
    }
});

/**
 * @swagger
 * /companies/job-roles:
 *   get:
 *     summary: Get all job roles
 *     tags: [Companies]
 *     responses:
 *       200:
 *         description: List of job roles
 */
router.get('/job-roles', async (req, res) => {
    try {
        const roles = await companyService.findAllJobRoles();
        res.json(roles);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch job roles' });
    }
});

/**
 * @swagger
 * /companies/job-roles/{id}:
 *   get:
 *     summary: Get a single job role by ID
 *     tags: [Companies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Job role details
 *       404:
 *         description: Job role not found
 */
router.get('/job-roles/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const jobRole = await companyService.findJobRoleById(id);
        if (!jobRole) {
            return res.status(404).json({ error: 'Job role not found' });
        }
        res.json(jobRole);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch job role' });
    }
});

/**
 * @swagger
 * /companies/{id}/stats:
 *   get:
 *     summary: Get detailed statistics for a company
 *     tags: [Companies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Company statistics
 */
router.get('/:id/stats', async (req, res) => {
    try {
        const stats = await companyService.getCompanyStats(parseInt(req.params.id));
        res.json(stats);
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
