import Mongo, { Db, MongoClient } from 'mongodb';

let maggieDb: Promise<Db>;
let mongoClient: MongoClient;

export async function getMongoClient(): Promise<Db> {
  if (maggieDb) {
    return maggieDb;
  }
  const mongoUri = 'mongodb://docker:mongopw@localhost:27017'; //process.env.MONGO_URI;
  if (!mongoUri) {
    throw Error('No mongo URI');
  }

  maggieDb = new Promise((resolve, reject) => {
    const mongoClientPromise = MongoClient.connect(mongoUri, {
      useUnifiedTopology: true,
    });

    mongoClientPromise
      .then((cli: MongoClient) => {
        mongoClient = cli;
        const db = cli.db('process-db');
        resolve(db);
      })
      .catch(error => {
        reject(error);
      });
  });

  return maggieDb;
}

async function mongoDb<T>(collection: string) {
  const client = await getMongoClient();
  return client.collection<T>(collection);
}

const mongoDbCypress = async (collection: any, uri: any) => {
  if (!mongoClient) {
    mongoClient = await Mongo.connect(uri);
  }

  return mongoClient.db('process-db').collection(collection);
};

const mongoDbDropCypress = async (uri: any) => {
  if (!mongoClient) {
    mongoClient = await Mongo.connect(uri);
  }

  return mongoClient.db('process-db').dropDatabase();
};

export default { mongoDb, mongoDbCypress, mongoDbDropCypress };
