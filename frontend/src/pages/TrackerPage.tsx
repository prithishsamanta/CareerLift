import React, { useState, useEffect } from 'react';
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
  Paper,
  TextField
} from '@mui/material';
import {
  CalendarToday,
  CheckCircle,
  TrendingUp,
  Assignment,
  NavigateBefore,
  NavigateNext,
  Refresh
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Chatbot, { FloatingChatButton } from '../components/Chatbot';
import { useWorkspace } from '../contexts/WorkspaceContext';
import '../styles/TrackerPage.css';
import { apiService } from '../services/api';

const TrackerPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentWorkspace, setCurrentWorkspace } = useWorkspace();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [studyPlan, setStudyPlan] = useState<any>(null);
  const [dailyTasks, setDailyTasks] = useState<{ [key: string]: Array<{ id: number; task: string; skill: string; completed: boolean; priority: string }> }>({});
  const [duration, setDuration] = useState<number>(14);
  const [savedGoal, setSavedGoal] = useState<any>(null);
  const [taskCompletions, setTaskCompletions] = useState<{ [key: string]: { [key: string]: boolean } }>({});
  const [loading, setLoading] = useState(false);

  // Handle workspace context from navigation
  useEffect(() => {
    // If workspace is passed via navigation state, update context
    if (location.state?.workspace) {
      setCurrentWorkspace(location.state.workspace);
    }
  }, [location.state, setCurrentWorkspace]);

  // Load saved goals and task completions when workspace changes
  useEffect(() => {
    if (currentWorkspace?.id) {
      loadSavedGoals();
      loadTaskCompletions();
    }
  }, [currentWorkspace]);

  // Load saved goals for the current workspace
  const loadSavedGoals = async () => {
    if (!currentWorkspace?.id) return;
    
    try {
      setLoading(true);
      const response = await apiService.getGoalByWorkplace(currentWorkspace.id);
      
      if (response.status === 'success' && response.goal) {
        setSavedGoal(response.goal);
        setStudyPlan(response.goal.goal_data);
        setDuration(response.goal.duration_days || 14);
        
        // Load task completions first, then convert goal data to daily tasks
        const completionsResponse = await apiService.getTaskCompletions(currentWorkspace.id);
        const completions = completionsResponse.status === 'success' ? completionsResponse.completions : {};
        setTaskCompletions(completions);
        
        // Convert saved goal data to daily tasks with completion data
        const tasks = convertStudyPlanToTasks(response.goal.goal_data, completions);
        setDailyTasks(tasks);
      }
    } catch (error) {
      console.error('Error loading saved goals:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load task completions for the current workspace
  const loadTaskCompletions = async () => {
    if (!currentWorkspace?.id) return;
    
    try {
      const response = await apiService.getTaskCompletions(currentWorkspace.id);
      
      if (response.status === 'success' && response.completions) {
        setTaskCompletions(response.completions);
        
        // Update daily tasks with new completion data
        if (studyPlan) {
          const updatedTasks = convertStudyPlanToTasks(studyPlan, response.completions);
          setDailyTasks(updatedTasks);
        }
      }
    } catch (error) {
      console.error('Error loading task completions:', error);
    }
  };

  // Save goals to database
  const saveGoals = async (goalData: any) => {
    if (!currentWorkspace?.id) {
      console.error('No workspace selected');
      return false;
    }
    
    try {
      setLoading(true);
      const response = await apiService.createGoal({
        workplace_id: currentWorkspace.id,
        goal_data: goalData,
        duration_days: duration
      });
      
      if (response.status === 'success') {
        setSavedGoal(response.goal);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error saving goals:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Mark task as completed/uncompleted
  const toggleTaskCompletion = async (taskId: string, taskDate: string, isCompleted: boolean) => {
    if (!currentWorkspace?.id) return;
    
    try {
      await apiService.markTaskCompletion({
        workplace_id: currentWorkspace.id,
        task_id: taskId,
        task_date: taskDate,
        is_completed: isCompleted
      });
      
      // Update local state
      setTaskCompletions(prev => ({
        ...prev,
        [taskDate]: {
          ...prev[taskDate],
          [taskId]: isCompleted
        }
      }));
      
      // Update daily tasks state
      setDailyTasks(prev => {
        const newTasks = { ...prev };
        if (newTasks[taskDate]) {
          newTasks[taskDate] = newTasks[taskDate].map(task => 
            task.id.toString() === taskId ? { ...task, completed: isCompleted } : task
          );
        }
        return newTasks;
      });
      
      // Refresh task completions from database to ensure consistency
      await loadTaskCompletions();
    } catch (error) {
      console.error('Error updating task completion:', error);
    }
  };

  // Convert study plan to daily tasks format
  const convertStudyPlanToTasks = (plan: any, completions: any = null) => {
    if (!plan || !plan.plan) return {};
    
    const tasks: { [key: string]: Array<{ id: number; task: string; skill: string; completed: boolean; priority: string }> } = {};
    const completionData = completions || taskCompletions;
    
    plan.plan.forEach((item: any, index: number) => {
      if (!tasks[item.date]) {
        tasks[item.date] = [];
      }
      
      const taskId = (index + 1).toString();
      const isCompleted = completionData[item.date]?.[taskId] || false;
      
      tasks[item.date].push({
        id: index + 1,
        task: item.topic,
        skill: item.skill,
        completed: isCompleted,
        priority: item.priority
      });
    });
    
    return tasks;
  };

  // Calculate weekly progress based on study plan
  const calculateWeeklyProgress = () => {
    if (!studyPlan || !studyPlan.plan) {
      return {
        'Cloud Infrastructure Management (AWS)': { completed: 0, total: 0, percentage: 0 },
        'Advanced SQL Querying': { completed: 0, total: 0, percentage: 0 },
        'Containerization with Docker & Kubernetes': { completed: 0, total: 0, percentage: 0 },
      };
    }

    const skillCounts: { [key: string]: { completed: number; total: number } } = {};
    
    studyPlan.plan.forEach((item: any) => {
      const skill = item.skill;
      if (!skillCounts[skill]) {
        skillCounts[skill] = { completed: 0, total: 0 };
      }
      skillCounts[skill].total++;
      
      // Check if task is completed (for now, we'll assume none are completed initially)
      const dateStr = item.date;
      const tasksForDate = dailyTasks[dateStr] || [];
      const taskCompleted = tasksForDate.some(task => task.task === item.topic && task.completed);
      if (taskCompleted) {
        skillCounts[skill].completed++;
      }
    });

    // Convert to percentage format
    const progress: { [key: string]: { completed: number; total: number; percentage: number } } = {};
    Object.keys(skillCounts).forEach(skill => {
      const { completed, total } = skillCounts[skill];
      progress[skill] = {
        completed,
        total,
        percentage: total > 0 ? Math.round((completed / total) * 100) : 0
      };
    });

    return progress;
  };

  const weeklyProgress = calculateWeeklyProgress();

    const fetchRoadmap = async () => {
    try {
      // Use the centralized apiService to make the request
      const data = await apiService.getRoadMap(duration);

      if (data.status === 'success') {
        setStudyPlan(data.data);
        console.log("Fetched Study Plan:", data.data);
        
        // Load task completions first, then convert study plan to daily tasks
        let completions = {};
        if (currentWorkspace?.id) {
          const completionsResponse = await apiService.getTaskCompletions(currentWorkspace.id);
          completions = completionsResponse.status === 'success' ? completionsResponse.completions : {};
          setTaskCompletions(completions);
        }
        
        // Convert study plan to daily tasks format with completion data
        const convertedTasks = convertStudyPlanToTasks(data.data, completions);
        setDailyTasks(convertedTasks);
        console.log("Converted Tasks:", convertedTasks);
        
        // Save the goals to database
        if (currentWorkspace?.id) {
          await saveGoals(data.data);
        }
      } else {
        // The apiService handleResponse will usually throw an error, 
        // but you can add extra handling here if the backend returns status:'error'
        console.error('Failed to fetch roadmap:', data.message);
      }
    } catch (error: any) {
      console.error('Error fetching roadmap:', error.message);
      
      // Even if roadmap creation fails, create a basic study plan and save goals
      console.log('Creating fallback study plan due to roadmap creation error');
      
      const fallbackStudyPlan = {
        plan: [
          {
            date: new Date().toISOString().split('T')[0],
            topic: "Review your analysis and create a learning plan",
            skill: "General",
            priority: "High"
          }
        ]
      };
      
      setStudyPlan(fallbackStudyPlan);
      
      // Load task completions first, then convert fallback study plan to daily tasks
      let completions = {};
      if (currentWorkspace?.id) {
        const completionsResponse = await apiService.getTaskCompletions(currentWorkspace.id);
        completions = completionsResponse.status === 'success' ? completionsResponse.completions : {};
        setTaskCompletions(completions);
      }
      
      const convertedTasks = convertStudyPlanToTasks(fallbackStudyPlan, completions);
      setDailyTasks(convertedTasks);
      
      // Save the fallback goals to database
      if (currentWorkspace?.id) {
        await saveGoals(fallbackStudyPlan);
      }
    }
  };

  // Add this useEffect to fetch the roadmap when the component mounts
  useEffect(() => {
    fetchRoadmap();
  }, []);  

  const handleBackClick = () => {
    navigate('/analysis');
  };

  const handleTaskToggle = (taskId: number) => {
    // Find the task and its date
    let taskDate = '';
    let currentCompleted = false;
    
    for (const date in dailyTasks) {
      const task = dailyTasks[date].find(task => task.id === taskId);
      if (task) {
        taskDate = date;
        currentCompleted = task.completed;
        break;
      }
    }
    
    if (taskDate) {
      const newCompleted = !currentCompleted;
      toggleTaskCompletion(taskId.toString(), taskDate, newCompleted);
    }
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
    return dailyTasks[today] || [];
  };

  return (
    <Box className="tracker-page">
      {/* Use consistent Header component */}
      <Header />

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
            <TextField
              label="Duration (days)"
              type="number"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value, 10))}
              variant="outlined"
              size="small"
              sx={{ width: '150px' }}
            />
            <Button
              variant="outlined"
              onClick={fetchRoadmap}
              startIcon={<Refresh />}
              className="toggle-button"
              sx={{ ml: 2 }}
            >
              Refresh Plan
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
                      const dayTasks = dailyTasks[dateStr] || [];
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
                      Total Tasks
                    </Typography>
                    <Typography variant="h4" className="stat-number">
                      {studyPlan?.plan?.length || 0}
                    </Typography>
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Box className="stat-item">
                    <Typography variant="body2" color="text.secondary">
                      Tasks Completed
                    </Typography>
                    <Typography variant="h4" className="stat-number">
                      {Object.values(dailyTasks).flat().filter(task => task.completed).length}
                    </Typography>
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Box className="stat-item">
                    <Typography variant="body2" color="text.secondary">
                      Skills in Progress
                    </Typography>
                    <Typography variant="h4" className="stat-number">
                      {Object.keys(weeklyProgress).length}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Box>
        </Box>
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

export default TrackerPage;
