import { type Request, type Response, type NextFunction } from 'express';
import { authService } from '../services/authService';

export interface AuthRequest extends Request {
    user?: {
        id: number;
        email: string;
        role: 'student' | 'coordinator';
    };
}

export const coordinatorAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
        return;
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        res.status(401).json({ error: 'Unauthorized: Token missing' });
        return;
    }

    const decoded = authService.verifyToken(token);

    if (!decoded || decoded.role !== 'coordinator') {
        res.status(403).json({ error: 'Forbidden: Coordinator access required' });
        return;
    }

    req.user = decoded;
    next();
};

export const studentAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
        return;
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        res.status(401).json({ error: 'Unauthorized: Token missing' });
        return;
    }

    const decoded = authService.verifyToken(token);

    if (!decoded || decoded.role !== 'student') {
        res.status(403).json({ error: 'Forbidden: Student access required' });
        return;
    }

    req.user = decoded;
    next();
};
