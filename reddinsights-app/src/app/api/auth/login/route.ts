import { ReddinsightsSchema } from '@/lib/models';

export async function POST (request: Request) {
    const body = await request.json();
    console.log('Parsed request body:', body);

    const email = body.email.toLowerCase();

    const user = await ReddinsightsSchema.User.findOne({ email });
    console.log('Testing login route.ts, user found:', user);

    return new Response(JSON.stringify({
        success: true,
        message: user ? "User found" : "User not found",
        data: user,
    }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
    });
}