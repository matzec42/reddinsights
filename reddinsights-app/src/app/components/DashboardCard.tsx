import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import Link from 'next/link';
import { AnalysisType } from '../../types/card-component-types.ts/card-component-type';

const COLORS = ['#41cb5b', '#fd4c0b', '#979a9c',];

const DashboardCard: React.FunctionComponent<{ analysis: AnalysisType }> = ({ analysis }) => {

    // TO-DO: edit data attribute on Pie component --- pull values from sentimentSummary property and convert here, before return
    // LONGER TERM: edit models/DB to store numbers instead of strings, check that storage and usage is consistent in other components (DashboardCard, Card, SavedCard)

    return (
        <div className="p-4 bg-white border border-gray-200 rounded-lg shadow hover:shadow-lg transition duration-200">
            <Link key={analysis._id} href={`/saved/${analysis._id}`} className="w-full">
                <h2 className="font-bold">{analysis.analysisTitle}</h2>
                <PieChart width={300} height={280} className="mx-auto">
                    <Pie
                        data={analysis.sentimentSummary.distribution
                            .filter((d) => d.value && !isNaN(parseFloat(d.value)))
                            .map((d) => ({
                                ...d,
                                value: parseFloat(d.value)
                            }))}
                        cx={150}
                        cy={120}
                        outerRadius={90}
                        dataKey="value"
                        label={({ value }) => `${value}%`}
                    >
                        {
                            analysis.sentimentSummary.distribution.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index]} />
                            ))
                        }
                    </Pie>
                    <Tooltip />
                    <Legend />
                </PieChart>
                <p className="mt-3"><i>Created at {new Date(analysis.createdAt).toLocaleString()}</i></p>
            </Link>
        </div>
    )
}

export default DashboardCard;