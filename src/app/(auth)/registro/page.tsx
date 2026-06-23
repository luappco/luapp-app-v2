'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const LOGO = 'https://luapp.co/images/logo/logo-color.webp'

const PAISES_CIUDADES: Record<string, string[]> = {
  'México':       ['Ciudad de México','Guadalajara','Monterrey','Cancún','Puebla','Tijuana','León','Juárez','Torreón','San Luis Potosí','Mérida','Querétaro','Aguascalientes','Acapulco','Veracruz','Chihuahua','Hermosillo','Culiacán','Mazatlán','Oaxaca','Tuxtla Gutiérrez','Morelia'],
  'Colombia':     ['Bogotá','Medellín','Cali','Barranquilla','Cartagena','Bucaramanga','Pereira','Santa Marta','Manizales','Ibagué','Cúcuta','Armenia','Villavicencio','Pasto','Montería','Neiva','Sincelejo','Valledupar','Popayán'],
  'Argentina':    ['Buenos Aires','Córdoba','Rosario','Mendoza','La Plata','Tucumán','Mar del Plata','Salta','Santa Fe','San Juan','Neuquén','Bahía Blanca'],
  'España':       ['Madrid','Barcelona','Valencia','Sevilla','Zaragoza','Málaga','Murcia','Palma','Las Palmas','Bilbao','Alicante','Córdoba','Valladolid','Vigo','Gijón','Granada','Tenerife'],
  'Chile':        ['Santiago','Valparaíso','Concepción','Antofagasta','Viña del Mar','La Serena','Temuco','Rancagua','Puerto Montt','Iquique','Arica','Talca'],
  'Perú':         ['Lima','Arequipa','Cusco','Trujillo','Chiclayo','Piura','Iquitos','Huancayo','Tacna'],
  'Venezuela':    ['Caracas','Maracaibo','Valencia','Barquisimeto','Maracay','Ciudad Guayana','San Cristóbal','Maturín'],
  'Ecuador':      ['Guayaquil','Quito','Cuenca','Ambato','Manta','Portoviejo','Loja','Esmeraldas'],
  'Bolivia':      ['La Paz','Santa Cruz de la Sierra','Cochabamba','Oruro','Sucre','Potosí','Tarija'],
  'Paraguay':     ['Asunción','Ciudad del Este','San Lorenzo','Luque','Capiatá'],
  'Uruguay':      ['Montevideo','Salto','Ciudad de la Costa','Paysandú','Las Piedras','Maldonado'],
  'Brasil':       ['São Paulo','Río de Janeiro','Brasília','Salvador','Fortaleza','Belo Horizonte','Manaus','Curitiba','Recife','Porto Alegre'],
  'Guatemala':    ['Ciudad de Guatemala','Mixco','Villa Nueva','Quetzaltenango','Escuintla'],
  'Costa Rica':   ['San José','Alajuela','Heredia','Liberia','Cartago','Puntarenas'],
  'Panamá':       ['Ciudad de Panamá','San Miguelito','David','La Chorrera','Colón'],
  'Honduras':     ['Tegucigalpa','San Pedro Sula','La Ceiba','El Progreso','Comayagua'],
  'El Salvador':  ['San Salvador','Soyapango','Santa Ana','San Miguel','Mejicanos'],
  'Nicaragua':    ['Managua','León','Masaya','Chinandega','Matagalpa'],
  'República Dominicana': ['Santo Domingo','Santiago de los Caballeros','La Romana','San Pedro de Macorís','Puerto Plata'],
  'Cuba':         ['La Habana','Santiago de Cuba','Camagüey','Holguín','Santa Clara'],
  'Puerto Rico':  ['San Juan','Bayamón','Carolina','Ponce','Caguas'],
  'Estados Unidos': ['Miami','Nueva York','Los Ángeles','Chicago','Houston','Dallas','Phoenix','San Diego','Las Vegas','Orlando','Atlanta'],
  'Portugal':     ['Lisboa','Oporto','Amadora','Braga','Setúbal','Coimbra','Funchal'],
  'Francia':      ['París','Marsella','Lyon','Toulouse','Niza','Nantes','Burdeos'],
  'Italia':       ['Roma','Milán','Nápoles','Turín','Palermo','Florencia','Venecia'],
  'Alemania':     ['Berlín','Hamburgo','Múnich','Colonia','Fráncfort','Stuttgart'],
  'Reino Unido':  ['Londres','Birmingham','Leeds','Glasgow','Mánchester','Liverpool'],
  'Canadá':       ['Toronto','Montreal','Vancouver','Calgary','Edmonton','Ottawa'],
  'Australia':    ['Sídney','Melbourne','Brisbane','Perth','Adelaida','Canberra'],
}

const inp = "w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm outline-none focus:border-[#af2245] bg-white"

export default function RegistroPage() {
  const [cargando, setCargando] = useState(false)
  const [error, setError]       = useState('')
  const router  = useRouter()
  const supabase = createClient()

  const [alias, setAlias]       = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [pais, setPais]         = useState('México')
  const [ciudad, setCiudad]     = useState('')
  const [edad, setEdad]         = useState('')
  const [genero, setGenero]     = useState('mujer')
  const [busca, setBusca]       = useState('hombre')

  const registrar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmar) { setError('Las contraseñas no coinciden.'); return }
    if (password.length < 6)   { setError('La contraseña debe tener al menos 6 caracteres.'); return }
    if (!ciudad)               { setError('Selecciona tu ciudad.'); return }
    setCargando(true); setError('')

    const { data, error: signUpError } = await supabase.auth.signUp({ email, password })
    if (signUpError) { setError('Error creando cuenta. Intenta de nuevo.'); setCargando(false); return }

    if (data.user) {
      const { error: insertError } = await supabase.from('usuarios').insert({
        id: data.user.id,
        alias, email, genero, busca,
        pais, ciudad,
        edad: parseInt(edad),
        creditos: 0,
      })
      if (insertError) { setError('Error creando perfil. Intenta de nuevo.'); setCargando(false); return }
      router.push('/explorar')
    }
    setCargando(false)
  }

  const ciudadesPais = PAISES_CIUDADES[pais] || []

  const btnGenero = (val: string, label: string) => (
    <button type="button" onClick={() => setGenero(val)}
      className="flex-1 py-3 rounded-2xl border text-sm font-medium transition-all"
      style={{ background: genero === val ? 'linear-gradient(135deg,#af2245,#f07855)' : 'white', color: genero === val ? 'white' : '#6b7280', borderColor: genero === val ? 'transparent' : '#e5e7eb' }}>
      {label}
    </button>
  )

  const btnBusca = (val: string, label: string) => (
    <button type="button" onClick={() => setBusca(val)}
      className="flex-1 py-2.5 rounded-2xl border text-xs font-medium transition-all"
      style={{ background: busca === val ? 'linear-gradient(135deg,#af2245,#f07855)' : 'white', color: busca === val ? 'white' : '#6b7280', borderColor: busca === val ? 'transparent' : '#e5e7eb' }}>
      {label}
    </button>
  )

  return (
    <div style={{ minHeight:'100vh', background:'#fff8f1', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'32px 20px' }}>

      {/* Logo */}
      <div style={{ marginBottom:28, textAlign:'center' }}>
        <img src={LOGO} alt="LUAPP" style={{ height:44, width:'auto', objectFit:'contain' }} />
      </div>

      <div style={{ width:'100%', maxWidth:400, background:'white', borderRadius:24, padding:'28px 24px', boxShadow:'0 2px 20px rgba(0,0,0,0.06)', border:'1px solid #f0d4d8' }}>
        <h2 style={{ fontSize:22, fontWeight:700, color:'#1f2937', marginBottom:4 }}>Crear cuenta</h2>
        <p style={{ fontSize:13, color:'#9ca3af', marginBottom:24 }}>100% discreto y anónimo</p>

        <form onSubmit={registrar} style={{ display:'flex', flexDirection:'column', gap:14 }}>

          <div>
            <label style={{ fontSize:11, fontWeight:600, color:'#6b7280', textTransform:'uppercase', letterSpacing:'0.07em', display:'block', marginBottom:5 }}>Tu alias</label>
            <input value={alias} onChange={e=>setAlias(e.target.value)} placeholder="Ej: Luna, Estrella..." required className={inp} />
          </div>

          <div>
            <label style={{ fontSize:11, fontWeight:600, color:'#6b7280', textTransform:'uppercase', letterSpacing:'0.07em', display:'block', marginBottom:5 }}>Email</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="tu@email.com" required className={inp} />
          </div>

          <div>
            <label style={{ fontSize:11, fontWeight:600, color:'#6b7280', textTransform:'uppercase', letterSpacing:'0.07em', display:'block', marginBottom:5 }}>Contraseña</label>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" required className={inp} />
          </div>

          <div>
            <label style={{ fontSize:11, fontWeight:600, color:'#6b7280', textTransform:'uppercase', letterSpacing:'0.07em', display:'block', marginBottom:5 }}>Confirmar contraseña</label>
            <input type="password" value={confirmar} onChange={e=>setConfirmar(e.target.value)} placeholder="Repite tu contraseña" required className={inp} />
          </div>

          {/* País */}
          <div>
            <label style={{ fontSize:11, fontWeight:600, color:'#6b7280', textTransform:'uppercase', letterSpacing:'0.07em', display:'block', marginBottom:5 }}>País</label>
            <select value={pais} onChange={e=>{setPais(e.target.value); setCiudad('')}} required className={inp} style={{ cursor:'pointer' }}>
              {Object.keys(PAISES_CIUDADES).map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          {/* Ciudad */}
          <div>
            <label style={{ fontSize:11, fontWeight:600, color:'#6b7280', textTransform:'uppercase', letterSpacing:'0.07em', display:'block', marginBottom:5 }}>Ciudad</label>
            <select value={ciudad} onChange={e=>setCiudad(e.target.value)} required className={inp} style={{ cursor:'pointer', color: ciudad ? '#1f2937' : '#9ca3af' }}>
              <option value="">Selecciona tu ciudad...</option>
              {ciudadesPais.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Edad */}
          <div>
            <label style={{ fontSize:11, fontWeight:600, color:'#6b7280', textTransform:'uppercase', letterSpacing:'0.07em', display:'block', marginBottom:5 }}>Edad</label>
            <select value={edad} onChange={e=>setEdad(e.target.value)} required className={inp} style={{ cursor:'pointer', color: edad ? '#1f2937' : '#9ca3af' }}>
              <option value="">Mayor de 18...</option>
              {Array.from({length:62},(_,i)=>i+18).map(n => <option key={n} value={n}>{n} años</option>)}
            </select>
          </div>

          {/* Soy */}
          <div>
            <label style={{ fontSize:11, fontWeight:600, color:'#6b7280', textTransform:'uppercase', letterSpacing:'0.07em', display:'block', marginBottom:8 }}>Soy</label>
            <div className="flex gap-3">
              {btnGenero('mujer','Mujer')}
              {btnGenero('hombre','Hombre')}
            </div>
          </div>

          {/* Busco */}
          <div>
            <label style={{ fontSize:11, fontWeight:600, color:'#6b7280', textTransform:'uppercase', letterSpacing:'0.07em', display:'block', marginBottom:8 }}>Busco</label>
            <div className="flex gap-2">
              {btnBusca('hombre','Hombre')}
              {btnBusca('mujer','Mujer')}
              {btnBusca('ambos','Ambos')}
            </div>
          </div>

          {error && <p style={{ fontSize:12, color:'#dc2626', textAlign:'center' }}>{error}</p>}

          <button type="submit" disabled={cargando}
            style={{ width:'100%', padding:'13px 0', borderRadius:24, border:'none', background:'linear-gradient(135deg,#af2245,#f07855)', color:'white', fontSize:14, fontWeight:700, cursor: cargando ? 'not-allowed' : 'pointer', opacity: cargando ? 0.7 : 1, marginTop:4 }}>
            {cargando ? 'Creando cuenta...' : 'Crear mi cuenta'}
          </button>
        </form>
      </div>

      <p style={{ textAlign:'center', fontSize:13, color:'#9ca3af', marginTop:20 }}>
        ¿Ya tienes cuenta?{' '}
        <Link href="/login" style={{ color:'#af2245', fontWeight:600 }}>Ingresar</Link>
      </p>
    </div>
  )
}
