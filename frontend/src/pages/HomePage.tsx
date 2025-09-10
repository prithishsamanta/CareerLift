import React, { useState } from "react";
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
} from "@mui/material";
import {
  Add,
  Work,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import Header from '../components/Header';
import "../styles/HomePage.css";

interface Workspace {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  lastModified: string;
}

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");

  const handleCreateWorkspace = () => {
    if (newWorkspaceName.trim()) {
      const newWorkspace: Workspace = {
        id: Date.now().toString(),
        name: newWorkspaceName.trim(),
        description: `Workspace for ${newWorkspaceName.trim()}`,
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
      };

      setWorkspaces([...workspaces, newWorkspace]);
      setNewWorkspaceName("");
      setCreateDialogOpen(false);

      // Redirect to Analysis page
      navigate("/analysis");
    }
  };

  const handleWorkspaceClick = (workspace: Workspace) => {
    // Navigate to Analysis page with workspace context
    navigate("/analysis", { state: { workspace } });
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
          <Box className="workspaces-grid">
            {/* Existing Workspaces */}
            {workspaces.map((workspace) => (
              <Box key={workspace.id} className="workspace-grid-item">
                <Card
                  className="workspace-card"
                  elevation={2}
                  onClick={() => handleWorkspaceClick(workspace)}
                >
                  <CardContent className="workspace-content">
                    <Box className="workspace-header">
                      <Work className="workspace-icon" />
                      <Typography variant="h6" className="workspace-name">
                        {workspace.name}
                      </Typography>
                    </Box>

                    <Typography
                      variant="body2"
                      className="workspace-description"
                      color="text.secondary"
                    >
                      {workspace.description}
                    </Typography>

                    <Box className="workspace-meta">
                      <Chip
                        label={`Created: ${formatDate(workspace.createdAt)}`}
                        size="small"
                        variant="outlined"
                        className="workspace-chip"
                      />
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
              >
                <CardContent className="create-workspace-content">
                  <Box className="create-workspace-icon">
                    <Add sx={{ fontSize: 32, color: "#3b82f6" }} />
                  </Box>
                  <Typography variant="h6" className="create-workspace-text">
                    Create New Workspace
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem', lineHeight: 1.4 }}>
                    Start a new skill development journey
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </Box>
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
            Give your new workspace a name to get started with your skill
            development journey.
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
