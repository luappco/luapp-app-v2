import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const schema = z.object({
  email: z.string().email(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email } = schema.parse(body)

    const supabase = await createClient()

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_URL}/auth/callback`,
      }
    })

    if (error) throw error

    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error enviando OTP' },
      { status: 400 }
    )
  }
}