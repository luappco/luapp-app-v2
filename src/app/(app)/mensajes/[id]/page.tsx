'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const IconArrowLeft = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
const IconSend = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
const IconUser = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>

const LOGO = 'https://luapp.co/images/logo/logo-color.webp'

interface Mensaje {
  id: string
  remitente_id: string
  contenido: string
  created_at: string
  leido: boolean
}

interface OtroUsuario {
  alias: string
  ciudad: string
  foto_principal?: string
  foto_url?: string
  ultimo_acceso?: string
}

export default function ChatPage() {
  const router = useRouter()
  const params = useParams()
  const otroId = params.id as string
  const supabase = createClient()

  const [userId, setUserId] = useState('')
  const [matchId, setMatchId] = useState('')
  const [otroUsuario, setOtroUsuario] = useState<OtroUsuario | null>(null)
  const [mensajes, setMensajes] = useState<Mensaje[]>([])
  const [nuevoMensaje, setNuevoMensaje] = useState('')
  const [cargando, setCargando] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => { init() }, [])

  const init = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    setUserId(user.id)

    // Cargar datos del otro usuario
    const { data: u } = await supabase.from('usuarios')
      .select('alias,ciudad,foto_principal,ultimo_acceso')
      .eq('id', otroId)
      .single()

    if (u) {
      const foto_url = u.foto_principal
        ? supabase.storage.from('fotos').getPublicUrl(u.foto_principal).data.publicUrl
        : undefined
      setOtroUsuario({ ...u, foto_url })
    }

    // Buscar el match entre los dos usuarios
    const { data: match } = await supabase.from('matches')
      .select('id')
      .or(`and(usuario1.eq.${user.id},usuario2.eq.${otroId}),and(usuario1.eq.${otroId},usuario2.eq.${user.id})`)
      .single()

    if (match) {
      setMatchId(match.id)
      await cargarMensajes(match.id)

      // Marcar mensajes como leídos
      await supabase.from('mensajes')
        .update({ leido: true })
        .eq('match_id', match.id)
        .neq('remitente_id', user.id)
    }

    // Registrar visita
    await supabase.rpc('registrar_visita', { perfil_id: otroId })
    // Actualizar último acceso
    await supabase.rpc('actualizar_ultimo_acceso')

    setCargando(false)

  }

  useEffect(() => {
    if (!matchId) return
    const sub = supabase
      .channel(`chat_${matchId}`)
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'mensajes', filter: `match_id=eq.${matchId}` },
        (payload: any) => {
          setMensajes(prev => {
            if (prev.find(m => m.id === payload.new.id)) return prev
            return [...prev, payload.new as Mensaje]
          })
          setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
        }
      )
      .subscribe()
    return () => { supabase.removeChannel(sub) }
  }, [matchId])

  const cargarMensajes = async (mid: string) => {
    const { data } = await supabase.from('mensajes')
      .select('id,remitente_id,contenido,created_at,leido')
      .eq('match_id', mid)
      .order('created_at', { ascending: true })

    if (data) setMensajes(data)
  }

  const enviarMensaje = async () => {
    if (!nuevoMensaje.trim() || !matchId) return
    setEnviando(true)

    const { error } = await supabase.from('mensajes').insert({
      match_id: matchId,
      remitente_id: userId,
      contenido: nuevoMensaje.trim(),
    })

    if (!error) {
      setNuevoMensaje('')
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
    }
    setEnviando(false)
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensajes])

  const formatHora = (ts: string) => {
    const d = new Date(ts)
    return d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
  }

  const formatFecha = (ts: string) => {
    const d = new Date(ts)
    const hoy = new Date()
    if (d.toDateString() === hoy.toDateString()) return 'Hoy'
    const ayer = new Date(hoy); ayer.setDate(hoy.getDate() - 1)
    if (d.toDateString() === ayer.toDateString()) return 'Ayer'
    return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })
  }

  if (cargando) return (
    <div style={{ minHeight: '100vh', background: '#fff8f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 28, height: 28, border: '3px solid #f0d4d8', borderTop: '3px solid #af2245', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  if (!otroUsuario) return (
    <div style={{ minHeight: '100vh', background: '#fff8f1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
      <p style={{ color: '#9ca3af', fontSize: 14 }}>No se encontró el usuario</p>
      <button onClick={() => router.push('/mensajes')} style={{ color: '#af2245', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }}>Volver</button>
    </div>
  )

  // Agrupar mensajes por fecha
  const mensajesPorFecha: { fecha: string; items: Mensaje[] }[] = []
  mensajes.forEach(m => {
    const fecha = formatFecha(m.created_at)
    const ultimo = mensajesPorFecha[mensajesPorFecha.length - 1]
    if (!ultimo || ultimo.fecha !== fecha) {
      mensajesPorFecha.push({ fecha, items: [m] })
    } else {
      ultimo.items.push(m)
    }
  })

  return (
    <div style={{ minHeight: '100vh', background: '#fff8f1', display: 'flex', flexDirection: 'column' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* Header */}
      <div style={{ background: 'white', borderBottom: '1px solid #f0d4d8', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 30, boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
        <button onClick={() => router.push('/mensajes')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', display: 'flex', alignItems: 'center', padding: 4, borderRadius: 8 }}>
          <IconArrowLeft />
        </button>

        <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,#af2245,#f07855)', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
          {otroUsuario.foto_url
            ? <img src={otroUsuario.foto_url} alt={otroUsuario.alias} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <IconUser />
          }
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#1f2937' }}>{otroUsuario.alias}</div>
          <div style={{ fontSize: 11, color: '#9ca3af' }}>{otroUsuario.ciudad}</div>
        </div>
      </div>

      {/* Mensajes */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {mensajes.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center', color: '#9ca3af' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <IconUser />
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Es un match con {otroUsuario.alias}</div>
              <div style={{ fontSize: 12 }}>Sé el primero en escribir</div>
            </div>
          </div>
        ) : (
          mensajesPorFecha.map(grupo => (
            <div key={grupo.fecha}>
              <div style={{ textAlign: 'center', margin: '12px 0 8px' }}>
                <span style={{ fontSize: 11, color: '#9ca3af', background: '#f0d4d8', borderRadius: 20, padding: '2px 10px' }}>{grupo.fecha}</span>
              </div>
              {grupo.items.map(msg => {
                const esMio = msg.remitente_id === userId
                return (
                  <div key={msg.id} style={{ display: 'flex', justifyContent: esMio ? 'flex-end' : 'flex-start', marginBottom: 4 }}>
                    <div style={{
                      maxWidth: '72%',
                      padding: '10px 14px',
                      borderRadius: esMio ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                      background: esMio ? 'linear-gradient(135deg,#af2245,#f07855)' : 'white',
                      color: esMio ? 'white' : '#1f2937',
                      fontSize: 14,
                      lineHeight: 1.4,
                      wordBreak: 'break-word',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                    }}>
                      <div>{msg.contenido}</div>
                      <div style={{ fontSize: 10, marginTop: 4, opacity: 0.6, textAlign: 'right' }}>
                        {formatHora(msg.created_at)}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{ background: 'white', borderTop: '1px solid #f0d4d8', padding: '10px 14px', display: 'flex', gap: 8, alignItems: 'flex-end', boxShadow: '0 -1px 8px rgba(0,0,0,0.04)' }}>
        <input
          type="text"
          placeholder="Escribe un mensaje..."
          value={nuevoMensaje}
          onChange={e => setNuevoMensaje(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), enviarMensaje())}
          style={{ flex: 1, padding: '10px 16px', borderRadius: 24, border: '1.5px solid #e5e7eb', background: '#f9f5f0', fontSize: 14, outline: 'none', transition: 'border-color 0.2s' }}
          onFocus={e => e.target.style.borderColor = '#af2245'}
          onBlur={e => e.target.style.borderColor = '#e5e7eb'}
        />
        <button onClick={enviarMensaje} disabled={enviando || !nuevoMensaje.trim()}
          style={{
            background: nuevoMensaje.trim() && !enviando ? 'linear-gradient(135deg,#af2245,#f07855)' : '#e5e7eb',
            border: 'none', borderRadius: '50%', width: 42, height: 42, cursor: nuevoMensaje.trim() && !enviando ? 'pointer' : 'default',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white',
            transition: 'background 0.2s', flexShrink: 0,
          }}>
          <IconSend />
        </button>
      </div>
    </div>
  )
}
