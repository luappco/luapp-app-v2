'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const IconChevL = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
const IconSave  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>

const CIUDADES: Record<string, string[]> = {
  'Colombia': ['Bogotá','Medellín','Cali','Barranquilla','Cartagena','Bucaramanga','Pereira','Santa Marta'],
  'México': ['Ciudad de México','Guadalajara','Monterrey','Cancún','Puebla','Tijuana'],
  'Argentina': ['Buenos Aires','Córdoba','Rosario','Mendoza'],
  'Chile': ['Santiago','Valparaíso','Concepción'],
  'Perú': ['Lima','Arequipa','Cusco'],
  'Brasil': ['São Paulo','Río de Janeiro','Brasília'],
  'España': ['Madrid','Barcelona','Valencia','Sevilla'],
  'Portugal': ['Lisboa','Oporto'],
}

const OPCIONES = {
  talla:        ['Bajo (menos 1.60m)','Mediano (1.60-1.75m)','Alto (más 1.75m)'],
  silueta:      ['Delgado','Normal','Atlético','Robusto','Curvilíneo'],
  ojos:         ['Negros','Marrones','Verdes','Azules','Grises','Miel'],
  cabello:      ['Negro','Castaño','Rubio','Rojizo','Canoso','Sin cabello'],
  largo_cabello:['Corto','Medio','Largo'],
  estado_civil: ['Soltero','Casado','Divorciado','Viudo','Complicado'],
  orientacion:  ['Heterosexual','Bisexual','Gay/Lesbiana','Otro'],
  hijos:        ['No','Sí, viven conmigo','Sí, no viven conmigo','Quiero tenerlos'],
  ingresos:     ['Prefiero no decirlo','Menos de $2M','$2M - $5M','$5M - $10M','Más de $10M'],
  signo:        ['Aries','Tauro','Géminis','Cáncer','Leo','Virgo','Libra','Escorpio','Sagitario','Capricornio','Acuario','Piscis'],
  etnia:        ['Hispano','Afrodescendiente','Mestizo','Indígena','Asiático','Blanco','Otro'],
  relacion:     ['Amistad','Aventura discreta','Sin compromiso','Relación seria','Pareja estable','Buena compañía','Discreción','Virtual','Cualquier cosa'],
  personalidad: ['Alegre','Fiable','Divertida','Generosa','Romántica','Apasionada','Independiente','Aventurera','Inteligente','Espontánea','Cariñosa'],
  deportes:     ['Fútbol','Natación','Ciclismo','Yoga','Gimnasio','Correr','Tenis','Baile','Volleyball','Otro'],
  actividades:  ['Viajes','Cine','Música','Cocinar','Arte','Lectura','Animales','Deporte','Tecnología','Naturaleza'],
  idiomas:      ['Español','Inglés','Portugués','Francés','Italiano','Alemán'],
}

function ChipSelector({ opciones, seleccionados, onChange, max }: { opciones: string[]; seleccionados: string[]; onChange: (v: string[]) => void; max?: number }) {
  const toggle = (op: string) => {
    if (seleccionados.includes(op)) {
      onChange(seleccionados.filter(s => s !== op))
    } else {
      if (max && seleccionados.length >= max) return
      onChange([...seleccionados, op])
    }
  }
  return (
    <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
      {opciones.map(op => {
        const sel = seleccionados.includes(op)
        return (
          <button key={op} type="button" onClick={()=>toggle(op)}
            style={{ padding:'6px 12px', borderRadius:20, border:'1.5px solid', fontSize:12, fontWeight:500, cursor:'pointer', transition:'all 0.15s',
              background: sel ? 'linear-gradient(135deg,#af2245,#f07855)' : 'white',
              color: sel ? 'white' : '#374151',
              borderColor: sel ? 'transparent' : '#e5e7eb',
            }}>
            {op}
          </button>
        )
      })}
    </div>
  )
}

function Seccion({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div style={{ background:'white', borderRadius:14, padding:'16px 18px', marginBottom:12, border:'1px solid #f0d4d8' }}>
      <div style={{ fontSize:12, fontWeight:700, color:'#af2245', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:14 }}>{titulo}</div>
      {children}
    </div>
  )
}

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom:14 }}>
      <label style={{ fontSize:11, fontWeight:600, color:'#6b7280', display:'block', marginBottom:6 }}>{label}</label>
      {children}
    </div>
  )
}

const inputStyle: React.CSSProperties = { width:'100%', padding:'9px 12px', borderRadius:9, border:'1.5px solid #e5e7eb', fontSize:13, color:'#1f2937', outline:'none', boxSizing:'border-box' }
const selectStyle: React.CSSProperties = { ...inputStyle, cursor:'pointer', background:'white' }

export default function PerfilEditarPage() {
  const router  = useRouter()
  const supabase = createClient()

  const [uid, setUid]           = useState('')
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje]   = useState('')

  // Básico
  const [alias, setAlias]   = useState('')
  const [bio, setBio]       = useState('')
  const [edad, setEdad]     = useState(25)
  const [ciudad, setCiudad] = useState('')
  const [pais, setPais]     = useState('Colombia')
  const [region, setRegion] = useState('')

  // Físico
  const [talla, setTalla]           = useState('')
  const [silueta, setSilueta]       = useState('')
  const [ojos, setOjos]             = useState('')
  const [cabello, setCabello]       = useState('')
  const [largoCabello, setLargoCabello] = useState('')
  const [fumador, setFumador]       = useState(false)

  // Personal
  const [estadoCivil, setEstadoCivil]       = useState('')
  const [orientacion, setOrientacion]       = useState('Heterosexual')
  const [hijos, setHijos]                   = useState('No')
  const [profesion, setProfesion]           = useState('')
  const [ingresos, setIngresos]             = useState('')
  const [signo, setSigno]                   = useState('')
  const [etnia, setEtnia]                   = useState('')

  // Relación / personalidad
  const [relacionBuscada, setRelacionBuscada] = useState<string[]>([])
  const [personalidad, setPersonalidad]       = useState<string[]>([])
  const [deportes, setDeportes]               = useState<string[]>([])
  const [actividades, setActividades]         = useState<string[]>([])
  const [idiomas, setIdiomas]                 = useState<string[]>([])

  useEffect(() => { cargar() }, [])

  const cargar = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) { router.push('/login'); return }
    setUid(session.user.id)
    const { data: u } = await supabase.from('usuarios').select('*').eq('id', session.user.id).single()
    if (u) {
      setAlias(u.alias || ''); setBio(u.bio || ''); setEdad(u.edad || 25)
      setCiudad(u.ciudad || ''); setPais(u.pais || 'Colombia'); setRegion(u.region || '')
      setTalla(u.talla || ''); setSilueta(u.silueta || ''); setOjos(u.ojos || '')
      setCabello(u.cabello || ''); setLargoCabello(u.largo_cabello || ''); setFumador(u.fumador || false)
      setEstadoCivil(u.estado_civil || ''); setOrientacion(u.orientacion_sexual || 'Heterosexual')
      setHijos(u.hijos || 'No'); setProfesion(u.profesion || ''); setIngresos(u.ingresos || '')
      setSigno(u.signo_zodiacal || ''); setEtnia(u.etnia || '')
      setRelacionBuscada(u.relacion_buscada || []); setPersonalidad(u.personalidad || [])
      setDeportes(u.deportes || []); setActividades(u.actividades || []); setIdiomas(u.idiomas || [])
    }
    setCargando(false)
  }

  const guardar = async () => {
    if (!alias.trim()) { setMensaje('El alias no puede estar vacío'); return }
    setGuardando(true); setMensaje('')
    const { error } = await supabase.from('usuarios').update({
      alias: alias.trim(), bio: bio.trim(), edad: Number(edad),
      ciudad: ciudad.trim(), pais, region: region.trim(),
      talla, silueta, ojos, cabello, largo_cabello: largoCabello, fumador,
      estado_civil: estadoCivil, orientacion_sexual: orientacion,
      hijos, profesion: profesion.trim(), ingresos, signo_zodiacal: signo, etnia,
      relacion_buscada: relacionBuscada, personalidad, deportes, actividades, idiomas,
    }).eq('id', uid)
    if (error) { setMensaje(`Error: ${error.message}`); setGuardando(false); return }
    setMensaje('Perfil actualizado correctamente')
    setTimeout(() => router.push('/perfil'), 1000)
  }

  if (cargando) return (
    <div style={{ minHeight:'100vh', background:'#fff8f1', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ width:28, height:28, border:'3px solid #f0d4d8', borderTop:'3px solid #af2245', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  const ok = !mensaje.toLowerCase().includes('error')

  return (
    <div style={{ minHeight:'100vh', background:'#fff8f1', maxWidth:540, margin:'0 auto', paddingBottom:30 }}>
      <style>{`*{box-sizing:border-box} @keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* Top bar */}
      <div style={{ background:'white', borderBottom:'1px solid #f0d4d8', padding:'11px 16px', display:'flex', alignItems:'center', gap:10, position:'sticky', top:0, zIndex:30, boxShadow:'0 1px 6px rgba(0,0,0,0.04)' }}>
        <button onClick={()=>router.push('/perfil')} style={{ background:'none', border:'none', cursor:'pointer', color:'#6b7280', padding:4 }}><IconChevL /></button>
        <span style={{ fontSize:16, fontWeight:700, color:'#1f2937', flex:1 }}>Editar perfil</span>
        <button onClick={guardar} disabled={guardando}
          style={{ background: guardando?'#e5e7eb':'linear-gradient(135deg,#af2245,#f07855)', color:'white', border:'none', borderRadius:9, padding:'7px 16px', fontSize:12, fontWeight:700, cursor: guardando?'not-allowed':'pointer', display:'flex', alignItems:'center', gap:5 }}>
          <IconSave /> {guardando ? 'Guardando...' : 'Guardar'}
        </button>
      </div>

      <div style={{ padding:'16px' }}>
        {mensaje && (
          <div style={{ padding:'10px 14px', borderRadius:10, background: ok?'#f0fdf4':'#fef2f2', border:`1px solid ${ok?'#bbf7d0':'#fecaca'}`, fontSize:12, color: ok?'#16a34a':'#dc2626', textAlign:'center', marginBottom:14 }}>
            {mensaje}
          </div>
        )}

        {/* Básico */}
        <Seccion titulo="Presentación">
          <Campo label="Alias (nombre público)">
            <input value={alias} onChange={e=>setAlias(e.target.value)} style={inputStyle} placeholder="Tu alias..." />
          </Campo>
          <Campo label="Frase de presentación">
            <textarea value={bio} onChange={e=>setBio(e.target.value.slice(0,200))} style={{ ...inputStyle, minHeight:80, resize:'none' }} placeholder="Cuéntanos algo de ti..." />
            <div style={{ fontSize:10, color:'#9ca3af', marginTop:3 }}>{bio.length}/200</div>
          </Campo>
          <Campo label={`Edad: ${edad} años`}>
            <input type="range" min={18} max={80} value={edad} onChange={e=>setEdad(Number(e.target.value))} style={{ width:'100%', accentColor:'#af2245' }} />
          </Campo>
        </Seccion>

        {/* Ubicación */}
        <Seccion titulo="Ubicación">
          <Campo label="Ciudad">
            <select value={ciudad} onChange={e=>setCiudad(e.target.value)} style={selectStyle}>
              <option value="">Selecciona tu ciudad...</option>
              {Object.entries(CIUDADES).map(([reg, cities]) => (
                <optgroup key={reg} label={reg}>
                  {cities.map(c => <option key={c} value={c}>{c}</option>)}
                </optgroup>
              ))}
            </select>
          </Campo>
          <Campo label="País">
            <input value={pais} onChange={e=>setPais(e.target.value)} style={inputStyle} placeholder="Colombia" />
          </Campo>
          <Campo label="Región / Departamento">
            <input value={region} onChange={e=>setRegion(e.target.value)} style={inputStyle} placeholder="Cundinamarca, Antioquia..." />
          </Campo>
        </Seccion>

        {/* Físico */}
        <Seccion titulo="Apariencia física">
          <Campo label="Talla">
            <select value={talla} onChange={e=>setTalla(e.target.value)} style={selectStyle}>
              <option value="">Seleccionar...</option>
              {OPCIONES.talla.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </Campo>
          <Campo label="Silueta">
            <ChipSelector opciones={OPCIONES.silueta} seleccionados={silueta?[silueta]:[]} onChange={v=>setSilueta(v[v.length-1]||'')} max={1} />
          </Campo>
          <Campo label="Color de ojos">
            <ChipSelector opciones={OPCIONES.ojos} seleccionados={ojos?[ojos]:[]} onChange={v=>setOjos(v[v.length-1]||'')} max={1} />
          </Campo>
          <Campo label="Color de cabello">
            <ChipSelector opciones={OPCIONES.cabello} seleccionados={cabello?[cabello]:[]} onChange={v=>setCabello(v[v.length-1]||'')} max={1} />
          </Campo>
          <Campo label="Largo de cabello">
            <ChipSelector opciones={OPCIONES.largo_cabello} seleccionados={largoCabello?[largoCabello]:[]} onChange={v=>setLargoCabello(v[v.length-1]||'')} max={1} />
          </Campo>
          <Campo label="Fumador">
            <div style={{ display:'flex', gap:8 }}>
              {['No','Sí'].map(v => (
                <button key={v} type="button" onClick={()=>setFumador(v==='Sí')}
                  style={{ flex:1, padding:'7px 0', borderRadius:8, border:'1.5px solid', fontSize:12, fontWeight:600, cursor:'pointer', background: (fumador&&v==='Sí')||(!fumador&&v==='No')?'linear-gradient(135deg,#af2245,#f07855)':'white', color: (fumador&&v==='Sí')||(!fumador&&v==='No')?'white':'#374151', borderColor: (fumador&&v==='Sí')||(!fumador&&v==='No')?'transparent':'#e5e7eb' }}>
                  {v}
                </button>
              ))}
            </div>
          </Campo>
        </Seccion>

        {/* Personal */}
        <Seccion titulo="Datos personales">
          <Campo label="Situación sentimental">
            <ChipSelector opciones={OPCIONES.estado_civil} seleccionados={estadoCivil?[estadoCivil]:[]} onChange={v=>setEstadoCivil(v[v.length-1]||'')} max={1} />
          </Campo>
          <Campo label="Orientación sexual">
            <ChipSelector opciones={OPCIONES.orientacion} seleccionados={orientacion?[orientacion]:[]} onChange={v=>setOrientacion(v[v.length-1]||'')} max={1} />
          </Campo>
          <Campo label="Hijos">
            <select value={hijos} onChange={e=>setHijos(e.target.value)} style={selectStyle}>
              {OPCIONES.hijos.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </Campo>
          <Campo label="Profesión">
            <input value={profesion} onChange={e=>setProfesion(e.target.value)} style={inputStyle} placeholder="Tu profesión o trabajo..." />
          </Campo>
          <Campo label="Ingresos mensuales">
            <select value={ingresos} onChange={e=>setIngresos(e.target.value)} style={selectStyle}>
              <option value="">Seleccionar...</option>
              {OPCIONES.ingresos.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </Campo>
          <Campo label="Signo zodiacal">
            <ChipSelector opciones={OPCIONES.signo} seleccionados={signo?[signo]:[]} onChange={v=>setSigno(v[v.length-1]||'')} max={1} />
          </Campo>
          <Campo label="Etnia">
            <ChipSelector opciones={OPCIONES.etnia} seleccionados={etnia?[etnia]:[]} onChange={v=>setEtnia(v[v.length-1]||'')} max={1} />
          </Campo>
          <Campo label="Idiomas">
            <ChipSelector opciones={OPCIONES.idiomas} seleccionados={idiomas} onChange={setIdiomas} />
          </Campo>
        </Seccion>

        {/* Relación */}
        <Seccion titulo="Relación buscada">
          <Campo label="¿Qué buscas? (puedes elegir varios)">
            <ChipSelector opciones={OPCIONES.relacion} seleccionados={relacionBuscada} onChange={setRelacionBuscada} />
          </Campo>
        </Seccion>

        {/* Personalidad */}
        <Seccion titulo="Personalidad y estilo de vida">
          <Campo label="Mi personalidad">
            <ChipSelector opciones={OPCIONES.personalidad} seleccionados={personalidad} onChange={setPersonalidad} max={5} />
          </Campo>
          <Campo label="Mis deportes">
            <ChipSelector opciones={OPCIONES.deportes} seleccionados={deportes} onChange={setDeportes} />
          </Campo>
          <Campo label="Mis actividades">
            <ChipSelector opciones={OPCIONES.actividades} seleccionados={actividades} onChange={setActividades} />
          </Campo>
        </Seccion>

        <button onClick={guardar} disabled={guardando}
          style={{ width:'100%', padding:'14px 0', borderRadius:12, border:'none', background: guardando?'#e5e7eb':'linear-gradient(135deg,#af2245,#f07855)', color:'white', fontSize:14, fontWeight:700, cursor: guardando?'not-allowed':'pointer', marginTop:4 }}>
          {guardando ? 'Guardando cambios...' : 'Guardar perfil completo'}
        </button>
      </div>
    </div>
  )
}
