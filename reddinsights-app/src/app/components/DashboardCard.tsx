import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import Link from 'next/link';
import { AnalysisType } from '../../types/card-component-types.ts/card-component-type';

const COLORS = ['#41cb5b', '#fd4c0b', '#979a9c',];

const DashboardCard: React.FunctionComponent<{ analysis: AnalysisType }> = ({ analysis }) => {

    const sentimentData = [
        { name: 'Positive', value: analysis.sentimentSummary.positive },
        { name: 'Negative', value: analysis.sentimentSummary.negative },
        { name: 'Neutral', value: analysis.sentimentSummary.neutral },
    ];

    return (
        <div className="p-4 bg-white border border-gray-200 rounded-lg shadow hover:shadow-lg transition duration-200">
            <Link key={analysis._id} href={`/saved/${analysis._id}`} className="w-full">

                <h2 className="font-bold">{analysis.analysisTitle}</h2>
                <p className="mt-3"><i>Created at {new Date(analysis.createdAt).toLocaleString()}</i></p>

                <PieChart width={300} height={280} className="mx-auto">
                    <Pie
                        data={sentimentData}
                        cx={150}
                        cy={120}
                        outerRadius={90}
                        dataKey="value"
                        label={({ value }) => `${(value / analysis.commentCount * 100).toFixed(0)}%`}
                    >
                        {sentimentData.map((d, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index] ?? '#cccccc'} />
                        ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                </PieChart>

            </Link>
        </div>
    )
}

export default DashboardCard;