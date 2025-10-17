export default function handler(req, res) {
  // This is a placeholder - the actual tRPC API needs a full Node.js environment
  // For now, return a message indicating the API is not available in this deployment
  res.status(503).json({ 
    error: 'API not available',
    message: 'This deployment is frontend-only. Backend API functionality is not available.'
  });
}
