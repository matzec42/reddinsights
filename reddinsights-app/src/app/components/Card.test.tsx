import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Card from './Card'

// Mock recharts — we don't want to test its internals, just confirm our component renders around it
jest.mock('recharts', () => ({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
    Pie: () => <div data-testid="pie" />,
    Cell: () => <div />,
    Tooltip: () => <div />,
    Legend: () => <div />,
}))

const mockAnalysis = {
    _id: 'mock-id-123',
    analysisTitle: 'Mock Analysis Title',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    commentCount: 42,
    generalSummary: 'This is a mock summary of the analysis.',
    sentimentSummary: {
        overall: 'positive',
        positive: 30,
        negative: 5,
        neutral: 7,
        distribution: [
            { name: 'Positive', value: '71' },
            { name: 'Negative', value: '12' },
            { name: 'Neutral', value: '17' },
        ],
    },
    topThemes: [
        { theme: 'Customer Service', quote: 'They were super helpful!' },
        { theme: 'Pricing', quote: 'A bit pricey honestly.' },
    ],
}

const mockSubreddits = ['AskReddit', 'technology']
const mockComments = ['comment one', 'comment two']

beforeEach(() => {
    global.fetch = jest.fn()
    window.alert = jest.fn()
})

describe('Card', () => {
    it('renders the analysis title and summary', () => {
        render(<Card analysis={mockAnalysis} subreddits={mockSubreddits} comments={mockComments} />)
        expect(screen.getByText('Mock Analysis Title')).toBeInTheDocument()
        expect(screen.getByText('This is a mock summary of the analysis.')).toBeInTheDocument()
    })

    it('renders the comment count', () => {
        render(<Card analysis={mockAnalysis} subreddits={mockSubreddits} comments={mockComments} />)
        expect(screen.getByText(/42/)).toBeInTheDocument()
    })

    it('renders top themes with quotes', () => {
        render(<Card analysis={mockAnalysis} subreddits={mockSubreddits} comments={mockComments} />)
        expect(screen.getByText('Customer Service:')).toBeInTheDocument()
        expect(screen.getByText(/They were super helpful!/)).toBeInTheDocument()
    })

    it('renders subreddit links with correct hrefs', () => {
        render(<Card analysis={mockAnalysis} subreddits={mockSubreddits} comments={mockComments} />)
        const link = screen.getByRole('link', { name: 'r/AskReddit' })
        expect(link).toHaveAttribute('href', 'https://www.reddit.com/r/AskReddit')
    })

    it('calls fetch with the correct payload when Save Analysis is clicked', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true })

        render(<Card analysis={mockAnalysis} subreddits={mockSubreddits} comments={mockComments} />)
        fireEvent.click(screen.getByText('Save Analysis'))

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith('/api/save-analysis', expect.objectContaining({
                method: 'POST',
            }))
        })
    })

    it('shows a success alert when save succeeds', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true })

        render(<Card analysis={mockAnalysis} subreddits={mockSubreddits} comments={mockComments} />)
        fireEvent.click(screen.getByText('Save Analysis'))

        await waitFor(() => {
            expect(window.alert).toHaveBeenCalledWith('Analysis saved successfully!')
        })
    })

    it('shows an error alert when save fails', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false })

        render(<Card analysis={mockAnalysis} subreddits={mockSubreddits} comments={mockComments} />)
        fireEvent.click(screen.getByText('Save Analysis'))

        await waitFor(() => {
            expect(window.alert).toHaveBeenCalledWith('Failed to save analysis. Please try again.')
        })
    })
})