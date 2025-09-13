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
import '../styles/AnalysisPage.css';

const AnalysisPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [analysisData, setAnalysisData] = useState<any>(null);

  // Extract analysis data from navigation state
  useEffect(() => {
    if (location.state && location.state.gapAnalysis) {
      const gapAnalysis = location.state.gapAnalysis;
      console.log('Received gap analysis data:', gapAnalysis);
      
      if (gapAnalysis.status === 'success' && gapAnalysis.analysis) {
        setAnalysisData(gapAnalysis.analysis);
      }
    }
  }, [location.state]);

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
  const currentAnalysis = analysisData || mockAnalysis;

  const handleBackClick = () => {
    navigate('/upload');
  };

  const handleEditForm = () => {
    navigate('/upload');
  };

  const handleChatbot = () => {
    setChatbotOpen(true);
  };

  const handleSetPlan = () => {
    navigate('/tracker');
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
                      Create Learning Plan
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
