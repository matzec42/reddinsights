import { ReddinsightsSchema } from '@/lib/models';
import { NextResponse } from 'next/server';

export async function POST (request: Request) {
    try {
        // parse the req body
        const body = await request.json();
        const { email, password } = body;

        // error handling for missing credentials
        if (!email || !password) {
            return NextResponse.json({
                success: false,
                message: "Failed to sign up."
            }, { status: 400 })
        }

        // handling if user email already exists
        const existingUser = await ReddinsightsSchema.User.findOne({ email });
        if (existingUser) {
            return NextResponse.json({
                success: false,
                message: "User already exists. Please login."
            }, { status: 400 })
        }

        // password hashing --- see web dev simplified, skeleton code in /utils folders (look into scrypt)

        // create new User in users document
        const newUser = ReddinsightsSchema.User.create({ email: email, password: password})

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