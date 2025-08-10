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
