/* Route to fetch user's past analyses for display on Dashboard (request is made on component mount from the DashboardPage on frontend) */

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ReddinsightsSchema } from "@/lib/models";

export async function GET(request: NextRequest) {
    // destructure Analysis, Session models for interacting w/ DB
    const { Analysis, Session } = ReddinsightsSchema;

    try {
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

        // fetch analyses from MongoDB --- all analyses documents associated w/ user
        const analyses = await Analysis.find(
            { userId: session.userId },
            { analysisTitle: 1, sentimentSummary: 1, createdAt: 1 },
            { sort: { createdAt: -1 }, limit: 20 }
        );

        if (!analyses) {
                    console.error("Error fetching analyses from DB");
                    return NextResponse.json({
                        success: false,
                        message: "Something went wrong while fetching your analyses. Please try again later."
                    }, { status: 500 });
                }
        
        return NextResponse.json({ data: analyses, success: true, message: "Analyses retrieved successfully" });

    } catch (error) {
        console.error("Error in the save-analysis route:", error);
        return NextResponse.json({
            success: false,
            message: "Something went wrong."
        }, { status: 500 })
    }
}
