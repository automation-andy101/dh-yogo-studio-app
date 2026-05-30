import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import * as dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import path from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.join(__dirname, '../.env.local') })

const MONGODB_URI = process.env.MONGODB_URI!

const StaffSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
}, { timestamps: true })

const Staff = mongoose.models.Staff || mongoose.model('Staff', StaffSchema)

async function seedAdmin() {
  await mongoose.connect(MONGODB_URI)
  console.log('Connected to MongoDB')

  const email = process.env.ADMIN_EMAIL || 'admin@deansgatehaus.com'
  const password = process.env.ADMIN_PASSWORD || 'Admin1234!'

  const existing = await Staff.findOne({ email })
  if (existing) {
    console.log(`Staff user already exists: ${email}`)
    process.exit(0)
  }

  const hashedPassword = await bcrypt.hash(password, 12)

  await Staff.create({
    email,
    password: hashedPassword,
    name: 'Admin',
  })

  console.log(`✅ Admin created: ${email}`)
  console.log(`   Password: ${password}`)
  process.exit(0)
}

seedAdmin().catch((err) => {
  console.error('Seed error:', err)
  process.exit(1)
})
