import Login from "./login/page"
import Link from "next/link"

// login page, direct to signup

export default function Home() {
  return (
    <div className="flex flex-col items-center text-center pt-12">
      <h1 className="text-4xl font-bold mb-6">Welcome to Reddinsights!</h1>
      <Login />
      <div className="flex items-center w-1/4 my-8">
                <hr className="flex-grow border-t border-gray-300" />
                <p className="mx-4 text-gray-500 font-medium">or</p>
                <hr className="flex-grow border-t border-gray-300" />
      </div>
      <Link className="font-bold text-gray-700 hover:underline hover:text-blue-500 transition-colors duration-200"
            href="/signup">Create a new account
      </Link>
    </div>
  );
}
