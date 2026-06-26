import { render, screen } from '@testing-library/react'
import Home from './page'

jest.mock('./(routes)/login/page', () => {
    return function MockLogin() {
        return <div>Mock Login Form</div>
    }
})

describe('Home page', () => {
    it('renders without crashing', () => {
        render(<Home />)
    })

    it('shows the welcome heading', () => {
        render(<Home />)
        expect(screen.getByText(/welcome to reddinsights/i)).toBeInTheDocument()
    })

    it('shows a link to create a new account', () => {
        render(<Home />)
        expect(screen.getByRole('link', { name: /create a new account/i })).toBeInTheDocument()
    })
})