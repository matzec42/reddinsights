"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import Sidebar from "./Sidebar";

const Navbar: React.FunctionComponent = () => {
    const [isClicked, setIsClicked] = useState(false);

    const handleMenuClick = () => {
        setIsClicked(!isClicked);
    }

    return (
        <>
            <nav className="flex justify-between items-center w-screen h-16 p-2 shadow-sm">
                <Image
                    onClick={handleMenuClick}
                    width={30}
                    height={30}
                    alt={"Menu button"}
                    src={"/menu.svg"}
                />
                
                <Link href="/dashboard">
                    <h1 className="text-4xl font-bold mb-6 mt-4">reddinsights</h1>
                </Link>

                <Link href="/analyzer">
                    <button id="start-new-analysis" className="w-full py-2 m-3 rounded-md text-white font-bold bg-orange-600 hover:bg-orange-400 focus:outline-none focus:ring focus:ring-orange-250">
                        Start a New Analysis
                    </button>
                </Link>

                <button
                    className="cursor-pointer mr-5"
                    onClick={async () => {
                        await fetch('/api/auth/logout', { method: 'POST' })
                        window.location.href = '/'
                    }}
                >
                    <Image
                        width={30}
                        height={30}
                        alt={"Logout button"}
                        src={"/logout.svg"}
                    />
                </button>
            </nav>

            <Sidebar isOpen={isClicked} />
        </>
    );
}

export default Navbar