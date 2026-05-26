'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const login = async (e: React.FormEvent) => {
    e.preventDefault()
    setCargando(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      setError('Email o contraseña incorrectos.')
    } else {
      router.push('/explorar')
    }
    setCargando(false)
  }

  return (
    <div className="min-h-screen bg-[#fff8f1] flex flex-col items-center justify-center px-6">
      <div className="mb-10 text-center">
        <div className="text-5xl mb-3">🔥</div>
        <h1 className="text-3xl font-bold" style={{
          background: 'linear-gradient(135deg,#af2245,#f07855)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>LUAPP</h1>
        <p className="text-xs text-gray-400 mt-1 tracking-widest uppercase">Tu secreto está a salvo</p>
      </div>

      <div className="w-full max-w-sm bg-white rounded-3xl p-8 shadow-sm border border-rose-100">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Ingresar</h2>
        <p className="text-sm text-gray-400 mb-6">Discreto y seguro</p>

        <form onSubmit={login} className="space-y-4">
          <div>
            <label className="text-xs tracking-widest text-gray-400 uppercase mb-1 block">Email</label>
            <input
              type="email" value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="tu@email.com" required
              className="w-full px-4 py-3 rounded-full border border-gray-200 text-sm outline-none focus:border-[#af2245] transition-colors"
            />
          </div>

          <div>
            <label className="text-xs tracking-widest text-gray-400 uppercase mb-1 block">Contraseña</label>
            <input
              type="password" value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" required
              className="w-full px-4 py-3 rounded-full border border-gray-200 text-sm outline-none focus:border-[#af2245] transition-colors"
            />
          </div>

          {error && <p className="text-red-400 text-xs">{error}</p>}

          <button type="submit" disabled={cargando}
            className="w-full text-white py-3.5 rounded-full text-xs tracking-widest uppercase font-medium disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg,#af2245,#f07855)' }}>
            {cargando ? 'Ingresando...' : 'Entrar'}
          </button>
        </form>
      </div>

      <p className="text-center text-sm text-gray-400 mt-6">
        ¿No tienes cuenta?{' '}
        <Link href="/registro" className="text-[#af2245] font-medium">Regístrate gratis</Link>
      </p>
    </div>
  )
}