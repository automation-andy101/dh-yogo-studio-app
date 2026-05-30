import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import * as dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import path from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.join(__dirname, '../.env.local') })

const MONGODB_URI = process.env.MONGODB_URI!

async function seedAdmin() {
  await mongoose.connect(MONGODB_URI)
  console.log('Connected to MongoDB')

  const db = mongoose.connection.db!

  const email = process.env.ADMIN_EMAIL || 'admin@deansgatehaus.com'
  const password = process.env.ADMIN_PASSWORD || 'Admin1234!'
  const name = 'Admin'

  const existing = await db.collection('user').findOne({ email })
  if (existing) {
    console.log(`Admin user already exists: ${email}`)
    process.exit(0)
  }

  const hashedPassword = await bcrypt.hash(password, 12)
  const now = new Date()

  await db.collection('user').insertOne({
    name,
    email,
    emailVerified: true,
    createdAt: now,
    updatedAt: now,
  })

  const user = await db.collection('user').findOne({ email })

  await db.collection('account').insertOne({
    accountId: user!._id.toString(),
    providerId: 'credential',
    userId: user!._id,
    password: hashedPassword,
    createdAt: now,
    updatedAt: now,
  })

  console.log(`✅ Admin user created: ${email}`)
  console.log(`   Password: ${password}`)
  console.log(`   Change this password after first login!`)
  process.exit(0)
}

seedAdmin().catch((err) => {
  console.error('Seed error:', err)
  process.exit(1)
})