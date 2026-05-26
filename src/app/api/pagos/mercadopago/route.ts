import { MercadoPagoConfig, Preference } from 'mercadopago'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!
})

const paquetes: Record<string, { creditos: number; precio: number; nombre: string }> = {
  '50':  { creditos: 50,  precio: 4.99,  nombre: '50 Créditos LUAPP' },
  '150': { creditos: 150, precio: 11.99, nombre: '150 Créditos LUAPP' },
  '350': { creditos: 350, precio: 24.99, nombre: '350 Créditos LUAPP' },
  '800': { creditos: 800, precio: 49.99, nombre: '800 Créditos LUAPP' },
}

export async function POST(req: NextRequest) {
  try {
    const { paquete } = await req.json()
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const pkg = paquetes[paquete]
    if (!pkg) {
      return NextResponse.json({ error: 'Paquete inválido' }, { status: 400 })
    }

    const preference = new Preference(client)
    const result = await preference.create({
      body: {
        items: [{
          id: paquete,
          title: pkg.nombre,
          quantity: 1,
          unit_price: pkg.precio,
          currency_id: 'USD',
        }],
        metadata: {
          usuario_id: user.id,
          creditos: pkg.creditos
        },
        back_urls: {
          success: `${process.env.NEXT_PUBLIC_URL}/creditos?estado=ok`,
          failure: `${process.env.NEXT_PUBLIC_URL}/creditos?estado=error`,
          pending: `${process.env.NEXT_PUBLIC_URL}/creditos?estado=pendiente`,
        },
        auto_return: 'approved',
        notification_url: `${process.env.NEXT_PUBLIC_URL}/api/pagos/webhook/mp`,
      }
    })

    return NextResponse.json({ url: result.init_point })
  } catch (error) {
    console.error('MP Error:', error)
    return NextResponse.json({ error: 'Error creando pago' }, { status: 500 })
  }
}