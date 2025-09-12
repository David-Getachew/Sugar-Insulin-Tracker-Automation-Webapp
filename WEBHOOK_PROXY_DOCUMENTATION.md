# Webhook Proxy Implementation Documentation

## Overview
This document describes the implementation of a secure webhook proxy for the Sugar & Insulin Tracker application. The proxy moves the webhook secret from client-side code to server-side environment variables, addressing the security vulnerability of exposing secrets in client-side code.

## Implementation Details

### 1. Serverless Function (api/webhook-proxy.js)
A serverless function has been created at `api/webhook-proxy.js` that:
- Receives webhook requests from the frontend
- Forwards requests to the n8n webhook URL
- Adds the webhook secret header securely from environment variables
- Returns the response from n8n back to the frontend

### 2. Frontend Changes (src/hooks/useDatabase.ts)
The frontend has been updated to:
- Call the local proxy endpoint (`/api/webhook-proxy`) instead of the n8n webhook directly
- Remove the hardcoded webhook secret from client-side code
- Maintain the same request/response handling logic

## Environment Variables
The following environment variables need to be set in Vercel:

```
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/emergency
WEBHOOK_SECRET=your_secure_webhook_secret
```

Note: These are server-side environment variables (no VITE_ prefix needed) since they're only used in the serverless function.

## Security Benefits
1. **Secret Protection**: The webhook secret is no longer exposed in client-side code
2. **Environment Isolation**: Secrets are stored securely in Vercel environment variables
3. **Request Validation**: The proxy can implement additional validation if needed
4. **Centralized Management**: Webhook configuration is centralized in one place

## Deployment
1. Deploy the application to Vercel
2. Set the required environment variables in Vercel dashboard
3. The serverless function will automatically be available at `/api/webhook-proxy`

## Testing
To test the webhook proxy:
1. Ensure the environment variables are set correctly
2. Trigger an emergency report submission
3. Check the Vercel function logs for successful proxy execution
4. Verify the n8n workflow is triggered correctly

## Error Handling
The proxy includes error handling for:
- Missing environment variables
- Network failures
- Invalid HTTP methods
- n8n webhook errors

Errors are logged to the console and returned to the frontend for proper error handling.