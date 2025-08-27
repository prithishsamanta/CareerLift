import { Router, Request, Response } from 'express';
import { ApiResponse } from '../types';
import multer from 'multer';
import path from 'path';

const router = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads')); // Make sure this folder exists
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

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

// POST /upload-resume
router.post('/upload-resume', upload.single('resume'), async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  // req.file contains file info
  
  res.json({
    message: 'Resume uploaded successfully',
    filename: req.file.filename,
    originalname: req.file.originalname,
    path: req.file.path,
  });
  return;
});

export default router;