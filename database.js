const { MongoClient } = require('mongodb');

let statsCollection;

async function connectDB() {
  const mongo = new MongoClient(process.env.MONGODB_URI);
  await mongo.connect();
  const db = mongo.db("discordbot");
  statsCollection = db.collection("stats");
  console.log("MongoDB接続完了");
}

async function getAllStats() {
  const docs = await statsCollection.find().toArray();
  const stats = {};
  for (const doc of docs) {
    stats[doc._id] = {
      id: doc._id,
      name: doc.name,
      mention: doc.mention || 0,
      lucky: doc.lucky || 0
    };
  }
  return stats;
}

async function updateUserStats(userId, username, statsType) {
  const incData = {};
  if (statsType === 'mention') incData.mention = 1;
  if (statsType === 'lucky') incData.lucky = 1;

  const update = {
    $set: { name: username },
    $inc: incData
  };

  const result = await statsCollection.updateOne(
    { _id: userId },
    update,
    { upsert: true }
  );

  console.log(`統計更新: ${username} | ${statsType}+1 | matched: ${result.matchedCount}, upserted: ${result.upsertedCount}`);
}

module.exports = {
  connectDB,
  getAllStats,
  updateUserStats
};

