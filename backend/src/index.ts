import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { specs } from './config/swagger';
import academicYearRoutes from './routes/academicYearRoutes';
import authRoutes from './routes/authRoutes';
import coordinatorRoutes from './routes/coordinatorRoutes';
import companyRoutes from './routes/companyRoutes';
import departmentRoutes from './routes/departmentRoutes';
import studentRoutes from './routes/studentRoutes';
import applicationRoutes from './routes/applicationRoutes';
import cors from 'cors';

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

app.use('/auth', authRoutes);
app.use('/coordinators', coordinatorRoutes);
app.use('/academic-years', academicYearRoutes);
app.use('/departments', departmentRoutes);
app.use('/students', studentRoutes);
app.use('/companies', companyRoutes);
app.use('/applications', applicationRoutes);

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log(`Swagger docs available at http://localhost:${port}/api-docs`);
});
