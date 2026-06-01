'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const router = useRouter()
  const supabase = createClient()

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }
    if (password !== confirm) {
      setError('Las contraseñas no coinciden.')
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError('Error al actualizar. El enlace puede haber expirado.')
      setLoading(false)
      return
    }

    setSuccess(true)
    setTimeout(() => router.push('/explorar'), 2000)
  }

  return (
    <div className="min-h-screen bg-[#fdf6f0] flex flex-col items-center justify-center px-4">
      {/* Logo */}
      <div className="mb-8 text-center">
        <div className="text-5xl mb-2">🔥</div>
        <h1 className="text-3xl font-bold text-rose-500 tracking-tight">LUAPP</h1>
        <p className="text-xs text-gray-400 tracking-widest uppercase mt-1">Tu secreto está a salvo</p>
      </div>

      <div className="w-full max-w-sm bg-white rounded-3xl shadow-sm p-8">
        <h2 className="text-xl font-bold text-gray-800 mb-1">Nueva contraseña</h2>
        <p className="text-sm text-gray-400 mb-6">Elige una contraseña segura</p>

        {success ? (
          <div className="text-center">
            <div className="text-4xl mb-3">✅</div>
            <p className="text-sm text-green-600 font-semibold">¡Contraseña actualizada!</p>
            <p className="text-xs text-gray-400 mt-1">Redirigiendo...</p>
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Nueva contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                required
                className="mt-1 w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm 
                  focus:outline-none focus:border-rose-400 bg-gray-50"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Confirmar contraseña
              </label>
              <input
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="Repite la contraseña"
                required
                className="mt-1 w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm 
                  focus:outline-none focus:border-rose-400 bg-gray-50"
              />
            </div>

            {error && (
              <p className="text-sm text-rose-500 text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-rose-500 to-rose-400 text-white 
                font-semibold rounded-2xl uppercase tracking-wider text-sm
                hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? 'Guardando...' : 'Guardar contraseña'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
