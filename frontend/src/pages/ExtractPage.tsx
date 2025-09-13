import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { apiService } from '../services/api';
import '../styles/ExtractPage.css';

// Main App component containing the entire application flow
const ExtractPage = () => {
    const navigate = useNavigate();
    
    // State to manage the file upload progress and status
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadStatus, setUploadStatus] = useState('');

    // State for resume data - complete parsed data
    const [resumeData, setResumeData] = useState<any>(null);
    
    // State for job description and parsed data
    const [jobDescription, setJobDescription] = useState('');
    const [jobData, setJobData] = useState<any>(null);
    const [isProcessingJD, setIsProcessingJD] = useState(false);
    const [jdProcessStatus, setJdProcessStatus] = useState('');
    
    // State for analysis generation
    const [isGeneratingAnalysis, setIsGeneratingAnalysis] = useState(false);
    const [analysisStatus, setAnalysisStatus] = useState('');
    
    // useRef hook with a generic type to specify the element type
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Function to handle the file selection and upload simulation
    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setUploadStatus('');
            setUploadProgress(0);

            try {
                const data = await apiService.uploadResume(file);
                
                setUploadProgress(100);
                setUploadStatus('Upload successful!');
                console.log('File uploaded:', data);

                // Set complete resume data from backend response
                const parsedData = data.parsed_data;
                setResumeData(parsedData);
            } catch (error: any) {
                console.error('Upload error:', error);
                if (error.message?.includes('Authorization') || error.message?.includes('401')) {
                    setUploadStatus('Please log in first to upload your resume.');
                } else {
                    setUploadStatus(`Upload failed: ${error.message || 'Unknown error'}`);
                }
            }
        }
    };

    // Function to programmatically trigger the hidden file input
    const handleUploadTrigger = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    // Function to handle job description processing
    const handleProcessJobDescription = async () => {
        if (!jobDescription.trim()) {
            setJdProcessStatus('Please enter a job description first.');
            return;
        }

        setIsProcessingJD(true);
        setJdProcessStatus('Processing job description...');

        try {
            const data = await apiService.parseJobDescription({
                job_description: jobDescription
            });
            
            console.log('Job description parsed:', data);
            const parsedData = data.parsed_data;
            setJobData(parsedData);
            setJdProcessStatus('Job description processed successfully!');
        } catch (error: any) {
            console.error('Error processing job description:', error);
            if (error.message?.includes('Authorization') || error.message?.includes('401')) {
                setJdProcessStatus('Please log in first to process job descriptions.');
            } else {
                setJdProcessStatus(error.message || 'Failed to process job description');
            }
        } finally {
            setIsProcessingJD(false);
        }
    };
    
    // Function to handle analysis generation
    const handleGenerateAnalysis = async () => {
        if (!resumeData || !jobData) {
            setAnalysisStatus('Please upload a resume and process a job description first.');
            return;
        }

        setIsGeneratingAnalysis(true);
        setAnalysisStatus('Generating analysis...');

        try {
            const data = await apiService.generateAnalysis({
                name: `Analysis - ${new Date().toLocaleString()}`,
                description: 'Generated from ExtractPage'
            });
            
            console.log('Analysis generated:', data);
            setAnalysisStatus('Analysis generated successfully!');
            
            // Navigate to analysis page after successful generation
            setTimeout(() => {
                navigate('/analysis', { 
                    state: { 
                        workplaceId: data.workplace.id,
                        resumeData: data.resume_data,
                        jobData: data.job_description_data,
                        gapAnalysis: data.gap_analysis
                    } 
                });
            }, 1000);
        } catch (error: any) {
            console.error('Error generating analysis:', error);
            if (error.message?.includes('Authorization') || error.message?.includes('401')) {
                setAnalysisStatus('Please log in first to generate analysis.');
            } else if (error.message?.includes('No resume found')) {
                setAnalysisStatus('Please upload a resume first.');
            } else if (error.message?.includes('No job description found')) {
                setAnalysisStatus('Please process a job description first.');
            } else {
                setAnalysisStatus(`Failed to generate analysis: ${error.message || 'Unknown error'}`);
            }
        } finally {
            setIsGeneratingAnalysis(false);
        }
    };
    
    // Inline SVG for a file icon
    const FileIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
            <polyline points="14 2 14 8 20 8" />
        </svg>
    );

    // Inline SVG for a target icon
    const TargetIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="6" />
            <path d="M12 2v2" />
            <path d="M12 20v2" />
            <path d="M2 12h2" />
            <path d="M20 12h2" />
        </svg>
    );

    return (
        <div className="extract-page">
            {/* Use the proper Header component */}
            <Header />

            {/* Main Content - Two Cards Layout */}
            <div className="cards-container">
                {/* Resume Card */}
                <div className="card resume-card">
                    <div className="card-header">
                        <FileIcon />
                        <h3>Resume Upload & Analysis</h3>
                    </div>
                    
                    <div className="card-content">
                        <div className="upload-section">
                            <button 
                                className="upload-button"
                                onClick={handleUploadTrigger}
                            >
                                Upload Resume (PDF)
                            </button>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                onChange={handleFileChange} 
                                accept=".pdf" 
                                className="hidden-input" 
                            />
                        </div>
                        
                        {/* Loading Bar */}
                        {uploadProgress > 0 && uploadProgress < 100 && (
                            <div className="loading-bar-container">
                                <div 
                                    className="loading-bar" 
                                    style={{ width: `${uploadProgress}%` }}
                                ></div>
                            </div>
                        )}
                        
                        {/* Upload Status */}
                        {uploadStatus && (
                            <p className="upload-status">
                                {uploadStatus}
                            </p>
                        )}

                        {/* Resume Data Display */}
                        {resumeData && (
                            <div className="parsed-data-container">
                                <h4 className="section-title">📄 Parsed Resume Data</h4>
                                
                                {/* Skills Section */}
                                {resumeData.skills && resumeData.skills.length > 0 && (
                                    <div className="data-section">
                                        <h5 className="subsection-title">🛠️ Skills</h5>
                                        <div className="skills-container">
                                            {resumeData.skills.map((skill: string, index: number) => (
                                                <span key={index} className="skill-tag">{skill}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Work Experience Section */}
                                {resumeData.work_experience && resumeData.work_experience.length > 0 && (
                                    <div className="data-section">
                                        <h5 className="subsection-title">💼 Work Experience</h5>
                                        {resumeData.work_experience.map((exp: any, index: number) => (
                                            <div key={index} className="experience-item">
                                                <div className="experience-header">
                                                    <strong>{exp.position}</strong> at <em>{exp.company}</em>
                                                    <span className="duration">({exp.duration})</span>
                                                </div>
                                                <div className="experience-description">{exp.description}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Education Section */}
                                {resumeData.education && resumeData.education.length > 0 && (
                                    <div className="data-section">
                                        <h5 className="subsection-title">🎓 Education</h5>
                                        {resumeData.education.map((edu: any, index: number) => (
                                            <div key={index} className="education-item">
                                                <div className="education-header">
                                                    <strong>{edu.degree}</strong>
                                                    <span className="duration">({edu.year})</span>
                                                </div>
                                                <div className="education-institution">{edu.institution}</div>
                                                {edu.details && <div className="education-details">{edu.details}</div>}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Projects Section */}
                                {resumeData.projects && resumeData.projects.length > 0 && (
                                    <div className="data-section">
                                        <h5 className="subsection-title">🚀 Projects</h5>
                                        {resumeData.projects.map((project: any, index: number) => (
                                            <div key={index} className="project-item">
                                                <div className="project-header">
                                                    <strong>{project.name}</strong>
                                                    {project.duration && <span className="duration">({project.duration})</span>}
                                                </div>
                                                <div className="project-description">{project.description}</div>
                                                {project.technologies && (
                                                    <div className="project-technologies">
                                                        <strong>Technologies:</strong> {project.technologies}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Error Display */}
                                {resumeData.error && (
                                    <div className="error-section">
                                        <h5 className="subsection-title">⚠️ Error</h5>
                                        <div className="error-message">{resumeData.error}</div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Job Description Card */}
                <div className="card job-card">
                    <div className="card-header">
                        <TargetIcon />
                        <h3>Job Description Analysis</h3>
                    </div>
                    
                    <div className="card-content">
                        <div className="form-group">
                            <label htmlFor="job-description" className="form-label">Job Description:</label>
                            <textarea 
                                id="job-description" 
                                rows={8} 
                                placeholder="Enter the job description text here..." 
                                className="form-textarea"
                                value={jobDescription}
                                onChange={e => setJobDescription(e.target.value)}
                            ></textarea>
                        </div>

                        <div className="button-group">
                            <button 
                                className="process-button"
                                onClick={handleProcessJobDescription}
                                disabled={isProcessingJD || !jobDescription.trim()}
                            >
                                {isProcessingJD ? 'Processing...' : 'Process Job Description'}
                            </button>
                        </div>

                        {/* Processing Status */}
                        {jdProcessStatus && (
                            <p className="upload-status">
                                {jdProcessStatus}
                            </p>
                        )}

                        {/* Job Description Data Display */}
                        {jobData && (
                            <div className="parsed-data-container">
                                <h4 className="section-title">🎯 Parsed Job Description</h4>
                                
                                {/* Technical Skills Section */}
                                {jobData.technical_skills && jobData.technical_skills.length > 0 && (
                                    <div className="data-section">
                                        <h5 className="subsection-title">🛠️ Technical Skills Required</h5>
                                        <div className="skills-container">
                                            {jobData.technical_skills.map((skill: string, index: number) => (
                                                <span key={index} className="skill-tag job-skill-tag">{skill}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Technical Synopsis Section */}
                                {jobData.technical_synopsis && (
                                    <div className="data-section">
                                        <h5 className="subsection-title">📋 Technical Synopsis</h5>
                                        <div className="synopsis-content">
                                            {jobData.technical_synopsis}
                                        </div>
                                    </div>
                                )}

                                {/* Error Display */}
                                {jobData.error && (
                                    <div className="error-section">
                                        <h5 className="subsection-title">⚠️ Error</h5>
                                        <div className="error-message">{jobData.error}</div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            {/* Generate Analysis Button */}
            <div className="analysis-button-container">
                <button 
                    className="generate-analysis-btn"
                    onClick={handleGenerateAnalysis}
                    disabled={isGeneratingAnalysis}
                >
                    {isGeneratingAnalysis ? 'Generating...' : 'Generate Analysis'}
                </button>
                {analysisStatus && (
                    <div className={`status-message ${analysisStatus.includes('success') ? 'success' : 'error'}`}>
                        {analysisStatus}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExtractPage;