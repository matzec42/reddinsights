/* Route to save a Reddinsight analysis (request is made from the AnalyzerPage on frontend) */

import { NextRequest, NextResponse } from "next/server";
import { cookies} from "next/headers";
import { ReddinsightsSchema } from "@/lib/models";

export async function POST(request: NextRequest) {
        // destructure Analysis, Session models for interacting w/ DB
        const { Analysis, Session } = ReddinsightsSchema;

        try {
            const body = await request.json();
            const { analysis, subreddits, visualization } = body;
            
            // 
            const cookieStore = await cookies();
            const userIdFromSessionCookie = cookieStore.get("session")?.value;
            const session = await Session.findOne({ sessionToken: userIdFromSessionCookie });
            if (!session) {
                return NextResponse.json({
                    success: false,
                    message: "Invalid session. Please log in."
                }, { status: 401 });
            }
    
            // console.log (`In save-analysis route, checking some of the req body: ${analysis.analysisTitle}, ${subreddits[0]}, ${visualization[0].name}`);
            
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

            // mapping distribution values --- making percentages for the visualization
            const distribution = visualization.map((num: { name: string, value: number }) => ({
                name: num.name,
                value: (num.value / analysis.commentCount).toLocaleString('en-US', { style: 'percent' })
            }));

            // save analysis to MongoDB --- new document in analysis collection
            const newAnalysis = await Analysis.create({
                userId: session.userId,
                postTitle: analysis.analysisTitle,
                commentCount: analysis.commentCount,
                sentimentSummary: { 
                    overall: analysis.sentimentSummary.overall,
                    positive: analysis.sentimentSummary.positive,
                    neutral: analysis.sentimentSummary.neutral,
                    negative: analysis.sentimentSummary.negative,
                    distribution: distribution
                },
                topThemes: analysis.topThemes.map((t: { theme: string, quote: string }) => ({
                    label: t.theme,
                    quote: t.quote
                })),
                createdAt: analysis.createdAt,
                subreddits: subreddits
            });

            console.log(`New analysis saved in save route: ${newAnalysis}`);

            return NextResponse.json({ data: newAnalysis._id, success: true, message: "Analysis saved successfully!" });

        } catch (error) {
            console.error("Error in the save-analysis route:", error);
            return NextResponse.json({
                success: false,
                message: "Something went wrong."
            }, { status: 500 })
        }
    }