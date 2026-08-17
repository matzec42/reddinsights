import { NextRequest, NextResponse } from 'next/server'
import { deleteSession } from '@/lib/auth-helpers'

export async function POST(request: NextRequest) {
    await deleteSession()
    const response = NextResponse.redirect(new URL('/', request.url), 303)
    response.cookies.delete('session')
    return response
}