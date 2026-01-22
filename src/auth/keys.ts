import crypto from 'crypto'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const keysDir = path.join(__dirname, '..', '..', 'keys')
const privateKeyPath = path.join(keysDir, 'private.pem')
const publicKeyPath = path.join(keysDir, 'public.pem')

let cachedPrivateKey: string | null = null
let cachedPublicKey: string | null = null

export function ensureKeys() {
  if (process.env.RSA_PRIVATE_KEY && process.env.RSA_PUBLIC_KEY) {
    console.log('🔑 Using RSA keys from environment variables')
    cachedPrivateKey = Buffer.from(process.env.RSA_PRIVATE_KEY, 'base64').toString('utf8')
    cachedPublicKey = Buffer.from(process.env.RSA_PUBLIC_KEY, 'base64').toString('utf8')
    return
  }

  if (!fs.existsSync(keysDir)) {
    fs.mkdirSync(keysDir, { recursive: true })
  }

  if (!fs.existsSync(privateKeyPath) || !fs.existsSync(publicKeyPath)) {
    console.log('🔑 Generating RSA key pair...')
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem',
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
      },
    })

    fs.writeFileSync(privateKeyPath, privateKey)
    fs.writeFileSync(publicKeyPath, publicKey)
    console.log('✅ RSA key pair generated successfully')
    console.log('\n📝 To use these keys on Vercel, run: node scripts/encode-keys.js\n')
  }
}

export function getPrivateKey(): string {
  if (cachedPrivateKey) {
    return cachedPrivateKey
  }

  if (process.env.RSA_PRIVATE_KEY) {
    cachedPrivateKey = Buffer.from(process.env.RSA_PRIVATE_KEY, 'base64').toString('utf8')
    return cachedPrivateKey
  }

  ensureKeys()
  return fs.readFileSync(privateKeyPath, 'utf8')
}

export function getPublicKey(): string {
  if (cachedPublicKey) {
    return cachedPublicKey
  }

  if (process.env.RSA_PUBLIC_KEY) {
    cachedPublicKey = Buffer.from(process.env.RSA_PUBLIC_KEY, 'base64').toString('utf8')
    return cachedPublicKey
  }

  ensureKeys()
  return fs.readFileSync(publicKeyPath, 'utf8')
}

export function getKeyId(): string {
  const publicKey = getPublicKey()
  const hash = crypto.createHash('sha256').update(publicKey).digest('hex')
  return hash.substring(0, 16)
}
