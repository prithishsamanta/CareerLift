import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  Add,
  FolderOpen,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import Header from '../components/Header';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import "../styles/HomePage.css";

interface Workspace {
  id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  resume_filename?: string;
  job_title?: string;
  job_company?: string;
}

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [workspaceNameError, setWorkspaceNameError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load workplaces from backend on component mount
  useEffect(() => {
    loadWorkplaces();
  }, []);


  // Refresh workspaces when component becomes visible (user navigates back)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        refreshWorkspaces();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const loadWorkplaces = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getWorkplaces();
      const backendWorkspaces = response.workplaces || [];
      
      // Load temporary workspaces from localStorage
      const savedWorkspaces = localStorage.getItem('tempWorkspaces');
      let tempWorkspaces: Workspace[] = [];
      
      if (savedWorkspaces) {
        try {
          tempWorkspaces = JSON.parse(savedWorkspaces);
        } catch (error) {
          console.error('Error parsing saved workspaces:', error);
        }
      }
      
      // Merge backend and temporary workspaces, avoiding duplicates by name
      const backendNames = new Set(backendWorkspaces.map((w: Workspace) => w.name.toLowerCase()));
      const uniqueTempWorkspaces = tempWorkspaces.filter((w: Workspace) => !backendNames.has(w.name.toLowerCase()));
      const allWorkspaces = [...backendWorkspaces, ...uniqueTempWorkspaces];
      setWorkspaces(allWorkspaces);
      
    } catch (error: any) {
      console.error('Error loading workplaces:', error);
      setError(error.message || 'Failed to load workplaces');
    } finally {
      setLoading(false);
    }
  };

  const validateWorkspaceName = (name: string): string | null => {
    const trimmedName = name.trim();
    
    if (!trimmedName) {
      return "Workspace name is required";
    }
    
    if (trimmedName.length > 12) {
      return "Workspace name must be 12 characters or less";
    }
    
    return null;
  };

  const handleWorkspaceNameChange = (value: string) => {
    setNewWorkspaceName(value);
    
    // Clear error when user starts typing
    if (workspaceNameError) {
      setWorkspaceNameError(null);
    }
    
    // Validate on change for immediate feedback
    if (value.trim().length > 12) {
      setWorkspaceNameError("Workspace name must be 12 characters or less");
    }
  };

  const handleCreateWorkspace = async () => {
    const validationError = validateWorkspaceName(newWorkspaceName);
    
    if (validationError) {
      setWorkspaceNameError(validationError);
      return;
    }

    try {
      // Create a temporary workspace object and add it to the list
      const newWorkspace: Workspace = {
        id: Date.now(), // Temporary ID
        name: newWorkspaceName.trim(),
        description: `Workspace for ${newWorkspaceName.trim()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Add to the list immediately for better UX
      const updatedWorkspaces = [newWorkspace, ...workspaces];
      setWorkspaces(updatedWorkspaces);
      
      // Save to localStorage for persistence
      const tempWorkspaces = updatedWorkspaces.filter(w => typeof w.id === 'number' && w.id > 1000000000000);
      localStorage.setItem('tempWorkspaces', JSON.stringify(tempWorkspaces));
      
      setNewWorkspaceName("");
      setWorkspaceNameError(null);
      setCreateDialogOpen(false);
      
      // The actual workspace will be created in the database when analysis is generated
      // For now, we just show it in the UI
    } catch (error: any) {
      console.error('Error creating workspace:', error);
      setError(error.message || 'Failed to create workspace');
    }
  };

  const handleWorkspaceClick = (workspace: Workspace) => {
    // Navigate to Analysis page with workspace context
    navigate("/analysis", { 
      state: { 
        workspace,
        isTemporary: typeof workspace.id === 'number' && workspace.id > 1000000000000,
        tempWorkspaceId: typeof workspace.id === 'number' && workspace.id > 1000000000000 ? workspace.id : null
      } 
    });
  };

  // Function to clean up temporary workspace when it becomes a real workspace
  const cleanupTempWorkspace = (tempWorkspaceId: number) => {
    setWorkspaces(prevWorkspaces => {
      const updated = prevWorkspaces.filter(w => w.id !== tempWorkspaceId);
      const tempWorkspaces = updated.filter(w => typeof w.id === 'number' && w.id > 1000000000000);
      localStorage.setItem('tempWorkspaces', JSON.stringify(tempWorkspaces));
      return updated;
    });
  };

  // Function to refresh workspaces (useful when coming back from analysis)
  const refreshWorkspaces = () => {
    loadWorkplaces();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true
      });
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined
      });
    }
  };

  return (
    <Box className="home-page">
      {/* Use consistent Header component */}
      <Header />

      {/* Welcome Message */}
      <Container maxWidth="lg" sx={{ pt: 4, pb: 2, px: { xs: 2, sm: 3 } }}>
        <Box className="welcome-section" sx={{ textAlign: 'center', mb: 4 }}>
          <Typography 
            variant="h4" 
            component="h1"
            sx={{ 
              fontWeight: 700,
              color: '#1f2937',
              mb: 2,
              fontSize: { xs: '1.75rem', sm: '2.125rem' }
            }}
          >
            Hi {user?.firstName || 'User'}, Welcome to CareerLift
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              color: '#4b5563',
              fontSize: '1.125rem',
              lineHeight: 1.6,
              maxWidth: '800px',
              mx: 'auto'
            }}
          >
            CareerLift helps you bridge the gap between where you are and where you want to be, 
            by analyzing your resume and target job description using cutting-edge AI
          </Typography>
        </Box>
      </Container>

      {/* Main Content */}
      <Container maxWidth="lg" className="main-content" sx={{ px: { xs: 2, sm: 3 } }}>
        <Box className="workspaces-container">
          {/* Error Display */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}


          {/* Loading State */}
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
              <CircularProgress />
            </Box>
          ) : (
            <Box className="workspaces-grid" sx={{ width: '100%' }}>
              {/* Existing Workspaces */}
              {workspaces.map((workspace) => (
                <Box key={workspace.id} className="workspace-grid-item">
                  <Card
                    className="workspace-card"
                    elevation={2}
                    onClick={() => handleWorkspaceClick(workspace)}
                    sx={{
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                      }
                    }}
                  >
                    <CardContent 
                      className="workspace-content"
                      sx={{ 
                        p: 2.5,
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-start',
                        height: '100%',
                        minHeight: 'auto'
                      }}
                    >
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: '12px',
                          background: 'linear-gradient(135deg, #3182ce 0%, #2c5aa0 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mx: 'auto',
                          mb: 1.5
                        }}
                      >
                        <FolderOpen sx={{ fontSize: 24, color: 'white' }} />
                      </Box>
                      
                      <Typography 
                        variant="h6" 
                        className="workspace-name"
                        sx={{ 
                          fontWeight: 700,
                          color: '#1f2937',
                          fontSize: '1rem',
                          lineHeight: 1.3,
                          mb: 1.5,
                          wordBreak: 'break-word'
                        }}
                      >
                        {workspace.name}
                      </Typography>
                      
                      <Box className="workspace-timestamps">
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: '#6b7280',
                            fontSize: '0.75rem',
                            lineHeight: 1.2,
                            mb: 0.25
                          }}
                        >
                          Updated: {formatDateTime(workspace.updated_at)}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: '#9ca3af',
                            fontSize: '0.75rem',
                            lineHeight: 1.2
                          }}
                        >
                          Created: {formatDateTime(workspace.created_at)}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Box>
              ))}

              {/* Create New Workspace Card */}
              <Box className="workspace-grid-item">
                <Card
                  className="create-workspace-card"
                  elevation={2}
                  onClick={() => setCreateDialogOpen(true)}
                  sx={{
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    border: '1px dashed #cbd5e0',
                    background: '#ffffff',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                      borderColor: '#3182ce',
                      borderStyle: 'solid'
                    }
                  }}
                >
                  <CardContent 
                    className="create-workspace-content"
                    sx={{ 
                      p: 2.5,
                      textAlign: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'flex-start',
                      height: '100%',
                      minHeight: 'auto'
                    }}
                  >
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #ed8936 0%, #dd6b20 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 1.5
                      }}
                    >
                      <Add sx={{ fontSize: 24, color: 'white' }} />
                    </Box>
                    
                    <Typography 
                      variant="h6" 
                      className="create-workspace-text"
                      sx={{ 
                        fontWeight: 700,
                        color: '#1f2937',
                        fontSize: '1rem',
                        lineHeight: 1.3,
                        mb: 1.5,
                        textAlign: 'center'
                      }}
                    >
                      Create New Workspace
                    </Typography>
                    
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ 
                        fontSize: '0.75rem', 
                        lineHeight: 1.3,
                        color: '#6b7280',
                        textAlign: 'center',
                        mt: 0.5
                      }}
                    >
                      Start a new skill development journey
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            </Box>
          )}
        </Box>
      </Container>

      {/* Create Workspace Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={() => {
          setCreateDialogOpen(false);
          setWorkspaceNameError(null);
          setNewWorkspaceName("");
        }}
        maxWidth="sm"
        fullWidth
        className="create-workspace-dialog"
      >
        <DialogTitle className="dialog-title">
          <FolderOpen sx={{ mr: 1, color: "primary.main" }} />
          Create New Workspace
        </DialogTitle>

        <DialogContent>
          <Typography variant="body1" color="text.secondary" paragraph>
            Give your new workspace a name. You'll be able to start your skill development journey by clicking on the workspace and uploading your resume and job description.
          </Typography>

          <TextField
            autoFocus
            margin="dense"
            label="Workspace Name"
            type="text"
            fullWidth
            variant="outlined"
            value={newWorkspaceName}
            onChange={(e) => handleWorkspaceNameChange(e.target.value)}
            placeholder="e.g., Frontend Dev, Data Science"
            error={!!workspaceNameError}
            helperText={workspaceNameError || `${newWorkspaceName.length}/12 characters`}
            inputProps={{ maxLength: 15 }} // Allow a bit more to show validation error
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleCreateWorkspace();
              }
            }}
          />
        </DialogContent>

        <DialogActions className="dialog-actions">
          <Button
            onClick={() => {
              setCreateDialogOpen(false);
              setWorkspaceNameError(null);
              setNewWorkspaceName("");
            }}
            className="cancel-button"
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateWorkspace}
            variant="contained"
            className="create-button"
            disabled={!newWorkspaceName.trim() || !!workspaceNameError}
          >
            Create Workspace
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HomePage;
