import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box
} from '@mui/material';
import {
  Home,
  Logout
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import '../styles/Taskbar.css';

const Taskbar: React.FC = () => {
  const navigate = useNavigate();

  const handleHome = () => {
    navigate('/home');
  };

  const handleLogout = () => {
    // Clear any stored login data
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    // Navigate to login page
    navigate('/');
  };

  return (
    <AppBar position="static" className="taskbar" elevation={1}>
      <Toolbar className="taskbar-toolbar">
        {/* Left side - App name */}
        <Typography 
          variant="h6" 
          className="app-name"
          sx={{ flexGrow: 1 }}
        >
          SkillGap Analyzer
        </Typography>

        {/* Right side - Navigation buttons */}
        <Box className="nav-buttons">
          <Button
            color="inherit"
            startIcon={<Home />}
            onClick={handleHome}
            className="nav-button"
            sx={{ textTransform: 'none' }}
          >
            Home
          </Button>
          <Button
            color="inherit"
            startIcon={<Logout />}
            onClick={handleLogout}
            className="nav-button"
            sx={{ textTransform: 'none' }}
          >
            Logout
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Taskbar;
