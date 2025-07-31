"use client"

import { useState, useEffect, FormEvent } from "react";

// typing for form; mode property for re-usability in Login, Signup components
interface AuthFormProps {
    mode: "Signup" | "Login",
    onSubmit: (data: { email: string, password: string }) => void;
    resetForm?: boolean;
}

const AuthForm: React.FC<AuthFormProps> = ({ mode, onSubmit, resetForm }) => {
    // state for email & PW
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // for 
    useEffect(() => {
        if (resetForm) {
            setEmail("");
            setPassword("");
        }
    }, [resetForm]);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        onSubmit({ email, password });
    }

    return (
        <div>
            <form className="space-y-5 w-70" onSubmit={handleSubmit}>
                <h2 className="font-bold text-center text-2xl mb-5">{mode}</h2>
                <div className="flex flex-col">
                    <label className="text-left">Email</label>
                    <input className="border rounded-md mt-1 p-2 w-full" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
                <div className="flex flex-col">
                    <label className="text-left">Password</label>
                    <input className="border rounded-md mt-1 p-2 w-full" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                </div>
                <button className="w-full py-2 rounded-md text-white font-bold bg-orange-600 hover:bg-orange-400 focus:outline-none focus:ring focus:ring-orange-250" type="submit">
                    {mode}
                </button>
            </form>
        </div>
    )
}

export default AuthForm;