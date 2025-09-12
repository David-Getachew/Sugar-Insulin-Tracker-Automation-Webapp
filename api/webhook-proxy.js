export default async function handler(request, response) {
  // Get the webhook URL and secret from environment variables
  const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
  const webhookSecret = process.env.WEBHOOK_SECRET;
  
  // Check if required environment variables are set
  if (!n8nWebhookUrl || !webhookSecret) {
    return response.status(500).json({ 
      error: 'Missing environment variables: N8N_WEBHOOK_URL and/or WEBHOOK_SECRET must be set' 
    });
  }
  
  // Only allow POST requests
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    // Forward the request to the n8n webhook
    const res = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-webhook-secret': webhookSecret
      },
      body: JSON.stringify(request.body)
    });
    
    // Get the response data
    const data = await res.json();
    
    // Return the response from n8n
    return response.status(res.status).json(data);
  } catch (error) {
    console.error('Webhook proxy error:', error);
    return response.status(500).json({ error: 'Webhook proxy failed: ' + error.message });
  }
}