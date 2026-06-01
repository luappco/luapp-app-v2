'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [listo, setListo] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resetSent, setResetSent] = useState(false)

  useEffect(() => {
    // Si ya hay sesión activa, redirigir directo
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        router.replace('/explorar')
      } else {
        setListo(true)
      }
    })
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Email o contraseña incorrectos.')
      setLoading(false)
      return
    }

    if (!data.user?.email_confirmed_at) {
      await supabase.auth.resend({ type: 'signup', email })
      router.push('/verificar-email?email=' + encodeURIComponent(email))
      return
    }

    router.replace('/explorar')
  }

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Ingresa tu email primero.')
      return
    }
    setError('')
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://app.luapp.co/reset-password',
    })
    if (error) {
      setError('Error al enviar el email. Intenta de nuevo.')
    } else {
      setResetSent(true)
    }
  }

  // ── Splash mientras verifica sesión ──────────────────────────────────────
  if (!listo) return (
    <div style={{
      minHeight: '100vh',
      background: '#fff8f1',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 24,
    }}>
      <img
        src="https://luapp.co/images/logo/logo-color.webp"
        alt="LUAPP"
        style={{ width: 140, height: 'auto' }}
      />
      <div style={{
        width: 32,
        height: 32,
        border: '3px solid #f0d4d8',
        borderTop: '3px solid #af2245',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )

  // ── Formulario ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#fff8f1] flex flex-col items-center justify-center px-4">
      <div className="mb-8 text-center">
        <img
          src="https://luapp.co/images/logo/logo-color.webp"
          alt="LUAPP"
          className="h-12 mx-auto mb-2"
        />
        <p className="text-xs text-gray-400 tracking-widest uppercase mt-1">Tu secreto está a salvo</p>
      </div>

      <div className="w-full max-w-sm bg-white rounded-3xl shadow-sm p-8">
        <h2 className="text-xl font-bold text-[#2A1840] mb-1">Ingresar</h2>
        <p className="text-sm text-gray-400 mb-6">Discreto y seguro</p>

        {resetSent ? (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-sm text-green-700 text-center">
            Revisa tu email para restablecer tu contraseña.
          </div>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                className="mt-1 w-full px-4 py-3 rounded-2xl border border-[#e0bec1] text-sm focus:outline-none focus:border-[#af2245] bg-gray-50"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="mt-1 w-full px-4 py-3 rounded-2xl border border-[#e0bec1] text-sm focus:outline-none focus:border-[#af2245] bg-gray-50"
              />
            </div>

            {error && <p className="text-sm text-[#af2245] text-center">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 text-white font-medium tracking-widest uppercase text-xs rounded-full disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg,#af2245,#f07855)', boxShadow: '0 8px 24px rgba(175,34,69,.3)' }}
            >
              {loading ? 'Ingresando...' : 'Entrar'}
            </button>

            <button
              type="button"
              onClick={handleForgotPassword}
              className="w-full text-sm text-[#af2245] hover:underline text-center mt-1"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </form>
        )}
      </div>

      <p className="mt-6 text-sm text-gray-500">
        ¿No tienes cuenta?{' '}
        <Link href="/registro" className="text-[#af2245] font-semibold hover:underline">
          Regístrate gratis
        </Link>
      </p>
    </div>
  )
}
