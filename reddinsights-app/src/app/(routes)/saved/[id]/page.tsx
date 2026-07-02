import SavedCard from "@/app/components/SavedCard";
import Navbar from "@/app/components/Navbar";
import { ReddinsightsSchema } from "@/lib/models";

const SavedAnalysis = async ({ params }: {params: Promise<{ id: string }>}) => {
    // access params from URL
    const { id } = await params;
    const { Analysis } = ReddinsightsSchema;

    // parsing to pass simple/clean JS objects as props (avoids errors)
    const rawAnalysis = await Analysis.findById(id).lean();
    const analysis = JSON.parse(JSON.stringify(rawAnalysis));

    if (!analysis) return <p>Analysis not found.</p>

    return (
        <div>
            <Navbar />
            <div className="max-w-6xl mx-auto px-4 py-6">
                <SavedCard analysis={analysis} subreddits={analysis.subreddits} comments={analysis.comments}/>
            </div>
        </div>
    )
}

export default SavedAnalysis