import { Router, Request, Response } from 'express';
import { ApiResponse } from '../types';
import multer from 'multer';
import path from 'path';
import pdfParse from 'pdf-parse';
import * as fs from 'node:fs/promises';

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

  const findTextBetween = (
    fullText: string, 
    startKeyword: string, 
    endKeywords: string[]
): string | null => {
    // Find the starting position of the target section.
    const startIndex = fullText.toLowerCase().indexOf(startKeyword.toLowerCase());
    if (startIndex === -1) {
        return null; // The starting keyword was not found.
    }

    let sectionContent = fullText.substring(startIndex + startKeyword.length).trim();
    let endIndex = -1;

    // Search for the first occurrence of any end keyword to determine the section's end.
    for (const endKeyword of endKeywords) {
        const currentEndIndex = sectionContent.toLowerCase().indexOf(endKeyword.toLowerCase());
        
        // If an end keyword is found and it's the first or earliest one so far.
        if (currentEndIndex !== -1 && (endIndex === -1 || currentEndIndex < endIndex)) {
            endIndex = currentEndIndex;
        }
    }

    // If an end keyword was found, trim the content to that point.
    if (endIndex !== -1) {
        sectionContent = sectionContent.substring(0, endIndex).trim();
    }
    
    // Clean up extra newlines for better readability.
    return sectionContent.replace(/\n\s*\n/g, '\n');
};

  const dataBuffer = await fs.readFile(req.file.path);
  const data = await pdfParse(dataBuffer);

  var pages = data.numpages;

  const potentialEndKeywords = [
        'education', 
        'projects', 
        'certifications', 
        'awards', 
        'summary', 
        'contact',
        'experience', // An alternative for Work Experience
        'professional summary'
    ];

    // Extract skills, looking for the end of the section
    const skills = findTextBetween(data.text, 'skills', ['education', 
        'projects', 
        'certifications', 
        'awards', 
        'summary', 
        'contact',
        'experience',
        'professional summary']);

    // Extract work experience, looking for the end of that section
    const workExperience = findTextBetween(data.text, 'experience', ['skills', 'education', 
        'projects', 
        'certifications', 
        'awards', 
        'summary', 
        'contact',
        'professional summary']);

  
  res.json({
    message: 'Resume uploaded successfully',
    filename: req.file.filename,
    originalname: req.file.originalname,
    path: req.file.path,
    pages: pages,
    skills: skills,
    experience: workExperience,
  });
  return;
});

export default router;