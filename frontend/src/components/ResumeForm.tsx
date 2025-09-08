import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  TextField,
  Paper,
  Divider,
  IconButton,
  LinearProgress,
  Alert,
  Chip
} from '@mui/material';
import {
  Close,
  CloudUpload,
  Save,
  Delete,
  Add,
  Edit
} from '@mui/icons-material';
import '../styles/ResumeForm.css';

interface ResumeData {
  name: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  skills: string[];
  workExperience: WorkExperience[];
  education: Education[];
  projects: Project[];
}

interface WorkExperience {
  id: string;
  company: string;
  position: string;
  duration: string;
  description: string;
}

interface Education {
  id: string;
  institution: string;
  degree: string;
  duration: string;
  details: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string;
}

interface ResumeFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: ResumeData) => void;
  initialData?: ResumeData | null;
}

const ResumeForm: React.FC<ResumeFormProps> = ({ 
  open, 
  onClose, 
  onSave, 
  initialData 
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [newSkill, setNewSkill] = useState('');

  // Form data state
  const [formData, setFormData] = useState<ResumeData>({
    name: '',
    email: '',
    phone: '',
    location: '',
    summary: '',
    skills: [],
    workExperience: [],
    education: [],
    projects: []
  });

  // Mock parsed data for demonstration
  const mockParsedData: ResumeData = {
    name: 'John Doe',
    email: 'john.doe@email.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    summary: 'Experienced software developer with 3+ years in web development. Proficient in React, Node.js, and modern JavaScript frameworks.',
    skills: ['JavaScript', 'React.js', 'Node.js', 'HTML/CSS', 'Git', 'MongoDB', 'Express.js'],
    workExperience: [
      {
        id: '1',
        company: 'Tech Solutions Inc.',
        position: 'Frontend Developer',
        duration: '2021 - Present',
        description: 'Developed responsive web applications using React and TypeScript. Collaborated with backend team to integrate REST APIs.'
      },
      {
        id: '2',
        company: 'StartupCorp',
        position: 'Junior Developer',
        duration: '2020 - 2021',
        description: 'Built user interfaces for mobile-first applications. Implemented automated testing with Jest.'
      }
    ],
    education: [
      {
        id: '1',
        institution: 'University of California',
        degree: 'Bachelor of Science in Computer Science',
        duration: '2016 - 2020',
        details: 'Relevant coursework: Data Structures, Algorithms, Web Development'
      }
    ],
    projects: [
      {
        id: '1',
        name: 'E-commerce Platform',
        description: 'Full-stack web application for online shopping with user authentication and payment integration.',
        technologies: 'React, Node.js, MongoDB, Stripe API'
      },
      {
        id: '2',
        name: 'Task Management App',
        description: 'Real-time collaborative task management application with drag-and-drop functionality.',
        technologies: 'React, Socket.io, Express.js, PostgreSQL'
      }
    ]
  };

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setIsUploading(true);
      setUploadProgress(0);
      setUploadError(null); // Clear any previous errors

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('resume', file);

      try {
        // Simulate progress for better UX
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return 90;
            }
            return prev + 10;
          });
        }, 200);

        // Make API call to backend
        const response = await fetch('http://localhost:5001/api/resume/upload', {
          method: 'POST',
          body: formData,
        });

        clearInterval(progressInterval);
        setUploadProgress(100);

        if (response.ok) {
          const data = await response.json();
          console.log('Backend response:', data);

          // Transform backend response to match ResumeData interface
          const backendData = data.parsed_data;
          const parsedData: ResumeData = {
            name: '', // Extract from work experience or education if available
            email: '', // Not extracted by backend yet
            phone: '', // Not extracted by backend yet
            location: '', // Not extracted by backend yet
            summary: '', // Not extracted by backend yet
            skills: backendData.skills || [],
            workExperience: backendData.work_experience || [],
            education: backendData.education || [],
            projects: backendData.projects || []
          };

          setFormData(parsedData);
          setUploadError(null); // Clear any previous errors
          setIsUploading(false);
        } else {
          const errorData = await response.json().catch(() => ({ message: 'Upload failed' }));
          console.error('Upload failed:', response.statusText);
          setUploadError(errorData.message || 'Failed to upload and parse resume');
          setIsUploading(false);
          setUploadProgress(0);
        }
      } catch (error) {
        console.error('Error uploading file:', error);
        setUploadError('Network error occurred while uploading file');
        setIsUploading(false);
        setUploadProgress(0);
      }
    }
  };

  // Helper function to parse work experience text into structured format
  const parseWorkExperience = (experienceText: string): WorkExperience[] => {
    if (!experienceText) return [];
    
    // Basic parsing - you can enhance this based on your backend's output format
    const experiences: WorkExperience[] = [];
    
    // Split by common delimiters and create experience entries
    const sections = experienceText.split(/\n\n|\n•|\n-/).filter(section => section.trim().length > 0);
    
    sections.forEach((section, index) => {
      const lines = section.trim().split('\n').filter(line => line.trim().length > 0);
      if (lines.length > 0) {
        experiences.push({
          id: Date.now().toString() + index,
          company: lines[0] || '',
          position: lines[1] || '',
          duration: lines[2] || '',
          description: lines.slice(3).join(' ') || section.trim()
        });
      }
    });

    return experiences.length > 0 ? experiences : [{
      id: Date.now().toString(),
      company: '',
      position: '',
      duration: '',
      description: experienceText.trim()
    }];
  };

  const handleInputChange = (field: keyof ResumeData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleWorkExperienceChange = (id: string, field: keyof WorkExperience, value: string) => {
    setFormData(prev => ({
      ...prev,
      workExperience: prev.workExperience.map(exp => 
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    }));
  };

  const handleEducationChange = (id: string, field: keyof Education, value: string) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.map(edu => 
        edu.id === id ? { ...edu, [field]: value } : edu
      )
    }));
  };

  const handleProjectChange = (id: string, field: keyof Project, value: string) => {
    setFormData(prev => ({
      ...prev,
      projects: prev.projects.map(proj => 
        proj.id === id ? { ...proj, [field]: value } : proj
      )
    }));
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const addWorkExperience = () => {
    const newExp: WorkExperience = {
      id: Date.now().toString(),
      company: '',
      position: '',
      duration: '',
      description: ''
    };
    setFormData(prev => ({
      ...prev,
      workExperience: [...prev.workExperience, newExp]
    }));
  };

  const removeWorkExperience = (id: string) => {
    setFormData(prev => ({
      ...prev,
      workExperience: prev.workExperience.filter(exp => exp.id !== id)
    }));
  };

  const addEducation = () => {
    const newEdu: Education = {
      id: Date.now().toString(),
      institution: '',
      degree: '',
      duration: '',
      details: ''
    };
    setFormData(prev => ({
      ...prev,
      education: [...prev.education, newEdu]
    }));
  };

  const removeEducation = (id: string) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.filter(edu => edu.id !== id)
    }));
  };

  const addProject = () => {
    const newProject: Project = {
      id: Date.now().toString(),
      name: '',
      description: '',
      technologies: ''
    };
    setFormData(prev => ({
      ...prev,
      projects: [...prev.projects, newProject]
    }));
  };

  const removeProject = (id: string) => {
    setFormData(prev => ({
      ...prev,
      projects: prev.projects.filter(proj => proj.id !== id)
    }));
  };

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      addSkill();
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      className="resume-form-dialog"
    >
      <DialogTitle className="resume-form-header">
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h5" className="form-title">
            <Edit sx={{ mr: 1 }} />
            Resume Details
          </Typography>
          <IconButton onClick={onClose} className="close-button">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent className="resume-form-content">
        {/* File Upload Section */}
        <Paper className="upload-section" elevation={1}>
          <Typography variant="h6" gutterBottom>
            📄 Upload Resume (PDF)
          </Typography>
          
          <input
            accept=".pdf,.doc,.docx"
            style={{ display: 'none' }}
            id="resume-file-upload"
            type="file"
            onChange={handleFileUpload}
          />
          <label htmlFor="resume-file-upload">
            <Button
              variant="outlined"
              component="span"
              startIcon={<CloudUpload />}
              className="upload-btn"
              fullWidth
            >
              {uploadedFile ? `Uploaded: ${uploadedFile.name}` : 'Choose Resume File'}
            </Button>
          </label>

          {isUploading && (
            <Box mt={2}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Parsing resume content...
              </Typography>
              <LinearProgress variant="determinate" value={uploadProgress} />
            </Box>
          )}

          {uploadedFile && !isUploading && !uploadError && (
            <Alert severity="success" sx={{ mt: 2 }}>
              Resume uploaded and parsed successfully! You can now edit the details below.
            </Alert>
          )}

          {uploadError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {uploadError}
            </Alert>
          )}
        </Paper>

        <Divider sx={{ my: 3 }} />

        {/* Personal Information */}
        <Box className="form-section">
          <Typography variant="h6" className="section-title" gutterBottom>
            👤 Personal Information
          </Typography>
          <Box display="flex" flexDirection="column" gap={2}>
            <Box display="flex" gap={2} flexDirection={{ xs: 'column', sm: 'row' }}>
              <TextField
                fullWidth
                label="Full Name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="form-field"
              />
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="form-field"
              />
            </Box>
            <Box display="flex" gap={2} flexDirection={{ xs: 'column', sm: 'row' }}>
              <TextField
                fullWidth
                label="Phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="form-field"
              />
              <TextField
                fullWidth
                label="Location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className="form-field"
              />
            </Box>
            <TextField
              fullWidth
              label="Professional Summary"
              multiline
              rows={3}
              value={formData.summary}
              onChange={(e) => handleInputChange('summary', e.target.value)}
              className="form-field"
            />
          </Box>
        </Box>

        {/* Skills Section */}
        <Box className="form-section">
          <Typography variant="h6" className="section-title" gutterBottom>
            🛠️ Skills
          </Typography>
          
          <Box display="flex" gap={1} mb={2}>
            <TextField
              label="Add Skill"
              size="small"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyPress={handleKeyPress}
              className="skill-input"
            />
            <Button
              variant="contained"
              onClick={addSkill}
              startIcon={<Add />}
              disabled={!newSkill.trim()}
            >
              Add
            </Button>
          </Box>

          <Box display="flex" flexWrap="wrap" gap={1}>
            {formData.skills.map((skill, index) => (
              <Chip
                key={index}
                label={skill}
                onDelete={() => removeSkill(skill)}
                color="primary"
                variant="outlined"
                className="skill-chip"
              />
            ))}
          </Box>
        </Box>

        {/* Work Experience Section */}
        <Box className="form-section">
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Typography variant="h6" className="section-title">
              💼 Work Experience
            </Typography>
            <Button
              variant="outlined"
              startIcon={<Add />}
              onClick={addWorkExperience}
              size="small"
            >
              Add Experience
            </Button>
          </Box>

          {formData.workExperience.map((exp) => (
            <Paper key={exp.id} className="experience-item" elevation={1}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="subtitle2" color="primary">
                  Work Experience
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => removeWorkExperience(exp.id)}
                  className="delete-btn"
                >
                  <Delete />
                </IconButton>
              </Box>
              
              <Box display="flex" flexDirection="column" gap={2}>
                <Box display="flex" gap={2} flexDirection={{ xs: 'column', sm: 'row' }}>
                  <TextField
                    fullWidth
                    label="Company"
                    size="small"
                    value={exp.company}
                    onChange={(e) => handleWorkExperienceChange(exp.id, 'company', e.target.value)}
                  />
                  <TextField
                    fullWidth
                    label="Position"
                    size="small"
                    value={exp.position}
                    onChange={(e) => handleWorkExperienceChange(exp.id, 'position', e.target.value)}
                  />
                </Box>
                <Box display="flex" gap={2} flexDirection={{ xs: 'column', sm: 'row' }}>
                  <TextField
                    fullWidth
                    label="Duration"
                    size="small"
                    value={exp.duration}
                    onChange={(e) => handleWorkExperienceChange(exp.id, 'duration', e.target.value)}
                  />
                  <Box flex={1}></Box>
                </Box>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={2}
                  size="small"
                  value={exp.description}
                  onChange={(e) => handleWorkExperienceChange(exp.id, 'description', e.target.value)}
                />
              </Box>
            </Paper>
          ))}
        </Box>

        {/* Education Section */}
        <Box className="form-section">
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Typography variant="h6" className="section-title">
              🎓 Education
            </Typography>
            <Button
              variant="outlined"
              startIcon={<Add />}
              onClick={addEducation}
              size="small"
            >
              Add Education
            </Button>
          </Box>

          {formData.education.map((edu) => (
            <Paper key={edu.id} className="experience-item" elevation={1}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="subtitle2" color="primary">
                  Education
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => removeEducation(edu.id)}
                  className="delete-btn"
                >
                  <Delete />
                </IconButton>
              </Box>
              
              <Box display="flex" flexDirection="column" gap={2}>
                <Box display="flex" gap={2} flexDirection={{ xs: 'column', sm: 'row' }}>
                  <TextField
                    fullWidth
                    label="Institution"
                    size="small"
                    value={edu.institution}
                    onChange={(e) => handleEducationChange(edu.id, 'institution', e.target.value)}
                  />
                  <TextField
                    fullWidth
                    label="Degree"
                    size="small"
                    value={edu.degree}
                    onChange={(e) => handleEducationChange(edu.id, 'degree', e.target.value)}
                  />
                </Box>
                <Box display="flex" gap={2} flexDirection={{ xs: 'column', sm: 'row' }}>
                  <TextField
                    fullWidth
                    label="Duration"
                    size="small"
                    value={edu.duration}
                    onChange={(e) => handleEducationChange(edu.id, 'duration', e.target.value)}
                  />
                  <Box flex={1}></Box>
                </Box>
                <TextField
                  fullWidth
                  label="Details"
                  multiline
                  rows={2}
                  size="small"
                  value={edu.details}
                  onChange={(e) => handleEducationChange(edu.id, 'details', e.target.value)}
                />
              </Box>
            </Paper>
          ))}
        </Box>

        {/* Projects Section */}
        <Box className="form-section">
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Typography variant="h6" className="section-title">
              🚀 Projects
            </Typography>
            <Button
              variant="outlined"
              startIcon={<Add />}
              onClick={addProject}
              size="small"
            >
              Add Project
            </Button>
          </Box>

          {formData.projects.map((project) => (
            <Paper key={project.id} className="experience-item" elevation={1}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="subtitle2" color="primary">
                  Project
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => removeProject(project.id)}
                  className="delete-btn"
                >
                  <Delete />
                </IconButton>
              </Box>
              
              <Box display="flex" flexDirection="column" gap={2}>
                <TextField
                  fullWidth
                  label="Project Name"
                  size="small"
                  value={project.name}
                  onChange={(e) => handleProjectChange(project.id, 'name', e.target.value)}
                />
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={2}
                  size="small"
                  value={project.description}
                  onChange={(e) => handleProjectChange(project.id, 'description', e.target.value)}
                />
                <TextField
                  fullWidth
                  label="Technologies Used"
                  size="small"
                  value={project.technologies}
                  onChange={(e) => handleProjectChange(project.id, 'technologies', e.target.value)}
                />
              </Box>
            </Paper>
          ))}
        </Box>
      </DialogContent>

      <DialogActions className="form-actions">
        <Button onClick={onClose} className="cancel-btn">
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          startIcon={<Save />}
          className="save-btn"
        >
          Save Resume
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ResumeForm;
