import React, { useState, useRef } from 'react';
import '../styles/ExtractPage.css';

// Main App component containing the entire application flow
const ExtractPage = () => {
    // State to manage the visibility of the panels
    const [resumePanelVisible, setResumePanelVisible] = useState(false);
    const [targetPanelVisible, setTargetPanelVisible] = useState(false);
    
    // State to manage the file upload progress and status
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadStatus, setUploadStatus] = useState('');

     // State for skills and work experience
    const [skills, setSkills] = useState('');
    const [workExperience, setWorkExperience] = useState('');
    
    // useRef hook with a generic type to specify the element type
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Function to handle the file selection and upload simulation
    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setUploadStatus('');
            setUploadProgress(0);

            const formData = new FormData();
            formData.append('resume', file);

            try {
                const response = await fetch('http://localhost:3000/api/upload-resume', {
                    method: 'POST',
                    body: formData,
                });

                if (response.ok) {
                    setUploadProgress(100);
                    setUploadStatus('Upload successful!');
                    const data = await response.json();
                    console.log('File uploaded:', data);

                    // Set skills and work experience from backend response
                    setSkills(data.skills || '');
                    setWorkExperience(data.experience || '');
                } else {
                    setUploadStatus('Upload failed.');
                }
            } catch (error) {
                setUploadStatus('Upload failed.');
            }
        }
    };

    // Function to programmatically trigger the hidden file input
    const handleUploadTrigger = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
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
        <>
            <div className="app-container">
                {/* Main Content Panel - Always visible */}
                <div className="main-panel">
                    <div className="panel-title">Taskbar - Showing the same options as home in all the pages</div>

                    <div className="button-group">
                        <button className="button">
                            Back
                        </button>
                        <button 
                            className="button"
                            onClick={() => {
                                setTargetPanelVisible(false);
                                setResumePanelVisible(!resumePanelVisible);
                            }}
                        >
                            <FileIcon /> Upload / Edit Resume
                        </button>
                        <button 
                            className="button"
                            onClick={() => {
                                setResumePanelVisible(false);
                                setTargetPanelVisible(!targetPanelVisible);
                            }}
                        >
                            <TargetIcon /> Upload / Edit Target
                        </button>
                    </div>

                    <div className="summary-container">
                        <div className="summary-box">
                            <p>Shows the Summary of the uploaded resume</p>
                        </div>
                        <div className="summary-box">
                            <p>Shows the Summary of the target</p>
                        </div>
                    </div>

                    <div className="button-group">
                        <button className="main-button">
                            Analyze
                        </button>
                    </div>
                </div>

                {/* Resume Panel (Conditionally Rendered) */}
                {resumePanelVisible && (
                    <div className="side-panel">
                        <div className="panel-title">Resume Panel</div>

                        <div className="button-group">
                            <button 
                                className="button"
                                onClick={handleUploadTrigger}
                            >
                                Upload Resume
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

                        <div className="form-group">
                            <label htmlFor="skills" className="form-label">Skills:</label>
                            <input 
                                type="text" 
                                id="skills" 
                                placeholder="Skills" 
                                className="form-input"
                                value={skills}
                                onChange={e => setSkills(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="work-experience" className="form-label">Work Experience:</label>
                            <textarea 
                                id="work-experience" 
                                rows={10} 
                                placeholder="Work Experience" 
                                className="form-textarea"
                                value={workExperience}
                                onChange={e => setWorkExperience(e.target.value)}
                            ></textarea>
                        </div>
                    </div>
                )}

                {/* Target Panel (Conditionally Rendered) */}
                {targetPanelVisible && (
                    <div className="side-panel">
                        <div className="panel-title">Target Panel</div>
                        <div className="form-group">
                            <label htmlFor="target-description" className="form-label">Target Description:</label>
                            <textarea 
                                id="target-description" 
                                rows={15} 
                                placeholder="Enter the description of your target job or role" 
                                className="form-textarea"
                            ></textarea>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default ExtractPage;
