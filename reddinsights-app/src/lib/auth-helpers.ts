import bcrypt from "bcryptjs";
import { ReddinsightsSchema } from "./models";
// import { cookies } from "next/dist/server/request/cookies";
import { cookies } from "next/headers";
import mongoose from "mongoose";


const SALT_ROUNDS = 10;

// function to hash PW during signup
export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
}

// function to compare PW with hashed PW in DB during login
export async function comparePasswords(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
}

// function to create session 
export async function createSession(userId: mongoose.Types.ObjectId): Promise<string> {
    const sessionToken = crypto.randomUUID();
    // console.log("Generated session token:", sessionToken);

    await ReddinsightsSchema.Session.create({ userId, sessionToken });

    const cookieStore = await cookies();
    cookieStore.set('session', sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60,
        path: '/'
    })

    return sessionToken;
}

// function to get session and user info from cookie
export async function getSession() {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session')?.value;

    if (!sessionToken) return null;

    return ReddinsightsSchema.Session.findOne({ sessionToken }).populate('userId');
}

// function to end session on logout
export async function deleteSession() {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session')?.value;
    // console.log("Session token to be deleted:", sessionToken);

    if (sessionToken) {
        await ReddinsightsSchema.Session.deleteOne({ sessionToken });
    }
    cookieStore.delete('session');
}