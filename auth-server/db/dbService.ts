import { ConnectOptions } from "mongodb";
import mongoose from "mongoose";
const connectDB = async (dbURI: string) => {
  await mongoose.connect(dbURI!);
};
export default connectDB;
