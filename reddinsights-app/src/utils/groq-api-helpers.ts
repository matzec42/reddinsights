import { Groq } from "groq-sdk";
import { GroqApiCallOptions } from "@/types/groq-api-types/groq-types";

// A new instance of Groq API (passing in key as well to ensure it's there for the calls)
const groq = new Groq(
    { apiKey: process.env.GROQ_API_KEY }
);

// function to query Groq chat
export async function groqCall({
        prompt,
        model = "llama-3.3-70b-versatile",
        temperature = 0.2,
        maxTokens = 1600,
        topP = 1,
        stream = false,
        stop = null,
        systemPrompt = "You are a helpful assistant."
    }: GroqApiCallOptions): Promise<string> {

    const response = await groq.chat.completions.create({
        model: model,
        messages: [
            {
                role: "system",
                content: systemPrompt,
            },
            {
                role: "user",
                content: prompt
            }
        ],
        temperature,
        max_completion_tokens: maxTokens,
        top_p: topP,
    })

    const groqContent = response.choices[0]?.message?.content?.trim();
    // console.log("Raw Groq response:", groqContent);
    // console.log("Groq response type:", typeof groqContent);


    // error handling is in route.ts, as this needs to return a string
    if (!groqContent) {
        return "No content returned from Groq AI helper"
    }
    return groqContent;
}