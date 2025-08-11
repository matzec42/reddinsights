// type for Groq API calls
export interface GroqApiCallOptions {
    prompt: string;
    model?: string;
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    stream?: boolean;
    stop?: string | string[] | null;
    systemPrompt?: string;
}

