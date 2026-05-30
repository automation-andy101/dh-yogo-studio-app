import { betterAuth } from 'better-auth'
import { mongodbAdapter } from 'better-auth/adapters/mongodb'
import { MongoClient } from 'mongodb'

console.log('BETTER_AUTH_SECRET exists:', !!process.env.BETTER_AUTH_SECRET)
console.log('BETTER_AUTH_URL:', process.env.BETTER_AUTH_URL)

const client = new MongoClient(process.env.MONGODB_URI!)

export const auth = betterAuth({
  database: mongodbAdapter(client.db()),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  session: {
    expiresIn: 60 * 60 * 24,
    updateAge: 60 * 60,
  },
  secret: process.env.AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
  trustedOrigins: [
    process.env.BETTER_AUTH_URL || 'http://localhost:3000'
  ],
})

export type Session = typeof auth.$Infer.Session