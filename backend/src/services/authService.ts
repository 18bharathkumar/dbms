import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/db';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const authService = {
    async hashPassword(password: string): Promise<string> {
        return await bcrypt.hash(password, 10);
    },

    async comparePassword(password: string, hash: string): Promise<boolean> {
        return await bcrypt.compare(password, hash);
    },

    generateToken(payload: { id: number; email: string; role: 'student' | 'coordinator' }): string {
        return jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });
    },

    verifyToken(token: string): any {
        try {
            return jwt.verify(token, JWT_SECRET);
        } catch (error) {
            return null;
        }
    }
};
