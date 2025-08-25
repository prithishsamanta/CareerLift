import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  Typography,
  TextField,
  IconButton,
  Paper,
  Avatar,
  Fab,
  Slide,
  InputAdornment,
  Divider,
  Button
} from '@mui/material';
import {
  Close,
  Send,
  Chat,
  SmartToy,
  Person,
  Minimize,
  Refresh
} from '@mui/icons-material';
import { TransitionProps } from '@mui/material/transitions';
import './Chatbot.css';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface ChatbotProps {
  open: boolean;
  onClose: () => void;
  title?: string;
}

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const Chatbot: React.FC<ChatbotProps> = ({ open, onClose, title = "AI Assistant" }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hello! I'm your AI assistant. I can help you understand your skill analysis, provide learning recommendations, or answer any questions about your progress. How can I assist you today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mock responses for demonstration
  const mockResponses = [
    "That's a great question! Based on your skill analysis, I'd recommend focusing on practical projects to reinforce your learning.",
    "I can see you're making good progress with React.js. Have you considered building a portfolio project to showcase your skills?",
    "For improving your Node.js skills, I suggest starting with Express.js fundamentals and building REST APIs.",
    "AWS can seem overwhelming at first, but starting with the free tier and basic services like EC2 and S3 is a good approach.",
    "Your learning streak is impressive! Consistency is key to mastering new technologies.",
    "Would you like me to suggest some specific resources or tutorials for any of your target skills?"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (inputMessage.trim() === '') return;

    const userMessage: Message = {
      id: messages.length + 1,
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI response delay
    setTimeout(() => {
      const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];
      const botMessage: Message = {
        id: messages.length + 2,
        text: randomResponse,
        sender: 'bot',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 2000);
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 1,
        text: "Chat cleared! How can I help you?",
        sender: 'bot',
        timestamp: new Date()
      }
    ]);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      TransitionComponent={Transition}
      maxWidth="sm"
      fullWidth
      className="chatbot-dialog"
      PaperProps={{
        className: isMinimized ? 'chatbot-minimized' : 'chatbot-expanded'
      }}
    >
      {/* Header */}
      <DialogTitle className="chatbot-header">
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            <Avatar className="bot-avatar">
              <SmartToy />
            </Avatar>
            <Box>
              <Typography variant="h6" className="chatbot-title">
                {title}
              </Typography>
              <Typography variant="caption" className="chatbot-status">
                {isTyping ? 'Typing...' : 'Online'}
              </Typography>
            </Box>
          </Box>
          
          <Box display="flex" alignItems="center">
            <IconButton
              onClick={() => setIsMinimized(!isMinimized)}
              className="header-button"
              size="small"
            >
              <Minimize />
            </IconButton>
            <IconButton
              onClick={handleClearChat}
              className="header-button"
              size="small"
            >
              <Refresh />
            </IconButton>
            <IconButton
              onClick={onClose}
              className="header-button"
              size="small"
            >
              <Close />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>

      {!isMinimized && (
        <>
          <Divider />
          
          {/* Messages Area */}
          <DialogContent className="chatbot-messages">
            <Box className="messages-container">
              {messages.map((message) => (
                <Box
                  key={message.id}
                  className={`message-wrapper ${message.sender}`}
                >
                  <Box display="flex" alignItems="flex-start" gap={1}>
                    {message.sender === 'bot' && (
                      <Avatar className="message-avatar bot">
                        <SmartToy />
                      </Avatar>
                    )}
                    
                    <Paper className={`message-bubble ${message.sender}`}>
                      <Typography variant="body1" className="message-text">
                        {message.text}
                      </Typography>
                      <Typography variant="caption" className="message-time">
                        {formatTime(message.timestamp)}
                      </Typography>
                    </Paper>
                    
                    {message.sender === 'user' && (
                      <Avatar className="message-avatar user">
                        <Person />
                      </Avatar>
                    )}
                  </Box>
                </Box>
              ))}
              
              {isTyping && (
                <Box className="message-wrapper bot">
                  <Box display="flex" alignItems="flex-start" gap={1}>
                    <Avatar className="message-avatar bot">
                      <SmartToy />
                    </Avatar>
                    <Paper className="message-bubble bot typing">
                      <Box className="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                      </Box>
                    </Paper>
                  </Box>
                </Box>
              )}
              
              <div ref={messagesEndRef} />
            </Box>
          </DialogContent>

          <Divider />

          {/* Input Area */}
          <Box className="chatbot-input">
            <TextField
              fullWidth
              multiline
              maxRows={3}
              placeholder="Type your message..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              variant="outlined"
              className="message-input"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleSendMessage}
                      disabled={inputMessage.trim() === ''}
                      className="send-button"
                    >
                      <Send />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            
            <Box display="flex" justifyContent="center" mt={1}>
              <Typography variant="caption" color="text.secondary">
                AI responses are simulated for demo purposes
              </Typography>
            </Box>
          </Box>
        </>
      )}
    </Dialog>
  );
};

// Floating Chat Button Component
interface FloatingChatButtonProps {
  onClick: () => void;
  className?: string;
}

export const FloatingChatButton: React.FC<FloatingChatButtonProps> = ({ 
  onClick, 
  className = '' 
}) => {
  return (
    <Fab
      color="primary"
      className={`floating-chat-fab ${className}`}
      onClick={onClick}
      sx={{ 
        position: 'fixed', 
        bottom: 24, 
        right: 24,
        zIndex: 1000
      }}
    >
      <Chat />
    </Fab>
  );
};

export default Chatbot;
