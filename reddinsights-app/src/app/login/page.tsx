"use client";

import { useState } from "react";
import AuthForm  from "../components/AuthForm"
import { useRouter } from "next/navigation";

const Login: React.FunctionComponent = () => {
    const router = useRouter();

    // state --- login message, status
    const [message, setMessage] = useState("");
    const [isSuccessful, setIsSuccessful] = useState(false);
    
    // login handler function, makes POST request to login route
    const handleLogin = async (data: { email: string, password: string }) => {
        const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        const result = await response.json();
        setMessage(result.message);

        if (result.data) {
            setIsSuccessful(true);
            router.push("/dashboard");
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
