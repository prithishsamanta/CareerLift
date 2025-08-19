# Backend - TiDB Hackathon Project

A TypeScript-based Express.js backend server for the TiDB hackathon project.

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- TiDB instance (for database connectivity)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Copy environment variables:
```bash
cp .env.example .env
```

3. Update the `.env` file with your configuration

### Development

Start the development server with hot reload:
```bash
npm run dev
```

The server will start on `http://localhost:3000` (or your configured PORT).

### Production

Build the project:
```bash
npm run build
```

Start the production server:
```bash
npm start
```

## 📁 Project Structure

```
src/
├── app.ts          # Express app configuration
├── server.ts       # Server entry point
├── routes/         # API route handlers
├── controllers/    # Business logic controllers
├── middleware/     # Custom middleware
├── models/         # Data models
├── types/          # TypeScript type definitions
└── utils/          # Utility functions
```

## 🛠 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run lint` - Check TypeScript types
- `npm run clean` - Remove build directory

## 📡 API Endpoints

### Base URL: `http://localhost:3000`

- `GET /` - Welcome message and server status
- `GET /health` - Health check endpoint
- `GET /api/status` - API status information
- `GET /api/tidb-info` - TiDB connection information

## 🗄️ TiDB Integration

This project is set up to work with TiDB. Connection configuration should be added to your `.env` file:

```env
TIDB_HOST=your-tidb-host
TIDB_PORT=4000
TIDB_DATABASE=your-database
TIDB_USERNAME=your-username
TIDB_PASSWORD=your-password
```

## 🔧 Configuration

The application uses environment variables for configuration. See `.env.example` for all available options.

## 📝 Development Notes

- TypeScript strict mode is enabled for better code quality
- CORS is configured for cross-origin requests
- Request logging and error handling middleware can be added as needed
- The project structure follows common Node.js/Express patterns