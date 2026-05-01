import { ReddinsightsSchema } from '@/lib/models';
import { NextResponse } from 'next/server';
import { comparePasswords, createSession } from '@/lib/auth-helpers';

export async function POST (request: Request) {
    try {
        // parse the req body
        const body = await request.json();
        const { email, password } = body;

        // query database
        const user = await ReddinsightsSchema.User.findOne({ email });

        // error handling if user does not exist
        if (!user) {
            return NextResponse.json({
                success: false,
                message: "Invalid credentials.",
            }, { status: 401, })
        }

        // password verification (compare with hashed password in DB)
        const validUser = await comparePasswords(password, user.password);

        if (!validUser) {
            return NextResponse.json({
                success: false,
                message: "Invalid credentials.",
            }, { status: 401, })
        }

        //creates session and sets cookie
        await createSession(user._id.toString())

        return NextResponse.json({
            success: true,
            message: "Login successful.",
            data: user,
        }, { status: 200 });

    } catch {
        return NextResponse.json({
            success: false,
            message: "Something went wrong."
        }, { status: 500 })
    }
}