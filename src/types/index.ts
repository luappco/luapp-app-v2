export type Usuario = {
  id: string
  alias: string
  edad: number
  ciudad: string
  busca?: string
  bio?: string
  foto_principal?: string
  modo_incognito?: boolean
  creditos?: number
}

export type PaqueteCreditos = {
  id: string
  creditos: number
  precio: number
  nombre: string
  popular?: boolean
}
