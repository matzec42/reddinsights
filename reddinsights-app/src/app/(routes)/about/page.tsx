import Navbar from "@/app/components/Navbar"

const AboutPage: React.FunctionComponent = () => {
    return (
        <div>
            <Navbar />
            <div className="min-h-screen flex flex-col justify-center items-center">

                <div className="flex flex-col justify-center mt-6 items-center md:w-1/2 p-6 bg-white border border-gray-200 rounded-2xl shadow-lg">

                    <h1 className="text-3xl font-bold mb-6">About</h1>

                    <section className="mb-6">
                        <h2 className="text-xl font-semibold mb-3">The Project</h2>
                        <p className="text-gray-700 leading-relaxed">
                            Reddinsights is an AI-powered sentiment analysis tool that surfaces insights from Reddit discussions. 
                            Enter a topic or subreddit, choose an analysis mode (General, Brand, or Student) and Reddinsights 
                            fetches relevant Reddit posts and runs them through a multi-step LLM pipeline to return a structured 
                            sentiment breakdown, key themes, and representative quotes.
                        </p>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-xl font-semibold mb-3">The Developer</h2>
                        <p className="text-gray-700 leading-relaxed">
                            Hello! My name is Chris and I&apos;m an engineer with a background in JavaScript and TypeScript, full-stack web development, 
                            and applied AI. Graduate of Codesmith. Co-creator of CacheIQL, an open source pair of libraries providing 
                            server- and client-side caching solutions for GraphQL users. Currently exploring Python, LLM integration, retrieval augmented generation (RAG), 
                            and AI-powered product development.
                        </p>
                        <p className="text-gray-700 leading-relaxed mt-4">
                            Former teacher with strong curiosity & passion for technology, learning, and building tools that make 
                            information more accessible.
                        </p>
                        <p className="text-gray-700 leading-relaxed mt-4">
                            Primary Stack: JavaScript / TypeScript, Node.js, Express, Next.js, PostgreSQL, MongoDB
                        </p>
                    </section>

                    <section className="w-full text-center">
                        <h2 className="text-xl font-semibold mb-3">Links:</h2>
                        <div className="flex justify-center gap-6 text-orange-500 underline">
                            <a href="https://github.com/matzec42" target="_blank" rel="noopener noreferrer">GitHub</a>
                            <a href="https://www.linkedin.com/in/matzec42" target="_blank" rel="noopener noreferrer">LinkedIn</a>
                            <a href="https://github.com/oslabs-beta/CacheIQL" target="_blank" rel="noopener noreferrer">CacheIQL</a>
                        </div>
                    </section>

                </div>
            </div>
        </div>
    );
}

export default AboutPage