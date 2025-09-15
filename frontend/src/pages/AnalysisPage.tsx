import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Divider
} from '@mui/material';
import {
  Edit,
  Chat,
  Schedule,
  TrendingUp,
  Psychology,
  School,
  Work
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Chatbot from '../components/Chatbot';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { apiService } from '../services/api';
import '../styles/AnalysisPage.css';

const AnalysisPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [workspace, setWorkspace] = useState<any>(null);
  const [hasGoals, setHasGoals] = useState(false);
  const { currentWorkspace, setCurrentWorkspace } = useWorkspace();

  // Check if goals exist for the current workspace
  const checkGoalsExist = async (workspaceId: number) => {
    try {
      const response = await apiService.getGoalByWorkplace(workspaceId);
      setHasGoals(response.status === 'success' && response.goal !== null);
    } catch (error) {
      console.error('Error checking goals:', error);
      setHasGoals(false);
    }
  };

  // Extract analysis data and workspace from navigation state or context
  useEffect(() => {
    // Priority 1: Use workspace from navigation state (direct navigation)
    if (location.state?.workspace) {
      setWorkspace(location.state.workspace);
      setCurrentWorkspace(location.state.workspace); // Update context
      
      // Check for analysis data in navigation state
      if (location.state.gapAnalysis) {
        const gapAnalysis = location.state.gapAnalysis;
        console.log('🔍 Received gapAnalysis in AnalysisPage:', gapAnalysis);
        
        if (gapAnalysis && gapAnalysis.status === 'success' && gapAnalysis.analysis) {
          console.log('✅ Setting analysis data from navigation state');
          setAnalysisData(gapAnalysis.analysis);
        } else if (gapAnalysis && gapAnalysis.analysis) {
          // Handle case where status might not be exactly 'success'
          console.log('✅ Setting analysis data (no status check)');
          setAnalysisData(gapAnalysis.analysis);
        } else if (gapAnalysis) {
          // Handle case where gapAnalysis is the analysis data directly
          console.log('✅ Setting analysis data directly');
          setAnalysisData(gapAnalysis);
        }
      }
      
      // Check if analysis data is directly in workspace
      if (location.state.workspace.analysis_data) {
        setAnalysisData(location.state.workspace.analysis_data);
      }
      
      // Check if goals exist for this workspace
      if (location.state.workspace.id) {
        checkGoalsExist(location.state.workspace.id);
      }
    }
    // Priority 2: Use workspace from context (header navigation)
    else if (currentWorkspace) {
      setWorkspace(currentWorkspace);
      if (currentWorkspace.analysis_data) {
        setAnalysisData(currentWorkspace.analysis_data);
      }
      
      // Check if goals exist for this workspace
      if (currentWorkspace.id) {
        checkGoalsExist(currentWorkspace.id);
      }
    }
    
    // Fallback: Handle case where we have gapAnalysis but no workspace
    if (!location.state?.workspace && location.state?.gapAnalysis) {
      console.log('🔍 No workspace but have gapAnalysis, handling fallback');
      const gapAnalysis = location.state.gapAnalysis;
      
      if (gapAnalysis && gapAnalysis.status === 'success' && gapAnalysis.analysis) {
        console.log('✅ Setting analysis data from fallback');
        setAnalysisData(gapAnalysis.analysis);
      } else if (gapAnalysis && gapAnalysis.analysis) {
        setAnalysisData(gapAnalysis.analysis);
      } else if (gapAnalysis) {
        setAnalysisData(gapAnalysis);
      }
    }
  }, [location.state, currentWorkspace, setCurrentWorkspace]);

  // Fallback mock data if no real data is available
  const mockAnalysis = {
    summary: "Based on your resume and the target job description, we've identified key areas where you can improve to bridge the gap between your current skills and the requirements for your dream job.",
    skillsToImprove: [
      { name: 'React.js', current: 60, target: 90, urgency: 'High', suggestion: 'Focus on advanced React patterns and hooks' },
      { name: 'Node.js', current: 40, target: 80, urgency: 'High', suggestion: 'Build full-stack projects with Node.js' },
      { name: 'AWS', current: 20, target: 70, urgency: 'Medium', suggestion: 'Get AWS certification for cloud skills' },
      { name: 'TypeScript', current: 70, target: 85, urgency: 'Low', suggestion: 'Practice TypeScript in real projects' }
    ],
    strengths: ['JavaScript', 'HTML/CSS', 'Git', 'Problem Solving'],
    recommendations: [
      'Focus on advanced React patterns and hooks',
      'Build full-stack projects with Node.js',
      'Get AWS certification for cloud skills',
      'Practice TypeScript in real projects'
    ],
    suggestions: [
      'Set up a daily coding routine',
      'Build projects that showcase your skills',
      'Join developer communities for networking'
    ],
    conclusion: "You have a solid foundation in web development. Focus on strengthening your React and Node.js skills to be fully ready for senior developer positions."
  };

  // Use real data if available, otherwise use mock data
  // Handle different possible data structures
  let processedAnalysisData = null;
  
  if (analysisData) {
    processedAnalysisData = analysisData;
  } else if (workspace?.analysis_data) {
    processedAnalysisData = workspace.analysis_data;
  }
  
  // Transform the data structure to match expected format
  let transformedAnalysis = null;
  if (processedAnalysisData) {
    // Check if data is nested under 'gap_analysis'
    if (processedAnalysisData.gap_analysis) {
      transformedAnalysis = {
        summary: processedAnalysisData.gap_analysis.summary || processedAnalysisData.gap_analysis.conclusion || "Analysis completed successfully.",
        skillsToImprove: processedAnalysisData.gap_analysis.skillsToImprove || processedAnalysisData.gap_analysis.skills_to_improve || [],
        strengths: processedAnalysisData.gap_analysis.strengths || processedAnalysisData.gap_analysis.strong_points || [],
        recommendations: processedAnalysisData.gap_analysis.recommendations || processedAnalysisData.gap_analysis.suggestions || [],
        suggestions: processedAnalysisData.gap_analysis.suggestions || processedAnalysisData.gap_analysis.recommendations || [],
        conclusion: processedAnalysisData.gap_analysis.conclusion || processedAnalysisData.gap_analysis.summary || "Analysis completed."
      };
    } else {
      // Use data as-is if it's already in the expected format
      transformedAnalysis = processedAnalysisData;
    }
  }
  
  const currentAnalysis = transformedAnalysis || mockAnalysis;


  const handleBackClick = () => {
    navigate('/home');
  };

  const handleEditForm = () => {
    // Navigate to upload page with workspace context
    navigate('/upload', { 
      state: { 
        workspace: workspace
      } 
    });
  };

  const handleChatbot = () => {
    setChatbotOpen(true);
  };

  const handleSetPlan = () => {
    navigate('/tracker', { 
      state: { 
        workspace: workspace || currentWorkspace
      } 
    });
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'High': return 'error';
      case 'Medium': return 'warning';
      case 'Low': return 'info';
      default: return 'default';
    }
  };

  return (
    <Box className="analysis-page">
      {/* Use consistent Header component */}
      <Header />

      <Container maxWidth="lg" className="main-content">
        {/* Show workspace info if available */}
        {workspace && (
          <Box mb={3}>
            <Typography variant="h4" className="section-title" sx={{ background: 'transparent' }}>
              {workspace.name}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {workspace.description}
            </Typography>
          </Box>
        )}


        {/* Show upload prompt if no analysis data */}
        {!analysisData && (
          <Box sx={{ mb: 4 }}>
            {/* Welcome Section */}
            <Paper 
              elevation={0} 
              sx={{ 
                mb: 3,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                borderRadius: 3,
                overflow: 'hidden'
              }}
            >
              <CardContent sx={{ p: 6, textAlign: 'center', position: 'relative' }}>
                {/* Background Pattern */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                    opacity: 0.3
                  }}
                />
                
                <Box sx={{ position: 'relative', zIndex: 1 }}>
                  <Box display="flex" alignItems="center" justifyContent="center" mb={3}>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: '50%',
                        background: 'rgba(255, 255, 255, 0.2)',
                        backdropFilter: 'blur(10px)',
                        mr: 2
                      }}
                    >
                      <Work sx={{ fontSize: 48, color: 'white' }} />
                    </Box>
                    <Typography 
                      variant="h3" 
                      sx={{ 
                        fontWeight: 700,
                        textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}
                    >
                      Welcome to Your Workspace
                    </Typography>
                  </Box>
                  
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      mb: 2,
                      opacity: 0.9,
                      fontWeight: 400
                    }}
                  >
                    Ready to unlock your potential?
                  </Typography>
                  
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      maxWidth: '600px',
                      mx: 'auto',
                      opacity: 0.8,
                      lineHeight: 1.6
                    }}
                  >
                    Upload your resume and job description to get started with your personalized skill gap analysis. 
                    We'll help you identify areas for improvement and create a tailored development plan.
                  </Typography>
                </Box>
              </CardContent>
            </Paper>

            {/* Action Cards */}
            <Box display="flex" gap={3} flexDirection={{ xs: 'column', md: 'row' }}>
              {/* Upload Card */}
              <Paper 
                elevation={3} 
                sx={{ 
                  flex: 1,
                  borderRadius: 3,
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 24px rgba(0,0,0,0.15)'
                  }
                }}
              >
                <CardContent sx={{ p: 4, textAlign: 'center' }}>
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #3182ce 0%, #2c5aa0 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 3
                    }}
                  >
                    <Edit sx={{ fontSize: 32, color: 'white' }} />
                  </Box>
                  
                  <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                    Start Your Analysis
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.6 }}>
                    Upload your resume and job description to begin your personalized skill gap analysis
                  </Typography>
                  
                  <Button
                    variant="contained"
                    size="large"
                    onClick={handleEditForm}
                    startIcon={<Edit />}
                    sx={{ 
                      px: 4, 
                      py: 1.5,
                      background: 'linear-gradient(135deg, #3182ce 0%, #2c5aa0 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #2c5aa0 0%, #2a4d8d 100%)',
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    Upload Documents
                  </Button>
                </CardContent>
              </Paper>

              {/* Info Card */}
              <Paper 
                elevation={3} 
                sx={{ 
                  flex: 1,
                  borderRadius: 3,
                  overflow: 'hidden',
                  background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box display="flex" alignItems="center" mb={3}>
                    <Box
                      sx={{
                        width: 60,
                        height: 60,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #ed8936 0%, #dd6b20 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mr: 2
                      }}
                    >
                      <Psychology sx={{ fontSize: 24, color: 'white' }} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      What You'll Get
                    </Typography>
                  </Box>
                  
                  <Box component="ul" sx={{ pl: 0, listStyle: 'none' }}>
                    {[
                      'Personalized skill gap analysis',
                      'Targeted improvement recommendations',
                      'Custom learning roadmap',
                      'Progress tracking tools'
                    ].map((item, index) => (
                      <Box 
                        key={index}
                        component="li"
                        sx={{ 
                          display: 'flex',
                          alignItems: 'center',
                          mb: 1.5,
                          '&::before': {
                            content: '"✓"',
                            color: '#10b981',
                            fontWeight: 'bold',
                            mr: 1.5,
                            fontSize: '1.2rem'
                          }
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          {item}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Paper>
            </Box>

            {/* Back Button */}
            <Box display="flex" justifyContent="center" mt={4}>
              <Button
                variant="outlined"
                size="large"
                onClick={handleBackClick}
                sx={{ 
                  px: 4, 
                  py: 1.5,
                  borderColor: '#e2e8f0',
                  color: '#6b7280',
                  '&:hover': {
                    borderColor: '#3182ce',
                    color: '#3182ce',
                    backgroundColor: 'rgba(49, 130, 206, 0.04)'
                  }
                }}
              >
                Back to Workspaces
              </Button>
            </Box>
          </Box>
        )}

        {/* Show analysis data if available */}
        {(analysisData || workspace?.analysis_data) && (
          <Box display="flex" gap={4} flexDirection={{ xs: 'column', lg: 'row' }}>
            {/* Main Analysis Section */}
            <Box flex="1" maxWidth={{ lg: '66%' }}>
              <Paper className="analysis-card" elevation={3}>
                <CardContent sx={{ p: 4 }}>
                  <Box display="flex" alignItems="center" mb={3} sx={{ background: 'transparent' }}>
                    <TrendingUp sx={{ mr: 2, color: '#6b7280' }} />
                    <Typography variant="h4" className="section-title" sx={{ background: 'transparent' }}>
                      Your Skill Analysis
                    </Typography>
                  </Box>
                
                <Typography variant="body1" className="analysis-description" paragraph>
                  {currentAnalysis.summary}
                </Typography>

                <Divider sx={{ my: 3 }} />

                {/* Skill Gaps */}
                <Typography variant="h5" className="subsection-title" gutterBottom>
                  <Work sx={{ mr: 1 }} />
                  Skills to Improve
                </Typography>
                
                {currentAnalysis.skillsToImprove && currentAnalysis.skillsToImprove.map((skill: any, index: number) => (
                  <Box key={index} className="skill-gap-item" mb={3}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="h6">{skill.name}</Typography>
                      <Chip 
                        label={skill.urgency} 
                        color={getUrgencyColor(skill.urgency) as any}
                        size="small"
                      />
                    </Box>
                    <Box display="flex" alignItems="center" gap={2} mb={1}>
                      <Typography variant="body2" sx={{ minWidth: '100px' }}>
                        Current: {skill.current}%
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={skill.current}
                        sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
                      />
                      <Typography variant="body2" sx={{ minWidth: '100px' }}>
                        Target: {skill.target}%
                      </Typography>
                    </Box>
                    {skill.suggestion && (
                      <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                        💡 {skill.suggestion}
                      </Typography>
                    )}
                  </Box>
                ))}

                <Divider sx={{ my: 3 }} />

                {/* Strengths */}
                <Typography variant="h5" className="subsection-title" gutterBottom>
                  <School sx={{ mr: 1 }} />
                  Your Strengths
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={1} mb={3}>
                  {currentAnalysis.strengths && currentAnalysis.strengths.map((strength: string, index: number) => (
                    <Chip 
                      key={index} 
                      label={strength} 
                      color="success" 
                      variant="outlined"
                    />
                  ))}
                </Box>

                <Divider sx={{ my: 3 }} />

                {/* Recommendations */}
                <Typography variant="h5" className="subsection-title" gutterBottom>
                  💡 Recommendations
                </Typography>
                <Box mb={3}>
                  {currentAnalysis.recommendations && currentAnalysis.recommendations.map((rec: string, index: number) => (
                    <Typography key={index} variant="body1" className="recommendation-item" paragraph>
                      • {rec}
                    </Typography>
                  ))}
                </Box>

                {/* Suggestions */}
                {currentAnalysis.suggestions && currentAnalysis.suggestions.length > 0 && (
                  <>
                    <Divider sx={{ my: 3 }} />
                    <Typography variant="h5" className="subsection-title" gutterBottom>
                      🌟 Additional Suggestions
                    </Typography>
                    <Box mb={3}>
                      {currentAnalysis.suggestions.map((suggestion: string, index: number) => (
                        <Typography key={index} variant="body1" className="recommendation-item" paragraph>
                          • {suggestion}
                        </Typography>
                      ))}
                    </Box>
                  </>
                )}

                {/* Conclusion */}
                {currentAnalysis.conclusion && (
                  <>
                    <Divider sx={{ my: 3 }} />
                    <Typography variant="h5" className="subsection-title" gutterBottom>
                      🎯 Conclusion
                    </Typography>
                    <Typography variant="body1" className="conclusion-text" paragraph sx={{ 
                      fontStyle: 'italic', 
                      backgroundColor: '#f8f9fa', 
                      padding: 2, 
                      borderRadius: 2,
                      borderLeft: '4px solid #3182ce'
                    }}>
                      {currentAnalysis.conclusion}
                    </Typography>
                  </>
                )}
              </CardContent>
            </Paper>
          </Box>

          {/* Sidebar Actions */}
          <Box flex="0 0 auto" width={{ xs: '100%', lg: '33%' }}>
            <Box className="sidebar-actions" position="sticky" top={20}>
              <Card className="action-card" elevation={2}>
                <CardContent>
                  <Typography variant="h5" className="action-title" gutterBottom>
                    Quick Actions
                  </Typography>
                  
                  <Box display="flex" flexDirection="column" gap={2}>
                    <Button
                      variant="contained"
                      startIcon={<Edit />}
                      onClick={handleEditForm}
                      className="action-button edit-button"
                      fullWidth
                    >
                      Edit Analysis Form
                    </Button>
                    
                    <Button
                      variant="contained"
                      startIcon={<Schedule />}
                      onClick={handleSetPlan}
                      className="action-button plan-button"
                      fullWidth
                    >
                      {hasGoals ? 'View Goals' : 'Create Learning Plan'}
                    </Button>
                  </Box>
                </CardContent>
              </Card>

              {/* AI Assistant Card */}
              <Card className="ai-assistant-card" elevation={2} sx={{ mt: 3 }}>
                <CardContent>
                  <Typography variant="h6" className="ai-title" gutterBottom>
                    🤖 AI Assistant
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Need help understanding your analysis? Chat with our AI assistant for personalized guidance.
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<Chat />}
                    onClick={handleChatbot}
                    className="chat-button"
                    fullWidth
                  >
                    Start Chat
                  </Button>
                </CardContent>
              </Card>
            </Box>
          </Box>
        </Box>
        )}
      </Container>

      {/* Chatbot */}
      <Chatbot
        open={chatbotOpen}
        onClose={() => setChatbotOpen(false)}
      />
    </Box>
  );
};

export default AnalysisPage;
