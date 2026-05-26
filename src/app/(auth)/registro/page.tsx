'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function RegistroPage() {
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    alias: '', email: '', password: '', confirmar: '',
    genero: 'mujer', busca: 'hombre', ciudad: '', edad: ''
  })
  const router = useRouter()
  const supabase = createClient()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const registrar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password !== form.confirmar) {
      setError('Las contraseñas no coinciden.')
      return
    }
    if (form.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }
    setCargando(true)
    setError('')

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    })

    if (signUpError) {
      setError('Error creando cuenta. Intenta de nuevo.')
      setCargando(false)
      return
    }

    if (data.user) {
      const { error: insertError } = await supabase.from('usuarios').insert({
        id: data.user.id,
        alias: form.alias,
        email: form.email,
        genero: form.genero,
        busca: form.busca,
        ciudad: form.ciudad,
        edad: parseInt(form.edad),
        creditos: 0,
      })

      if (insertError) {
        setError('Error creando perfil. Intenta de nuevo.')
        setCargando(false)
        return
      }

      router.push('/explorar')
    }
    setCargando(false)
  }

  return (
    <div className="min-h-screen bg-[#fff8f1] flex flex-col items-center justify-center px-6 py-10">
      <div className="mb-8 text-center">
        <div className="text-5xl mb-3">🔥</div>
        <h1 className="text-3xl font-bold" style={{
          background: 'linear-gradient(135deg,#af2245,#f07855)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>LUAPP</h1>
      </div>

      <div className="w-full max-w-sm bg-white rounded-3xl p-8 shadow-sm border border-rose-100">
        <h2 className="text-2xl font-semibold text-gray-800 mb-1">Crear cuenta</h2>
        <p className="text-sm text-gray-400 mb-6">100% discreto y anónimo</p>

        <form onSubmit={registrar} className="space-y-4">
          <div>
            <label className="text-xs tracking-widest text-gray-400 uppercase mb-1 block">Tu alias</label>
            <input name="alias" value={form.alias} onChange={handleChange}
              placeholder="Ej: Luna, Estrella..." required
              className="w-full px-4 py-3 rounded-full border border-gray-200 text-sm outline-none focus:border-[#af2245]"/>
          </div>

          <div>
            <label className="text-xs tracking-widest text-gray-400 uppercase mb-1 block">Email</label>
            <input name="email" type="email" value={form.email} onChange={handleChange}
              placeholder="tu@email.com" required
              className="w-full px-4 py-3 rounded-full border border-gray-200 text-sm outline-none focus:border-[#af2245]"/>
          </div>

          <div>
            <label className="text-xs tracking-widest text-gray-400 uppercase mb-1 block">Contraseña</label>
            <input name="password" type="password" value={form.password} onChange={handleChange}
              placeholder="Mínimo 6 caracteres" required
              className="w-full px-4 py-3 rounded-full border border-gray-200 text-sm outline-none focus:border-[#af2245]"/>
          </div>

          <div>
            <label className="text-xs tracking-widest text-gray-400 uppercase mb-1 block">Confirmar contraseña</label>
            <input name="confirmar" type="password" value={form.confirmar} onChange={handleChange}
              placeholder="Repite tu contraseña" required
              className="w-full px-4 py-3 rounded-full border border-gray-200 text-sm outline-none focus:border-[#af2245]"/>
          </div>

          <div>
            <label className="text-xs tracking-widest text-gray-400 uppercase mb-1 block">Ciudad</label>
            <input name="ciudad" value={form.ciudad} onChange={handleChange}
              placeholder="Bogotá, CDMX..." required
              className="w-full px-4 py-3 rounded-full border border-gray-200 text-sm outline-none focus:border-[#af2245]"/>
          </div>

          <div>
            <label className="text-xs tracking-widest text-gray-400 uppercase mb-1 block">Edad</label>
            <input name="edad" type="number" min="18" max="99"
              value={form.edad} onChange={handleChange}
              placeholder="Mayor de 18" required
              className="w-full px-4 py-3 rounded-full border border-gray-200 text-sm outline-none focus:border-[#af2245]"/>
          </div>

          <div>
            <label className="text-xs tracking-widest text-gray-400 uppercase mb-2 block">Soy</label>
            <div className="flex gap-3">
              {['mujer', 'hombre'].map(g => (
                <button key={g} type="button"
                  onClick={() => setForm({ ...form, genero: g })}
                  className="flex-1 py-2.5 rounded-full border text-sm capitalize transition-all"
                  style={{
                    background: form.genero === g ? 'linear-gradient(135deg,#af2245,#f07855)' : 'white',
                    color: form.genero === g ? 'white' : '#594143',
                    borderColor: form.genero === g ? 'transparent' : '#e0bec1'
                  }}>
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs tracking-widest text-gray-400 uppercase mb-2 block">Busco</label>
            <div className="flex gap-3">
              {['hombre', 'mujer', 'ambos'].map(b => (
                <button key={b} type="button"
                  onClick={() => setForm({ ...form, busca: b })}
                  className="flex-1 py-2.5 rounded-full border text-xs capitalize transition-all"
                  style={{
                    background: form.busca === b ? 'linear-gradient(135deg,#af2245,#f07855)' : 'white',
                    color: form.busca === b ? 'white' : '#594143',
                    borderColor: form.busca === b ? 'transparent' : '#e0bec1'
                  }}>
                  {b}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-red-400 text-xs">{error}</p>}

          <button type="submit" disabled={cargando}
            className="w-full text-white py-3.5 rounded-full text-xs tracking-widest uppercase font-medium disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg,#af2245,#f07855)' }}>
            {cargando ? 'Creando cuenta...' : 'Crear mi cuenta'}
          </button>
        </form>
      </div>

      <p className="text-center text-sm text-gray-400 mt-6">
        ¿Ya tienes cuenta?{' '}
        <Link href="/login" className="text-[#af2245] font-medium">Ingresar</Link>
      </p>
    </div>
  )
}