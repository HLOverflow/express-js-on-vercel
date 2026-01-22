import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { getPublicKey } from './keys.js'
import { TokenPayload } from './oauth.js'

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload
    }
  }
}

export function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ error: 'Access token required' })
  }

  try {
    const publicKey = getPublicKey()
    const decoded = jwt.verify(token, publicKey, {
      algorithms: ['RS256'],
      issuer: process.env.JWT_ISSUER || 'https://express-js-on-vercel-iota-seven-72.vercel.app',
      audience: process.env.JWT_AUDIENCE || 'api',
    }) as TokenPayload

    req.user = decoded
    next()
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' })
  }
}

export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return next()
  }

  try {
    const publicKey = getPublicKey()
    const decoded = jwt.verify(token, publicKey, {
      algorithms: ['RS256'],
      issuer: process.env.JWT_ISSUER || 'https://express-js-on-vercel-iota-seven-72.vercel.app',
      audience: process.env.JWT_AUDIENCE || 'api',
    }) as TokenPayload

    req.user = decoded
  } catch (error) {
  }

  next()
}
