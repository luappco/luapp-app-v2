'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const LOGO = 'https://luapp.co/images/logo/logo-color.webp'

const IconChevL = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
const IconHeart = ({ filled }: { filled?: boolean }) => <svg width="20" height="20" viewBox="0 0 24 24" fill={filled ? '#af2245' : 'none'} stroke={filled ? '#af2245' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
const IconMessage = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
const IconUser = ({ size = 20 }: { size?: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>

interface Usuario {
  id: string
  alias: string
  edad: number
  ciudad: string
  busca: string
  bio?: string
  genero?: string
  foto_principal?: string
  foto_url?: string | null
}

interface Flechazo {
  id: string
  alias: string
  edad: number
  foto_url?: string | null
}

export default function PerfilOtroUsuario() {
  const router = useRouter()
  const params = useParams()
  const userId = params.id as string
  const supabase = createClient()

  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [flechazosRecibidos, setFlechazosRecibidos] = useState<Flechazo[]>([])
  const [miUserId, setMiUserId] = useState('')
  const [envieFlechazo, setEnvieFlechazo] = useState(false)
  const [cargando, setCargando] = useState(true)

  useEffect(() => { cargar() }, [])

  const cargar = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) { router.push('/login'); return }
    setMiUserId(session.user.id)

    // Cargar usuario
    const { data: u } = await supabase.from('usuarios').select('*').eq('id', userId).single()
    if (!u) { router.push('/explorar'); return }

    const foto = u.foto_principal
      ? (u.foto_principal.startsWith('http')
          ? u.foto_principal
          : supabase.storage.from('fotos').getPublicUrl(u.foto_principal).data.publicUrl)
      : null

    setUsuario({ ...u, foto_url: foto })

    // Cargar flechazos recibidos por este usuario
    const { data: flechazos } = await supabase
      .from('flechazos')
      .select('emisor')
      .eq('receptor', userId)

    if (flechazos && flechazos.length > 0) {
      const emisoresIds = flechazos.map(f => f.emisor)
      const { data: emisores } = await supabase
        .from('usuarios')
        .select('id, alias, edad, foto_principal')
        .in('id', emisoresIds)
      
      if (emisores) {
        const mapped: Flechazo[] = emisores.map(e => ({
          id: e.id,
          alias: e.alias,
          edad: e.edad,
          foto_url: e.foto_principal
            ? (e.foto_principal.startsWith('http')
                ? e.foto_principal
                : supabase.storage.from('fotos').getPublicUrl(e.foto_principal).data.publicUrl)
            : null,
        }))
        setFlechazosRecibidos(mapped)
      }
    }

    // Verificar si yo ya envié flechazo
    const { data: yaEnviado } = await supabase
      .from('flechazos')
      .select('id')
      .eq('emisor', session.user.id)
      .eq('receptor', userId)
      .single()

    setEnvieFlechazo(!!yaEnviado)
    setCargando(false)
  }

  const enviarFlechazo = async () => {
    if (envieFlechazo) return
    const { data: c } = await supabase.from('usuarios').select('creditos').eq('id', miUserId).single()
    if (!c || c.creditos < 1) { router.push('/creditos'); return }

    await supabase.from('flechazos').insert({ emisor: miUserId, receptor: userId })
    await supabase.rpc('sumar_creditos', { uid: miUserId, monto: -1 })
    setEnvieFlechazo(true)

    // Verificar match mutuo
    const { data: mutuo } = await supabase
      .from('flechazos')
      .select('id')
      .eq('emisor', userId)
      .eq('receptor', miUserId)
      .single()

    if (mutuo) {
      const u1 = miUserId < userId ? miUserId : userId
      const u2 = miUserId < userId ? userId : miUserId
      await supabase.from('matches').upsert({ usuario1: u1, usuario2: u2 })
    }
  }

  if (cargando) return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(180deg,#1a0f2e 0%,#241638 100%)', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ width:30, height:30, border:'3px solid rgba(212,175,55,0.2)', borderTop:'3px solid #d4af37', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  if (!usuario) return null

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(180deg,#1a0f2e 0%,#241638 100%)', color:'white' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} * {box-sizing:border-box}`}</style>

      {/* Top bar */}
      <div style={{ background:'rgba(26,15,46,0.85)', borderBottom:'1px solid rgba(212,175,55,0.22)', padding:'12px 20px', display:'flex', alignItems:'center', gap:16, position:'sticky', top:0, zIndex:30, backdropFilter:'blur(8px)' }}>
        <button onClick={() => router.push('/explorar')} style={{ background:'none', border:'none', cursor:'pointer', color:'#d4af37', display:'flex', alignItems:'center' }}>
          <IconChevL />
        </button>
        <img src={LOGO} alt="LUAPP" style={{ height:30, width:'auto', filter:'brightness(1.3)' }} />
        <div style={{ flex:1 }} />
        <span style={{ fontSize:12, fontWeight:600, color:'#d4af37' }}>{usuario.alias}</span>
      </div>

      {/* Main */}
      <div style={{ maxWidth:600, margin:'0 auto', padding:'20px' }}>

        {/* Foto principal */}
        <div style={{ borderRadius:18, overflow:'hidden', aspectRatio:'3/4', background:'linear-gradient(160deg,#2A1840,#af2245)', marginBottom:20, border:'1px solid rgba(212,175,55,0.22)' }}>
          {usuario.foto_url
            ? <img src={usuario.foto_url} alt={usuario.alias} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
            : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', color:'rgba(255,255,255,0.3)' }}><IconUser size={60} /></div>
          }
        </div>

        {/* Info básica */}
        <div style={{ background:'linear-gradient(160deg,rgba(60,30,90,0.55),rgba(40,15,60,0.7))', border:'1px solid rgba(212,175,55,0.22)', borderRadius:16, padding:18, marginBottom:16 }}>
          <div style={{ display:'flex', alignItems:'baseline', gap:8, marginBottom:8 }}>
            <span style={{ fontSize:28, fontWeight:800, color:'white' }}>{usuario.alias}</span>
            <span style={{ fontSize:20, fontWeight:600, color:'rgba(255,255,255,0.7)' }}>{usuario.edad}</span>
          </div>
          <div style={{ fontSize:13, color:'rgba(255,255,255,0.7)', marginBottom:12 }}>{usuario.ciudad} · {usuario.genero}</div>
          {usuario.bio && (
            <p style={{ fontSize:13, color:'rgba(255,255,255,0.85)', fontStyle:'italic', margin:0, marginBottom:12, lineHeight:1.6 }}>"{usuario.bio}"</p>
          )}
          <div style={{ fontSize:12, color:'#d4af37', fontWeight:600, background:'rgba(212,175,55,0.12)', padding:'6px 12px', borderRadius:8, display:'inline-block' }}>
            Busca: {usuario.busca}
          </div>
        </div>

        {/* Botones acción */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:20 }}>
          <button onClick={enviarFlechazo}
            disabled={envieFlechazo}
            style={{ padding:'14px 0', borderRadius:16, border:'none', background: envieFlechazo ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg,#af2245,#f07855)', color: envieFlechazo ? 'rgba(255,255,255,0.5)' : 'white', fontSize:13, fontWeight:700, cursor: envieFlechazo ? 'default' : 'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
            <IconHeart filled={envieFlechazo} /> {envieFlechazo ? 'Ya enviado' : 'Flechazo'}
          </button>
          <button onClick={() => router.push('/mensajes')}
            style={{ padding:'14px 0', borderRadius:16, border:'1px solid rgba(212,175,55,0.4)', background:'transparent', color:'#d4af37', fontSize:13, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
            <IconMessage /> Mensaje
          </button>
        </div>

        {/* Flechazos recibidos */}
        {flechazosRecibidos.length > 0 && (
          <div style={{ background:'linear-gradient(160deg,rgba(60,30,90,0.55),rgba(40,15,60,0.7))', border:'1px solid rgba(212,175,55,0.22)', borderRadius:16, padding:18 }}>
            <div style={{ fontSize:15, fontWeight:700, color:'white', marginBottom:14, display:'flex', alignItems:'center', gap:8 }}>
              ❤️ Flechazos recibidos ({flechazosRecibidos.length})
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(80px,1fr))', gap:10 }}>
              {flechazosRecibidos.map(f => (
                <div key={f.id} style={{ borderRadius:12, overflow:'hidden', aspectRatio:'1', background:'linear-gradient(135deg,#2A1840,#af2245)', border:'1px solid rgba(212,175,55,0.18)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'rgba(255,255,255,0.35)' }}>
                  {f.foto_url
                    ? <img src={f.foto_url} alt={f.alias} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                    : <IconUser size={24} />
                  }
                </div>
              ))}
            </div>
            <div style={{ fontSize:11, color:'rgba(255,255,255,0.5)', marginTop:10, textAlign:'center' }}>
              {flechazosRecibidos.map(f => f.alias).join(', ')} le enviaron flechazo
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
