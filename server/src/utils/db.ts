import mongoose from "mongoose";

// On serverless platforms (Vercel), a new function invocation can reuse the
// same process, so we cache the connection on the global object to avoid
// opening a new MongoDB connection on every request.
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache || { conn: null, promise: null };
global.mongooseCache = cached;

export const connectDB = async (): Promise<typeof mongoose> => {
  // Already connected — e.g. by this same cache, or by a test helper that
  // connects directly (mongodb-memory-server). Avoids opening a second,
  // unrelated connection on every request.
  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/attendance-care";
    cached.promise = mongoose.connect(uri).then((mongooseInstance) => {
      console.log("MongoDB connected");
      return mongooseInstance;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
};
