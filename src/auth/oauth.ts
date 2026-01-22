import jwt from 'jsonwebtoken'
import { getPrivateKey, getKeyId } from './keys.js'

export interface TokenPayload {
  sub: string
  email?: string
  name?: string
  scope?: string
  iat?: number
  exp?: number
}

export interface TokenResponse {
  access_token: string
  token_type: string
  expires_in: number
  scope?: string
}

export function generateAccessToken(
  userId: string,
  email?: string,
  name?: string,
  scope: string = 'read write',
  expiresIn: string = '1h'
): TokenResponse {
  const privateKey = getPrivateKey()
  const kid = getKeyId()

  const payload: TokenPayload = {
    sub: userId,
    email,
    name,
    scope,
  }

  const token = jwt.sign(payload, privateKey, {
    algorithm: 'RS256',
    expiresIn: expiresIn,
    issuer: process.env.JWT_ISSUER || 'https://express-js-on-vercel-iota-seven-72.vercel.app',
    audience: process.env.JWT_AUDIENCE || 'api',
    keyid: kid,
  } as jwt.SignOptions)

  const decoded = jwt.decode(token) as any
  const expiresInSeconds = decoded.exp - decoded.iat

  return {
    access_token: token,
    token_type: 'Bearer',
    expires_in: expiresInSeconds,
    scope,
  }
}

export function verifyAccessToken(token: string): TokenPayload {
  const publicKey = getPrivateKey()
  
  try {
    const decoded = jwt.verify(token, publicKey, {
      algorithms: ['RS256'],
      issuer: process.env.JWT_ISSUER || 'https://express-js-on-vercel-iota-seven-72.vercel.app',
      audience: process.env.JWT_AUDIENCE || 'api',
    }) as TokenPayload

    return decoded
  } catch (error) {
    throw new Error('Invalid or expired token')
  }
}
