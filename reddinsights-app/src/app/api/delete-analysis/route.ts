/* Route to delete a Reddinsight analysis (request is made from the Card.tsx on frontend) */

import { NextRequest, NextResponse } from "next/server";
import { cookies} from "next/headers";
import { ReddinsightsSchema } from "@/lib/models";

export async function DELETE(request: NextRequest) {
        // destructure Analysis, Session models for interacting w/ DB
        const { Analysis, Session } = ReddinsightsSchema;

        try {
            const body = await request.json();
            const { id } = body;
            
            // validate user --- retrieve session token from cookie 
            const cookieStore = await cookies();
            const tokenFromSessionCookie = cookieStore.get("session")?.value;
            const session = await Session.findOne({ sessionToken: tokenFromSessionCookie });
            if (!session) {
                return NextResponse.json({
                    success: false,
                    message: "Invalid session. Please log in."
                }, { status: 401 });
            }
                
            // error handling --- check if body contains anything missing, send 400 status code
            if (!id) {
                return NextResponse.json({
                    error: "Invalid analysis type",
                    success: false,
                    message: "Please submit a valid analysis type."
                }, { status: 400 });
            }

            // error handling --- invalid user (no session)
            if (!session) {
                return NextResponse.json({
                    error: "Invalid user",
                    success: false,
                    message: "Please log in to save an analysis."
                }, { status: 401 });
            }

            // query MongoDB, findOneAndDelete method to delete analysis by matching _id
            const deleteAnalysis = await Analysis.findOneAndDelete(
                { _id: id }
            )
            console.log("In delete API route, MongoDB response for deleteAnalysis: ", deleteAnalysis);

            return NextResponse.json({ success: true, message: "Analysis successfully deleted." })
        
        } catch (error) {
            console.error("Error in the delete-analysis route:", error);
            return NextResponse.json({
                success: false,
                message: "Something went wrong."
            }, { status: 500 })
        }
    }