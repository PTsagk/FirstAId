// import { MongoClient } from "mongodb";

// let client;
// let db;

// async function connectDB() {
//   try {
//     // If already connected, return the existing db instance
//     if (db) {
//       return db;
//     }

//     // Set up a new connection if none exists
//     const url = process.env.MONGO_URI;
//     client = new MongoClient(url);
//     await client.connect();

//     // Specify the database name
//     const dbName = "FirstAId";
//     db = client.db(dbName);
//     return db;
//   } catch (error) {
//     console.error(error);
//     return null;
//   }
// }

// // Close the client connection gracefully (e.g., during server shutdown)
// async function closeDB() {
//   if (client) {
//     await client.close();
//     client = null;
//     db = null;
//   }
// }

// export { connectDB, closeDB };

import { MongoClient } from "mongodb";

let dbInstance = null;

async function getDB() {
  if (dbInstance) return dbInstance;

  const client = new MongoClient(process.env.MONGO_URI);

  await client.connect();
  dbInstance = client.db("FirstAId");

  // Optional: keep the client from closing by attaching it globally (optional safeguard)
  if (!global._mongoClient) {
    global._mongoClient = client;
  }

  return dbInstance;
}

export { getDB };
