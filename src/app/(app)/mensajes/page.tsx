'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function MensajesPage() {
  const [matches, setMatches] = useState<any[]>([])
  const [cargando, setCargando] = useState(true)
  const [userId, setUserId] = useState('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    cargarMatches()
  }, [])

  const cargarMatches = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    setUserId(user.id)

    const { data } = await supabase
      .from('matches')
      .select(`
        *,
        usuario1_data:usuarios!matches_usuario1_fkey(alias, ciudad),
        usuario2_data:usuarios!matches_usuario2_fkey(alias, ciudad)
      `)
      .or(`usuario1.eq.${user.id},usuario2.eq.${user.id}`)
      .order('created_at', { ascending: false })

    setMatches(data || [])
    setCargando(false)
  }

  const getOtroUsuario = (match: any) => {
    if (match.usuario1 === userId) return match.usuario2_data
    return match.usuario1_data
  }

  if (cargando) return (
    <div className="min-h-screen bg-[#fff8f1] flex items-center justify-center">
      <div className="text-4xl animate-pulse">🔥</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#fff8f1] flex flex-col max-w-md mx-auto">
      {/* Header */}
      <div className="px-5 pt-12 pb-4">
        <h1 className="text-2xl font-bold text-[#2A1840]">Mensajes</h1>
        <p className="text-xs text-gray-400 mt-0.5">Todo es privado 🔒</p>
      </div>

      {/* Lista */}
      <div className="flex-1 px-4 pb-24">
        {matches.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-20 gap-4">
            <div className="text-5xl">💬</div>
            <p className="text-gray-400 text-center text-sm">
              Aún no tienes matches.<br/>¡Da flechazos en Explorar!
            </p>
            <button onClick={() => router.push('/explorar')}
              className="text-white px-6 py-2.5 rounded-full text-sm"
              style={{ background: 'linear-gradient(135deg,#af2245,#f07855)' }}>
              Explorar perfiles
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {matches.map(match => {
              const otro = getOtroUsuario(match)
              return (
                <button key={match.id}
                  onClick={() => router.push(`/mensajes/${match.id}`)}
                  className="w-full flex items-center gap-3 p-4 bg-white rounded-2xl border border-rose-100 text-left hover:shadow-sm transition-all">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg,#F2C4CE,#F9D9C8)' }}>
                    {otro?.alias?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-[#2A1840] text-sm">{otro?.alias}</div>
                    <div className="text-xs text-gray-400 truncate">{otro?.ciudad}</div>
                  </div>
                  <div className="text-gray-300 text-lg">›</div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-rose-100 flex py-2 z-10">
        <button onClick={() => router.push('/explorar')}
          className="flex-1 flex flex-col items-center gap-0.5 text-gray-400">
          <span className="text-lg">🔍</span>
        </button>
        <button onClick={() => router.push('/mensajes')}
          className="flex-1 flex flex-col items-center gap-0.5 text-[#af2245]">
          <span className="text-lg">💬</span>
          <div className="w-1 h-1 rounded-full bg-[#af2245]"></div>
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
    </div>
  )
}