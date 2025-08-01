import { ReddinsightsSchema } from '@/lib/models';

export async function POST (request: Request) {
    try {
        // parse the req body
        const body = await request.json();
        const { email } = body;

        // query database
        const user = await ReddinsightsSchema.User.findOne({ email });

        // error handling if user does not exist
        if (!user) {
            return new Response(JSON.stringify({
                success: false,
                message: "User not found.",
            }), { status: 404, })
        }

        // additional login logic --- checking password (see web dev simplified / scrypt, similar to compare with bcrypt, and the /utils folder)
        // also starting a new session, etc.

        return new Response(JSON.stringify({
            success: true,
            message: "Login successful.",
            data: user,
        }), { status: 200 });

    } catch {
        return new Response(JSON.stringify({
            success: false,
            message: "Something went wrong."
        }), { status: 500 })
    }
}