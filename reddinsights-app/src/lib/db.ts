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
})

const User = mongoose.model("User", userSchema);

export default User
