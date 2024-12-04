import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import compression from 'compression';
import helmet from 'helmet';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false
}));

// Compression middleware
app.use(compression());

// Parse JSON bodies
app.use(express.json());

// Webhook endpoint
app.post('/api/webhooks/mercadopago/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const webhookData = req.body;
    
    console.log('Received webhook:', {
      userId,
      data: webhookData
    });

    // Respond with 200 OK to acknowledge receipt
    res.status(200).json({ 
      received: true,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Serve static files from the dist directory
app.use(express.static(join(__dirname, 'dist')));

// Handle all other routes for SPA
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});