import swaggerJsdoc from 'swagger-jsdoc'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Express API on Vercel',
      version: '1.0.0',
      description: 'API documentation for Express.js application deployed on Vercel with OAuth 2.0 authentication',
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
      {
        url: 'https://express-js-on-vercel-iota-seven-72.vercel.app',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token obtained from /oauth/token endpoint',
        },
        OAuth2: {
          type: 'oauth2',
          flows: {
            clientCredentials: {
              tokenUrl: '/oauth/token',
              scopes: {
                'read': 'Read access',
                'write': 'Write access',
              },
            },
          },
        },
      },
    },
  },
  apis: ['./src/index.ts', './src/**/*.ts'],
}

export const swaggerSpec = swaggerJsdoc(options)

export function generateSwaggerFile() {
  const outputPath = path.join(__dirname, '..', 'swagger.json')
  fs.writeFileSync(outputPath, JSON.stringify(swaggerSpec, null, 2))
  console.log(`✅ Swagger definition file generated at: ${outputPath}`)
  return outputPath
}
