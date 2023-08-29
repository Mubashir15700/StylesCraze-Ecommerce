import mongoose from 'mongoose';

const Connection = async () => {
    try {
        const URL = process.env.DB_URL || "mongodb://127.0.0.1:27017/EcommerceDB";
        mongoose.set('strictQuery', false);
        await mongoose.connect(URL, { useUnifiedTopology: true, useNewUrlParser: true });
        console.log("Connected to database succesfully.");
    } catch (error) {
        console.log(error);
    }
}

export default Connection;