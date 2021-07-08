import mongoose from "mongoose";

const uri: string = process.env.DB_MONGO_URL || "mongodb://localhost:27017/test";

export default class MongoDatabase {
  connect(): void {
    console.log("Connecting to database...");
    mongoose
      .connect(uri, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
      })
      .then(() => console.log("Database Connected!"))
      .catch((error) => {
        console.log("Error connecting to database: ", error);
        return process.exit(1);
      });
  }
}


