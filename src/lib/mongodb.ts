import mongoose from 'mongoose';


const MONGODB_URI = process.env.MONGODB_URI;


if (!MONGODB_URI) {
throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

/**
* Global is used here to maintain a cached connection across hot reloads in development.
*/
let cached: { conn: typeof mongoose | null } = (global as any)._mongoose || { conn: null };


export async function connect() {
if (cached.conn) {
return cached.conn;
}
if(MONGODB_URI){
    const opts = {
    bufferCommands: false,
    // other mongoose options
    } as mongoose.ConnectOptions;
    const conn = await mongoose.connect(MONGODB_URI, opts);
    cached.conn = conn;
    (global as any)._mongoose = cached;
    return conn;
}
}