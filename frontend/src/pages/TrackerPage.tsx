import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  LinearProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Checkbox,
  Paper
} from '@mui/material';
import {
  ArrowBack,
  CalendarToday,
  CheckCircle,
  Schedule,
  TrendingUp,
  Assignment,
  NavigateBefore,
  NavigateNext
} from '@mui/icons-material';
import '../styles/TrackerPage.css';

const TrackerPage: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');

  // Mock data for daily tasks based on analysis
  const mockDailyTasks: { [key: string]: Array<{ id: number; task: string; skill: string; completed: boolean; priority: string }> } = {
    '2024-01-15': [
      { id: 1, task: 'Complete React Hooks tutorial', skill: 'React.js', completed: true, priority: 'High' },
      { id: 2, task: 'Read React documentation - Context API', skill: 'React.js', completed: false, priority: 'High' },
    ],
    '2024-01-16': [
      { id: 3, task: 'Build a simple React project', skill: 'React.js', completed: false, priority: 'High' },
      { id: 4, task: 'Practice Node.js Express basics', skill: 'Node.js', completed: false, priority: 'Medium' },
    ],
    '2024-01-17': [
      { id: 5, task: 'AWS Free Tier account setup', skill: 'AWS', completed: false, priority: 'Medium' },
      { id: 6, task: 'TypeScript fundamentals practice', skill: 'TypeScript', completed: false, priority: 'Low' },
    ],
  };

  const weeklyProgress = {
    'React.js': { completed: 2, total: 5, percentage: 40 },
    'Node.js': { completed: 0, total: 3, percentage: 0 },
    'AWS': { completed: 0, total: 4, percentage: 0 },
    'TypeScript': { completed: 0, total: 2, percentage: 0 },
  };

  const handleBackClick = () => {
    // TODO: Navigate back to analysis page
    console.log('Back to analysis page');
  };

  const handleTaskToggle = (taskId: number) => {
    // TODO: Toggle task completion
    console.log('Toggle task:', taskId);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'error';
      case 'Medium': return 'warning';
      case 'Low': return 'info';
      default: return 'default';
    }
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    for (let i = 0; i < 42; i++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const getTodayTasks = () => {
    const today = formatDate(new Date());
    return mockDailyTasks[today] || [];
  };

  return (
    <Box className="tracker-page">
      {/* Header */}
      <Box className="header-section">
        <Container maxWidth="lg">
          <Box display="flex" alignItems="center" justifyContent="space-between" py={3}>
            <Typography variant="h3" className="page-title">
              <Schedule sx={{ mr: 2, fontSize: 'inherit' }} />
              Progress Tracker
            </Typography>
            <Button
              variant="outlined"
              startIcon={<ArrowBack />}
              onClick={handleBackClick}
              className="back-button"
            >
              Back to Analysis
            </Button>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="xl" className="main-content">
        {/* View Mode Toggle */}
        <Box display="flex" justifyContent="center" mb={4}>
          <Box className="view-toggle">
            <Button
              variant={viewMode === 'calendar' ? 'contained' : 'outlined'}
              onClick={() => setViewMode('calendar')}
              startIcon={<CalendarToday />}
              className="toggle-button"
            >
              Calendar View
            </Button>
            <Button
              variant={viewMode === 'list' ? 'contained' : 'outlined'}
              onClick={() => setViewMode('list')}
              startIcon={<Assignment />}
              className="toggle-button"
              sx={{ ml: 2 }}
            >
              List View
            </Button>
          </Box>
        </Box>

        <Box display="flex" gap={3} flexDirection={{ xs: 'column', lg: 'row' }}>
          {/* Main Calendar/List Area */}
          <Box flex="1" maxWidth={{ lg: '80%' }}>
            {viewMode === 'calendar' ? (
              <Card className="calendar-card" elevation={2}>
                <CardContent sx={{ p: 2 }}>
                  {/* Calendar Header */}
                  <Box display="flex" alignItems="center" justifyContent="between" mb={3}>
                    <IconButton onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}>
                      <NavigateBefore />
                    </IconButton>
                    <Typography variant="h5" className="calendar-title">
                      {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </Typography>
                    <IconButton onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}>
                      <NavigateNext />
                    </IconButton>
                  </Box>

                  {/* Calendar Grid */}
                  <Box className="calendar-grid">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <Box key={day} className="calendar-day-header">
                        {day}
                      </Box>
                    ))}
                    {getDaysInMonth(currentDate).map((day, index) => {
                      const dateStr = formatDate(day);
                      const dayTasks = mockDailyTasks[dateStr] || [];
                      const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                      const isToday = formatDate(day) === formatDate(new Date());
                      
                      return (
                        <Box
                          key={index}
                          className={`calendar-day ${!isCurrentMonth ? 'other-month' : ''} ${isToday ? 'today' : ''}`}
                        >
                          <Typography variant="body2" className="day-number">
                            {day.getDate()}
                          </Typography>
                          {dayTasks.length > 0 && (
                            <Box className="task-indicators">
                              {dayTasks.slice(0, 2).map((task: any) => (
                                <Chip
                                  key={task.id}
                                  label={task.skill}
                                  size="small"
                                  color={getPriorityColor(task.priority) as any}
                                  className="task-chip"
                                />
                              ))}
                              {dayTasks.length > 2 && (
                                <Typography variant="caption" className="more-tasks">
                                  +{dayTasks.length - 2} more
                                </Typography>
                              )}
                            </Box>
                          )}
                        </Box>
                      );
                    })}
                  </Box>
                </CardContent>
              </Card>
            ) : (
              <Card className="list-card" elevation={2}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h5" className="list-title" gutterBottom>
                    <Assignment sx={{ mr: 1 }} />
                    Today's Tasks
                  </Typography>
                  <List>
                    {getTodayTasks().map((task: any) => (
                      <ListItem key={task.id} className="task-item">
                        <ListItemIcon>
                          <Checkbox
                            checked={task.completed}
                            onChange={() => handleTaskToggle(task.id)}
                            color="primary"
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={task.task}
                          secondary={`Skill: ${task.skill}`}
                          className={task.completed ? 'completed-task' : ''}
                        />
                        <Chip
                          label={task.priority}
                          color={getPriorityColor(task.priority) as any}
                          size="small"
                        />
                      </ListItem>
                    ))}
                    {getTodayTasks().length === 0 && (
                      <ListItem>
                        <ListItemText
                          primary="No tasks for today"
                          secondary="Great job staying on track!"
                        />
                      </ListItem>
                    )}
                  </List>
                </CardContent>
              </Card>
            )}
          </Box>

          {/* Progress Sidebar */}
          <Box flex="0 0 auto" width={{ xs: '100%', lg: '20%' }}>
            <Box className="progress-sidebar">
              {/* Weekly Progress */}
              <Card className="progress-card" elevation={2}>
                <CardContent>
                  <Typography variant="h6" className="progress-title" gutterBottom>
                    <TrendingUp sx={{ mr: 1 }} />
                    Weekly Progress
                  </Typography>
                  
                  {Object.entries(weeklyProgress).map(([skill, progress]) => (
                    <Box key={skill} className="skill-progress" mb={3}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography variant="body1" fontWeight={600}>
                          {skill}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {progress.completed}/{progress.total}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={progress.percentage}
                        sx={{ height: 8, borderRadius: 4 }}
                        className="progress-bar"
                      />
                      <Typography variant="caption" color="text.secondary">
                        {progress.percentage}% complete
                      </Typography>
                    </Box>
                  ))}
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card className="stats-card" elevation={2} sx={{ mt: 3 }}>
                <CardContent>
                  <Typography variant="h6" className="stats-title" gutterBottom>
                    📊 Quick Stats
                  </Typography>
                  
                  <Box className="stat-item">
                    <Typography variant="body2" color="text.secondary">
                      Tasks Completed This Week
                    </Typography>
                    <Typography variant="h4" className="stat-number">
                      2
                    </Typography>
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Box className="stat-item">
                    <Typography variant="body2" color="text.secondary">
                      Current Streak
                    </Typography>
                    <Typography variant="h4" className="stat-number">
                      3 days
                    </Typography>
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Box className="stat-item">
                    <Typography variant="body2" color="text.secondary">
                      Skills in Progress
                    </Typography>
                    <Typography variant="h4" className="stat-number">
                      4
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default TrackerPage;
