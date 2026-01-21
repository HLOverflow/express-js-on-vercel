import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

// Home route - HTML
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

app.get('/about', function (req, res) {
  res.sendFile(path.join(__dirname, '..', 'components', 'about.htm'))
})

// Example API endpoint - JSON
app.get('/api-data', (req, res) => {
  res.json({
    message: 'Here is some sample API data',
    items: ['apple', 'banana', 'cherry'],
  })
})

// Health check
app.get('/healthz', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() })
})

// The valid API key from environment variables
const CLIENT_API_KEY = process.env.CLIENT_API_KEY;
// Middleware function to check the API key
function checkApiKey(req, res, next) {
    // API key can be sent in query parameter 'api_key' or header 'x-api-key'
    const apiKey = req.get('X-CLIENT-AUTH');
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
