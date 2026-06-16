'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const IconArrowLeft = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
const IconSend = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
const IconUser = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>

interface Mensaje {
  id: string
  de: string
  contenido: string
  timestamp: string
}

interface Usuario {
  alias: string
  ciudad: string
  foto_principal?: string
}

const LOGO = 'https://luapp.co/images/logo/logo-color.webp'

export default function ChatPage() {
  const router = useRouter()
  const params = useParams()
  const otroId = params.id as string
  const supabase = createClient()

  const [userId, setUserId] = useState('')
  const [usuario, setUsuario] = useState<Usuario | null>(null)
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
      .select('alias,ciudad,foto_principal')
      .eq('id', otroId)
      .single()
    if (u) setUsuario(u)

    // Cargar mensajes
    await cargarMensajes(user.id)
    setCargando(false)

    // Suscribirse a nuevos mensajes
    const sub = supabase
      .channel(`chat_${user.id}_${otroId}`)
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'mensajes' },
        (payload: any) => {
          if ((payload.new.de === user.id && payload.new.a === otroId) ||
              (payload.new.de === otroId && payload.new.a === user.id)) {
            setMensajes(prev => [...prev, {
              id: payload.new.id,
              de: payload.new.de,
              contenido: payload.new.contenido,
              timestamp: payload.new.created_at
            }])
          }
        }
      )
      .subscribe()

    return () => { sub.unsubscribe() }
  }

  const cargarMensajes = async (uid: string) => {
    const { data } = await supabase.from('mensajes')
      .select('id,de,contenido,created_at')
      .or(`and(de.eq.${uid},a.eq.${otroId}),and(de.eq.${otroId},a.eq.${uid})`)
      .order('created_at', { ascending: true })

    if (data) {
      setMensajes(data.map(m => ({
        id: m.id,
        de: m.de,
        contenido: m.contenido,
        timestamp: m.created_at
      })))
    }
  }

  const enviarMensaje = async () => {
    if (!nuevoMensaje.trim()) return

    setEnviando(true)
    const { error } = await supabase.from('mensajes').insert({
      de: userId,
      a: otroId,
      contenido: nuevoMensaje
    })

    if (!error) {
      setNuevoMensaje('')
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
    setEnviando(false)
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [mensajes])

  if (cargando || !usuario) return (
    <div style={{ minHeight:'100vh', background:'#fff8f1', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ width:28, height:28, border:'3px solid #f0d4d8', borderTop:'3px solid #af2245', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', background:'#fff8f1', display:'flex', flexDirection:'column' }}>
      {/* Header */}
      <div style={{ background:'white', borderBottom:'0.5px solid #f0d4d8', padding:'12px 16px', display:'flex', alignItems:'center', gap:12, position:'sticky', top:0, zIndex:30 }}>
        <button onClick={() => router.push('/mensajes')}
          style={{ background:'none', border:'none', cursor:'pointer', color:'#6b7280', display:'flex', alignItems:'center' }}>
          <IconArrowLeft />
        </button>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:14, fontWeight:600, color:'#1f2937' }}>{usuario.alias}</div>
          <div style={{ fontSize:11, color:'#9ca3af' }}>📍 {usuario.ciudad}</div>
        </div>
      </div>

      {/* Mensajes */}
      <div style={{ flex:1, overflowY:'auto', padding:'16px', display:'flex', flexDirection:'column', gap:8 }}>
        {mensajes.length === 0 ? (
          <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', color:'#9ca3af', textAlign:'center' }}>
            <div>
              <div style={{ fontSize:40, marginBottom:8 }}>💬</div>
              <div>Sin mensajes aún</div>
              <div style={{ fontSize:12, marginTop:4 }}>¡Sé el primero en escribir!</div>
            </div>
          </div>
        ) : (
          mensajes.map(msg => (
            <div key={msg.id} style={{ display:'flex', justifyContent: msg.de === userId ? 'flex-end' : 'flex-start' }}>
              <div style={{
                maxWidth:'70%',
                padding:'10px 14px',
                borderRadius:12,
                background: msg.de === userId ? 'linear-gradient(135deg,#af2245,#f07855)' : '#f0f0f0',
                color: msg.de === userId ? 'white' : '#1f2937',
                fontSize:14,
                wordWrap:'break-word',
              }}>
                {msg.contenido}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{ background:'white', borderTop:'0.5px solid #f0d4d8', padding:'12px 16px', display:'flex', gap:8, alignItems:'flex-end' }}>
        <input
          type="text"
          placeholder="Escribe un mensaje..."
          value={nuevoMensaje}
          onChange={e => setNuevoMensaje(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), enviarMensaje())}
          style={{ flex:1, padding:'10px 14px', borderRadius:20, border:'0.5px solid #e0bec1', background:'#f9f5f0', fontSize:14, outline:'none' }}
        />
        <button onClick={enviarMensaje} disabled={enviando || !nuevoMensaje.trim()}
          style={{ background:nuevoMensaje.trim() && !enviando ? 'linear-gradient(135deg,#af2245,#f07855)' : '#e0bec1', border:'none', borderRadius:'50%', width:40, height:40, cursor: nuevoMensaje.trim() && !enviando ? 'pointer' : 'default', display:'flex', alignItems:'center', justifyContent:'center', color:'white' }}>
          <IconSend />
        </button>
      </div>
    </div>
  )
}
