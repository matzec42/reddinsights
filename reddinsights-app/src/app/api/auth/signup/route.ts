import { ReddinsightsSchema } from '@/lib/models';
import { NextResponse } from 'next/server';
import { hashPassword } from '@/lib/auth-helpers';

export async function POST (request: Request) {
    try {
        // parse the req body
        const body = await request.json();
        const { email, password } = body;

        // error handling for missing credentials
        if (!email || !password) {
            return NextResponse.json({
                success: false,
                message: "Invalid credentials. Failed to sign up."
            }, { status: 400 })
        }

        // handling if user email already exists
        const existingUser = await ReddinsightsSchema.User.findOne({ email });

        if (existingUser) {
            return NextResponse.json({
                success: false,
                message: "User already exists. Please login."
            }, { status: 409 })
        }

        // password hashing
        const hashedPassword = await hashPassword(password);

        // create a new User (new User document)
        const newUser = await ReddinsightsSchema.User.create({ email: email, password: hashedPassword });

        return NextResponse.json({
            success: true,
            message: "Signup successful.",
            data: newUser,
        }, { status: 200 });

    } catch {
        return NextResponse.json({
            success: false,
            message: "Something went wrong."
        }, { status: 500 })
    }
}