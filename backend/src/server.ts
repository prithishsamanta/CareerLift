import app from './app';

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`🚀 Server is running on port ${port}`);
  console.log(`📍 Local: http://localhost:${port}`);
  console.log(`🏥 Health check: http://localhost:${port}/health`);
});