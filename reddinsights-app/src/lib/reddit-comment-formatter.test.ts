import { redditCommentFormatter } from './reddit-comment-formatter'

describe('redditCommentFormatter', () => {
    it('formats valid comments with numbering', () => {
        const comments = [
            'This is a perfectly reasonable comment length for testing.',
            'Another comment that is also long enough to pass the filter.'
        ]
        const result = redditCommentFormatter(comments, 10)
        expect(result).toContain('Comment 1:')
        expect(result).toContain('Comment 2:')
        expect(result).toContain('\n\n---\n\n')
    })

    it('filters out comments shorter than 20 characters', () => {
        const comments = ['too short', 'This one is long enough to survive the filter step.']
        const result = redditCommentFormatter(comments, 10)
        expect(result).not.toContain('too short')
        expect(result).toContain('Comment 1:')
        expect(result.match(/Comment \d+:/g)).toHaveLength(1)
    })

    it('filters out comments longer than 2000 characters', () => {
        const longComment = 'a'.repeat(2001)
        const shortEnough = 'This comment is within the acceptable length range.'
        const result = redditCommentFormatter([longComment, shortEnough], 10)
        expect(result.match(/Comment \d+:/g)).toHaveLength(1)
        expect(result).toContain(shortEnough)
    })

    it('respects the maxComments cap', () => {
        const comments = Array.from({ length: 5 }, (_, i) =>
            `This is comment number ${i} and it is long enough to pass.`
        )
        const result = redditCommentFormatter(comments, 3)
        expect(result.match(/Comment \d+:/g)).toHaveLength(3)
    })

    it('truncates individual comments to 1500 characters', () => {
        const longComment = 'b'.repeat(1800)
        const result = redditCommentFormatter([longComment], 10)
        // "Comment 1: " prefix + 1500 chars of content
        const contentPart = result.replace('Comment 1: ', '')
        expect(contentPart.length).toBe(1500)
    })

    it('returns an empty string for an empty array', () => {
        expect(redditCommentFormatter([], 10)).toBe('')
    })

    it('returns an empty string when all comments are filtered out', () => {
        const comments = ['short', 'tiny']
        expect(redditCommentFormatter(comments, 10)).toBe('')
    })
})