 'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const LOGO = 'https://luapp.co/images/logo/logo-color.webp'

const IconChevL = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
const IconSave = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>

const CIUDADES: Record<string, string[]> = {
  '🇨🇴 Colombia': ['Bogotá','Medellín','Cali','Barranquilla','Cartagena','Bucaramanga','Pereira','Santa Marta'],
  '🇲🇽 México': ['Ciudad de México','Guadalajara','Monterrey','Cancún','Puebla','Tijuana'],
  '🇨🇦 Centroamérica': ['Ciudad de Guatemala','San José (CR)','Panamá','Santo Domingo'],
  '🇦🇷 Argentina': ['Buenos Aires','Córdoba','Rosario','Mendoza','La Plata'],
  '🇨🇱 Chile': ['Santiago','Valparaíso','Concepción'],
  '🇵🇪 Perú': ['Lima','Arequipa','Cusco'],
  '🇧🇷 Brasil': ['São Paulo','Río de Janeiro','Brasília'],
  '🇪🇸 España': ['Madrid','Barcelona','Valencia','Sevilla','Bilbao'],
  '🇵🇹 Portugal': ['Lisboa','Oporto'],
  '🇫🇷 Francia': ['París','Lyon','Marsella'],
}

export default function PerfilEditarPage() {
  const router = useRouter()
  const supabase = createClient()

  const [usuario, setUsuario] = useState<any>(null)
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState('')

  const [alias, setAlias] = useState('')
  const [bio, setBio] = useState('')
  const [edad, setEdad] = useState(18)
  const [ciudad, setCiudad] = useState('')
  const [busca, setBusca] = useState('')

  useEffect(() => { cargar() }, [])

  const cargar = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) { router.push('/login'); return }
    const { data: u } = await supabase.from('usuarios').select('*').eq('id', session.user.id).single()
    if (u) {
      setUsuario(u)
      setAlias(u.alias || '')
      setBio(u.bio || '')
      setEdad(u.edad || 18)
      setCiudad(u.ciudad || '')
      setBusca(u.busca || '')
    }
    setCargando(false)
  }

  const guardar = async () => {
    if (!usuario) return
    setGuardando(true)
    try {
      await supabase.from('usuarios').update({
        alias,
        bio,
        edad,
        ciudad,
        busca,
      }).eq('id', usuario.id)
      setMensaje('✅ Perfil actualizado correctamente.')
      setTimeout(() => router.push('/perfil'), 1500)
    } catch (err) {
      console.error('Error:', err)
      setMensaje('❌ Error al guardar perfil')
    }
    setGuardando(false)
  }

  if (cargando) return (
    <div style={{ minHeight:'100vh', background:'#fff8f1', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ width:28, height:28, border:'3px solid #f0d4d8', borderTop:'3px solid #af2245', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', background:'#fff8f1', maxWidth:480, margin:'0 auto', paddingBottom:20 }}>
      <style>{`* {box-sizing:border-box}`}</style>

      {/* Top bar */}
      <div style={{ background:'white', borderBottom:'0.5px solid #f0d4d8', padding:'12px 16px', display:'flex', alignItems:'center', gap:12, position:'sticky', top:0, zIndex:30 }}>
        <button onClick={() => router.push('/perfil')} style={{ background:'none', border:'none', cursor:'pointer', color:'#af2245' }}>
          <IconChevL />
        </button>
        <span style={{ fontSize:16, fontWeight:700, color:'#2A1840' }}>Editar perfil</span>
        <div style={{ flex:1 }} />
        <button onClick={guardar} disabled={guardando}
          style={{ background: guardando ? '#e0bec1' : 'linear-gradient(135deg,#af2245,#f07855)', color:'white', border:'none', borderRadius:8, padding:'6px 14px', fontSize:12, fontWeight:600, cursor: guardando ? 'not-allowed' : 'pointer', display:'flex', alignItems:'center', gap:4 }}>
          <IconSave /> {guardando ? 'Guardando...' : 'Guardar'}
        </button>
      </div>

      <div style={{ padding:'16px' }}>

        {mensaje && (
          <div style={{ padding:'10px 14px', borderRadius:10, background: mensaje.includes('Error') ? '#fef2f2' : '#f0fdf4', border:`0.5px solid ${mensaje.includes('Error') ? '#fecaca' : '#bbf7d0'}`, fontSize:12, color: mensaje.includes('Error') ? '#af2245' : '#16a34a', textAlign:'center', marginBottom:16 }}>
            {mensaje}
          </div>
        )}

        {/* Alias */}
        <div style={{ marginBottom:16 }}>
          <label style={{ fontSize:12, fontWeight:600, color:'#6b7280', display:'block', marginBottom:6 }}>Alias (nombre de usuario)</label>
          <input type="text" value={alias} onChange={e => setAlias(e.target.value)}
            style={{ width:'100%', padding:'10px 12px', borderRadius:10, border:'0.5px solid #e0bec1', fontSize:13, color:'#2A1840', fontFamily:'inherit' }}
            placeholder="Tu alias" />
        </div>

        {/* Bio */}
        <div style={{ marginBottom:16 }}>
          <label style={{ fontSize:12, fontWeight:600, color:'#6b7280', display:'block', marginBottom:6 }}>Frase de presentación (bio)</label>
          <textarea value={bio} onChange={e => setBio(e.target.value)}
            style={{ width:'100%', padding:'10px 12px', borderRadius:10, border:'0.5px solid #e0bec1', fontSize:13, color:'#2A1840', fontFamily:'inherit', minHeight:80, resize:'none' }}
            placeholder="Cuéntanos un poco de ti..." />
          <div style={{ fontSize:11, color:'#9ca3af', marginTop:4 }}>{bio.length}/150 caracteres</div>
        </div>

        {/* Edad */}
        <div style={{ marginBottom:16 }}>
          <label style={{ fontSize:12, fontWeight:600, color:'#6b7280', display:'block', marginBottom:6 }}>Edad</label>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <input type="range" min={18} max={80} value={edad} onChange={e => setEdad(Number(e.target.value))}
              style={{ flex:1 }} />
            <span style={{ fontSize:16, fontWeight:700, color:'#af2245', width:40, textAlign:'center' }}>{edad}</span>
          </div>
        </div>

        {/* Ciudad */}
        <div style={{ marginBottom:16 }}>
          <label style={{ fontSize:12, fontWeight:600, color:'#6b7280', display:'block', marginBottom:6 }}>Ciudad</label>
          <select value={ciudad} onChange={e => setCiudad(e.target.value)}
            style={{ width:'100%', padding:'10px 12px', borderRadius:10, border:'0.5px solid #e0bec1', fontSize:13, color: ciudad ? '#2A1840' : '#9ca3af', fontFamily:'inherit' }}>
            <option value="">Selecciona tu ciudad...</option>
            {Object.entries(CIUDADES).map(([region, cities]) => (
              <optgroup key={region} label={region}>
                {cities.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {/* ¿Qué busca? */}
        <div style={{ marginBottom:24 }}>
          <label style={{ fontSize:12, fontWeight:600, color:'#6b7280', display:'block', marginBottom:6 }}>¿Qué buscas?</label>
          <select value={busca} onChange={e => setBusca(e.target.value)}
            style={{ width:'100%', padding:'10px 12px', borderRadius:10, border:'0.5px solid #e0bec1', fontSize:13, color: busca ? '#2A1840' : '#9ca3af', fontFamily:'inherit' }}>
            <option value="">Selecciona qué buscas...</option>
            <option value="Aventura discreta">Aventura discreta</option>
            <option value="Amistad especial">Amistad especial</option>
            <option value="Sin compromiso">Sin compromiso</option>
            <option value="Relación seria">Relación seria</option>
          </select>
        </div>

        {/* Botón guardar grande */}
        <button onClick={guardar} disabled={guardando}
          style={{ width:'100%', padding:'14px 0', borderRadius:12, border:'none', background: guardando ? '#e0bec1' : 'linear-gradient(135deg,#af2245,#f07855)', color:'white', fontSize:14, fontWeight:700, cursor: guardando ? 'not-allowed' : 'pointer' }}>
          {guardando ? 'Guardando cambios...' : '✅ Guardar cambios'}
        </button>
      </div>
    </div>
  )
}
