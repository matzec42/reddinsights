/* Route to save a Reddinsight analysis (request is made from the AnalyzerPage on frontend) */

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ReddinsightsSchema } from "@/lib/models";
import { deepSanitize } from "@/lib/deep-sanitize";

export async function POST(request: NextRequest) {
    // destructure Analysis, Session models for interacting w/ DB
    const { Analysis, Session } = ReddinsightsSchema;

    try {
        const body = await request.json();
        const { analysis, subreddits, visualization, comments } = body;

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
        if (!analysis || !subreddits || !visualization) {
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

        // checks headers, grabs idempotency key
        const idempotencyKey = request.headers.get("Idempotency-Key");
        // error handling if absent (every saved request should generate a key)
        if (!idempotencyKey) {
            return NextResponse.json({
                success: false,
                message: "Missing Idempotency-Key header."
            }, { status: 400 });
        }
        // early response for an already saved analysis --- fetch saved result via idempotency key
        // check if this exact request was already processed
        const existing = await Analysis.findOne({ idempotencyKey });
        if (existing) {
            return NextResponse.json({ data: existing._id, success: true, message: "Analysis saved successfully!" });
        }

        // mapping distribution values --- making percentages for the visualization
        const distribution = visualization.map((num: { name: string, value: number }) => ({
            name: num.name,
            value: (num.value / analysis.commentCount).toLocaleString('en-US', { style: 'percent' })
        }));

        const cleanAnalysis = deepSanitize(analysis);
        const cleanSubreddits = deepSanitize(subreddits);
        const cleanComments = deepSanitize(comments);
        const cleanVisualization = deepSanitize(visualization);

        // save analysis to MongoDB --- new document in analysis collection
        try {
            const newAnalysis = await Analysis.create({
                userId: session.userId,
                analysisTitle: cleanAnalysis.analysisTitle,
                commentCount: cleanAnalysis.commentCount,
                generalSummary: cleanAnalysis.generalSummary,
                sentimentSummary: {
                    overall: cleanAnalysis.sentimentSummary.overall,
                    positive: cleanAnalysis.sentimentSummary.positive,
                    neutral: cleanAnalysis.sentimentSummary.neutral,
                    negative: cleanAnalysis.sentimentSummary.negative,
                    distribution: cleanVisualization
                },
                topThemes: cleanAnalysis.topThemes.map((t: { theme: string, quote: string }) => ({
                    theme: t.theme,
                    quote: t.quote
                })),
                createdAt: cleanAnalysis.createdAt,
                subreddits: cleanSubreddits,
                comments: cleanComments,
                idempotencyKey
            });

            return NextResponse.json({ data: newAnalysis._id, success: true, message: "Analysis saved successfully!" });

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            // specific catch for race condition (e.g., two nearly simultaneous requests, this handles them possibly saving with the same key)
            // this fetches the request and returns it anyway
            // code 11000 is a duplicate key error code
            if (err.code === 11000) {
                const existing = await Analysis.findOne({ idempotencyKey });
                return NextResponse.json({ data: existing?._id, success: true, message: "Analysis saved successfully!" });
            }
            // any other error is sent up / caught by outer catch (see below)
            throw err;
        }

    } catch (error) {
        console.error("Error in the save-analysis route:", error);
        return NextResponse.json({
            success: false,
            message: "Something went wrong."
        }, { status: 500 })
    }
}