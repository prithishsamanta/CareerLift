import React from 'react';
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
  ArrowBack,
  Edit,
  Chat,
  Schedule,
  TrendingUp,
  Psychology,
  School,
  Work
} from '@mui/icons-material';
// import { useNavigate } from 'react-router-dom';
import '../styles/AnalysisPage.css';

const AnalysisPage: React.FC = () => {
  // const navigate = useNavigate();

  // Mock data for demonstration
  const mockAnalysis = {
    skillGaps: [
      { skill: 'React.js', currentLevel: 60, requiredLevel: 90, priority: 'High' },
      { skill: 'Node.js', currentLevel: 40, requiredLevel: 80, priority: 'High' },
      { skill: 'AWS', currentLevel: 20, requiredLevel: 70, priority: 'Medium' },
      { skill: 'TypeScript', currentLevel: 70, requiredLevel: 85, priority: 'Low' }
    ],
    strengths: ['JavaScript', 'HTML/CSS', 'Git', 'Problem Solving'],
    recommendations: [
      'Focus on advanced React patterns and hooks',
      'Build full-stack projects with Node.js',
      'Get AWS certification for cloud skills',
      'Practice TypeScript in real projects'
    ]
  };

  const handleBackClick = () => {
    // TODO: Navigate to previous page when implemented
    console.log('Back button clicked');
  };

  const handleEditForm = () => {
    // TODO: Navigate to edit form when implemented
    console.log('Edit form clicked');
  };

  const handleChatbot = () => {
    // TODO: Open chatbot when implemented
    console.log('Chatbot clicked');
  };

  const handleSetPlan = () => {
    // TODO: Navigate to plan page when implemented
    console.log('Set plan clicked');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'error';
      case 'Medium': return 'warning';
      case 'Low': return 'info';
      default: return 'default';
    }
  };

  return (
    <Box className="analysis-page">
      {/* Header */}
      <Box className="header-section">
        <Container maxWidth="lg">
          <Box display="flex" alignItems="center" justifyContent="space-between" py={3}>
            <Typography variant="h3" className="page-title">
              <Psychology sx={{ mr: 2, fontSize: 'inherit' }} />
              Skill Gap Analysis
            </Typography>
            <Button
              variant="outlined"
              startIcon={<ArrowBack />}
              onClick={handleBackClick}
              className="back-button"
            >
              Back
            </Button>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" className="main-content">
        <Box display="flex" gap={4} flexDirection={{ xs: 'column', lg: 'row' }}>
          {/* Main Analysis Section */}
          <Box flex="1" maxWidth={{ lg: '66%' }}>
            <Paper className="analysis-card" elevation={3}>
              <CardContent sx={{ p: 4 }}>
                <Box display="flex" alignItems="center" mb={3}>
                  <TrendingUp sx={{ mr: 2, color: 'primary.main' }} />
                  <Typography variant="h4" className="section-title">
                    Your Skill Analysis
                  </Typography>
                </Box>
                
                <Typography variant="body1" className="analysis-description" paragraph>
                  Based on your resume and the target job description, we've identified key areas 
                  where you can improve to bridge the gap between your current skills and the 
                  requirements for your dream job.
                </Typography>

                <Divider sx={{ my: 3 }} />

                {/* Skill Gaps */}
                <Typography variant="h5" className="subsection-title" gutterBottom>
                  <Work sx={{ mr: 1 }} />
                  Skills to Improve
                </Typography>
                
                {mockAnalysis.skillGaps.map((gap, index) => (
                  <Box key={index} className="skill-gap-item" mb={3}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="h6">{gap.skill}</Typography>
                      <Chip 
                        label={gap.priority} 
                        color={getPriorityColor(gap.priority) as any}
                        size="small"
                      />
                    </Box>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Typography variant="body2" sx={{ minWidth: '100px' }}>
                        Current: {gap.currentLevel}%
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={gap.currentLevel}
                        sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
                      />
                      <Typography variant="body2" sx={{ minWidth: '100px' }}>
                        Target: {gap.requiredLevel}%
                      </Typography>
                    </Box>
                  </Box>
                ))}

                <Divider sx={{ my: 3 }} />

                {/* Strengths */}
                <Typography variant="h5" className="subsection-title" gutterBottom>
                  <School sx={{ mr: 1 }} />
                  Your Strengths
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={1} mb={3}>
                  {mockAnalysis.strengths.map((strength, index) => (
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
                <Box>
                  {mockAnalysis.recommendations.map((rec, index) => (
                    <Typography key={index} variant="body1" className="recommendation-item">
                      • {rec}
                    </Typography>
                  ))}
                </Box>
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


    </Box>
  );
};

export default AnalysisPage;
