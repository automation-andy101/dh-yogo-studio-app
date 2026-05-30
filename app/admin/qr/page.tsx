'use client'
import { useState, useEffect, useRef } from 'react'
import { Download, QrCode } from 'lucide-react'

export default function QRPage() {
  const [url, setUrl] = useState('')
  const [qrDataUrl, setQrDataUrl] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setUrl(window.location.origin)
  }, [])

  const generateQR = async () => {
    if (!url) return
    setLoading(true)
    try {
      const res = await fetch(`/api/qr?url=${encodeURIComponent(url)}`)
      const data = await res.json()
      setQrDataUrl(data.qrDataUrl)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (url) generateQR()
  }, [])

  const download = () => {
    const a = document.createElement('a')
    a.href = qrDataUrl
    a.download = 'deansgate-haus-studio-qr.png'
    a.click()
  }

  const PRESETS = [
    { label: 'Home (All Options)', path: '/' },
    { label: 'Mat Hire', path: '/order/mat' },
    { label: 'Drinks', path: '/order/drinks' },
    { label: 'Shop', path: '/shop' },
    { label: 'Classes', path: '/order/classes' },
  ]

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">QR Code Generator</h1>
      <p className="text-gray-500 text-sm mb-6">Generate QR codes to place around your studio</p>

      {/* Preset destinations */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-50 mb-5">
        <h2 className="font-semibold text-sm mb-3">Quick Presets</h2>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.path}
              onClick={() => { setUrl(`${window.location.origin}${preset.path}`); setTimeout(generateQR, 100) }}
              className="px-3 py-1.5 text-sm bg-sage-50 text-sage-700 rounded-lg hover:bg-sage-100 transition-colors border border-sage-100"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom URL */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-50 mb-5">
        <h2 className="font-semibold text-sm mb-3">Custom URL</h2>
        <div className="flex gap-2">
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://yourstudio.com"
            className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-sage-400"
          />
          <button
            onClick={generateQR}
            className="px-4 py-2.5 bg-sage-600 text-white rounded-xl text-sm font-medium hover:bg-sage-700 transition-colors"
          >
            Generate
          </button>
        </div>
      </div>

      {/* QR Display */}
      {loading && (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-50">
          <div className="spinner w-8 h-8 mx-auto" />
        </div>
      )}

      {qrDataUrl && !loading && (
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-50 text-center">
          <div className="inline-block p-4 bg-white border-4 border-sage-200 rounded-2xl mb-4">
            <img src={qrDataUrl} alt="QR Code" className="w-48 h-48" />
          </div>
          <p className="text-sm text-gray-500 mb-1">Points to:</p>
          <p className="text-sm font-mono text-sage-700 break-all mb-5">{url}</p>
          <button
            onClick={download}
            className="inline-flex items-center gap-2 px-6 py-3 bg-charcoal text-white rounded-xl font-medium hover:bg-sage-800 transition-colors"
          >
            <Download className="w-4 h-4" />
            Download PNG
          </button>
          <p className="text-xs text-gray-400 mt-3">Print at A4 or A5 for best results</p>
        </div>
      )}
    </div>
  )
}
