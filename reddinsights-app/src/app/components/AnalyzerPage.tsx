import Navbar from '../components/Navbar';
import Form from 'next/form';

const AnalyzerPage: React.FunctionComponent = () => {
    const getSubredditTopic = async (formData: FormData) => {
        "use server"

        // work to be done here --- in server-actions/actions.ts, write a function which will query the 
    }

    return (
        <div>
            <Navbar />
            <Form action={getSubredditTopic}>
                <input className="w-100 border border-gray-300 m-2 p-2 rounded-md" name="query" placeholder="Type a Subreddit topic here (e.g., Target, Amazon)" />
                <button className="w-40 py-2 rounded-md text-white font-bold bg-orange-600 hover:bg-orange-400 focus:outline-none focus:ring focus:ring-orange-250" type="submit">Analyze</button>
            </Form>
        </div>
    )
}

export default AnalyzerPage