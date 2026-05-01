import { NextResponse } from 'next/server'
import { deleteSession } from '@/lib/auth-helpers'

export async function POST() {
    await deleteSession()
    return NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_BASE_URL))
}