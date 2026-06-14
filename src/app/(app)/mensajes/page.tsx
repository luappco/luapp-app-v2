'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const LOGO = 'https://luapp.co/images/logo/logo-color.webp'

const IconArrowLeft = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
const IconClose = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
const IconSend = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
const IconUser = ({ size = 18 }: { size?: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
const IconLogout = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>

interface Usuario { id: string; alias: string; edad: number; ciudad: string; foto_principal?: string; online?: boolean }
interface Mensaje { id: string; emisor_id: string; receptor_id: string; contenido: string; created_at: string; leido: boolean }
interface MiPerfil { id: string; alias: string; creditos: number }

export default function MensajesPage() {
  const router = useRouter()
  const supabase = createClient()
  const scrollRef = useRef<HTMLDivElement>(null)

  const [miPerfil, setMiPerfil] = useState<MiPerfil | null>(null)
  const [userId, setUserId] = useState('')
  const [cargando, setCargando] = useState(true)
  
  const [tab, setTab] = useState<'entrada' | 'noleidos' | 'enviados'>('entrada')
  const [chats, setChats] = useState<(Usuario & { ultimoMensaje?: string; timestamp?: string; noLeidos?: number })[]>([])
  const [chatAbierto, setChatAbierto] = useState<Usuario | null>(null)
  const [mensajes, setMensajes] = useState<Mensaje[]>([])
  const [nuevoMensaje, setNuevoMensaje] = useState('')
  const [enviando, setEnviando] = useState(false)

  useEffect(() => { init() }, [])

  useEffect(() => {
    if (chatAbierto) {
      cargarMensajesChat()
      const interval = setInterval(cargarMensajesChat, 2000)
      return () => clearInterval(interval)
    }
  }, [chatAbierto])

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [mensajes])

  const init = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) { router.push('/login'); return }
    const uid = session.user.id
    setUserId(uid)
    const { data: p } = await supabase.from('usuarios').select('id, alias, creditos').eq('id', uid).single()
    if (p) setMiPerfil({ id: p.id, alias: p.alias, creditos: p.creditos || 0 })
    cargarChats()
    setCargando(false)
  }

  const cargarChats = async () => {
    const { data } = await supabase
      .from('matches')
      .select('usuario1, usuario2')
      .or(`usuario1.eq.${userId},usuario2.eq.${userId}`)
      .limit(50)

    if (data) {
      const otrosIds = data.map(m => m.usuario1 === userId ? m.usuario2 : m.usuario1)
      const { data: usuarios } = await supabase
        .from('usuarios')
        .select('id, alias, edad, ciudad, foto_principal, online')
        .in('id', otrosIds)

      if (usuarios) {
        const chatsConInfo = await Promise.all(usuarios.map(async (u) => {
          const { data: ultMsg } = await supabase
            .from('mensajes')
            .select('contenido, created_at, leido')
            .or(`and(emisor_id.eq.${userId},receptor_id.eq.${u.id}),and(emisor_id.eq.${u.id},receptor_id.eq.${userId})`)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

          const { count: noLeidos } = await supabase
            .from('mensajes')
            .select('*', { count: 'exact' })
            .eq('receptor_id', userId)
            .eq('emisor_id', u.id)
            .eq('leido', false)

          return {
            ...u,
            ultimoMensaje: ultMsg?.contenido ? (ultMsg.contenido.length > 50 ? ultMsg.contenido.substring(0, 50) + '...' : ultMsg.contenido) : 'Sin mensajes',
            timestamp: ultMsg?.created_at ? formatTime(ultMsg.created_at) : '',
            noLeidos: noLeidos || 0
          }
        }))

        setChats(chatsConInfo.sort((a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime()))
      }
    }
  }

  const cargarMensajesChat = async () => {
    if (!chatAbierto) return
    const { data } = await supabase
      .from('mensajes')
      .select('*')
      .or(`and(emisor_id.eq.${userId},receptor_id.eq.${chatAbierto.id}),and(emisor_id.eq.${chatAbierto.id},receptor_id.eq.${userId})`)
      .order('created_at', { ascending: true })
      .limit(200)

    if (data) setMensajes(data)
  }

  const enviarMensaje = async () => {
    if (!nuevoMensaje.trim() || !chatAbierto) return
    setEnviando(true)

    const { error } = await supabase.from('mensajes').insert({
      emisor_id: userId,
      receptor_id: chatAbierto.id,
      contenido: nuevoMensaje,
      leido: false
    })

    if (!error) {
      setMensajes(prev => [...prev, {
        id: Date.now().toString(),
        emisor_id: userId,
        receptor_id: chatAbierto.id,
        contenido: nuevoMensaje,
        created_at: new Date().toISOString(),
        leido: false
      }])
      setNuevoMensaje('')
    }
    setEnviando(false)
  }

  const formatTime = (fecha: string) => {
    const now = new Date()
    const then = new Date(fecha)
    const diff = now.getTime() - then.getTime()
    const minutos = Math.floor(diff / 60000)
    const horas = Math.floor(diff / 3600000)
    const dias = Math.floor(diff / 86400000)

    if (minutos < 1) return 'ahora'
    if (minutos < 60) return `hace ${minutos}m`
    if (horas < 24) return `hace ${horas}h`
    if (dias < 7) return `hace ${dias}d`
    return then.toLocaleDateString('es-AR', { month: 'short', day: 'numeric' })
  }

  const formatFullTime = (fecha: string) => {
    const date = new Date(fecha)
    return date.toLocaleString('es-AR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  const logout = async () => { await supabase.auth.signOut(); router.push('/login') }

  if (cargando) return (
    <div style={{ minHeight: '100vh', background: '#1a0f2e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 30, height: 30, border: '3px solid rgba(212,175,55,0.2)', borderTop: '3px solid #d4af37', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  const chatsToShow = chats.filter(c => {
    if (tab === 'entrada') return true
    if (tab === 'noleidos') return c.noLeidos! > 0
    return false
  })

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg,#1a0f2e 0%,#241638 100%)', color: 'white', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        * { box-sizing: border-box }
        ::-webkit-scrollbar { width: 6px }
        ::-webkit-scrollbar-track { background: rgba(255,255,255,0.05) }
        ::-webkit-scrollbar-thumb { background: rgba(212,175,55,0.3); border-radius: 3px }
        ::-webkit-scrollbar-thumb:hover { background: rgba(212,175,55,0.5) }
      `}</style>

      {/* TOP BAR */}
      <div style={{ background: 'rgba(26,15,46,0.85)', borderBottom: '1px solid rgba(212,175,55,0.22)', padding: '10px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 30, backdropFilter: 'blur(8px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button onClick={() => router.push('/explorar')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#d4af37', padding: 2, display: 'flex', alignItems: 'center' }}>
            {IconArrowLeft()}
          </button>
          <img src={LOGO} alt="LUAPP" style={{ height: 28, width: 'auto', filter: 'brightness(1.3)' }} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 8, background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.22)' }}>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>Créditos:</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#d4af37' }}>{miPerfil?.creditos}</span>
          </div>
          <button onClick={logout} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.7)', padding: 2 }}>
            {IconLogout()}
          </button>
        </div>
      </div>

      {/* CONTENIDO */}
      {!chatAbierto ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
          {/* TABS */}
          <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid rgba(212,175,55,0.22)', padding: '0 22px' }}>
            {[
              { id: 'entrada', label: 'Bandeja de entrada', icon: '📧' },
              { id: 'noleidos', label: 'Mensajes no leídos', icon: '📬' },
              { id: 'enviados', label: 'Mensajes enviados', icon: '✉️' }
            ].map(t => (
              <button key={t.id} onClick={() => setTab(t.id as any)} style={{ padding: '14px 16px', border: 'none', background: 'none', color: tab === t.id ? '#d4af37' : 'rgba(255,255,255,0.55)', borderBottom: tab === t.id ? '2px solid #d4af37' : 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, transition: 'all 0.2s', whiteSpace: 'nowrap' }}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          {/* LISTA CHATS */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '0 22px' }}>
            {chatsToShow.length === 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'rgba(255,255,255,0.4)' }}>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: 12, margin: 0 }}>No hay mensajes en esta sección</p>
                </div>
              </div>
            ) : (
              <div>
                {chatsToShow.map(chat => (
                  <div key={chat.id} onClick={() => setChatAbierto(chat)} style={{ padding: '14px 0', borderBottom: '1px solid rgba(212,175,55,0.05)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, transition: 'all 0.2s', background: 'transparent' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                    <div style={{ width: 50, height: 50, borderRadius: '50%', background: 'linear-gradient(135deg,#2A1840,#af2245)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                      {chat.foto_principal ? <img src={chat.foto_principal} alt={chat.alias} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <IconUser size={20} />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>{chat.alias}</span>
                        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{chat.edad} años • {chat.ciudad}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {chat.ultimoMensaje}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>{chat.timestamp}</span>
                          {chat.noLeidos! > 0 && <span style={{ fontSize: 10, background: '#af2245', color: 'white', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>{chat.noLeidos}</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* CHAT ABIERTO */
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'rgba(255,255,255,0.02)', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
          {/* HEADER CHAT */}
          <div style={{ padding: '14px 22px', borderBottom: '1px solid rgba(212,175,55,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,#2A1840,#af2245)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                {chatAbierto.foto_principal ? <img src={chatAbierto.foto_principal} alt={chatAbierto.alias} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <IconUser size={18} />}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'white' }}>{chatAbierto.alias}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{chatAbierto.edad} años • {chatAbierto.ciudad} {chatAbierto.online ? '• En línea' : ''}</div>
              </div>
            </div>
            <button onClick={() => setChatAbierto(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#d4af37', padding: 2, display: 'flex', alignItems: 'center' }}>
              {IconClose()}
            </button>
          </div>

          {/* HISTORIAL */}
          <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8, padding: '14px 22px', justifyContent: 'flex-end' }}>
            {mensajes.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>
                Comienza a conversar
              </div>
            ) : (
              mensajes.map(msg => (
                <div key={msg.id} style={{ display: 'flex', justifyContent: msg.emisor_id === userId ? 'flex-end' : 'flex-start', gap: 8 }}>
                  <div style={{ maxWidth: '70%', background: msg.emisor_id === userId ? 'linear-gradient(135deg,#af2245,#f07855)' : 'rgba(255,255,255,0.06)', color: 'white', padding: '10px 14px', borderRadius: 14, fontSize: 12, wordBreak: 'break-word' }}>
                    <div>{msg.contenido}</div>
                    <div style={{ fontSize: 10, color: msg.emisor_id === userId ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.4)', marginTop: 4 }}>
                      {formatFullTime(msg.created_at)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* INPUT */}
          <div style={{ padding: '14px 22px', borderTop: '1px solid rgba(212,175,55,0.22)', display: 'flex', gap: 8, alignItems: 'flex-end' }}>
            <input
              type="text"
              value={nuevoMensaje}
              onChange={(e) => setNuevoMensaje(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && enviarMensaje()}
              placeholder="Escribe un mensaje..."
              style={{ flex: 1, padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(212,175,55,0.22)', background: 'rgba(255,255,255,0.04)', color: 'white', fontSize: 12, outline: 'none', transition: 'all 0.2s' }}
              onFocus={(e) => { e.target.style.borderColor = 'rgba(212,175,55,0.4)'; e.target.style.background = 'rgba(255,255,255,0.08)' }}
              onBlur={(e) => { e.target.style.borderColor = 'rgba(212,175,55,0.22)'; e.target.style.background = 'rgba(255,255,255,0.04)' }}
            />
            <button onClick={enviarMensaje} disabled={!nuevoMensaje.trim() || enviando} style={{ background: nuevoMensaje.trim() ? 'linear-gradient(135deg,#af2245,#f07855)' : 'rgba(255,255,255,0.1)', color: 'white', border: 'none', borderRadius: 8, padding: '10px 12px', cursor: nuevoMensaje.trim() ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: enviando ? 0.6 : 1 }}>
              {IconSend()}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
