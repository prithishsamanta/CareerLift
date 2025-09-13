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
  Work,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import Header from '../components/Header';
import { apiService } from '../services/api';
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
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
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

  const handleCreateWorkspace = async () => {
    if (newWorkspaceName.trim()) {
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
        setCreateDialogOpen(false);
        
        // The actual workspace will be created in the database when analysis is generated
        // For now, we just show it in the UI
      } catch (error: any) {
        console.error('Error creating workspace:', error);
        setError(error.message || 'Failed to create workspace');
      }
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

  return (
    <Box className="home-page">
      {/* Use consistent Header component */}
      <Header />

      {/* Main Content */}
      <Container maxWidth="lg" className="main-content">
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
            <Box className="workspaces-grid">
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
                        p: 4,
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        minHeight: '120px'
                      }}
                    >
                      <Box
                        sx={{
                          width: 60,
                          height: 60,
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #3182ce 0%, #2c5aa0 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mb: 2
                        }}
                      >
                        <Work sx={{ fontSize: 28, color: 'white' }} />
                      </Box>
                      
                      <Typography 
                        variant="h6" 
                        className="workspace-name"
                        sx={{ 
                          fontWeight: 600,
                          color: '#1f2937',
                          textAlign: 'center',
                          lineHeight: 1.3
                        }}
                      >
                        {workspace.name}
                      </Typography>
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
                    border: '2px dashed #cbd5e0',
                    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                      borderColor: '#3182ce',
                      background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)'
                    }
                  }}
                >
                  <CardContent 
                    className="create-workspace-content"
                    sx={{ 
                      p: 4,
                      textAlign: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      minHeight: '120px'
                    }}
                  >
                    <Box
                      sx={{
                        width: 60,
                        height: 60,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #ed8936 0%, #dd6b20 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 2
                      }}
                    >
                      <Add sx={{ fontSize: 28, color: 'white' }} />
                    </Box>
                    
                    <Typography 
                      variant="h6" 
                      className="create-workspace-text"
                      sx={{ 
                        fontWeight: 600,
                        color: '#1f2937',
                        textAlign: 'center',
                        lineHeight: 1.3,
                        mb: 1
                      }}
                    >
                      Create New Workspace
                    </Typography>
                    
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ 
                        fontSize: '0.875rem', 
                        lineHeight: 1.4,
                        textAlign: 'center'
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
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        className="create-workspace-dialog"
      >
        <DialogTitle className="dialog-title">
          <Work sx={{ mr: 1, color: "primary.main" }} />
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
            onChange={(e) => setNewWorkspaceName(e.target.value)}
            placeholder="e.g., Frontend Development, Data Science, Product Management"
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleCreateWorkspace();
              }
            }}
          />
        </DialogContent>

        <DialogActions className="dialog-actions">
          <Button
            onClick={() => setCreateDialogOpen(false)}
            className="cancel-button"
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateWorkspace}
            variant="contained"
            className="create-button"
            disabled={!newWorkspaceName.trim()}
          >
            Create Workspace
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HomePage;
