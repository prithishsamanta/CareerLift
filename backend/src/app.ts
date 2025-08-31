import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import apiRoutes from './routes/api';

const app: Express = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', apiRoutes);

// Basic route
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Welcome to TiDB Hackathon Backend API',
    status: 'Server is running successfully!',
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'OK',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('/{*any}', (req: Request, res: Response) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method
  });
});

export default app;