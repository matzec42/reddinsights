import Login from "./(routes)/login/page"
import Link from "next/link"

// login page, direct to signup

export default function Home() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 px-4">
      <div className="w-full max-w-md border border-gray-300 rounded-md bg-white shadow-md p-8 mt-2 mb-2">
        <main className="flex flex-col items-center text-center pt-12">
          <h1 className="text-3xl font-bold mb-6 mt-4">Welcome to Reddinsights!</h1>
          <h4 className="italic">AI-powered analysis of the web&apos;s most popular discussion forum.</h4>
          <Login />
          <div className="flex items-center w-1/4 my-8">
                    <hr className="flex-grow border-t border-gray-300" />
                    <p className="mx-4 text-gray-500 font-medium">or</p>
                    <hr className="flex-grow border-t border-gray-300" />
          </div>
          <Link className="font-bold text-gray-700 hover:underline hover:text-blue-500 transition-colors duration-200"
                href="/signup">Create a new account
          </Link>
        </main>
        <footer className="text-center text-sm text-gray-400 mt-6">Reddinsights 2025. Powered by Next.js, RedditAPI and GroqAI.</footer>
      </div>
    </div>
  );
}
