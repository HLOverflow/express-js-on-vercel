import crypto from 'crypto'
import { getPublicKey, getKeyId } from './keys.js'

export interface JWK {
  kty: string
  use: string
  kid: string
  alg: string
  n: string
  e: string
}

export interface JWKS {
  keys: JWK[]
}

function pemToJwk(pem: string, kid: string): JWK {
  const publicKey = crypto.createPublicKey(pem)
  const jwk = publicKey.export({ format: 'jwk' }) as any

  return {
    kty: 'RSA',
    use: 'sig',
    kid: kid,
    alg: 'RS256',
    n: jwk.n,
    e: jwk.e,
  }
}

export function getJWKS(): JWKS {
  const publicKey = getPublicKey()
  const kid = getKeyId()
  const jwk = pemToJwk(publicKey, kid)

  return {
    keys: [jwk],
  }
}
