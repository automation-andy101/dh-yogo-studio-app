'use client'
import { useTheme, Theme } from './ThemeContext'
import { Palette } from 'lucide-react'
import { useState } from 'react'

const THEMES: { id: Theme; label: string; desc: string; preview: string[] }[] = [
  {
    id: 'deansgate-light',
    label: 'Deansgate Light',
    desc: 'Burgundy on ivory',
    preview: ['#4A0A0A', '#E8DDD0', '#F5F0EA'],
  },
  {
    id: 'deansgate-dark',
    label: 'Deansgate Dark',
    desc: 'Cream on black',
    preview: ['#0A0A0A', '#E8DDD0', '#1a1a1a'],
  },
    {
    id: 'deansgate-serenity',
    label: 'Deansgate Natural',
    desc: 'Sage green & clay',
    preview: ['#547f52', '#da6830', '#faf7f2'],
  },
]

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  const [open, setOpen] = useState(false)

  return (
    <div className="fixed top-4 right-4 z-50">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-10 h-10 rounded-full bg-white/90 backdrop-blur shadow-md flex items-center justify-center hover:scale-105 transition-transform border border-black/10"
        title="Switch theme"
      >
        <Palette className="w-4 h-4 text-gray-600" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0" onClick={() => setOpen(false)} />
          <div className="absolute top-12 right-0 bg-white rounded-2xl shadow-xl border border-gray-100 p-3 w-56 z-50">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 mb-2">Theme</p>
            {THEMES.map((t) => (
              <button
                key={t.id}
                onClick={() => { setTheme(t.id); setOpen(false) }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                  theme === t.id ? 'bg-gray-100' : 'hover:bg-gray-50'
                }`}
              >
                {/* Colour preview dots */}
                <div className="flex gap-1 shrink-0">
                  {t.preview.map((c, i) => (
                    <div key={i} className="w-4 h-4 rounded-full border border-black/10" style={{ background: c }} />
                  ))}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{t.label}</p>
                  <p className="text-xs text-gray-400">{t.desc}</p>
                </div>
                {theme === t.id && <div className="ml-auto w-2 h-2 rounded-full bg-gray-800" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
