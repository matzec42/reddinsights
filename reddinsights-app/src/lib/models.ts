import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error("Please define the MONGODB_URI environment variable");
}

mongoose.connect(MONGODB_URI, {
    dbName: "Reddinsights-Data"
})
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.log(err));

const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const sessionSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    sessionToken: { type: String, required: true, unique: true },
    createdAt: { type: Date, default: Date.now, expires: '1d' } // Session expires after 1 day
});

const analysisSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    analysisTitle: String,
    createdAt: Date,
    commentCount: Number,
    generalSummary: String,
    sentimentSummary: {
        overall: String,
        positive: Number,
        negative: Number,
        neutral: Number,
        distribution: [{
            _id: false, name: String, value: String
        }]
    },
    topThemes: [
        { theme: String, quote: String }
    ],
    subreddits: [{ type: String }]
});

const commentSchema = new Schema({
    analysisId: { type: Schema.Types.ObjectId, ref: "Analysis", required: true },
    commentId: String,
    author: String,
    content: String,
    sentiment: String,
    tokens: Number,
    createdAt: Date
});

const cardSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    analysisId: { type: Schema.Types.ObjectId, ref: "Analysis" },
    displayName: String,
    createdAt: { type: Date, default: Date.now },
    // for cards --- some repetition of Analysis, but idea is to have user access past analyses/snaphots of analyses
    snapshot: {
        subreddit: String,
        postTitle: String,
        commentCount: Number,
        sentimentSummary: {
            positive: Number,
            negative: Number,
            neutral: Number
        },
        topThemes: [
            { label: String, quote: String }
        ],
        pieChartData: [
            { label: String, value: Number }
        ]
    }
});

const User = mongoose.models.User || mongoose.model("User", userSchema);
const Session = mongoose.models.Session || mongoose.model("Session", sessionSchema);
const Analysis = mongoose.models.Analysis || mongoose.model("Analysis", analysisSchema);
const Comment = mongoose.models.Comment || mongoose.model("Comment", commentSchema);
const Card = mongoose.models.Card || mongoose.model("Card", cardSchema);

export const ReddinsightsSchema = { User, Session, Analysis, Comment, Card }
