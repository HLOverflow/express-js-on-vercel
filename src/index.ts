import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import { getJWKS } from './auth/jwks.js'
import { generateAccessToken } from './auth/oauth.js'
import { authenticateToken } from './auth/middleware.js'
import { ensureKeys } from './auth/keys.js'

import * as dotenv from 'dotenv';
dotenv.config();

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

ensureKeys()

const app = express()
app.use(express.json())

/**
 * @swagger
 * /:
 *   get:
 *     summary: Home page
 *     description: Returns the main HTML page with navigation
 *     tags:
 *       - Pages
 *     responses:
 *       200:
 *         description: HTML page
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 */
app.get('/', (req, res) => {
  res.type('html').send(`
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8"/>
        <title>Express on Vercel</title>
        <link rel="stylesheet" href="/style.css" />
      </head>
      <body>
        <nav>
          <a href="/">Home</a>
          <a href="/about">About</a>
          <a href="/api-data">API Data</a>
          <a href="/healthz">Health</a>
        </nav>
        <h1>Welcome to Express on Vercel 🚀</h1>
        <p>This is a minimal example without a database or forms.</p>
        <img src="/logo.png" alt="Logo" width="120" />
      </body>
    </html>
  `)
})

/**
 * @swagger
 * /about:
 *   get:
 *     summary: About page
 *     description: Returns the about page HTML
 *     tags:
 *       - Pages
 *     responses:
 *       200:
 *         description: About page HTML
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 */
app.get('/about', function (req, res) {
  res.sendFile(path.join(__dirname, '..', 'components', 'about.htm'))
})

/**
 * @swagger
 * /api-data:
 *   get:
 *     summary: Get sample API data
 *     description: Returns sample data with a message and list of items
 *     tags:
 *       - API
 *     responses:
 *       200:
 *         description: Successful response with sample data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Here is some sample API data
 *                 items:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["apple", "banana", "cherry"]
 */
app.get('/api-data', (req, res) => {
  res.json({
    message: 'Here is some sample API data',
    items: ['apple', 'banana', 'cherry'],
  })
})

/**
 * @swagger
 * /healthz:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns the health status of the application
 *     tags:
 *       - Health
 *     responses:
 *       200:
 *         description: Application is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: 2024-01-21T14:32:00.000Z
 */
app.get('/healthz', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() })
})

/**
 * @swagger
 * /.well-known/jwks.json:
 *   get:
 *     summary: JSON Web Key Set endpoint
 *     description: Returns the public keys used to verify JWT tokens
 *     tags:
 *       - OAuth
 *     responses:
 *       200:
 *         description: JWKS response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 keys:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       kty:
 *                         type: string
 *                         example: RSA
 *                       use:
 *                         type: string
 *                         example: sig
 *                       kid:
 *                         type: string
 *                       alg:
 *                         type: string
 *                         example: RS256
 *                       n:
 *                         type: string
 *                       e:
 *                         type: string
 */
app.get('/.well-known/jwks.json', (req, res) => {
  const jwks = getJWKS()
  res.json(jwks)
})

/**
 * @swagger
 * /oauth/token:
 *   post:
 *     summary: OAuth token endpoint
 *     description: Generate an access token for API authentication
 *     tags:
 *       - OAuth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - grant_type
 *               - client_id
 *               - client_secret
 *             properties:
 *               grant_type:
 *                 type: string
 *                 example: client_credentials
 *               client_id:
 *                 type: string
 *                 example: your-client-id
 *               client_secret:
 *                 type: string
 *                 example: your-client-secret
 *               scope:
 *                 type: string
 *                 example: read write
 *     responses:
 *       200:
 *         description: Token generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 access_token:
 *                   type: string
 *                 token_type:
 *                   type: string
 *                   example: Bearer
 *                 expires_in:
 *                   type: number
 *                   example: 3600
 *                 scope:
 *                   type: string
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Invalid credentials
 */
app.post('/oauth/token', (req, res) => {
  const { grant_type, client_id, client_secret, scope } = req.body

  if (grant_type !== 'client_credentials') {
    return res.status(400).json({ error: 'unsupported_grant_type', error_description: 'Only client_credentials grant type is supported' })
  }

  if (!client_id || !client_secret) {
    return res.status(400).json({ error: 'invalid_request', error_description: 'client_id and client_secret are required' })
  }

  const validClientId = process.env.CLIENT_ID || 'demo-client-id'
  const validClientSecret = process.env.CLIENT_SECRET || 'demo-client-secret'

  if (client_id !== validClientId || client_secret !== validClientSecret) {
    return res.status(401).json({ error: 'invalid_client', error_description: 'Invalid client credentials' })
  }

  const tokenResponse = generateAccessToken(
    client_id,
    undefined,
    undefined,
    scope || 'read write',
    '1h'
  )

  res.json(tokenResponse)
})

/**
 * @swagger
 * /api/protected:
 *   get:
 *     summary: Protected API endpoint
 *     description: Example of a protected endpoint that requires OAuth authentication
 *     tags:
 *       - API
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response with user data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: This is protected data
 *                 user:
 *                   type: object
 *                   properties:
 *                     sub:
 *                       type: string
 *                     scope:
 *                       type: string
 *       401:
 *         description: Access token required
 *       403:
 *         description: Invalid or expired token
 */
app.get('/api/protected', authenticateToken, (req, res) => {
  res.json({
    message: 'This is protected data',
    user: req.user,
    timestamp: new Date().toISOString(),
  })
})

// The valid API key from environment variables
const CLIENT_API_KEY = process.env.CLIENT_API_KEY;
// Middleware function to check the API key
function checkApiKey(req, res, next) {
    // API key can be sent in query parameter 'api_key' or header 'x-api-key'
    const apiKey = req.get('X-CLIENT-AUTH');
    console.log("DEBUGGING HERE!!!!!!")
    if (! apiKey){
        res.status(403).send('Forbidden: Missing API Key');
    } else if(apiKey === CLIENT_API_KEY) {
        // Key is valid, proceed to the next middleware or route handler
        next();
    } else {
        // Key is invalid or missing, send a 403 Forbidden error
        res.status(403).send('Forbidden: Invalid API Key');
    }
}

// Example of applying middleware to a specific protected route
app.get('/protected1', checkApiKey, (req, res) => {
    res.send('Hello, authenticated user with a valid API key!');
});

export default app
