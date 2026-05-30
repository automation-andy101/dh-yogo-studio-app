import { NextRequest, NextResponse } from 'next/server'
import QRCode from 'qrcode'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const url = searchParams.get('url') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  try {
    const qrDataUrl = await QRCode.toDataURL(url, {
      width: 400,
      margin: 2,
      color: { dark: '#1c1c1e', light: '#ffffff' },
      errorCorrectionLevel: 'M',
    })
    return NextResponse.json({ qrDataUrl })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
