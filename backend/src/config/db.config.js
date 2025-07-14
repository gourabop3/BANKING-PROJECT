const mongoose = require("mongoose")

exports.ConnectDB = async()=>{
    try {
        const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/bankdb';

        await mongoose.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log(`MongoDB connected → ${mongoose.connection.host}`);

    } catch (error) {
        console.error('MongoDB connection failed:', error.message);
        console.log('Starting server without database for testing...');
        // Don't exit for testing purposes
        // process.exit(1);
    }
}