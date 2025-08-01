"use client";

import { useState } from "react";
import AuthForm  from "../AuthForm"

const Login: React.FunctionComponent = () => {
    // state --- login message, status
    const [message, setMessage] = useState("");
    const [isSuccessful, setIsSuccessful] = useState(false);
    
    const handleLogin = async (data: { email: string, password: string }) => {
        const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        const result = await response.json();
        // console.log('Result of fetch from /api/auth/login:', result)
        setMessage(result.message);

        if (response.status === 200 || response.status === 201) {
            setIsSuccessful(true);
            // logic to redirect and/or store session token

        } else {
            setIsSuccessful(false);
        }
    }

    return (
        <div className="max-w-md mx-auto mt-12">
            <AuthForm
                mode={"Login"}
                onSubmit={handleLogin}
            />

            { message && (
                <p
                    className={`text-center mt-4 ${
                        isSuccessful ? "text-green-500" : "text-red-500"
                    } font-medium`}
                >
                    {message}
                </p>
            )}
        </div>
    );
}

export default Login;
