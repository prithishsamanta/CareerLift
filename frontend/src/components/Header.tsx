import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Psychology,
  Schedule,
  Work,
  Logout,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setMobileOpen(false);
  };

  const handleLogout = () => {
    // Clear any stored auth data
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    // Navigate to login page
    navigate('/');
    setMobileOpen(false);
  };

  const isActive = (path: string) => location.pathname === path;

  // Define all navigation items
  const allNavItems = [
    { path: "/home", label: "Home", icon: <Work /> },
    { path: "/upload", label: "Upload", icon: <Work /> },
    { path: "/analysis", label: "Analysis", icon: <Psychology /> },
    { path: "/tracker", label: "Tracker", icon: <Schedule /> },
  ];

  // Show different navigation items based on current page
  const navItems = location.pathname === "/home" 
    ? [{ path: "/home", label: "Home", icon: <Work /> }]
    : allNavItems;

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: "center" }}>
      <Typography variant="h6" sx={{ my: 2 }}>
        CareerLift
      </Typography>
      <List>
        {navItems.map((item) => (
          <ListItem
            key={item.path}
            onClick={() => handleNavigation(item.path)}
            sx={{
              backgroundColor: isActive(item.path)
                ? "primary.light"
                : "transparent",
              color: isActive(item.path) ? "white" : "inherit",
              borderRadius: 1,
              mx: 1,
              mb: 1,
            }}
          >
            <ListItemText primary={item.label} />
          </ListItem>
        ))}
        
        {/* Mobile Logout Button */}
        <ListItem
          onClick={handleLogout}
          sx={{
            backgroundColor: "transparent",
            color: "error.main",
            borderRadius: 1,
            mx: 1,
            mt: 2,
            border: "1px solid",
            borderColor: "error.main",
            "&:hover": {
              backgroundColor: "rgba(211, 47, 47, 0.08)",
            },
          }}
        >
          <ListItemText primary="Logout" />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <>
      <AppBar
        position="static"
        elevation={0}
        sx={{
          backgroundColor: "white",
          borderBottom: "1px solid #e2e8f0",
          color: "text.primary",
        }}
      >
        <Container maxWidth="lg">
          <Toolbar sx={{ justifyContent: "space-between" }}>
            {/* Logo/Brand */}
            <Box
              display="flex"
              alignItems="center"
              sx={{ cursor: "pointer" }}
              onClick={() => handleNavigation("/home")}
            >
              <Typography
                variant="h5"
                component="div"
                sx={{
                  fontWeight: 800,
                  background: "linear-gradient(45deg, #3182ce, #2c5aa0)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                CareerLift
              </Typography>
            </Box>

            {/* Desktop Navigation */}
            {!isMobile && (
              <Box display="flex" gap={2} alignItems="center">
                {navItems.map((item) => (
                  <Button
                    key={item.path}
                    onClick={() => handleNavigation(item.path)}
                    sx={{
                      color: isActive(item.path)
                        ? "primary.main"
                        : "text.secondary",
                      fontWeight: isActive(item.path) ? 600 : 400,
                      textTransform: "none",
                      fontSize: "1rem",
                      "&:hover": {
                        backgroundColor: "rgba(49, 130, 206, 0.08)",
                        color: "primary.main",
                      },
                    }}
                  >
                    {item.icon}
                    <Box component="span" sx={{ ml: 1 }}>
                      {item.label}
                    </Box>
                  </Button>
                ))}
                
                {/* Logout Button */}
                <Button
                  onClick={handleLogout}
                  sx={{
                    color: "error.main",
                    fontWeight: 500,
                    textTransform: "none",
                    fontSize: "1rem",
                    ml: 2,
                    "&:hover": {
                      backgroundColor: "rgba(211, 47, 47, 0.08)",
                      color: "error.dark",
                    },
                  }}
                >
                  <Logout sx={{ mr: 1, fontSize: "1.2rem" }} />
                  Logout
                </Button>
              </Box>
            )}

            {/* Mobile Menu Button */}
            {isMobile && (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ color: "text.primary" }}
              >
                <MenuIcon />
              </IconButton>
            )}
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: 240,
            backgroundColor: "white",
          },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Header;
