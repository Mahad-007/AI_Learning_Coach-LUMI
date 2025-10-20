import express from 'express';
import cors from 'cors';
import emailRoutes from './email-service.js';

const app = express();
const PORT = process.env.EMAIL_SERVER_PORT || 4001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/', emailRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'Email Service', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`📧 Email service running on port ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

export default app;
