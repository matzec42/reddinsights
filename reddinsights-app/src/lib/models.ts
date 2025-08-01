import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error("Please define the MONGODB_URI environment variable");
}

mongoose.connect(MONGODB_URI, {
    dbName: 'Reddinsights-Data'
})
.then(() => console.log("Connected to MongoDB"))
.catch((err) => console.log(err));

const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

const User = mongoose.model("User", userSchema);

const threadSchema = new Schema({
    userId: Number,
    redditUrl: { type: String, required: true },
    subreddit: String,
    postTitle: String,
    fetchedAt: Date,
    commentCount: Number,
    sentimentSummary: {
        positive: Number,
        negative: Number,
        neutral: Number,
        distribution: {
            positive: Number,
            negative: Number,
            neutral: Number,
        }
    },
    topThemes: [
        { label: String, quote: String }
    ],
    rawPromptToken: Number,
    createdAt: Date
});

const Thread = mongoose.model("Thread", threadSchema);

const commentSchema = new Schema({
    threadId: Number,
    commentId: String,
    author: String,
    content: String,
    sentiment: String,
    tokens: Number,
    createdAt: Date
});

const Comment = mongoose.model("Comment", commentSchema);

export const ReddinsightsSchema = { User, Thread, Comment }
