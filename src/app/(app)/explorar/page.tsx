 'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const LOGO = 'https://luapp.co/images/logo/logo-color.webp'

// ICONOS
const IconClose = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
const IconMail = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
const IconSend = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
const IconSmile = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"/></svg>
const IconUser = ({ size = 18 }: { size?: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
const IconLogout = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
const IconArrowLeft = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>

interface Chat { id: string; alias: string; foto_url?: string }
interface Mensaje { id: string; emisor_id: string; receptor_id: string; contenido: string; created_at: string; es_enviado?: boolean }
interface MiPerfil { id: string; alias: string; creditos: number }

export default function ExplorarPage() {
  const router = useRouter()
  const supabase = createClient()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [windowWidth, setWindowWidth] = useState(0)

  const [miPerfil, setMiPerfil] = useState<MiPerfil | null>(null)
  const [userId, setUserId] = useState('')
  const [cargando, setCargando] = useState(true)

  // Chat
  const [chats, setChats] = useState<Chat[]>([])
  const [chatAbierto, setChatAbierto] = useState<string | null>(null)
  const [mensajes, setMensajes] = useState<Mensaje[]>([])
  const [nuevoMensaje, setNuevoMensaje] = useState('')
  const [escribiendo, setEscribiendo] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [mostradorEmojis, setMostradorEmojis] = useState(false)

  const isMobile = windowWidth < 768

  useEffect(() => {
    setWindowWidth(window.innerWidth)
    const handleResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => { init() }, [])

  useEffect(() => {
    if (chatAbierto) {
      cargarMensajes()
      const interval = setInterval(cargarMensajes, 2000)
      return () => clearInterval(interval)
    }
  }, [chatAbierto])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
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
      .limit(20)

    if (data) {
      const otrosIds = data.map(m => m.usuario1 === userId ? m.usuario2 : m.usuario1)
      const { data: usuarios } = await supabase
        .from('usuarios')
        .select('id, alias, foto_principal')
        .in('id', otrosIds)

      if (usuarios) {
        const chatsFormatted: Chat[] = usuarios.map(u => ({
          id: u.id,
          alias: u.alias,
          foto_url: u.foto_principal ? (u.foto_principal.startsWith('http') ? u.foto_principal : supabase.storage.from('fotos').getPublicUrl(u.foto_principal).data.publicUrl) : undefined
        }))
        setChats(chatsFormatted)
      }
    }
  }

  const cargarMensajes = async () => {
    if (!chatAbierto) return
    const { data } = await supabase
      .from('mensajes')
      .select('*')
      .or(`and(emisor_id.eq.${userId},receptor_id.eq.${chatAbierto}),and(emisor_id.eq.${chatAbierto},receptor_id.eq.${userId})`)
      .order('created_at', { ascending: true })
      .limit(100)

    if (data) {
      const formatted = data.map(m => ({
        ...m,
        es_enviado: m.emisor_id === userId
      }))
      setMensajes(formatted)
    }
  }

  const enviarMensaje = async () => {
    if (!nuevoMensaje.trim() || !chatAbierto) return
    setEnviando(true)

    await supabase.from('mensajes').insert({
      emisor_id: userId,
      receptor_id: chatAbierto,
      contenido: nuevoMensaje
    })

    setMensajes(prev => [...prev, {
      id: Date.now().toString(),
      emisor_id: userId,
      receptor_id: chatAbierto,
      contenido: nuevoMensaje,
      created_at: new Date().toISOString(),
      es_enviado: true
    }])
    setNuevoMensaje('')
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

  const emojis = ['😊', '❤️', '😂', '🔥', '👍', '😍', '🎉', '✨']
  const logout = async () => { await supabase.auth.signOut(); router.push('/login') }

  if (cargando) return (
    <div style={{ minHeight: '100vh', background: '#1a0f2e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 30, height: 30, border: '3px solid rgba(212,175,55,0.2)', borderTop: '3px solid #d4af37', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  const chatActivo = chats.find(c => c.id === chatAbierto)

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg,#1a0f2e 0%,#241638 100%)', color: 'white', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        * { box-sizing: border-box }
        ::-webkit-scrollbar { width: 6px }
        ::-webkit-scrollbar-track { background: rgba(255,255,255,0.05) }
        ::-webkit-scrollbar-thumb { background: rgba(212,175,55,0.3); border-radius: 3px }
        ::-webkit-scrollbar-thumb:hover { background: rgba(212,175,55,0.5) }
        @media (max-width: 768px) {
          body { overflow: hidden }
        }
      `}</style>

      {/* TOP BAR */}
      <div style={{ background: 'rgba(26,15,46,0.85)', borderBottom: '1px solid rgba(212,175,55,0.22)', padding: isMobile ? '8px 14px' : '10px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 30, backdropFilter: 'blur(8px)' }}>
        {isMobile && chatAbierto && (
          <button onClick={() => setChatAbierto(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#d4af37', padding: 2 }}>
            {IconArrowLeft()}
          </button>
        )}
        
        {isMobile && chatAbierto ? (
          <div style={{ flex: 1, marginLeft: 12, textAlign: 'center' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'white' }}>{chatActivo?.alias}</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>En línea</div>
          </div>
        ) : (
          <img src={LOGO} alt="LUAPP" style={{ height: isMobile ? 24 : 32, width: 'auto', filter: 'brightness(1.3)' }} />
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 14 : 22 }}>
          {!chatAbierto && (
            <button onClick={() => cargarChats()} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.85)', position: 'relative', padding: 2 }}>
              {IconMail()}
              {chats.length > 0 && <span style={{ position: 'absolute', top: -4, right: -4, background: '#af2245', color: 'white', borderRadius: '50%', minWidth: 12, height: 12, fontSize: 7, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 2px', border: '1.5px solid #1a0f2e' }}>{chats.length}</span>}
            </button>
          )}
          
          {!chatAbierto && (
            <button onClick={logout} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>
              {IconLogout()}
            </button>
          )}

          {chatAbierto && (
            <button onClick={() => setChatAbierto(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#d4af37', display: 'flex', alignItems: 'center', padding: 2 }}>
              {IconClose()}
            </button>
          )}
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        
        {/* EXPLORAR (OCULTO EN MÓVIL SI HAY CHAT ABIERTO) */}
        {!isMobile || !chatAbierto ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: isMobile ? 20 : 40, background: 'rgba(255,255,255,0.02)' }}>
            <p style={{ fontSize: isMobile ? 12 : 13, color: 'rgba(255,255,255,0.5)', margin: 0, textAlign: 'center' }}>Explorar perfiles aquí</p>
            <p style={{ fontSize: isMobile ? 10 : 11, color: 'rgba(255,255,255,0.3)', marginTop: 8, textAlign: 'center' }}>Haz clic en el ícono de mensajes para abrir chats</p>
          </div>
        ) : null}

        {/* PANEL CHAT (FULL SCREEN EN MÓVIL) */}
        {chatAbierto && (
          <div style={{ display: 'flex', flexDirection: 'column', background: 'linear-gradient(180deg,rgba(26,15,46,0.9) 0%,rgba(36,22,56,0.9) 100%)', flex: 1, overflow: 'hidden' }}>
            
            {/* HISTORIAL */}
            <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8, padding: isMobile ? '12px 14px' : '14px 18px', justifyContent: 'flex-end' }}>
              {mensajes.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 12, padding: '20px 0' }}>
                  Comienza la conversación 💬
                </div>
              ) : (
                mensajes.map(msg => (
                  <div key={msg.id} style={{ display: 'flex', justifyContent: msg.es_enviado ? 'flex-end' : 'flex-start', gap: 8 }}>
                    <div style={{ maxWidth: isMobile ? '85%' : '70%', background: msg.es_enviado ? 'linear-gradient(135deg,#af2245,#f07855)' : 'rgba(255,255,255,0.06)', color: 'white', padding: '10px 14px', borderRadius: 14, fontSize: 12, wordBreak: 'break-word', lineHeight: 1.4 }}>
                      {msg.contenido}
                      <div style={{ fontSize: 9, color: msg.es_enviado ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.4)', marginTop: 4 }}>
                        {formatTime(msg.created_at)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* INPUT */}
            <div style={{ padding: isMobile ? '12px 14px' : '14px 18px', borderTop: '1px solid rgba(212,175,55,0.1)', flexShrink: 0 }}>
              {escribiendo && <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>escribiendo...</div>}
              
              {mostradorEmojis && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6, marginBottom: 8, padding: 8, background: 'rgba(255,255,255,0.04)', borderRadius: 8 }}>
                  {emojis.map(emoji => (
                    <button key={emoji} onClick={() => { setNuevoMensaje(prev => prev + emoji); setMostradorEmojis(false) }} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', padding: 4 }}>
                      {emoji}
                    </button>
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                <button onClick={() => setMostradorEmojis(!mostradorEmojis)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#d4af37', padding: 6, display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                  {IconSmile()}
                </button>
                <input
                  type="text"
                  value={nuevoMensaje}
                  onChange={(e) => { setNuevoMensaje(e.target.value); setEscribiendo(e.target.value.length > 0) }}
                  onKeyPress={(e) => e.key === 'Enter' && enviarMensaje()}
                  placeholder="Mensaje..."
                  style={{ flex: 1, padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(212,175,55,0.22)', background: 'rgba(255,255,255,0.04)', color: 'white', fontSize: 12, outline: 'none', transition: 'all 0.2s', minHeight: 38 }}
                  onFocus={(e) => { e.target.style.borderColor = 'rgba(212,175,55,0.4)'; e.target.style.background = 'rgba(255,255,255,0.08)' }}
                  onBlur={(e) => { e.target.style.borderColor = 'rgba(212,175,55,0.22)'; e.target.style.background = 'rgba(255,255,255,0.04)' }}
                />
                <button onClick={enviarMensaje} disabled={!nuevoMensaje.trim() || enviando} style={{ background: nuevoMensaje.trim() ? 'linear-gradient(135deg,#af2245,#f07855)' : 'rgba(255,255,255,0.1)', color: 'white', border: 'none', borderRadius: 8, padding: '10px 12px', cursor: nuevoMensaje.trim() ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: enviando ? 0.6 : 1, flexShrink: 0, minHeight: 38 }}>
                  {IconSend()}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SIDEBAR CHATS (DESKTOP ONLY) */}
        {!isMobile && !chatAbierto && (
          <div style={{ background: 'rgba(255,255,255,0.02)', borderLeft: '1px solid rgba(212,175,55,0.22)', display: 'flex', flexDirection: 'column', width: 380, height: '100%' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(212,175,55,0.1)' }}>
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'white' }}>Mensajes</h3>
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {chats.length === 0 ? (
                <div style={{ padding: '20px 18px', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>
                  No tienes chats aún
                </div>
              ) : (
                chats.map(chat => (
                  <button key={chat.id} onClick={() => setChatAbierto(chat.id)} style={{ width: '100%', padding: '12px 18px', border: 'none', background: 'none', cursor: 'pointer', borderBottom: '1px solid rgba(212,175,55,0.05)', display: 'flex', alignItems: 'center', gap: 10, transition: 'all 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'} onMouseLeave={(e) => e.currentTarget.style.background = 'none'}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,#2A1840,#af2245)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                      {chat.foto_url ? <img src={chat.foto_url} alt={chat.alias} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <IconUser size={18} />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{chat.alias}</div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Haz clic para chatear</div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {/* SIDEBAR CHATS (MÓVIL - MODAL STYLE) */}
        {isMobile && !chatAbierto && (
          <div style={{ background: 'rgba(255,255,255,0.02)', borderLeft: '1px solid rgba(212,175,55,0.22)', display: 'flex', flexDirection: 'column', width: '100%', maxWidth: 280, height: '100%' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(212,175,55,0.1)' }}>
              <h3 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: 'white' }}>Chats</h3>
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {chats.length === 0 ? (
                <div style={{ padding: '20px 14px', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>
                  Sin chats
                </div>
              ) : (
                chats.map(chat => (
                  <button key={chat.id} onClick={() => setChatAbierto(chat.id)} style={{ width: '100%', padding: '10px 14px', border: 'none', background: 'none', cursor: 'pointer', borderBottom: '1px solid rgba(212,175,55,0.05)', display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'} onMouseLeave={(e) => e.currentTarget.style.background = 'none'}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#2A1840,#af2245)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                      {chat.foto_url ? <img src={chat.foto_url} alt={chat.alias} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <IconUser size={16} />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{chat.alias}</div>
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Click chat</div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
