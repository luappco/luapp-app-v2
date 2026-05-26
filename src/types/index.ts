export type Usuario = {
  id: string
  alias: string
  email: string
  genero: 'hombre' | 'mujer'
  busca: string
  ciudad: string
  edad: number
  bio: string
  creditos: number
  es_premium: boolean
  modo_incognito: boolean
  activo: boolean
  created_at: string
}

export type Foto = {
  id: string
  usuario_id: string
  url: string
  es_privada: boolean
  es_principal: boolean
}

export type Match = {
  id: string
  usuario1: string
  usuario2: string
  created_at: string
  usuario?: Usuario
  fotos?: Foto[]
}

export type Mensaje = {
  id: string
  match_id: string
  remitente_id: string
  contenido: string
  leido: boolean
  created_at: string
}

export type Transaccion = {
  id: string
  usuario_id: string
  tipo: 'compra' | 'gasto' | 'regalo'
  creditos: number
  descripcion: string
  pago_id: string
  pago_metodo: string
  created_at: string
}

export type PaqueteCreditos = {
  id: string
  creditos: number
  precio: number
  nombre: string
  popular?: boolean
}