import mongoose from "mongoose";

const connectionString = `mongodb+srv://${process.env.MONGO_DB_USERNAME}:${process.env.MONGO_DB_PASSWORD}@linkedinclonedatabase.mongocluster.cosmos.azure.com/?tls=true&authMechanism=SCRAM-SHA-256&retrywrites=false&maxIdleTimeMS=120000`;

if (!connectionString) {
  throw new Error("Please provide a valid connection string");
}

const connectDB = async () => {
  if (mongoose.connection?.readyState >= 1) {
    console.log("---- Already connected ----");
    return;
  }

  try {
    console.log("---- Connecting to MongoDB ----");
    await mongoose.connect(connectionString, {
      serverSelectionTimeoutMS: 30000, // Increase timeout to 30 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      tlsInsecure: false, // Ensure a secure TLS connection (important for Cosmos DB)
    });

    // Successful connection
    console.log("---- Successfully connected to MongoDB ----");

    // Handle successful connection events
    mongoose.connection.on("connected", () => {
      console.log("Mongoose connection established.");
    });

    // Log any disconnection events
    mongoose.connection.on("disconnected", () => {
      console.log("Mongoose connection disconnected.");
    });

    // Log errors on the connection
    mongoose.connection.on("error", (err) => {
      console.error("Mongoose connection error:", err);
    });
  } catch (error) {
    console.log("Error connecting to MongoDB", error);
  }
};

// Enable Mongoose debugging for development
if (process.env.NODE_ENV === "development") {
  mongoose.set("debug", true);
}

export default connectDB;
