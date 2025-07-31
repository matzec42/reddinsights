"use client"

import { useState } from "react";
import AuthForm  from "../AuthForm"
import Link from "next/link";

const Signup: React.FunctionComponent = () => {
    // state for signup
    const [message, setMessage] = useState("");
    const [isSuccessful, setIsSuccessful] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSignup = async (data: { email: string, password: string }) => {
        const response = await fetch("/api/auth/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        const result = await response.json();
        setMessage(result.message);

        if (response.status === 200 || response.status === 201) {
            setIsSuccessful(true);
            setIsSuccess(true);
        } else {
            setIsSuccess(false);
        }
    }

    return (
        <div className="flex flex-col items-center text-center pt-12">
            <div>
                { isSuccessful ? (
                    <>
                        <p className="text-green-500 text-center text-lg font-semibold">
                            Welcome!
                        </p>
                    </>
                ) : (
                    <AuthForm mode="Signup" onSubmit={handleSignup} />
                )}

                { message && (
                    <p
                        className={`text-center mt-4 ${
                            isSuccess ? "text-green-500" : "text-red-500"
                        }`}
                    >
                        {message}
                    </p>
                )}

                {isSuccessful && (
                    <Link href="../components/login">
                        <a className="font-bold hover:underline text-gray-700 hover:text-blue-500 transition-colors duration-200">
                            Back to login
                        </a>
                    </Link>
                )}
            </div>
        </div>
    )
}

export default Signup