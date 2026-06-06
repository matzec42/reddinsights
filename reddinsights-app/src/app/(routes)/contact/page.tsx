"use client"

import Navbar from '@/app/components/Navbar'
import { useState } from 'react'

const ContactPage: React.FunctionComponent = () => {
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSubmitted(true);
    }

    return (
        <div>
            <Navbar />
            <div className="min-h-screen flex flex-col justify-center items-center">

                <div className="flex flex-col justify-center items-center md:w-1/2 p-6 mt-6 bg-white border border-gray-200 rounded-2xl shadow-lg">

                    <h1 className="text-3xl font-bold mb-2">Contact</h1>
                    <p className="text-gray-500 mb-8">Have feedback, a question, or just want to say hello?</p>

                    {submitted ? (
                        <p className="text-green-600 font-semibold text-center py-8">
                            Thanks for reaching out! We&apos;ll be in touch soon.
                        </p>
                    ) : (
                        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">

                            <div className="flex flex-col gap-1">
                                <label className="text-sm font-medium text-gray-700">Name</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Your name"
                                    className="border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-sm font-medium text-gray-700">Email</label>
                                <input
                                    type="email"
                                    required
                                    placeholder="your@email.com"
                                    className="border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-sm font-medium text-gray-700">Message</label>
                                <textarea
                                    required
                                    rows={5}
                                    placeholder="Your message..."
                                    className="border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
                                />
                            </div>

                            <button type="submit" className="w-full py-3 rounded-lg text-white font-bold bg-orange-600 hover:bg-orange-500 transition-colors">Send Message</button>
                        </form>
                    )}

                </div>
            </div>
        </div>
    );
}

export default ContactPage