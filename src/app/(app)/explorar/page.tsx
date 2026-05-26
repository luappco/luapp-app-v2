'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { Usuario } from '@/types'

export default function ExplorarPage() {
  const [perfiles, setPerfiles] = useState<Usuario[]>([])
  const [indice, setIndice] = useState(0)
  const [cargando, setCargando] = useState(true)
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { data: perfil } = await supabase
      .from('usuarios').select('*').eq('id', user.id).single()
    if (!perfil) { router.push('/registro'); return }
    setUsuario(perfil)

    const { data } = await supabase
      .from('usuarios')
      .select('*')
      .neq('id', user.id)
      .eq('activo', true)
      .eq('modo_incognito', false)
      .limit(20)

    setPerfiles(data || [])
    setCargando(false)
  }

  const darFlechazo = async () => {
    if (!usuario || !perfiles[indice]) return
    await supabase.from('flechazos').insert({
      de_usuario: usuario.id,
      a_usuario: perfiles[indice].id
    })
    setIndice(i => i + 1)
  }

  const pasar = () => setIndice(i => i + 1)

  const perfil = perfiles[indice]

  if (cargando) return (
    <div className="min-h-screen bg-[#fff8f1] flex items-center justify-center">
      <div className="text-4xl animate-pulse">🔥</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#fff8f1] flex flex-col max-w-md mx-auto">
      {/* Header */}
      <div className="px-5 pt-12 pb-3 flex items-center justify-between">
        <h1 className="text-xl font-bold" style={{
          background: 'linear-gradient(135deg,#af2245,#f07855)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
        }}>LUAPP</h1>
        <div className="flex gap-2 items-center">
          <div className="bg-rose-50 border border-rose-200 rounded-full px-3 py-1 text-xs text-[#af2245]">
            🔥 {usuario?.creditos} créditos
          </div>
          <button onClick={() => router.push('/perfil')}
            className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-sm">
            👤
          </button>
        </div>
      </div>

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-rose-100 flex py-2 z-10">
        <button onClick={() => router.push('/explorar')}
          className="flex-1 flex flex-col items-center gap-0.5 text-[#af2245]">
          <span className="text-lg">🔍</span>
          <div className="w-1 h-1 rounded-full bg-[#af2245]"></div>
        </button>
        <button onClick={() => router.push('/mensajes')}
          className="flex-1 flex flex-col items-center gap-0.5 text-gray-400">
          <span className="text-lg">💬</span>
        </button>
        <button onClick={() => router.push('/creditos')}
          className="flex-1 flex flex-col items-center gap-0.5 text-gray-400">
          <span className="text-lg">🔥</span>
        </button>
        <button onClick={() => router.push('/perfil')}
          className="flex-1 flex flex-col items-center gap-0.5 text-gray-400">
          <span className="text-lg">👤</span>
        </button>
      </div>

      {/* Card */}
      <div className="flex-1 px-4 pb-24">
        {!perfil ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 pt-20">
            <div className="text-5xl">✨</div>
            <p className="text-gray-500 text-center">No hay más perfiles por ahora.<br/>Vuelve más tarde.</p>
          </div>
        ) : (
          <div className="relative rounded-3xl overflow-hidden shadow-xl" style={{ height: '65vh' }}>
            {/* Foto */}
            <div className="absolute inset-0 bg-gradient-to-b from-rose-100 to-rose-200 flex items-center justify-center">
              <span className="text-8xl opacity-20">👤</span>
            </div>
            <div className="absolute inset-0" style={{
              background: 'linear-gradient(to top, rgba(26,16,51,.9) 0%, transparent 55%)'
            }}></div>

            {/* Tags */}
            <div className="absolute top-4 left-4 flex gap-2">
              <span className="bg-white/20 border border-white/30 rounded-full px-2 py-0.5 text-xs text-white">
                {perfil.ciudad}
              </span>
            </div>

            {/* Info */}
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <h2 className="text-2xl font-bold text-white mb-1">
                {perfil.alias}, {perfil.edad}
              </h2>
              <p className="text-white/60 text-xs mb-1">📍 {perfil.ciudad}</p>
              {perfil.bio && (
                <p className="text-white/70 text-sm mb-4 line-clamp-2">{perfil.bio}</p>
              )}

              {/* Acciones */}
              <div className="flex justify-center gap-4">
                <button onClick={pasar}
                  className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-xl shadow-lg">
                  ✕
                </button>
                <button onClick={() => router.push('/mensajes')}
                  className="w-14 h-14 rounded-full flex items-center justify-center text-xl shadow-lg"
                  style={{ background: '#1e1b17' }}>
                  💬
                </button>
                <button onClick={darFlechazo}
                  className="w-14 h-14 rounded-full flex items-center justify-center text-xl shadow-lg"
                  style={{ background: 'linear-gradient(135deg,#af2245,#f07855)' }}>
                  🔥
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}