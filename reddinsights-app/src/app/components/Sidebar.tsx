// "use client";

import Link from "next/link";

interface SidebarProps {
    isOpen: boolean;
}

const Sidebar: React.FunctionComponent<SidebarProps> = ({ isOpen }) => {
    return (
        <div className={`fixed top-16 left-0 h-full w-64 bg-white shadow-lg z-50 p-4 
                        transition-transform duration-300 ease-in-out
                        ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
            <ul className="flex flex-col gap-4">
                <li><Link href="/about">About</Link></li>
                <li><Link href="/contact">Contact</Link></li>
                <li><Link href="/create-pdf">Create a PDF</Link></li>
                <li><Link href="/dashboard">Dashboard</Link></li>
            </ul>
        </div>
    );
}

export default Sidebar;