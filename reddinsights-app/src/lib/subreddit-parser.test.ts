import { subredditParser } from './subreddit-parser'

describe('subredditParser', () => {
    it('extracts subreddit names from a quoted list', () => {
        const input = '["AskReddit", "technology", "programming"]'
        expect(subredditParser(input)).toEqual(['AskReddit', 'technology', 'programming'])
    })

    it('removes duplicate subreddit names', () => {
        const input = '["AskReddit", "AskReddit", "technology"]'
        expect(subredditParser(input)).toEqual(['AskReddit', 'technology'])
    })

    it('caps the result at 5 subreddits', () => {
        const input = '["a", "b", "c", "d", "e", "f", "g"]'
        expect(subredditParser(input)).toHaveLength(5)
    })

    it('strips internal whitespace from matches', () => {
        const input = '["some thing", "another one"]'
        expect(subredditParser(input)).toEqual(['something', 'anotherone'])
    })

    it('returns an empty array when no quoted substrings are found', () => {
        const input = 'no quotes here at all'
        expect(subredditParser(input)).toEqual([])
    })
})