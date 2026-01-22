import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const keysDir = path.join(__dirname, '..', 'keys')
const privateKeyPath = path.join(keysDir, 'private.pem')
const publicKeyPath = path.join(keysDir, 'public.pem')

console.log('🔐 Encoding RSA keys for Vercel deployment\n')

if (!fs.existsSync(privateKeyPath) || !fs.existsSync(publicKeyPath)) {
  console.error('❌ Keys not found! Please run the server first to generate keys.')
  console.error('   Run: pnpm dev')
  process.exit(1)
}

const privateKey = fs.readFileSync(privateKeyPath, 'utf8')
const publicKey = fs.readFileSync(publicKeyPath, 'utf8')

const privateKeyBase64 = Buffer.from(privateKey).toString('base64')
const publicKeyBase64 = Buffer.from(publicKey).toString('base64')

console.log('✅ Keys encoded successfully!\n')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('📋 Add these environment variables to Vercel:')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

console.log('RSA_PRIVATE_KEY')
console.log(privateKeyBase64)
console.log('')

console.log('RSA_PUBLIC_KEY')
console.log(publicKeyBase64)
console.log('')

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('\n📝 How to add to Vercel:')
console.log('   1. Go to your project on Vercel dashboard')
console.log('   2. Settings → Environment Variables')
console.log('   3. Add RSA_PRIVATE_KEY with the first value above')
console.log('   4. Add RSA_PUBLIC_KEY with the second value above')
console.log('   5. Redeploy your application')
console.log('\n⚠️  IMPORTANT: Keep these values secret! Never commit them to git.\n')

const envExample = `
# Add to your .env file for local testing with environment variables:
RSA_PRIVATE_KEY=${privateKeyBase64}
RSA_PUBLIC_KEY=${publicKeyBase64}
`

const envExamplePath = path.join(__dirname, '..', '.env.keys.example')
fs.writeFileSync(envExamplePath, envExample.trim())
console.log(`💾 Example saved to: .env.keys.example`)
console.log('   (This file is for reference only - do not commit it!)\n')
