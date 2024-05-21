import mongoose from "mongoose";
import { config } from "./env.js";

const Connection = async () => {
    try {
        const URL = config.dbLocalUrl;

        if (!URL) {
            throw new Error("Database URL not provided in environment variables.");
        }

        mongoose.set("strictQuery", false);
        await mongoose.connect(URL, {
            useUnifiedTopology: true,
            useNewUrlParser: true
        });

        console.log("Connected to database succesfully.");
    } catch (error) {
        console.error("Error connecting to the database: ", error.message);
        process.exit(1); // Exit the process with failure
    };
}

export default Connection;
