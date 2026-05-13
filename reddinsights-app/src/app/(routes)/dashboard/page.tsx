import DashboardPage from "../../components/DashboardPage"
import Navbar from "@/app/components/Navbar"

const Dashboard: React.FunctionComponent = () => {
    return (
        <div>
            <Navbar />
            <DashboardPage />
        </div>
    )
}

export default Dashboard