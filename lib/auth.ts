import { betterAuth } from 'better-auth'
import { mongodbAdapter } from 'better-auth/adapters/mongodb'
import { MongoClient } from 'mongodb'

function createAuth() {
  const secret = process.env.BETTER_AUTH_SECRET || process.env.AUTH_SECRET
  const url = process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  
  console.log('Creating auth, secret exists:', !!secret, 'url:', url)

  if (!secret) {
    throw new Error('BETTER_AUTH_SECRET environment variable is not set')
  }

  const client = new MongoClient(process.env.MONGODB_URI!)

  return betterAuth({
    database: mongodbAdapter(client.db()),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
    },
    session: {
      expiresIn: 60 * 60 * 24,
      updateAge: 60 * 60,
    },
    secret,
    baseURL: url,
    trustedOrigins: [url],
  })
}

let _auth: ReturnType<typeof createAuth> | null = null

export function getAuth() {
  if (!_auth) {
    _auth = createAuth()
  }
  return _auth
}

export const auth = getAuth()
export type Session = typeof auth.$Infer.Session
