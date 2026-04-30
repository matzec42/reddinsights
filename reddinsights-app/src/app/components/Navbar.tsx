"use client";

import Link from "next/link";
import Image from "next/image";

const Navbar: React.FunctionComponent = () => {
    return (
        <nav className="flex justify-between items-center w-screen h-16 p-2 shadow-sm">
            <div className="">
                <Link href="" className="">
                    <Image
                        width={30}
                        height={30}
                        alt={"Menu button"}
                        src={"/menu.svg"}
                    ></Image>
                </Link>
            </div>

            <Link href="/dashboard">
                <h1 className="text-4xl font-bold mb-6 mt-4">Reddinsights</h1>
            </Link>

            <Link href="/analyzer">
                <button id="start-new-analysis" className="w-full py-2 m-3 rounded-md text-white font-bold bg-orange-600 hover:bg-orange-400 focus:outline-none focus:ring focus:ring-orange-250">
                    Start a New Analysis
                </button>
            </Link>

            <div className="">
                <Link href="">
                    <Image
                        width={30}
                        height={30}
                        alt={"Logout button"}
                        src={"/logout.svg"}
                    ></Image>
                </Link>
            </div>
        </nav>
    );
}

export default Navbar