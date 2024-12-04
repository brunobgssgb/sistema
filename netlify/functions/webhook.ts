import { Handler } from '@netlify/functions';
import { PaymentWebhookData } from '../../src/types/payment';

export const handler: Handler = async (event) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers,
      body: ''
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Extract user ID from path
    const pathPattern = /\/api\/webhooks\/mercadopago\/([^\/]+)/;
    const match = event.path.match(pathPattern);
    const userId = match ? match[1] : null;

    if (!userId) {
      console.error('User ID not found in path:', event.path);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'User ID not found in webhook URL' })
      };
    }

    // Parse webhook data
    const webhookData: PaymentWebhookData = JSON.parse(event.body || '{}');
    
    console.log('Webhook received:', {
      userId,
      paymentId: webhookData.id,
      status: webhookData.status,
      timestamp: new Date().toISOString()
    });

    // Process the webhook data here
    // You can store it in your database or trigger other actions

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        received: true,
        userId,
        paymentId: webhookData.id,
        status: webhookData.status,
        timestamp: new Date().toISOString()
      })
    };
  } catch (error) {
    console.error('Webhook processing error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
};