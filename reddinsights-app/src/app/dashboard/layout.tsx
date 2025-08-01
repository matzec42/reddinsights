
const Layout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div>
            <div>
                Hello World
            </div>
            <div>{children}</div>
        </div>
    )
}

export default Layout