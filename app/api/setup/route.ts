// app/api/setup/route.ts
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export async function GET() {
  // Remove this route after first use!
  const result = await auth.api.signUpEmail({
    body: {
      email: 'admin@deansgatehaus.com',
      password: 'Admin1234!',
      name: 'Admin',
    }
  })
  return NextResponse.json(result)
}

