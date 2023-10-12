import mongoose from 'mongoose';

const Connection = async () => {
    try {
        const URL = process.env.DB_ATLAS_URL;
        // const URL = process.env.DB_LOCAL_URL;
        mongoose.set('strictQuery', false);
        await mongoose.connect(URL, { useUnifiedTopology: true, useNewUrlParser: true });
        console.log("Connected to database succesfully.");
    } catch (error) {
        console.log(error);
    }
}

export default Connection;