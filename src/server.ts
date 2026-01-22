import app from './index.js'
import swaggerUi from 'swagger-ui-express'
import { swaggerSpec, generateSwaggerFile } from './swagger.config.js'

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

generateSwaggerFile()

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`)
  console.log(`📚 Swagger documentation available at http://localhost:${PORT}/api-docs`)
})
