'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { Usuario } from '@/types'

export default function PerfilPage() {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [cargando, setCargando] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    cargarPerfil()
  }, [])

  const cargarPerfil = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { data } = await supabase
      .from('usuarios').select('*').eq('id', user.id).single()
    setUsuario(data)
    setCargando(false)
  }

  const cerrarSesion = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const toggleIncognito = async () => {
    if (!usuario) return
    await supabase.from('usuarios')
      .update({ modo_incognito: !usuario.modo_incognito })
      .eq('id', usuario.id)
    setUsuario({ ...usuario, modo_incognito: !usuario.modo_incognito })
  }

  if (cargando) return (
    <div className="min-h-screen bg-[#fff8f1] flex items-center justify-center">
      <div className="text-4xl animate-pulse">🔥</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#fff8f1] flex flex-col max-w-md mx-auto pb-24">

      {/* Header con gradiente */}
      <div className="px-5 pt-12 pb-8 text-center"
        style={{ background: 'linear-gradient(160deg,rgba(242,196,206,.3),#fff8f1)' }}>
        <div className="w-20 h-20 rounded-full mx-auto mb-3 flex items-center justify-center text-3xl text-white font-bold"
          style={{ background: 'linear-gradient(135deg,#af2245,#f07855)' }}>
          {usuario?.alias?.[0]?.toUpperCase()}
        </div>
        <h2 className="text-xl font-bold text-[#2A1840]">{usuario?.alias}</h2>
        <p className="text-xs text-gray-400 tracking-wider mt-0.5 uppercase">
          {usuario?.ciudad} · {usuario?.edad} años
        </p>

        {/* Stats */}
        <div className="flex justify-center gap-8 mt-4">
          <div className="text-center">
            <div className="text-xl font-bold text-[#2A1840]">{usuario?.creditos}</div>
            <div className="text-xs text-gray-400">Créditos</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-[#2A1840]">
              {usuario?.modo_incognito ? '🔒' : '👁️'}
            </div>
            <div className="text-xs text-gray-400">Incógnito</div>
          </div>
        </div>
      </div>

      {/* Opciones */}
      <div className="px-4 space-y-3">

        <button onClick={toggleIncognito}
          className="w-full flex items-center gap-3 p-4 bg-white rounded-2xl border border-rose-100 text-left">
          <span className="text-xl">🔒</span>
          <div className="flex-1">
            <div className="text-sm font-medium text-[#2A1840]">Modo incógnito</div>
            <div className="text-xs text-gray-400">
              {usuario?.modo_incognito ? 'Activado — no apareces en búsquedas' : 'Desactivado'}
            </div>
          </div>
          <div className={`w-10 h-6 rounded-full transition-all ${usuario?.modo_incognito ? 'bg-[#af2245]' : 'bg-gray-200'}`}>
            <div className={`w-5 h-5 bg-white rounded-full shadow mt-0.5 transition-all ${usuario?.modo_incognito ? 'ml-4.5' : 'ml-0.5'}`}></div>
          </div>
        </button>

        <button onClick={() => router.push('/creditos')}
          className="w-full flex items-center gap-3 p-4 bg-white rounded-2xl border border-rose-100 text-left">
          <span className="text-xl">🔥</span>
          <div className="flex-1">
            <div className="text-sm font-medium text-[#2A1840]">Mis créditos</div>
            <div className="text-xs text-gray-400">{usuario?.creditos} disponibles</div>
          </div>
          <span className="text-gray-300">›</span>
        </button>

        <button className="w-full flex items-center gap-3 p-4 bg-white rounded-2xl border border-rose-100 text-left">
          <span className="text-xl">📸</span>
          <div className="flex-1">
            <div className="text-sm font-medium text-[#2A1840]">Álbum privado</div>
            <div className="text-xs text-gray-400">Solo para tus contactos</div>
          </div>
          <span className="text-gray-300">›</span>
        </button>

        <button className="w-full flex items-center gap-3 p-4 bg-white rounded-2xl border border-rose-100 text-left">
          <span className="text-xl">✏️</span>
          <div className="flex-1">
            <div className="text-sm font-medium text-[#2A1840]">Editar perfil</div>
            <div className="text-xs text-gray-400">Bio, ciudad, intereses</div>
          </div>
          <span className="text-gray-300">›</span>
        </button>

        <button onClick={cerrarSesion}
          className="w-full flex items-center gap-3 p-4 bg-white rounded-2xl border border-red-100 text-left mt-4">
          <span className="text-xl">🚪</span>
          <div className="flex-1">
            <div className="text-sm font-medium text-red-400">Cerrar sesión</div>
          </div>
        </button>

      </div>

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-rose-100 flex py-2 z-10">
        <button onClick={() => router.push('/explorar')}
          className="flex-1 flex flex-col items-center gap-0.5 text-gray-400">
          <span className="text-lg">🔍</span>
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
          className="flex-1 flex flex-col items-center gap-0.5 text-[#af2245]">
          <span className="text-lg">👤</span>
          <div className="w-1 h-1 rounded-full bg-[#af2245]"></div>
        </button>
      </div>
    </div>
  )
}