/**
 * @jest-environment node
 */

import { POST } from './route'
import { groqCall } from '@/lib/groq-api-helpers'
import { getRedditReplies } from '@/lib/reddit-api-helper'

// Mock all external dependencies
jest.mock('@/lib/groq-api-helpers')
jest.mock('@/lib/reddit-api-helper')

jest.mock('@upstash/redis', () => ({
    Redis: { fromEnv: jest.fn(() => ({})) }
}))

jest.mock('@upstash/ratelimit', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const RatelimitMock: any = jest.fn().mockImplementation(() => ({
        limit: jest.fn().mockResolvedValue({ success: true })
    }))
    RatelimitMock.slidingWindow = jest.fn()
    return { Ratelimit: RatelimitMock }
})

jest.mock('@/lib/analysisConfigs', () => ({
    analysisConfigs: {
        general: {
            subredditPrompt: (q: string) => `find subreddits for ${q}`,
            analysisPrompt: (q: string, c: string) => `analyze ${q} with ${c}`,
            modelSubreddit: 'mock-model',
            modelAnalysis: 'mock-model',
            temperature: 0.5,
            maxComments: 30,
            systemPrompt: 'mock system prompt'
        }
    }
}))

const mockedGroqCall = groqCall as jest.Mock
const mockedGetRedditReplies = getRedditReplies as jest.Mock

function makeRequest(body: object) {
    return new Request('http://localhost:3000/api/generate-analysis', {
        method: 'POST',
        body: JSON.stringify(body)
    })
}

describe('POST /api/generate-analysis', () => {
    it('returns 400 if query is missing', async () => {
        const res = await POST(makeRequest({ type: 'general' }))
        expect(res.status).toBe(400)
    })

    it('returns 400 if analysis type is invalid', async () => {
        const res = await POST(makeRequest({ query: 'test', type: 'nonexistent' }))
        expect(res.status).toBe(400)
    })

    it('returns 404 if no Reddit comments are found', async () => {
        mockedGroqCall.mockResolvedValueOnce('["AskReddit"]')
        mockedGetRedditReplies.mockResolvedValueOnce([])

        const res = await POST(makeRequest({ query: 'test query', type: 'general' }))
        expect(res.status).toBe(404)
    })

    it('returns 200 with a successful full pipeline run', async () => {
        mockedGroqCall
            .mockResolvedValueOnce('["AskReddit", "technology"]') // subreddit call
            .mockResolvedValueOnce(JSON.stringify({ sentiment: 'positive', summary: 'Mock summary' })) // analysis call

        mockedGetRedditReplies.mockResolvedValueOnce([
            'This is a long enough comment to pass the formatter filter.',
            'Another comment that is also sufficiently long to pass.',
            'A third comment, also long enough to clear the minimum length.'
        ])

        const res = await POST(makeRequest({ query: 'test query', type: 'general' }))
        const json = await res.json()

        expect(res.status).toBe(200)
        expect(json.success).toBe(true)
        expect(json.data[0]).toEqual({ sentiment: 'positive', summary: 'Mock summary' })
    })
})