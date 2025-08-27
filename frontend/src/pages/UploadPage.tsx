import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Paper,
  Divider,
  Alert,
  LinearProgress,
  Chip,
  IconButton,
  TextField
} from '@mui/material';
import {
  CloudUpload,
  Description,
  Work,
  Analytics,
  CheckCircle,
  Delete,
  Edit,
  Visibility
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Chatbot, { FloatingChatButton } from '../components/Chatbot';
import '../styles/UploadPage.css';

interface UploadedFile {
  name: string;
  size: string;
  type: string;
  uploadedAt: Date;
}

interface ParsedContent {
  title: string;
  summary: string[];
  extractedInfo: string[];
}

const UploadPage: React.FC = () => {
  const navigate = useNavigate();
  const [chatbotOpen, setChatbotOpen] = useState(false);
  
  // Upload states
  const [resumeFile, setResumeFile] = useState<UploadedFile | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Parsed content states
  const [resumeParsed, setResumeParsed] = useState<ParsedContent | null>(null);
  const [jobDescParsed, setJobDescParsed] = useState<ParsedContent | null>(null);
  
  // Form visibility states
  const [showResumeForm, setShowResumeForm] = useState(false);
  const [showJobForm, setShowJobForm] = useState(false);

  // Mock parsed data for demonstration
  const mockResumeData: ParsedContent = {
    title: "Software Developer Resume",
    summary: [
      "3+ years experience in web development",
      "Proficient in JavaScript, React, Node.js",
      "Experience with Git, HTML/CSS",
      "Bachelor's degree in Computer Science"
    ],
    extractedInfo: [
      "Skills: JavaScript, React.js, HTML/CSS, Git, Problem Solving",
      "Experience: 3 years in web development",
      "Education: Bachelor's in Computer Science",
      "Projects: Built 5+ web applications"
    ]
  };

  const mockJobData: ParsedContent = {
    title: "Senior Frontend Developer Position",
    summary: [
      "5+ years React.js experience required",
      "Strong TypeScript and Node.js skills needed",
      "AWS cloud experience preferred",
      "Leadership and mentoring responsibilities"
    ],
    extractedInfo: [
      "Required Skills: React.js (5+ years), TypeScript, Node.js, AWS",
      "Experience Level: Senior (5+ years)",
      "Responsibilities: Development, Code Review, Mentoring",
      "Nice to have: GraphQL, Docker, CI/CD"
    ]
  };

  const handleResumeUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsUploading(true);
      setUploadProgress(0);
      
      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsUploading(false);
            setResumeFile({
              name: file.name,
              size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
              type: file.type,
              uploadedAt: new Date()
            });
            
            // Simulate parsing after upload
            setTimeout(() => {
              setResumeParsed(mockResumeData);
              setShowResumeForm(false);
            }, 1000);
            
            return 100;
          }
          return prev + 10;
        });
      }, 200);
    }
  };

  const handleJobDescriptionSubmit = () => {
    if (jobDescription.trim()) {
      // Simulate parsing job description
      setTimeout(() => {
        setJobDescParsed(mockJobData);
        setShowJobForm(false);
      }, 500);
    }
  };

  const handleAnalyze = () => {
    if (resumeParsed && jobDescParsed) {
      navigate('/analysis');
    }
  };

  const handleDeleteResume = () => {
    setResumeFile(null);
    setResumeParsed(null);
    setShowResumeForm(false);
  };

  const formatFileSize = (bytes: number) => {
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  };

  const canAnalyze = resumeParsed && jobDescParsed;

  return (
    <Box className="upload-page">
      {/* Header */}
      <Box className="header-section">
        <Container maxWidth="lg">
          <Box display="flex" alignItems="center" justifyContent="center" py={4}>
            <Typography variant="h3" className="page-title">
              <Analytics sx={{ mr: 2, fontSize: 'inherit' }} />
              Skill Gap Analyzer
            </Typography>
          </Box>
          <Box textAlign="center" pb={2}>
            <Typography variant="h6" className="page-subtitle">
              Upload your resume and job description to get personalized skill gap analysis
            </Typography>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="xl" className="main-content">
        <Box display="flex" gap={4} flexDirection={{ xs: 'column', lg: 'row' }}>
          
          {/* Resume Upload Section */}
          <Box flex="1" maxWidth={{ lg: '50%' }}>
            <Card className="upload-card" elevation={2}>
              <CardContent sx={{ p: 4 }}>
                <Box display="flex" alignItems="center" mb={3}>
                  <Description sx={{ mr: 2, color: 'primary.main', fontSize: '2rem' }} />
                  <Typography variant="h5" className="section-title">
                    Upload / Edit Resume
                  </Typography>
                </Box>

{!showResumeForm && !resumeFile ? (
                  <Box className="empty-state">
                    <Typography variant="body1" color="text.secondary" className="empty-message">
                      Workspace currently empty. Please Upload/Enter Few Details
                    </Typography>
                    <Button
                      variant="contained"
                      onClick={() => setShowResumeForm(true)}
                      startIcon={<CloudUpload />}
                      className="open-form-button"
                      sx={{ mt: 2 }}
                    >
                      Upload Resume
                    </Button>
                  </Box>
                ) : showResumeForm && !resumeFile ? (
                  <Box className="upload-area">
                    <input
                      accept=".pdf,.doc,.docx"
                      style={{ display: 'none' }}
                      id="resume-upload"
                      type="file"
                      onChange={handleResumeUpload}
                    />
                    <label htmlFor="resume-upload">
                      <Box className="upload-dropzone">
                        <CloudUpload sx={{ fontSize: '4rem', color: 'primary.main', mb: 2 }} />
                        <Typography variant="h6" gutterBottom>
                          Drop your resume here or click to browse
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Supported formats: PDF, DOC, DOCX (Max 10MB)
                        </Typography>
                        <Button
                          variant="contained"
                          component="span"
                          startIcon={<CloudUpload />}
                          sx={{ mt: 2 }}
                          className="upload-button"
                        >
                          Choose File
                        </Button>
                      </Box>
                    </label>
                    <Button
                      variant="outlined"
                      onClick={() => setShowResumeForm(false)}
                      sx={{ mt: 2 }}
                      className="cancel-button"
                    >
                      Cancel
                    </Button>
                  </Box>
                ) : resumeFile ? (
                  <Box className="uploaded-file">
                    <Paper className="file-info" elevation={1}>
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Box display="flex" alignItems="center" gap={2}>
                          <CheckCircle color="success" />
                          <Box>
                            <Typography variant="body1" fontWeight={600}>
                              {resumeFile.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {resumeFile.size} • Uploaded {resumeFile.uploadedAt.toLocaleTimeString()}
                            </Typography>
                          </Box>
                        </Box>
                        <Box display="flex" gap={1}>
                          <IconButton size="small" className="file-action">
                            <Visibility />
                          </IconButton>
                          <IconButton size="small" className="file-action">
                            <Edit />
                          </IconButton>
                          <IconButton size="small" onClick={handleDeleteResume} className="file-action delete">
                            <Delete />
                          </IconButton>
                        </Box>
                      </Box>
                    </Paper>

                    {isUploading && (
                      <Box mt={2}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Processing resume...
                        </Typography>
                        <LinearProgress variant="determinate" value={uploadProgress} />
                      </Box>
                    )}
                  </Box>
                ) : null}

                {resumeParsed && (
                  <Box className="parsed-content" mt={3}>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="h6" className="parsed-title" gutterBottom>
                      📄 Resume Summary
                    </Typography>
                    <Box className="summary-box">
                      {resumeParsed.summary.map((item, index) => (
                        <Typography key={index} variant="body2" className="summary-item">
                          • {item}
                        </Typography>
                      ))}
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>

          {/* Job Description Section */}
          <Box flex="1" maxWidth={{ lg: '50%' }}>
            <Card className="upload-card" elevation={2}>
              <CardContent sx={{ p: 4 }}>
                <Box display="flex" alignItems="center" mb={3}>
                  <Work sx={{ mr: 2, color: 'secondary.main', fontSize: '2rem' }} />
                  <Typography variant="h5" className="section-title">
                    Upload / Edit Target Job
                  </Typography>
                </Box>

{!showJobForm && !jobDescParsed ? (
                  <Box className="empty-state">
                    <Typography variant="body1" color="text.secondary" className="empty-message">
                      Workspace currently empty. Please Upload/Enter Few Details
                    </Typography>
                    <Button
                      variant="contained"
                      onClick={() => setShowJobForm(true)}
                      startIcon={<Work />}
                      className="open-form-button"
                      sx={{ mt: 2 }}
                    >
                      Enter Job Description
                    </Button>
                  </Box>
                ) : showJobForm ? (
                  <Box className="job-input-area">
                    <TextField
                      fullWidth
                      multiline
                      rows={8}
                      placeholder="Paste the job description here..."
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      variant="outlined"
                      className="job-description-input"
                    />
                    
                    <Box display="flex" gap={2} mt={2}>
                      <Button
                        variant="contained"
                        onClick={handleJobDescriptionSubmit}
                        disabled={!jobDescription.trim()}
                        startIcon={<Analytics />}
                        className="process-button"
                      >
                        Process Job Description
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={() => setShowJobForm(false)}
                        className="cancel-button"
                      >
                        Cancel
                      </Button>
                    </Box>
                  </Box>
                ) : null}

                {jobDescParsed && (
                  <Box className="parsed-content" mt={3}>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="h6" className="parsed-title" gutterBottom>
                      💼 Job Requirements Summary
                    </Typography>
                    <Box className="summary-box">
                      {jobDescParsed.summary.map((item, index) => (
                        <Typography key={index} variant="body2" className="summary-item">
                          • {item}
                        </Typography>
                      ))}
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* Analyze Button */}
        <Box display="flex" justifyContent="center" mt={4} mb={4}>
          <Button
            variant="contained"
            size="large"
            onClick={handleAnalyze}
            disabled={!canAnalyze}
            startIcon={<Analytics />}
            className="analyze-button"
            sx={{ 
              px: 6, 
              py: 2, 
              fontSize: '1.2rem',
              minWidth: '200px'
            }}
          >
            Analyze Skills Gap
          </Button>
        </Box>

        {canAnalyze && (
          <Box display="flex" justifyContent="center" mb={4}>
            <Alert severity="success" className="ready-alert">
              <Typography variant="body1">
                🎉 Ready for analysis! Your resume and job description have been processed successfully.
              </Typography>
            </Alert>
          </Box>
        )}
      </Container>

      {/* Floating Chat Button */}
      <FloatingChatButton onClick={() => setChatbotOpen(true)} />

      {/* Chatbot */}
      <Chatbot
        open={chatbotOpen}
        onClose={() => setChatbotOpen(false)}
      />
    </Box>
  );
};

export default UploadPage;
