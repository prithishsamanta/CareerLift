import { Router, Request, Response } from 'express';
import { ApiResponse } from '../types';

const router = Router();

// Example API route
router.get('/status', (req: Request, res: Response<ApiResponse>) => {
  res.json({
    success: true,
    message: 'API is working correctly',
    data: {
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString()
    }
  });
});

// Example route with TiDB placeholder
router.get('/tidb-info', (req: Request, res: Response<ApiResponse>) => {
  res.json({
    success: true,
    message: 'TiDB connection info',
    data: {
      status: 'Ready to connect',
      note: 'TiDB connection will be implemented here'
    }
  });
});

export default router;